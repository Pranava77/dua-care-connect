from datetime import date, datetime

from pydantic import Field

from app.domain.dto import DTO, InputDTO


class ResidentCreate(InputDTO):
    name: str = Field(min_length=1, max_length=120)
    room_number: str = Field(min_length=1, max_length=20)
    date_of_birth: date
    emergency_contact: str = Field(min_length=1, max_length=200)
    medical_conditions: list[str] = []


class ResidentUpdate(InputDTO):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    room_number: str | None = Field(default=None, min_length=1, max_length=20)
    date_of_birth: date | None = None
    emergency_contact: str | None = Field(default=None, min_length=1, max_length=200)
    medical_conditions: list[str] | None = None


class ResidentRead(DTO):
    id: str
    name: str
    room_number: str
    date_of_birth: date
    emergency_contact: str
    medical_conditions: list[str]
    created_at: datetime
