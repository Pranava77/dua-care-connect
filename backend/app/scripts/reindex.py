"""Rebuild the vector index from the database: python -m app.scripts.reindex"""

from __future__ import annotations

from app.container import Container
from app.core.config import get_settings


def reindex(container: Container) -> None:
    container.indexer.reset()
    with container.session_factory() as db:
        s = container.domain(db)
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
        cards = container.indexer.index_entities(entities)
        chunks = 0
        for doc in s.documents.list():
            if doc.has_file and doc.content_type:
                file = s.documents.read_file(doc.id)
                chunks += container.indexer.index_document_file(doc.model_dump(mode="json"), file.data, file.content_type)
    print(f"Indexed {cards} record cards and {chunks} document chunks "
          f"using {getattr(container.embeddings, 'name', 'embeddings')}.")


if __name__ == "__main__":
    reindex(Container(get_settings(), background_events=False))
