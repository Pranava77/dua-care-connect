"""Composition root: the only place that knows every concrete implementation."""

from __future__ import annotations

import logging
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy.orm import Session

from app.adapters.domain_gateway import ServiceGateway
from app.ai.agent.actions import ActionService
from app.ai.agent.service import AgentService
from app.ai.agent.tools import default_registry
from app.ai.docintel.service import DocIntelService
from app.ai.indexing.cards import RECORDS
from app.ai.indexing.handlers import register_index_handlers
from app.ai.indexing.indexer import Indexer
from app.ai.ports import EmbeddingProvider, LLMProvider, VectorStore
from app.ai.reports.service import ReportsService
from app.ai.search.service import SearchService
from app.core.config import Settings
from app import migrate
from app.core.db import make_engine, make_session_factory
from app.core.events import EventBus
from app.core.storage import FileStorage
from app.domain.accounting.service import AccountingService
from app.domain.documents.service import DocumentService
from app.domain.medical.service import MedicalService
from app.domain.reports.service import ExportService, ReportService
from app.domain.residents.service import ResidentService
from app.domain.settings.schemas import StoredAiConfig
from app.domain.settings.service import SettingsService
from app.domain.staff.service import StaffService
from app.domain.users.service import UserService
from app.infra import sql_agent_store
from app.infra.chroma_store import ChromaVectorStore
from app.infra.file_storage import LocalFileStorage
from app.infra.gemini_embeddings import GeminiEmbeddings
from app.infra.gemini_llm import GeminiLLM, UnconfiguredLLM, verify_gemini_key
from app.infra.hashing_embeddings import HashingEmbeddings
from app.infra.switchable import SwitchableEmbeddings, SwitchableLLM

log = logging.getLogger(__name__)

# Builds (llm, embeddings) for an API key and chat model; None key means AI is off.
AiFactory = Callable[[str | None, str], tuple[LLMProvider, EmbeddingProvider]]
# Raises LLMUnavailableError when a key/model pair does not work.
KeyValidator = Callable[[str, str], None]


def gemini_factory(settings: Settings) -> AiFactory:
    def build(api_key: str | None, chat_model: str) -> tuple[LLMProvider, EmbeddingProvider]:
        if not api_key:
            return UnconfiguredLLM(), HashingEmbeddings()
        return (GeminiLLM(api_key, chat_model),
                GeminiEmbeddings(api_key, settings.gemini_embed_model, settings.embedding_dimensions))
    return build


@dataclass
class DomainServices:
    residents: ResidentService
    staff: StaffService
    medical: MedicalService
    documents: DocumentService
    accounting: AccountingService
    reports: ReportService
    users: UserService
    settings: SettingsService
    export: ExportService


