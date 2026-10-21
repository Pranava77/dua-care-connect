"""Document intelligence: classify, link to a resident, summarise and answer questions."""

from __future__ import annotations

import asyncio

from pydantic import BaseModel, Field

from app.ai.indexing.extract import extract_text, needs_transcription
from app.ai.indexing.indexer import Indexer
from app.ai.ports import LLMProvider
from app.ai.gateway import DomainGateway
from app.ai.schemas import Attachment, DocCategory, DocSuggestion
from app.domain.documents.schemas import DocumentUpdate

MAX_CHARS = 20_000
MULTIMODAL_TYPES = ("application/pdf", "image/jpeg", "image/png")

SYSTEM = (
    "You are a records clerk at a residential care home. You classify uploaded documents, "
    "identify which resident they concern, and summarise them factually. Never invent details "
    "that are not in the document."
)


class _Analysis(BaseModel):
    category: DocCategory
    resident_id: str | None = Field(default=None, description="Exactly one ID from the roster, or null")
    summary: str
    confidence: float = Field(ge=0, le=1)
    transcript: str = Field(default="", description="Full text of the document when it was provided as a file")


class DocIntelService:
    def __init__(self, llm: LLMProvider, indexer: Indexer):
        self.llm = llm
        self.indexer = indexer

    async def analyze(self, gateway: DomainGateway, document_id: str) -> DocSuggestion:
        document = gateway.get_document(document_id)
        file = gateway.read_document_file(document_id)
        residents = gateway.list_residents()
        roster = "\n".join(f"- {r.id}: {r.name} (room {r.room_number})" for r in residents)
        pages = extract_text(file.data, file.content_type)
        instructions = (
            f"Document name: {document.name}\nUploader's description: {document.description or 'none'}\n"
            f"Resident roster (id: name):\n{roster}\n\n"
            "Choose the best category (Admission, KYC, Consent, Contract, Financial, Medical), the resident it "
            "concerns (or null), a 2-3 sentence summary, and your confidence from 0 to 1."
        )
        if needs_transcription(pages) and file.content_type in MULTIMODAL_TYPES:
            analysis = await self.llm.structured(
                system=SYSTEM, schema=_Analysis,
                prompt=instructions + " Also return the full transcript of the attached file.",
                attachments=[Attachment(mime_type=file.content_type, data=file.data)],
            )
            if analysis.transcript.strip():
                await asyncio.to_thread(self.indexer.index_document_text,
                                        document.model_dump(mode="json"), [(1, analysis.transcript)])
        else:
            text = "\n\n".join(t for _, t in pages)[:MAX_CHARS]
            analysis = await self.llm.structured(
                system=SYSTEM, schema=_Analysis,
                prompt=f"{instructions} Leave transcript empty.\n\nDocument text:\n{text}",
            )
        by_id = {r.id: r for r in residents}
        resident = by_id.get(analysis.resident_id or "")
        suggestion = DocSuggestion(
            category=analysis.category,
            resident_id=resident.id if resident else None,
            resident_name=resident.name if resident else None,
            summary=analysis.summary,
            confidence=analysis.confidence,
        )
        gateway.update_document(document_id, DocumentUpdate(ai_suggestion=suggestion.model_dump()))
        return suggestion

    async def summarize(self, gateway: DomainGateway, document_id: str, question: str | None = None) -> str:
        document = gateway.get_document(document_id)
        if not document.has_file:
            return f"'{document.name}' has no stored file. Description: {document.description or 'none'}."
        file = gateway.read_document_file(document_id)
        pages = extract_text(file.data, file.content_type)
        task = f"Answer this question using only the document: {question}" if question else \
            "Summarise the document in a few bullet points, highlighting dates, values and required actions."
        if needs_transcription(pages) and file.content_type in MULTIMODAL_TYPES:
            result = await self.llm.structured(
                system=SYSTEM, schema=_Summary, prompt=f"Document '{document.name}'. {task}",
                attachments=[Attachment(mime_type=file.content_type, data=file.data)],
            )
            return result.answer
        text = "\n\n".join(t for _, t in pages)[:MAX_CHARS]
        return await self.llm.complete(system=SYSTEM, prompt=f"Document '{document.name}':\n{text}\n\n{task}")


class _Summary(BaseModel):
    answer: str
