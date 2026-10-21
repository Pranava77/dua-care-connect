from __future__ import annotations

from pydantic import BaseModel, Field

from app.ai.agent.registry import Tool, ToolContext, ToolResult
from app.ai.agent.tools.common import cite


class ListDocumentsArgs(BaseModel):
    resident_id: str | None = None


def list_documents(ctx: ToolContext, args: ListDocumentsArgs) -> ToolResult:
    docs = ctx.gateway.list_documents(args.resident_id)
    return ToolResult(content={"documents": [
        {"id": d.id, "name": d.name, "category": d.category, "status": d.status, "resident_name": d.resident_name,
         "uploaded_at": d.uploaded_at.isoformat(), "has_file": d.has_file, "description": d.description}
        for d in docs
    ]})


class SummarizeDocumentArgs(BaseModel):
    document_id: str
    question: str | None = Field(default=None, description="Optional specific question to answer from the document")


async def summarize_document(ctx: ToolContext, args: SummarizeDocumentArgs) -> ToolResult:
    document = ctx.gateway.get_document(args.document_id)
    answer = await ctx.docintel.summarize(ctx.gateway, args.document_id, args.question)
    return ToolResult(content={"document": document.name, "answer": answer},
                      citations=[cite(document.name, "/documents", "document", document.id)])


TOOLS = [
    Tool("list_documents", "List uploaded documents, optionally for one resident.", ListDocumentsArgs,
         list_documents, permissions=("documents:read",)),
    Tool("summarize_document", "Read one document and summarise it or answer a question about it.",
         SummarizeDocumentArgs, summarize_document, permissions=("documents:read",)),
]
