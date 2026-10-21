from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.ai.agent.registry import Tool, ToolContext, ToolResult
from app.ai.agent.tools.common import cite, dump, propose
from app.ai.gateway import DomainGateway
from app.domain.accounting.schemas import PaymentCreate


class ListInvoicesArgs(BaseModel):
    status: Literal["Paid", "Pending", "Overdue", "Cancelled"] | None = None
    resident_id: str | None = None


def list_invoices(ctx: ToolContext, args: ListInvoicesArgs) -> ToolResult:
    invoices = ctx.gateway.list_invoices(args.status, args.resident_id)
    return ToolResult(content={"invoices": dump(invoices)},
                      citations=[cite(i.invoice_number, "/accounting", "invoice", i.id) for i in invoices[:5]])


class NoArgs(BaseModel):
    pass


def list_outstanding_invoices(ctx: ToolContext, _: NoArgs) -> ToolResult:
    outstanding = ctx.gateway.outstanding_invoices()
    return ToolResult(content={"outstanding": dump(outstanding)},
                      citations=[cite(o.invoice.invoice_number, "/accounting", "invoice", o.invoice.id) for o in outstanding[:5]])


def get_financial_stats(ctx: ToolContext, _: NoArgs) -> ToolResult:
    return ToolResult(content={"currency": "GBP", **ctx.gateway.financial_stats().model_dump()})


class RecordPaymentArgs(BaseModel):
    invoice_id: str
    payment_method: Literal["UPI", "Card", "NEFT", "Cash", "Cheque"]
    amount: float | None = Field(default=None, gt=0, description="Defaults to the full invoice amount")
    transaction_id: str | None = None
    notes: str | None = None


def record_payment(ctx: ToolContext, args: RecordPaymentArgs) -> ToolResult:
    invoice = ctx.gateway.get_invoice(args.invoice_id)
    if invoice.status in ("Paid", "Cancelled"):
        return ToolResult.error(f"Invoice {invoice.invoice_number} is already {invoice.status}")
    args.amount = args.amount or invoice.amount
    payload = PaymentCreate(invoice_id=invoice.id, amount=args.amount, payment_method=args.payment_method,
                            transaction_id=args.transaction_id, notes=args.notes, processed_by=ctx.user.name)
    return propose(ctx, "record_payment", payload,
                   f"Record £{args.amount:,.2f} {args.payment_method} payment against {invoice.invoice_number} "
                   f"({invoice.resident_name}).")


def _execute_record_payment(gateway: DomainGateway, args: dict) -> dict:
    return gateway.record_payment(PaymentCreate(**args)).model_dump(mode="json")


TOOLS = [
    Tool("list_invoices", "List invoices, optionally filtered by status or resident.", ListInvoicesArgs,
         list_invoices, permissions=("accounting:read",)),
    Tool("list_outstanding_invoices", "Unpaid invoices with days overdue, most overdue first.", NoArgs,
         list_outstanding_invoices, permissions=("accounting:read",)),
    Tool("get_financial_stats", "Revenue, outstanding dues and today's payments.", NoArgs, get_financial_stats,
         permissions=("accounting:read",)),
    Tool("record_payment", "Propose recording a payment on an invoice. Requires user confirmation.",
         RecordPaymentArgs, record_payment, permissions=("accounting:create",), execute=_execute_record_payment),
]
