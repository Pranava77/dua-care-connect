from datetime import date, datetime

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, new_id, utcnow
from app.domain.common import UTCDateTime
from app.domain.residents.models import Resident


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    resident_id: Mapped[str] = mapped_column(ForeignKey("residents.id", ondelete="CASCADE"), index=True)
    diagnosis: Mapped[str] = mapped_column(String(255))
    treatment: Mapped[str] = mapped_column(String(500))
    last_check_date: Mapped[date] = mapped_column(Date)
    doctor: Mapped[str] = mapped_column(String(120))
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)

    resident: Mapped[Resident] = relationship(lazy="joined")


class Prescription(Base):
    __tablename__ = "prescriptions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    resident_id: Mapped[str] = mapped_column(ForeignKey("residents.id", ondelete="CASCADE"), index=True)
    medication: Mapped[str] = mapped_column(String(120))
    dosage: Mapped[str] = mapped_column(String(60))
    frequency: Mapped[str] = mapped_column(String(60))
    refill_date: Mapped[date] = mapped_column(Date)
    prescribing_doctor: Mapped[str] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)

    resident: Mapped[Resident] = relationship(lazy="joined")
