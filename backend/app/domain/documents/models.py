from datetime import datetime

from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, new_id, utcnow
from app.domain.common import UTCDateTime
from app.domain.residents.models import Resident


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(20), index=True)
    file_type: Mapped[str] = mapped_column(String(10))
    file_size: Mapped[str] = mapped_column(String(20))
    uploaded_by: Mapped[str] = mapped_column(String(120))
    resident_id: Mapped[str | None] = mapped_column(
        ForeignKey("residents.id", ondelete="CASCADE"), index=True, nullable=True
    )
    status: Mapped[str] = mapped_column(String(20), default="Pending")
    uploaded_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    storage_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    ai_suggestion: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    resident: Mapped[Resident | None] = relationship(lazy="joined")

    @property
    def resident_name(self) -> str | None:
        return self.resident.name if self.resident else None

    @property
    def has_file(self) -> bool:
        return self.storage_key is not None
