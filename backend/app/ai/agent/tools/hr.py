from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

from app.ai.agent.registry import Tool, ToolContext, ToolResult
from app.ai.agent.tools.common import cite, dump, propose
from app.ai.gateway import DomainGateway


class NoArgs(BaseModel):
    pass


def list_staff(ctx: ToolContext, _: NoArgs) -> ToolResult:
    return ToolResult(content={"staff": dump(ctx.gateway.list_staff())}, citations=[cite("HR & Staff", "/hr", "page", "hr")])


class LeaveArgs(BaseModel):
    status: Literal["pending", "approved", "rejected"] | None = None


def list_leave_requests(ctx: ToolContext, args: LeaveArgs) -> ToolResult:
    return ToolResult(content={"leave_requests": dump(ctx.gateway.list_leave_requests(args.status))},
                      citations=[cite("Leave requests", "/hr", "page", "hr")])


class LeaveDecisionArgs(BaseModel):
    leave_id: str
    status: Literal["approved", "rejected"]


def update_leave_status(ctx: ToolContext, args: LeaveDecisionArgs) -> ToolResult:
    request = next((lr for lr in ctx.gateway.list_leave_requests() if lr.id == args.leave_id), None)
    if request is None:
        return ToolResult.error("Leave request not found")
    verb = "Approve" if args.status == "approved" else "Reject"
    return propose(ctx, "update_leave_status", args,
                   f"{verb} leave for {request.staff.name} ({request.from_date} to {request.to_date}).")


def _execute_update_leave_status(gateway: DomainGateway, args: dict) -> dict:
    return gateway.update_leave_status(args["leave_id"], args["status"]).model_dump(mode="json")


TOOLS = [
    Tool("list_staff", "List staff members with positions and departments.", NoArgs, list_staff, permissions=("hr:read",)),
    Tool("list_leave_requests", "List staff leave requests, optionally by status.", LeaveArgs, list_leave_requests,
         permissions=("hr:read",)),
    Tool("update_leave_status", "Propose approving or rejecting a leave request. Requires user confirmation.",
         LeaveDecisionArgs, update_leave_status, permissions=("hr:update",), execute=_execute_update_leave_status),
]
