from __future__ import annotations

from sqlalchemy import func

from app.domain.common import SqlRepository
from app.domain.residents.models import Resident


class ResidentRepository(SqlRepository[Resident]):
    model = Resident

    def all(self) -> list[Resident]:
        return self.list(order_by=Resident.created_at.desc())

    def recent(self, limit: int) -> list[Resident]:
        return self.all()[:limit]

    def find_by_name(self, query: str) -> list[Resident]:
        return self.list(func.lower(Resident.name).contains(query.lower()), order_by=Resident.name)
