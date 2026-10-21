from datetime import date, datetime

from sqlalchemy import JSON, Date, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base, new_id, utcnow
from app.domain.common import UTCDateTime


class Resident(Base):
    __tablename__ = "residents"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(120), index=True)
    room_number: Mapped[str] = mapped_column(String(20))
    date_of_birth: Mapped[date] = mapped_column(Date)
    emergency_contact: Mapped[str] = mapped_column(String(200))
    medical_conditions: Mapped[list[str]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)
