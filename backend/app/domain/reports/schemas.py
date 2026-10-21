from datetime import datetime
from typing import Any, Literal

from app.domain.dto import DTO

ExportType = Literal["residents", "staff", "invoices", "documents", "reports"]


class ReportRead(DTO):
    id: str
    name: str
    category: Literal["Operational", "Financial", "Clinical", "HR"]
    type: str
    period: Literal["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"]
    last_generated: datetime
    next_scheduled: datetime | None = None
    status: Literal["Active", "Inactive", "Pending"]
    file_path: str | None = None
    parameters: dict[str, Any] | None = None
