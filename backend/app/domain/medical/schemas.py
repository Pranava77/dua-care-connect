from datetime import date, datetime

from pydantic import Field, model_validator

from app.domain.dto import DTO, InputDTO


class ResidentRef(DTO):
    name: str


class MedicalRecordCreate(InputDTO):
    resident_id: str
    diagnosis: str = Field(min_length=1, max_length=255)
    treatment: str = Field(min_length=1, max_length=500)
    last_check_date: date
    doctor: str = Field(min_length=1, max_length=120)
    notes: str = Field(default="", max_length=5000)


class MedicalRecordUpdate(InputDTO):
    resident_id: str | None = None
    diagnosis: str | None = Field(default=None, min_length=1, max_length=255)
    treatment: str | None = Field(default=None, min_length=1, max_length=500)
    last_check_date: date | None = None
    doctor: str | None = Field(default=None, min_length=1, max_length=120)
    notes: str | None = Field(default=None, max_length=5000)


class MedicalRecordRead(DTO):
    id: str
    resident_id: str
    residents: ResidentRef
    diagnosis: str
    treatment: str
    last_check_date: date
    doctor: str
    notes: str
    created_at: datetime

    @model_validator(mode="before")
    @classmethod
    def _resident_ref(cls, value):  # noqa: ANN001
        if hasattr(value, "resident"):
            return {**{k: getattr(value, k) for k in cls.model_fields if k != "residents"},
                    "residents": {"name": value.resident.name}}
        return value


class PrescriptionCreate(InputDTO):
    resident_id: str
    medication: str = Field(min_length=1, max_length=120)
    dosage: str = Field(min_length=1, max_length=60)
    frequency: str = Field(min_length=1, max_length=60)
    refill_date: date
    prescribing_doctor: str = Field(min_length=1, max_length=120)


class PrescriptionUpdate(InputDTO):
    resident_id: str | None = None
    medication: str | None = Field(default=None, min_length=1, max_length=120)
    dosage: str | None = Field(default=None, min_length=1, max_length=60)
    frequency: str | None = Field(default=None, min_length=1, max_length=60)
    refill_date: date | None = None
    prescribing_doctor: str | None = Field(default=None, min_length=1, max_length=120)


class PrescriptionRead(DTO):
    id: str
    resident_id: str
    residents: ResidentRef
    medication: str
    dosage: str
    frequency: str
    refill_date: date
    prescribing_doctor: str
    created_at: datetime

    @model_validator(mode="before")
    @classmethod
    def _resident_ref(cls, value):  # noqa: ANN001
        if hasattr(value, "resident"):
            return {**{k: getattr(value, k) for k in cls.model_fields if k != "residents"},
                    "residents": {"name": value.resident.name}}
        return value


class PrescriptionDue(DTO):
    prescription: PrescriptionRead
    days_until_refill: int
    overdue: bool
