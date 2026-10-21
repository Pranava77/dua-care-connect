from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field

from app.ai.agent.registry import Tool, ToolContext, ToolResult
from app.ai.agent.tools.common import cite, dump, propose
from app.ai.gateway import DomainGateway
from app.domain.medical.schemas import MedicalRecordCreate


class PrescriptionsDueArgs(BaseModel):
    within_days: int = Field(default=7, ge=0, le=90, description="Look-ahead window in days (overdue ones are always included)")


def list_prescriptions_due(ctx: ToolContext, args: PrescriptionsDueArgs) -> ToolResult:
    due = ctx.gateway.prescriptions_due(args.within_days)
    return ToolResult(
        content={"today": date.today().isoformat(), "prescriptions_due": dump(due)},
        citations=[cite(f"{d.prescription.medication} — {d.prescription.residents.name}",
                        f"/residents/{d.prescription.resident_id}", "prescription", d.prescription.id) for d in due[:5]],
    )


class MedicalRecordsArgs(BaseModel):
    resident_id: str | None = None


def list_medical_records(ctx: ToolContext, args: MedicalRecordsArgs) -> ToolResult:
    records = ctx.gateway.list_medical_records(args.resident_id)
    return ToolResult(content={"medical_records": dump(records)},
                      citations=[cite(f"{r.diagnosis} — {r.residents.name}", f"/residents/{r.resident_id}",
                                      "medical_record", r.id) for r in records[:5]])


class CreateMedicalRecordArgs(BaseModel):
    resident_id: str
    diagnosis: str
    treatment: str
    last_check_date: date
    notes: str = ""


def create_medical_record(ctx: ToolContext, args: CreateMedicalRecordArgs) -> ToolResult:
    resident = ctx.gateway.get_resident(args.resident_id)
    payload = MedicalRecordCreate(**args.model_dump(), doctor=ctx.user.name)
    return propose(ctx, "create_medical_record", payload,
                   f"Add medical record for {resident.name}: {args.diagnosis} — {args.treatment} "
                   f"(checked {args.last_check_date}, doctor {ctx.user.name}).")


def _execute_create_medical_record(gateway: DomainGateway, args: dict) -> dict:
    record = gateway.create_medical_record(MedicalRecordCreate(**args))
    return record.model_dump(mode="json")


TOOLS = [
    Tool("list_prescriptions_due", "Prescriptions needing a refill soon or already overdue.",
         PrescriptionsDueArgs, list_prescriptions_due, permissions=("medical:read",)),
    Tool("list_medical_records", "Medical records (diagnosis, treatment, notes), optionally for one resident.",
         MedicalRecordsArgs, list_medical_records, permissions=("medical:read",)),
    Tool("create_medical_record", "Propose a new medical record. Requires user confirmation before it is saved.",
         CreateMedicalRecordArgs, create_medical_record, permissions=("medical:create",),
         execute=_execute_create_medical_record),
]
