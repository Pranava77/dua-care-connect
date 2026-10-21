"""Data contracts for the AI layer (provider-neutral)."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

# ---- LLM conversation primitives -------------------------------------------------


class ToolCall(BaseModel):
    id: str
    name: str
    args: dict[str, Any] = {}
    # Opaque provider data that must be echoed back on the next turn
    # (e.g. Gemini thought signatures).
    provider_meta: dict[str, Any] = {}


class Message(BaseModel):
    role: Literal["user", "assistant", "tool"]
    content: str = ""
    tool_calls: list[ToolCall] = []
    tool_call_id: str | None = None
    tool_name: str | None = None
    tool_result: dict[str, Any] | None = None


class ToolSpec(BaseModel):
    name: str
    description: str
    parameters: dict[str, Any]


class LLMChunk(BaseModel):
    text: str = ""
    tool_calls: list[ToolCall] = []


class Attachment(BaseModel):
    mime_type: str
    data: bytes


# ---- Retrieval --------------------------------------------------------------------


class VectorRecord(BaseModel):
    id: str
    text: str
    metadata: dict[str, str | int | float | bool]


class VectorHit(BaseModel):
    id: str
    text: str
    metadata: dict[str, Any]
    score: float


class SearchHit(BaseModel):
    """A retrieval result shaped for both the UI (GlobalSearch) and agent citations."""

    id: str
    type: str
    title: str
    snippet: str
    url: str
    score: float
    module: str
    resident_id: str | None = None
    document_id: str | None = None


class Citation(BaseModel):
    title: str
    url: str
    type: str
    id: str


# ---- Document intelligence --------------------------------------------------------

DocCategory = Literal["Admission", "KYC", "Consent", "Contract", "Financial", "Medical"]


class DocSuggestion(BaseModel):
    category: DocCategory
    resident_id: str | None = Field(default=None, description="ID of the resident this document is about, if any")
    resident_name: str | None = None
    summary: str = Field(description="2-3 sentence factual summary of the document")
    confidence: float = Field(ge=0, le=1)


class DocTranscript(BaseModel):
    text: str = Field(description="Full plain-text transcription of the document")


# ---- Agent ------------------------------------------------------------------------

AgentEventType = Literal[
    "session", "step", "tool_call", "tool_result", "token", "citations", "proposed_action", "error", "done",
]


class AgentEvent(BaseModel):
    type: AgentEventType
    data: dict[str, Any] = {}


class ProposedAction(BaseModel):
    id: str
    tool: str
    args: dict[str, Any]
    summary: str
    status: Literal["pending", "executed", "rejected", "failed"] = "pending"
    result: dict[str, Any] | None = None


class ChatSessionSummary(BaseModel):
    id: str
    title: str
    updated_at: str


class ChatMessageRecord(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    meta: dict[str, Any] = {}
    created_at: str


class AlertItem(BaseModel):
    kind: Literal["refill_due", "invoice_overdue", "leave_pending", "document_pending"]
    severity: Literal["high", "medium", "low"]
    title: str
    detail: str
    url: str
