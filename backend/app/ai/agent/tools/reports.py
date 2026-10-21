from __future__ import annotations

from pydantic import BaseModel

from app.ai.agent.registry import Tool, ToolContext, ToolResult
from app.ai.reports.service import ReportKind


class DraftReportArgs(BaseModel):
    kind: ReportKind


async def draft_report(ctx: ToolContext, args: DraftReportArgs) -> ToolResult:
    report = await ctx.reports.draft(args.kind, ctx.gateway, ctx.user)
    return ToolResult(content=report.model_dump())


class NoArgs(BaseModel):
    pass


def get_alerts(ctx: ToolContext, _: NoArgs) -> ToolResult:
    alerts = ctx.reports.alerts(ctx.gateway, ctx.user)
    return ToolResult(content={"alerts": [a.model_dump() for a in alerts]})


TOOLS = [
    Tool("draft_report", "Draft a Markdown management report of the given kind.", DraftReportArgs, draft_report,
         permissions=("reports:generate",)),
    Tool("get_alerts", "Current operational alerts: overdue refills, overdue invoices, pending leave and documents.",
         NoArgs, get_alerts, permissions=("dashboard:read",)),
]
