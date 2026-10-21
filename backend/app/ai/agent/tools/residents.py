from __future__ import annotations

from pydantic import BaseModel, Field

from app.ai.agent.registry import Tool, ToolContext, ToolResult
from app.ai.agent.tools.common import cite, dump


class FindResidentArgs(BaseModel):
    name: str = Field(description="Full or partial resident name")


def find_resident(ctx: ToolContext, args: FindResidentArgs) -> ToolResult:
    matches = ctx.gateway.find_residents(args.name)
    return ToolResult(content={"residents": [{"id": r.id, "name": r.name, "room_number": r.room_number} for r in matches]})


class ResidentProfileArgs(BaseModel):
    resident_id: str


def get_resident_profile(ctx: ToolContext, args: ResidentProfileArgs) -> ToolResult:
    """Profile sections are included only for modules the user may read."""
    perms = set(ctx.user.permissions)
    resident = ctx.gateway.get_resident(args.resident_id)
    profile: dict = {"resident": resident.model_dump(mode="json")}
    if "medical:read" in perms:
        profile["medical_records"] = dump(ctx.gateway.list_medical_records(resident.id))
        profile["prescriptions"] = dump(ctx.gateway.list_prescriptions(resident.id))
    if "accounting:read" in perms:
        profile["invoices"] = dump(ctx.gateway.list_invoices(resident_id=resident.id))
    if "documents:read" in perms:
        profile["documents"] = [{"id": d.id, "name": d.name, "category": d.category, "status": d.status}
                                for d in ctx.gateway.list_documents(resident.id)]
    hidden = [m for m in ("medical", "accounting") if f"{m}:read" not in perms]
    if hidden:
        profile["withheld_sections"] = hidden
    return ToolResult(content=profile,
                      citations=[cite(resident.name, f"/residents/{resident.id}", "resident", resident.id)])


TOOLS = [
    Tool("find_resident", "Look up residents by name to get their IDs and rooms.", FindResidentArgs,
         find_resident, permissions=("residents:read",)),
    Tool("get_resident_profile", "Full profile for one resident: details plus medical, billing and documents "
         "that the user is allowed to see.", ResidentProfileArgs, get_resident_profile,
         permissions=("residents:read",)),
]
