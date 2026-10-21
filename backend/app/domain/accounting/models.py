from datetime import date, datetime

from sqlalchemy import JSON, Date, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, new_id, utcnow
from app.domain.common import UTCDateTime
from app.domain.residents.models import Resident


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    invoice_number: Mapped[str] = mapped_column(String(40), unique=True)
    resident_id: Mapped[str] = mapped_column(ForeignKey("residents.id", ondelete="CASCADE"), index=True)
    amount: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(3), default="GBP")
    status: Mapped[str] = mapped_column(String(20), default="Pending", index=True)
    due_date: Mapped[date] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)
    paid_at: Mapped[datetime | None] = mapped_column(UTCDateTime, nullable=True)
    payment_method: Mapped[str | None] = mapped_column(String(20), nullable=True)
    services: Mapped[list[dict]] = mapped_column(JSON, default=list)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    resident: Mapped[Resident] = relationship(lazy="joined")

    @property
    def resident_name(self) -> str:
        return self.resident.name


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    invoice_id: Mapped[str] = mapped_column(ForeignKey("invoices.id", ondelete="CASCADE"), index=True)
    amount: Mapped[float] = mapped_column(Float)
    payment_method: Mapped[str] = mapped_column(String(20))
    transaction_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    payment_date: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)
    processed_by: Mapped[str] = mapped_column(String(120))
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
