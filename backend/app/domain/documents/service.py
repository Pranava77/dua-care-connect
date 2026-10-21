from __future__ import annotations

from pathlib import PurePath

from sqlalchemy.orm import Session

from app.core.errors import DomainError, NotFoundError
from app.core.events import DocumentFileStored, EntityChanged, EventBus
from app.core.storage import FileStorage
from app.domain.common import apply_updates
from app.domain.documents.models import Document
from app.domain.documents.repository import DocumentRepository
from app.domain.documents.schemas import (
    DocumentCreate,
    DocumentFile,
    DocumentRead,
    DocumentStats,
    DocumentUpdate,
)

ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "text/plain",
}


def format_size(num_bytes: int) -> str:
    size = float(num_bytes)
    for unit in ("Bytes", "KB", "MB", "GB"):
        if size < 1024 or unit == "GB":
            return f"{int(size)} {unit}" if unit == "Bytes" else f"{size:.2f} {unit}"
        size /= 1024
    return f"{size:.2f} GB"


class DocumentService:
    def __init__(self, db: Session, events: EventBus, storage: FileStorage, max_bytes: int = 10 * 1024 * 1024):
        self.db = db
        self.events = events
        self.storage = storage
        self.max_bytes = max_bytes
        self.repo = DocumentRepository(db)

    def list(self, *, resident_id: str | None = None, category: str | None = None) -> list[DocumentRead]:
        return [DocumentRead.model_validate(d) for d in self.repo.search(resident_id=resident_id, category=category)]

    def get(self, document_id: str) -> DocumentRead:
        return DocumentRead.model_validate(self._get(document_id))

    def upload(self, data: DocumentCreate, *, filename: str, content_type: str, content: bytes) -> DocumentRead:
        if content_type not in ALLOWED_CONTENT_TYPES:
            raise DomainError(f"Unsupported file type: {content_type}")
        if len(content) > self.max_bytes:
            raise DomainError("File exceeds the maximum upload size")
        key = self.storage.save(content, filename=filename)
        document = Document(
            **data.model_dump(),
            file_type=(PurePath(filename).suffix.lstrip(".") or "FILE").upper()[:10],
            file_size=format_size(len(content)),
            storage_key=key,
            content_type=content_type,
        )
        self.repo.add(document)
        self.db.commit()
        dto = self._emit(document, "created")
        self.events.publish(DocumentFileStored(dto.id, key, content_type, dto.model_dump(mode="json")))
        return dto

    def can_edit(self, document_id: str, *, user_name: str, permissions: list[str]) -> bool:
        """Editors may change any document; uploaders may still fix their own pending uploads
        (e.g. applying the AI's category/resident suggestion right after upload)."""
        if "documents:update" in permissions:
            return True
        document = self._get(document_id)
        return "documents:create" in permissions and document.status == "Pending" and document.uploaded_by == user_name

    def update(self, document_id: str, data: DocumentUpdate) -> DocumentRead:
        document = self._get(document_id)
        apply_updates(document, data)
        self.db.commit()
        self.db.refresh(document)
        return self._emit(document, "updated")

    def delete(self, document_id: str) -> None:
        document = self._get(document_id)
        self._remove(document)
        self.db.commit()

    def delete_for_resident(self, resident_id: str) -> None:
        for document in self.repo.search(resident_id=resident_id):
            self._remove(document)
        self.db.flush()

    def read_file(self, document_id: str) -> DocumentFile:
        document = self._get(document_id)
        if not document.storage_key:
            raise NotFoundError("Document has no stored file")
        return DocumentFile(
            name=document.name,
            content_type=document.content_type or "application/octet-stream",
            data=self.storage.read(document.storage_key),
        )

    def stats(self) -> DocumentStats:
        docs = self.repo.search()
        return DocumentStats(
            admissionCount=sum(d.category == "Admission" for d in docs),
            kycCount=sum(d.category == "KYC" for d in docs),
            pendingCount=sum(d.status == "Pending" for d in docs),
            totalDocuments=len(docs),
        )

    def _remove(self, document: Document) -> None:
        key = document.storage_key
        self.repo.delete(document)
        if key:
            self.storage.delete(key)
        self.events.publish(EntityChanged("document", document.id, "deleted", {"document_id": document.id}))

    def _get(self, document_id: str) -> Document:
        document = self.repo.get(document_id)
        if document is None:
            raise NotFoundError("Document not found")
        return document

    def _emit(self, document: Document, action: str) -> DocumentRead:
        dto = DocumentRead.model_validate(document)
        self.events.publish(EntityChanged("document", dto.id, action, dto.model_dump(mode="json")))
        return dto
