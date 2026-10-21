"""Ports the AI layer depends on. Concrete adapters live in app.infra / app.adapters."""

from __future__ import annotations

from collections.abc import AsyncIterator, Sequence
from typing import Any, Protocol, TypeVar

from pydantic import BaseModel

from app.ai.schemas import (
    Attachment,
    ChatMessageRecord,
    ChatSessionSummary,
    LLMChunk,
    Message,
    ProposedAction,
    ToolSpec,
    VectorHit,
    VectorRecord,
)

SchemaT = TypeVar("SchemaT", bound=BaseModel)


class LLMUnavailableError(RuntimeError):
    """Raised when the language model cannot be reached or is not configured."""


class LLMProvider(Protocol):
    def stream(self, *, system: str, messages: Sequence[Message], tools: Sequence[ToolSpec] = ()) -> AsyncIterator[LLMChunk]:
        """Stream a model turn. Chunks carry text deltas and/or complete tool calls."""
        ...

    async def structured(self, *, system: str, prompt: str, schema: type[SchemaT],
                         attachments: Sequence[Attachment] = ()) -> SchemaT:
        """Generate JSON constrained to `schema`."""
        ...

    async def complete(self, *, system: str, prompt: str) -> str: ...


class EmbeddingProvider(Protocol):
    def embed_documents(self, texts: Sequence[str]) -> list[list[float]]: ...

    def embed_query(self, text: str) -> list[float]: ...


class VectorStore(Protocol):
    def upsert(self, collection: str, records: Sequence[VectorRecord], embeddings: Sequence[Sequence[float]]) -> None: ...

    def delete(self, collection: str, *, ids: Sequence[str] | None = None, where: dict[str, Any] | None = None) -> None: ...

    def query(self, collection: str, embedding: Sequence[float], *, k: int, where: dict[str, Any] | None = None) -> list[VectorHit]: ...

    def reset(self, collection: str) -> None: ...


class AgentStore(Protocol):
    """Persistence for conversations, pending actions and the tool audit trail."""

    def create_session(self, user_id: str, title: str) -> str: ...
    def session_owner(self, session_id: str) -> str | None: ...
    def list_sessions(self, user_id: str) -> list[ChatSessionSummary]: ...
    def add_message(self, session_id: str, role: str, content: str, meta: dict[str, Any] | None = None) -> None: ...
    def get_messages(self, session_id: str, limit: int = 50) -> list[ChatMessageRecord]: ...

    def create_action(self, session_id: str, user_id: str, tool: str, args: dict[str, Any], summary: str) -> ProposedAction: ...
    def get_action(self, action_id: str) -> tuple[ProposedAction, str] | None:
        """Returns the action and its owning user id."""
        ...
    def set_action_status(self, action_id: str, status: str, result: dict[str, Any] | None = None) -> ProposedAction: ...

    def audit(self, *, user_id: str, session_id: str | None, tool: str, args: dict[str, Any], ok: bool, summary: str) -> None: ...
