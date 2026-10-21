from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.ai.agent.registry import Tool, ToolContext, ToolResult
from app.ai.agent.tools.common import cite

EntityType = Literal["resident", "staff", "leave_request", "medical_record", "prescription", "invoice", "payment", "document"]


class SemanticSearchArgs(BaseModel):
    query: str = Field(description="Natural-language search query")
    resident_id: str | None = Field(default=None, description="Restrict to one resident")
    entity_type: EntityType | None = Field(default=None, description="Restrict to one kind of record")
    k: int = Field(default=6, ge=1, le=15)


def semantic_search(ctx: ToolContext, args: SemanticSearchArgs) -> ToolResult:
    hits = ctx.search.search(args.query, permissions=ctx.user.permissions, k=args.k,
                             resident_id=args.resident_id, entity_type=args.entity_type)
    return ToolResult(
        content={"results": [{"type": h.type, "id": h.id, "title": h.title, "text": h.snippet,
                              "resident_id": h.resident_id, "score": h.score} for h in hits]},
        citations=[cite(h.title, h.url, h.type, h.id) for h in hits[:5]],
    )


class SearchDocumentsArgs(BaseModel):
    query: str = Field(description="What to look for inside uploaded document text")
    resident_id: str | None = None
    document_id: str | None = None


def search_documents(ctx: ToolContext, args: SearchDocumentsArgs) -> ToolResult:
    hits = ctx.search.search_documents(args.query, permissions=ctx.user.permissions,
                                       resident_id=args.resident_id, document_id=args.document_id)
    return ToolResult(
        content={"passages": [{"document_id": h.document_id, "document": h.title, "text": h.snippet,
                               "score": h.score} for h in hits]},
        citations=[cite(h.title, h.url, "document", h.document_id or h.id) for h in hits[:5]],
    )


TOOLS = [
    Tool("semantic_search",
         "Search across all records the user may see (residents, medical, prescriptions, invoices, staff, "
         "leave, documents). Use for open-ended questions or to find IDs.",
         SemanticSearchArgs, semantic_search),
    Tool("search_documents", "Search the text content of uploaded documents (lab reports, contracts, consent forms).",
         SearchDocumentsArgs, search_documents, permissions=("documents:read",)),
]
