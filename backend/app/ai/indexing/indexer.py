"""Keeps the vector store in sync with domain data."""

from __future__ import annotations

import logging
from collections.abc import Iterable
from typing import Any

from app.ai.indexing.cards import DOCUMENTS, RECORDS, build_card, build_chunk_records, card_id
from app.ai.indexing.chunking import chunk_pages
from app.ai.indexing.extract import extract_text
from app.ai.ports import EmbeddingProvider, VectorStore

log = logging.getLogger(__name__)

BATCH = 64


class Indexer:
    def __init__(self, store: VectorStore, embeddings: EmbeddingProvider):
        self.store = store
        self.embeddings = embeddings

    def index_entity(self, entity_type: str, data: dict[str, Any]) -> None:
        record = build_card(entity_type, data)
        if record is None:
            return
        self.store.upsert(RECORDS, [record], self.embeddings.embed_documents([record.text]))

    def index_entities(self, items: Iterable[tuple[str, dict[str, Any]]]) -> int:
        records = [r for r in (build_card(t, d) for t, d in items) if r is not None]
        for i in range(0, len(records), BATCH):
            batch = records[i:i + BATCH]
            self.store.upsert(RECORDS, batch, self.embeddings.embed_documents([r.text for r in batch]))
        return len(records)

    def remove_entity(self, entity_type: str, entity_id: str) -> None:
        self.store.delete(RECORDS, ids=[card_id(entity_type, entity_id)])
        if entity_type == "document":
            self.store.delete(DOCUMENTS, where={"document_id": entity_id})
        elif entity_type == "resident":
            # Child rows were removed by a database cascade; drop everything tied to the resident.
            self.store.delete(RECORDS, where={"resident_id": entity_id})
            self.store.delete(DOCUMENTS, where={"resident_id": entity_id})

    def index_document_file(self, document: dict[str, Any], data: bytes, content_type: str) -> int:
        return self.index_document_text(document, extract_text(data, content_type))

    def index_document_text(self, document: dict[str, Any], pages: list[tuple[int, str]]) -> int:
        chunks = chunk_pages(pages)
        self.store.delete(DOCUMENTS, where={"document_id": document["id"]})
        if not chunks:
            return 0
        records = build_chunk_records(document, chunks)
        for i in range(0, len(records), BATCH):
            batch = records[i:i + BATCH]
            self.store.upsert(DOCUMENTS, batch, self.embeddings.embed_documents([r.text for r in batch]))
        log.info("Indexed %d chunks for document %s", len(records), document["id"])
        return len(records)

    def reset(self) -> None:
        self.store.reset(RECORDS)
        self.store.reset(DOCUMENTS)
