"""Composition root: the only place that knows every concrete implementation."""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy.orm import Session

from app.adapters.domain_gateway import ServiceGateway
from app.ai.agent.actions import ActionService
from app.ai.agent.service import AgentService
from app.ai.agent.tools import default_registry
from app.ai.docintel.service import DocIntelService
from app.ai.indexing.handlers import register_index_handlers
from app.ai.indexing.indexer import Indexer
from app.ai.ports import EmbeddingProvider, LLMProvider, VectorStore
from app.ai.reports.service import ReportsService
from app.ai.search.service import SearchService
from app.core.config import Settings
from app.core.db import Base, make_engine, make_session_factory
from app.core.events import EventBus
from app.core.storage import FileStorage
from app.domain.accounting.service import AccountingService
from app.domain.documents.service import DocumentService
from app.domain.medical.service import MedicalService
from app.domain.reports.service import ExportService, ReportService
from app.domain.residents.service import ResidentService
from app.domain.staff.service import StaffService
from app.domain.users.service import UserService
from app.infra import sql_agent_store
from app.infra.chroma_store import ChromaVectorStore
from app.infra.file_storage import LocalFileStorage
from app.infra.gemini_embeddings import GeminiEmbeddings
from app.infra.gemini_llm import GeminiLLM, UnconfiguredLLM
from app.infra.hashing_embeddings import HashingEmbeddings


@dataclass
class DomainServices:
    residents: ResidentService
    staff: StaffService
    medical: MedicalService
    documents: DocumentService
    accounting: AccountingService
    reports: ReportService
    users: UserService
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

        key = settings.gemini_api_key
        self.embeddings = embeddings or (
            GeminiEmbeddings(key, settings.gemini_embed_model, settings.embedding_dimensions) if key else HashingEmbeddings()
        )
        self.vector_store = vector_store or ChromaVectorStore(
            settings.chroma_path, namespace=getattr(self.embeddings, "name", "default")
        )
        self.llm = llm or (GeminiLLM(key, settings.gemini_chat_model) if key else UnconfiguredLLM())
        self.ai_enabled = llm is not None or bool(key)

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
        Base.metadata.create_all(self.engine)

    def domain(self, db: Session) -> DomainServices:
        documents = DocumentService(db, self.events, self.storage, self.settings.max_upload_bytes)
        residents = ResidentService(db, self.events, documents)
        staff = StaffService(db, self.events)
        accounting = AccountingService(db, self.events)
        reports = ReportService(db)
        return DomainServices(
            residents=residents, staff=staff, medical=MedicalService(db, self.events), documents=documents,
            accounting=accounting, reports=reports, users=UserService(db),
            export=ExportService(residents, staff, accounting, documents, reports),
        )

    def gateway(self, db: Session) -> ServiceGateway:
        return ServiceGateway(self.domain(db))

    def shutdown(self) -> None:
        if self._executor:
            self._executor.shutdown(wait=True, cancel_futures=False)
