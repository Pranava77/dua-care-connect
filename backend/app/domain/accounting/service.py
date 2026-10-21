from __future__ import annotations

from datetime import date

from sqlalchemy.orm import Session

from app.core.db import utcnow
from app.core.errors import DomainError, NotFoundError
from app.core.events import EntityChanged, EventBus
from app.domain.accounting.models import Invoice, Payment
from app.domain.accounting.repository import InvoiceRepository, PaymentRepository
from app.domain.accounting.schemas import (
    FinancialStats,
    InvoiceCreate,
    InvoiceRead,
    InvoiceStatus,
    InvoiceUpdate,
    OutstandingInvoice,
    PaymentCreate,
    PaymentRead,
)
from app.domain.residents.models import Resident


class AccountingService:
    def __init__(self, db: Session, events: EventBus):
        self.db = db
        self.events = events
        self.invoices = InvoiceRepository(db)
        self.payments = PaymentRepository(db)

    # Invoices
    def list_invoices(self, *, status: InvoiceStatus | None = None, resident_id: str | None = None) -> list[InvoiceRead]:
        return [InvoiceRead.model_validate(i) for i in self.invoices.search(status=status, resident_id=resident_id)]

    def get_invoice(self, invoice_id: str) -> InvoiceRead:
        return InvoiceRead.model_validate(self._get_invoice(invoice_id))

    def outstanding(self, today: date | None = None) -> list[OutstandingInvoice]:
        """Unpaid invoices (Pending or Overdue) with how many days past due they are."""
        today = today or date.today()
        unpaid = [i for i in self.invoices.search() if i.status in ("Pending", "Overdue")]
        return sorted(
            (OutstandingInvoice(invoice=InvoiceRead.model_validate(i), days_overdue=max((today - i.due_date).days, 0))
             for i in unpaid),
            key=lambda o: -o.days_overdue,
        )

    def create_invoice(self, data: InvoiceCreate) -> InvoiceRead:
        if self.db.get(Resident, data.resident_id) is None:
            raise NotFoundError("Resident not found")
        amount = data.amount if data.amount is not None else sum(line.amount for line in data.services)
        if amount <= 0:
            raise DomainError("Invoice amount must be greater than zero")
        invoice = Invoice(
            **data.model_dump(exclude={"amount", "invoice_number", "services"}),
            invoice_number=data.invoice_number or self.invoices.next_number(),
            amount=amount,
            services=[line.model_dump() for line in data.services],
        )
        self.invoices.add(invoice)
        self.db.commit()
        self.db.refresh(invoice)
        return self._emit_invoice(invoice, "created")

    def update_invoice(self, invoice_id: str, data: InvoiceUpdate) -> InvoiceRead:
        invoice = self._get_invoice(invoice_id)
        updates = data.model_dump(exclude_unset=True)
        if "services" in updates and data.services is not None:
            updates["services"] = [line.model_dump() for line in data.services]
        for key, value in updates.items():
            setattr(invoice, key, value)
        self.db.commit()
        self.db.refresh(invoice)
        return self._emit_invoice(invoice, "updated")

    def delete_invoice(self, invoice_id: str) -> None:
        invoice = self._get_invoice(invoice_id)
        self.invoices.delete(invoice)
        self.db.commit()
        self.events.publish(EntityChanged("invoice", invoice_id, "deleted"))

    # Payments
    def list_payments(self) -> list[PaymentRead]:
        return [PaymentRead.model_validate(p) for p in self.payments.all()]

    def record_payment(self, data: PaymentCreate) -> PaymentRead:
        """Record a payment; the invoice is marked Paid once payments cover its amount."""
        invoice = self._get_invoice(data.invoice_id)
        if invoice.status in ("Paid", "Cancelled"):
            raise DomainError(f"Invoice {invoice.invoice_number} is already {invoice.status}")
        payment = Payment(**data.model_dump(exclude={"payment_date"}), payment_date=data.payment_date or utcnow())
        self.payments.add(payment)
        if self.payments.total_for_invoice(invoice.id) >= invoice.amount:
            invoice.status = "Paid"
            invoice.paid_at = payment.payment_date
            invoice.payment_method = payment.payment_method
        self.db.commit()
        self.db.refresh(invoice)
        dto = PaymentRead.model_validate(payment)
        self.events.publish(EntityChanged("payment", dto.id, "created", dto.model_dump(mode="json")))
        self._emit_invoice(invoice, "updated")
        return dto

    def stats(self, today: date | None = None) -> FinancialStats:
        today = today or date.today()
        invoices = self.invoices.search()
        payments = self.payments.all()
        paid_today = [p for p in payments if p.payment_date.date() == today]
        return FinancialStats(
            totalRevenue=sum(i.amount for i in invoices if i.status == "Paid"),
            outstandingDues=sum(i.amount for i in invoices if i.status in ("Pending", "Overdue")),
            thisMonthRevenue=sum(
                i.amount for i in invoices
                if i.status == "Paid" and i.paid_at and (i.paid_at.year, i.paid_at.month) == (today.year, today.month)
            ),
            paidToday=sum(p.amount for p in paid_today),
            paidTodayCount=len(paid_today),
        )

    def _get_invoice(self, invoice_id: str) -> Invoice:
        invoice = self.invoices.get(invoice_id)
        if invoice is None:
            raise NotFoundError("Invoice not found")
        return invoice

    def _emit_invoice(self, invoice: Invoice, action: str) -> InvoiceRead:
        dto = InvoiceRead.model_validate(invoice)
        self.events.publish(EntityChanged("invoice", dto.id, action, dto.model_dump(mode="json")))
        return dto
