from datetime import date, datetime
from typing import Literal

from pydantic import Field

from app.domain.dto import DTO, InputDTO

InvoiceStatus = Literal["Paid", "Pending", "Overdue", "Cancelled"]
PaymentMethod = Literal["BACS", "Card", "Direct Debit", "Cash", "Cheque"]


class InvoiceLine(DTO):
    name: str = Field(min_length=1, max_length=120)
    amount: float = Field(ge=0)
    description: str | None = None


class InvoiceCreate(InputDTO):
    invoice_number: str | None = Field(default=None, max_length=40)
    resident_id: str
    amount: float | None = Field(default=None, gt=0)
    currency: str = Field(default="GBP", min_length=3, max_length=3)
    status: InvoiceStatus = "Pending"
    due_date: date
    services: list[InvoiceLine] = []
    notes: str | None = Field(default=None, max_length=2000)


class InvoiceUpdate(InputDTO):
    resident_id: str | None = None
    amount: float | None = Field(default=None, gt=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    status: InvoiceStatus | None = None
    due_date: date | None = None
    services: list[InvoiceLine] | None = None
    notes: str | None = Field(default=None, max_length=2000)


class InvoiceRead(DTO):
    id: str
    invoice_number: str
    resident_id: str
    resident_name: str
    amount: float
    currency: str
    status: InvoiceStatus
    due_date: date
    created_at: datetime
    paid_at: datetime | None = None
    payment_method: PaymentMethod | None = None
    services: list[InvoiceLine]
    notes: str | None = None


class OutstandingInvoice(DTO):
    invoice: InvoiceRead
    days_overdue: int


class PaymentCreate(InputDTO):
    invoice_id: str
    amount: float = Field(gt=0)
    payment_method: PaymentMethod
    transaction_id: str | None = Field(default=None, max_length=80)
    payment_date: datetime | None = None
    processed_by: str = Field(min_length=1, max_length=120)
    notes: str | None = Field(default=None, max_length=2000)


class PaymentRead(DTO):
    id: str
    invoice_id: str
    amount: float
    payment_method: PaymentMethod
    transaction_id: str | None
    payment_date: datetime
    processed_by: str
    notes: str | None


class FinancialStats(DTO):
    totalRevenue: float
    outstandingDues: float
    thisMonthRevenue: float
    paidToday: float
    paidTodayCount: int
