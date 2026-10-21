"""Permission-aware semantic search over the vector index."""

from __future__ import annotations

from typing import Any

from app.ai.indexing.cards import DOCUMENTS, RECORDS
from app.ai.ports import EmbeddingProvider, VectorStore
from app.ai.schemas import SearchHit, VectorHit
from app.core.rbac import allowed_modules


def _where(modules: list[str], filters: dict[str, Any]) -> dict[str, Any]:
    clauses: list[dict[str, Any]] = [{"module": {"$in": modules}}]
    clauses += [{k: v} for k, v in filters.items() if v is not None]
    return clauses[0] if len(clauses) == 1 else {"$and": clauses}


def _to_hit(hit: VectorHit) -> SearchHit:
    m = hit.metadata
    snippet = hit.text if len(hit.text) <= 280 else hit.text[:277] + "…"
    return SearchHit(
        id=str(m.get("entity_id", hit.id)),
        type=str(m.get("entity_type", "record")),
        title=str(m.get("title", "")),
        snippet=snippet,
        url=str(m.get("url", "/")),
        score=round(hit.score, 4),
        module=str(m.get("module", "")),
        resident_id=m.get("resident_id"),
        document_id=m.get("document_id"),
    )


class SearchService:
    def __init__(self, store: VectorStore, embeddings: EmbeddingProvider):
        self.store = store
        self.embeddings = embeddings

    def search(
        self,
        query: str,
        *,
        permissions: list[str],
        k: int = 8,
        collections: tuple[str, ...] = (RECORDS, DOCUMENTS),
        resident_id: str | None = None,
        document_id: str | None = None,
        entity_type: str | None = None,
        min_score: float = 0.0,
        dedupe: bool = True,
    ) -> list[SearchHit]:
        modules = allowed_modules(permissions)
        if not modules or not query.strip():
            return []
        vector = self.embeddings.embed_query(query)
        filters = {"resident_id": resident_id, "document_id": document_id, "entity_type": entity_type}
        where = _where(modules, filters)
        hits: list[VectorHit] = []
        for collection in collections:
            hits += self.store.query(collection, vector, k=k, where=where)
        hits.sort(key=lambda h: h.score, reverse=True)
        results: list[SearchHit] = []
        seen: set[tuple[str, str]] = set()
        for hit in (_to_hit(h) for h in hits if h.score >= min_score):
            key = (hit.module, hit.document_id or f"{hit.type}:{hit.id}")
            if dedupe and key in seen:
                continue
            seen.add(key)
            results.append(hit)
        return results[:k]

    def search_documents(self, query: str, *, permissions: list[str], k: int = 6,
                         resident_id: str | None = None, document_id: str | None = None) -> list[SearchHit]:
        return self.search(query, permissions=permissions, k=k, collections=(DOCUMENTS,),
                           resident_id=resident_id, document_id=document_id, dedupe=False)
