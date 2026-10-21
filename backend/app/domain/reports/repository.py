from __future__ import annotations

from app.domain.common import SqlRepository
from app.domain.reports.models import Report


class ReportRepository(SqlRepository[Report]):
    model = Report

    def all(self) -> list[Report]:
        return self.list(order_by=Report.name)
