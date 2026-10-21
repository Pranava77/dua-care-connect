from __future__ import annotations

from sqlalchemy import func, select

from app.domain.accounting.models import Invoice, Payment
from app.domain.common import SqlRepository


class InvoiceRepository(SqlRepository[Invoice]):
    model = Invoice

    def search(self, *, status: str | None = None, resident_id: str | None = None) -> list[Invoice]:
        where = []
        if status:
            where.append(Invoice.status == status)
        if resident_id:
            where.append(Invoice.resident_id == resident_id)
        return self.list(*where, order_by=Invoice.created_at.desc())

    def next_number(self) -> str:
        count = self.db.scalar(select(func.count()).select_from(Invoice)) or 0
        return f"INV-{count + 1:03d}"


class PaymentRepository(SqlRepository[Payment]):
    model = Payment

    def all(self) -> list[Payment]:
        return self.list(order_by=Payment.payment_date.desc())

    def total_for_invoice(self, invoice_id: str) -> float:
        return float(self.db.scalar(select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.invoice_id == invoice_id)))