class Container:
    def __init__(
        self,
        settings: Settings,
        *,
        llm: LLMProvider | None = None,
        embeddings: EmbeddingProvider | None = None,
        vector_store: VectorStore | None = None,
        storage: FileStorage | None = None,
        ai_factory: AiFactory | None = None,
        key_validator: KeyValidator | None = None,
        background_events: bool = True,
    ):
        self.settings = settings
        if settings.database_url.startswith("sqlite:///"):
            Path(settings.database_url.removeprefix("sqlite:///")).parent.mkdir(parents=True, exist_ok=True)
        self.engine = make_engine(settings.database_url)
        self.session_factory = make_session_factory(self.engine)
        self.storage = storage or LocalFileStorage(settings.storage_dir)
        self._executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="indexer") if background_events else None
        self.events = EventBus(self._executor)

        # AI providers start from the environment and can be swapped at runtime from Settings.
        self._ai_factory = ai_factory or gemini_factory(settings)
        self.validate_ai_key = key_validator or verify_gemini_key
        env_key = settings.gemini_api_key
        initial_llm, initial_embeddings = self._ai_factory(env_key, settings.gemini_chat_model)
        self.llm = SwitchableLLM(llm or initial_llm)
        self.embeddings = SwitchableEmbeddings(embeddings or initial_embeddings)
        self.ai_enabled = llm is not None or bool(env_key)
        self.ai_source: str | None = "environment" if env_key else None
        self.chat_model = settings.gemini_chat_model
        self.vector_store = vector_store or ChromaVectorStore(settings.chroma_path, namespace=self.embeddings.name)

        self.indexer = Indexer(self.vector_store, self.embeddings)
        self.search = SearchService(self.vector_store, self.embeddings)
        self.docintel = DocIntelService(self.llm, self.indexer)
        self.reports = ReportsService(self.llm)
        self.agent_store = sql_agent_store.SqlAgentStore(self.session_factory)
        self.registry = default_registry()
        self.agent = AgentService(llm=self.llm, registry=self.registry, store=self.agent_store, search=self.search,
                                  docintel=self.docintel, reports=self.reports, max_steps=settings.agent_max_steps)
        self.actions = ActionService(self.agent_store, self.registry)
        register_index_handlers(self.events, self.indexer, self.storage)

    def init_db(self) -> None:
        """Bring the database schema up to date with Alembic migrations."""
        migrate.upgrade(self.engine)

    # ---- AI provider configuration ---------------------------------------------------

    def apply_ai_settings(self, stored: StoredAiConfig, *, background: bool = True) -> None:
        """Use the key/model saved in Settings, falling back to the environment."""
        env_key = self.settings.gemini_api_key
        key = stored.api_key or env_key
        source = "settings" if stored.api_key else ("environment" if env_key else None)
        self._configure_ai(key, stored.chat_model or self.settings.gemini_chat_model, source, background=background)

    def load_saved_ai_settings(self) -> None:
        with self.session_factory() as db:
            stored = SettingsService(db).ai_config()
        if stored.api_key or stored.chat_model:
            self.apply_ai_settings(stored)

    def ai_status(self) -> dict:
        return {
            "enabled": self.ai_enabled,
            "source": self.ai_source,
            "chat_model": self.chat_model if self.ai_enabled else None,
            "embeddings": self.embeddings.name,
        }

    def _configure_ai(self, api_key: str | None, chat_model: str, source: str | None, *, background: bool) -> None:
        llm, embeddings = self._ai_factory(api_key, chat_model)
        previous_namespace = self.embeddings.name
        self.llm.swap(llm)
        self.embeddings.swap(embeddings)
        self.ai_enabled, self.ai_source, self.chat_model = bool(api_key), source, chat_model
        log.info("AI configured: enabled=%s source=%s model=%s embeddings=%s",
                 self.ai_enabled, source, chat_model, self.embeddings.name)
        if self.embeddings.name != previous_namespace and hasattr(self.vector_store, "use_namespace"):
            # A different embedding model needs its own index; build it once if it does not exist yet.
            self.vector_store.use_namespace(self.embeddings.name)
            if self.vector_store.is_empty(RECORDS):
                if background and self._executor:
                    self._executor.submit(self._safe_reindex)
                else:
                    self.reindex()

    def _safe_reindex(self) -> None:
        try:
            self.reindex()
        except Exception:
            log.exception("Re-indexing after AI reconfiguration failed")

    def reindex(self) -> tuple[int, int]:
        """Rebuild the vector index for the current embedding model from the database."""
        self.indexer.reset()
        with self.session_factory() as db:
            s = self.domain(db)
            dumped = lambda items: [i.model_dump(mode="json") for i in items]  # noqa: E731
            entities = (
                [("resident", d) for d in dumped(s.residents.list())]
                + [("staff", d) for d in dumped(s.staff.list())]
                + [("leave_request", d) for d in dumped(s.staff.list_leave())]
                + [("medical_record", d) for d in dumped(s.medical.list_records())]
                + [("prescription", d) for d in dumped(s.medical.list_prescriptions())]
                + [("invoice", d) for d in dumped(s.accounting.list_invoices())]
                + [("payment", d) for d in dumped(s.accounting.list_payments())]
                + [("document", d) for d in dumped(s.documents.list())]
            )
            cards = self.indexer.index_entities(entities)
            chunks = 0
            for doc in s.documents.list():
                if doc.has_file and doc.content_type:
                    file = s.documents.read_file(doc.id)
                    chunks += self.indexer.index_document_file(doc.model_dump(mode="json"), file.data, file.content_type)
        log.info("Indexed %d record cards and %d document chunks using %s", cards, chunks, self.embeddings.name)
        return cards, chunks

    def domain(self, db: Session) -> DomainServices:
        documents = DocumentService(db, self.events, self.storage, self.settings.max_upload_bytes)
        residents = ResidentService(db, self.events, documents)
        staff = StaffService(db, self.events)
        accounting = AccountingService(db, self.events)
        reports = ReportService(db)
        return DomainServices(
            residents=residents, staff=staff, medical=MedicalService(db, self.events), documents=documents,
            accounting=accounting, reports=reports, users=UserService(db), settings=SettingsService(db),
            export=ExportService(residents, staff, accounting, documents, reports),
        )

    def gateway(self, db: Session) -> ServiceGateway:
        return ServiceGateway(self.domain(db))

    def shutdown(self) -> None:
        if self._executor:
            self._executor.shutdown(wait=True, cancel_futures=False)
