from datetime import datetime

from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base, new_id, utcnow
from app.domain.common import UTCDateTime


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(120))
    category: Mapped[str] = mapped_column(String(20))
    type: Mapped[str] = mapped_column(String(40))
    period: Mapped[str] = mapped_column(String(20))
    last_generated: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)
    next_scheduled: Mapped[datetime | None] = mapped_column(UTCDateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Active")
    file_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    parameters: Mapped[dict | None] = mapped_column(JSON, nullable=True)
