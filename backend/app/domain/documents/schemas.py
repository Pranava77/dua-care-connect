from datetime import datetime
from typing import Any, Literal

from pydantic import Field

from app.domain.dto import DTO, InputDTO

DocumentCategory = Literal["Admission", "KYC", "Consent", "Contract", "Financial", "Medical"]
DocumentStatus = Literal["Verified", "Pending", "Active", "Paid", "Rejected"]


class DocumentCreate(InputDTO):
    name: str = Field(min_length=1, max_length=255)
    category: DocumentCategory
    uploaded_by: str = Field(min_length=1, max_length=120)
    resident_id: str | None = None
    status: DocumentStatus = "Pending"
    description: str | None = Field(default=None, max_length=1000)


class DocumentUpdate(InputDTO):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    category: DocumentCategory | None = None
    resident_id: str | None = None
    status: DocumentStatus | None = None
    description: str | None = Field(default=None, max_length=1000)
    ai_suggestion: dict[str, Any] | None = None


class DocumentRead(DTO):
    id: str
    name: str
    category: DocumentCategory
    file_type: str
    file_size: str
    uploaded_by: str
    resident_id: str | None
    resident_name: str | None
    status: DocumentStatus
    uploaded_at: datetime
    description: str | None
    content_type: str | None
    has_file: bool
    ai_suggestion: dict[str, Any] | None = None


class DocumentFile(DTO):
    name: str
    content_type: str
    data: bytes


class DocumentStats(DTO):
    admissionCount: int
    kycCount: int
    pendingCount: int
    totalDocuments: int
