"""AI-drafted reports and deterministic operational alerts."""

from __future__ import annotations

import json
from collections.abc import Callable
from datetime import date
from typing import Any, Literal

from pydantic import BaseModel

from app.ai.ports import LLMProvider
from app.ai.gateway import DomainGateway
from app.ai.schemas import AlertItem
from app.core.errors import PermissionDeniedError
from app.domain.users.schemas import AuthUser

ReportKind = Literal["clinical_summary", "refill_alerts", "overdue_dues", "financial_overview", "staff_leave", "occupancy"]

SYSTEM = (
    "You write concise operational reports for a residential care home's management team. "
    "Use Markdown with a title, a short executive summary, tables where useful, and a 'Recommended actions' list. "
    "Use only the JSON data provided; if something is missing say so. Amounts are in GBP. "
    "Do not give clinical advice; flag items for clinician review instead."
)


class DraftReport(BaseModel):
    kind: ReportKind
    title: str
    markdown: str
    generated_at: str


def _dump(items: list[BaseModel]) -> list[dict[str, Any]]:
    return [i.model_dump(mode="json") for i in items]


_KINDS: dict[str, tuple[str, str, Callable[[DomainGateway], dict[str, Any]]]] = {
    "clinical_summary": ("Clinical Summary", "medical:read", lambda g: {
        "residents": _dump(g.list_residents()),
        "medical_records": _dump(g.list_medical_records()),
        "prescriptions": _dump(g.list_prescriptions()),
    }),
    "refill_alerts": ("Medication Refill Alerts", "medical:read", lambda g: {
        "due_within_14_days_or_overdue": _dump(g.prescriptions_due(14)),
    }),
    "overdue_dues": ("Outstanding & Overdue Invoices", "accounting:read", lambda g: {
        "outstanding": _dump(g.outstanding_invoices()),
    }),
    "financial_overview": ("Financial Overview", "accounting:read", lambda g: {
        "stats": g.financial_stats().model_dump(),
        "invoices": _dump(g.list_invoices()),
    }),
    "staff_leave": ("Staff & Leave Report", "hr:read", lambda g: {
        "staff": _dump(g.list_staff()),
        "leave_requests": _dump(g.list_leave_requests()),
    }),
    "occupancy": ("Resident Occupancy Report", "residents:read", lambda g: {
        "residents": _dump(g.list_residents()),
    }),
}


class ReportsService:
    def __init__(self, llm: LLMProvider):
        self.llm = llm

    @staticmethod
    def kinds() -> list[dict[str, str]]:
        return [{"kind": k, "title": v[0], "permission": v[1]} for k, v in _KINDS.items()]

    async def draft(self, kind: ReportKind, gateway: DomainGateway, user: AuthUser) -> DraftReport:
        title, permission, gather = _KINDS[kind]
        if "reports:generate" not in user.permissions or permission not in user.permissions:
            raise PermissionDeniedError(f"Your role cannot generate the {title}")
        today = date.today().isoformat()
        data = gather(gateway)
        markdown = await self.llm.complete(
            system=SYSTEM,
            prompt=f"Report: {title}\nToday's date: {today}\nPrepared for: {user.name} ({user.role})\n\nData:\n"
                   f"{json.dumps(data, default=str)[:60_000]}",
        )
        return DraftReport(kind=kind, title=title, markdown=markdown, generated_at=today)

    @staticmethod
    def alerts(gateway: DomainGateway, user: AuthUser, today: date | None = None) -> list[AlertItem]:
        today = today or date.today()
        perms = set(user.permissions)
        alerts: list[AlertItem] = []
        if "medical:read" in perms:
            for due in gateway.prescriptions_due(7):
                p = due.prescription
                when = f"overdue by {-due.days_until_refill} days" if due.overdue else f"due in {due.days_until_refill} days"
                alerts.append(AlertItem(kind="refill_due", severity="high" if due.overdue else "medium",
                                        title=f"{p.medication} refill for {p.residents.name}",
                                        detail=f"Refill {when} ({p.refill_date:%d %b %Y}). {p.dosage}, {p.frequency.lower()}.",
                                        url=f"/residents/{p.resident_id}", resident_id=p.resident_id))
        if "accounting:read" in perms:
            for item in gateway.outstanding_invoices():
                if item.days_overdue > 0:
                    inv = item.invoice
                    alerts.append(AlertItem(kind="invoice_overdue", severity="high" if item.days_overdue > 30 else "medium",
                                            title=f"{inv.invoice_number} overdue for {inv.resident_name}",
                                            detail=f"£{inv.amount:,.0f} was due {inv.due_date:%d %b %Y} ({item.days_overdue} days ago).",
                                            url="/accounting", resident_id=inv.resident_id))
        if "hr:read" in perms:
            for leave in gateway.list_leave_requests("pending"):
                alerts.append(AlertItem(kind="leave_pending", severity="low",
                                        title=f"Leave request from {leave.staff.name}",
                                        detail=f"{leave.from_date:%d %b} to {leave.to_date:%d %b %Y}: {leave.reason}", url="/hr"))
        if "documents:read" in perms:
            for doc in gateway.list_documents():
                if doc.status == "Pending":
                    alerts.append(AlertItem(kind="document_pending", severity="low",
                                            title="Document awaiting verification", detail=doc.name, url="/documents",
                                            resident_id=doc.resident_id))
        order = {"high": 0, "medium": 1, "low": 2}
        return sorted(alerts, key=lambda a: order[a.severity])
