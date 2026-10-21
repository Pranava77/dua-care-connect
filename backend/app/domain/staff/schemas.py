from datetime import date, datetime
from typing import Literal

from pydantic import EmailStr, Field, model_validator

from app.domain.dto import DTO, InputDTO

LeaveStatus = Literal["pending", "approved", "rejected"]
EmploymentStatus = Literal["active", "inactive", "on_leave"]


class StaffCreate(InputDTO):
    name: str = Field(min_length=1, max_length=120)
    position: str = Field(min_length=1, max_length=120)
    department: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=1, max_length=40)
    hire_date: date
    salary: float = Field(default=0, ge=0)
    status: EmploymentStatus = "active"


class StaffUpdate(InputDTO):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    position: str | None = Field(default=None, min_length=1, max_length=120)
    department: str | None = Field(default=None, min_length=1, max_length=120)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, min_length=1, max_length=40)
    hire_date: date | None = None
    salary: float | None = Field(default=None, ge=0)
    status: EmploymentStatus | None = None


class StaffRead(DTO):
    id: str
    name: str
    position: str
    department: str
    email: str
    phone: str
    hire_date: date
    salary: float
    status: EmploymentStatus
    created_at: datetime


class StaffRef(DTO):
    name: str


class LeaveRequestCreate(InputDTO):
    staff_id: str
    from_date: date
    to_date: date
    reason: str = Field(min_length=1, max_length=1000)

    @model_validator(mode="after")
    def _check_range(self):  # noqa: ANN202
        if self.to_date < self.from_date:
            raise ValueError("to_date must be on or after from_date")
        return self


class LeaveStatusUpdate(InputDTO):
    status: LeaveStatus


class LeaveRequestRead(DTO):
    id: str
    staff_id: str
    staff: StaffRef
    from_date: date
    to_date: date
    reason: str
    status: LeaveStatus
    created_at: datetime
