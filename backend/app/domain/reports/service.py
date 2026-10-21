from __future__ import annotations

import csv
import io
import re

from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import utcnow
from app.core.errors import NotFoundError
from app.domain.accounting.service import AccountingService
from app.domain.documents.service import DocumentService
from app.domain.reports.repository import ReportRepository
from app.domain.reports.schemas import ExportType, ReportRead
from app.domain.residents.service import ResidentService
from app.domain.staff.service import StaffService


class ReportService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ReportRepository(db)

    def list(self) -> list[ReportRead]:
        return [ReportRead.model_validate(r) for r in self.repo.all()]

    def generate(self, report_id: str) -> ReportRead:
        report = self.repo.get(report_id)
        if report is None:
            raise NotFoundError("Report not found")
        report.last_generated = utcnow()
        slug = re.sub(r"\s+", "-", report.name.lower())
        report.file_path = f"/reports/{slug}-{int(report.last_generated.timestamp())}.pdf"
        self.db.commit()
        return ReportRead.model_validate(report)


class ExportService:
    """Builds CSV exports. Sits above the other modules and reads through their services."""

    def __init__(self, residents: ResidentService, staff: StaffService, accounting: AccountingService,
                 documents: DocumentService, reports: ReportService):
        self._sources = {
            "residents": residents.list,
            "staff": staff.list,
            "invoices": accounting.list_invoices,
            "documents": documents.list,
            "reports": reports.list,
        }

    def to_csv(self, export_type: ExportType) -> str:
        rows: list[BaseModel] = self._sources[export_type]()
        buffer = io.StringIO()
        if rows:
            dumped = [r.model_dump(mode="json") for r in rows]
            writer = csv.DictWriter(buffer, fieldnames=list(dumped[0].keys()))
            writer.writeheader()
            for row in dumped:
                writer.writerow({k: (v if not isinstance(v, (list, dict)) else str(v)) for k, v in row.items()})
        return buffer.getvalue()
