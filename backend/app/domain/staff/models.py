from datetime import date, datetime

from sqlalchemy import Date, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, new_id, utcnow
from app.domain.common import UTCDateTime


class Staff(Base):
    __tablename__ = "staff"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(120), index=True)
    position: Mapped[str] = mapped_column(String(120))
    department: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(40))
    hire_date: Mapped[date] = mapped_column(Date)
    salary: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(String(20), default="active")
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    staff_id: Mapped[str] = mapped_column(ForeignKey("staff.id", ondelete="CASCADE"), index=True)
    from_date: Mapped[date] = mapped_column(Date)
    to_date: Mapped[date] = mapped_column(Date)
    reason: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)

    staff: Mapped[Staff] = relationship(lazy="joined")
