from __future__ import annotations

from app.domain.common import SqlRepository
from app.domain.documents.models import Document


class DocumentRepository(SqlRepository[Document]):
    model = Document

    def search(self, *, resident_id: str | None = None, category: str | None = None) -> list[Document]:
        where = []
        if resident_id:
            where.append(Document.resident_id == resident_id)
        if category:
            where.append(Document.category == category)
        return self.list(*where, order_by=Document.uploaded_at.desc())
