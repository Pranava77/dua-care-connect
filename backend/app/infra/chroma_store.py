from __future__ import annotations

import re
from collections.abc import Sequence
from pathlib import Path
from typing import Any

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.ai.schemas import VectorHit, VectorRecord


class ChromaVectorStore:
    """VectorStore adapter for ChromaDB. Embeddings are computed by the caller.

    Collections are namespaced by embedding model so switching providers (which
    changes vector dimensions) never mixes incompatible vectors.
    """

    def __init__(self, path: Path | None, namespace: str):
        settings = ChromaSettings(anonymized_telemetry=False, allow_reset=False)
        self._client = (
            chromadb.PersistentClient(path=str(path), settings=settings) if path else chromadb.EphemeralClient(settings=settings)
        )
        self._namespace = re.sub(r"[^A-Za-z0-9._-]", "-", namespace)
        self._collections: dict[str, Any] = {}

    def _name(self, collection: str) -> str:
        return f"{collection}__{self._namespace}"

    def _col(self, collection: str):  # noqa: ANN202
        if collection not in self._collections:
            self._collections[collection] = self._client.get_or_create_collection(
                self._name(collection), embedding_function=None, configuration={"hnsw": {"space": "cosine"}}
            )
        return self._collections[collection]

    def upsert(self, collection: str, records: Sequence[VectorRecord], embeddings: Sequence[Sequence[float]]) -> None:
        if not records:
            return
        self._col(collection).upsert(
            ids=[r.id for r in records],
            embeddings=[list(e) for e in embeddings],
            documents=[r.text for r in records],
            metadatas=[r.metadata for r in records],
        )

    def delete(self, collection: str, *, ids: Sequence[str] | None = None, where: dict[str, Any] | None = None) -> None:
        if ids:
            self._col(collection).delete(ids=list(ids))
        elif where:
            self._col(collection).delete(where=where)

    def query(self, collection: str, embedding: Sequence[float], *, k: int, where: dict[str, Any] | None = None) -> list[VectorHit]:
        col = self._col(collection)
        if col.count() == 0:
            return []
        res = col.query(
            query_embeddings=[list(embedding)], n_results=k, where=where,
            include=["documents", "metadatas", "distances"],
        )
        return [
            VectorHit(id=i, text=doc or "", metadata=meta or {}, score=1.0 - float(dist))
            for i, doc, meta, dist in zip(res["ids"][0], res["documents"][0], res["metadatas"][0], res["distances"][0])
        ]

    def reset(self, collection: str) -> None:
        try:
            self._client.delete_collection(self._name(collection))
        except Exception:  # noqa: BLE001 - collection may not exist yet
            pass
        self._collections.pop(collection, None)
