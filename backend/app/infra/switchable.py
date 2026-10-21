"""Providers whose underlying implementation can be swapped at runtime (e.g. when an admin
saves a new API key) without rebuilding the services that hold a reference to them."""

from __future__ import annotations

from collections.abc import AsyncIterator, Sequence
from typing import Any

from app.ai.ports import EmbeddingProvider, LLMProvider
from app.ai.schemas import LLMChunk


class SwitchableLLM:
    def __init__(self, inner: LLMProvider):
        self.inner = inner

    def swap(self, inner: LLMProvider) -> None:
        self.inner = inner

    def stream(self, **kwargs: Any) -> AsyncIterator[LLMChunk]:
        return self.inner.stream(**kwargs)

    async def structured(self, **kwargs: Any):  # noqa: ANN201
        return await self.inner.structured(**kwargs)

    async def complete(self, **kwargs: Any) -> str:
        return await self.inner.complete(**kwargs)


class SwitchableEmbeddings:
    def __init__(self, inner: EmbeddingProvider):
        self.inner = inner

    def swap(self, inner: EmbeddingProvider) -> None:
        self.inner = inner

    @property
    def name(self) -> str:
        return getattr(self.inner, "name", "default")

    def embed_documents(self, texts: Sequence[str]) -> list[list[float]]:
        return self.inner.embed_documents(texts)

    def embed_query(self, text: str) -> list[float]:
        return self.inner.embed_query(text)
