from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.core.events import EntityChanged, EventBus
from app.domain.common import apply_updates
from app.domain.medical.models import MedicalRecord, Prescription
from app.domain.medical.repository import MedicalRecordRepository, PrescriptionRepository
from app.domain.medical.schemas import (
    MedicalRecordCreate,
    MedicalRecordRead,
    MedicalRecordUpdate,
    PrescriptionCreate,
    PrescriptionDue,
    PrescriptionRead,
    PrescriptionUpdate,
)
from app.domain.residents.models import Resident


class MedicalService:
    def __init__(self, db: Session, events: EventBus):
        self.db = db
        self.events = events
        self.records = MedicalRecordRepository(db)
        self.prescriptions = PrescriptionRepository(db)

    # Medical records
    def list_records(self, resident_id: str | None = None) -> list[MedicalRecordRead]:
        return [MedicalRecordRead.model_validate(r) for r in self.records.search(resident_id)]

    def create_record(self, data: MedicalRecordCreate) -> MedicalRecordRead:
        self._require_resident(data.resident_id)
        record = self.records.add(MedicalRecord(**data.model_dump()))
        self.db.commit()
        self.db.refresh(record)
        return self._emit_record(record, "created")

    def update_record(self, record_id: str, data: MedicalRecordUpdate) -> MedicalRecordRead:
        record = self._get(self.records, record_id, "Medical record")
        if data.resident_id:
            self._require_resident(data.resident_id)
        apply_updates(record, data)
        self.db.commit()
        self.db.refresh(record)
        return self._emit_record(record, "updated")

    def delete_record(self, record_id: str) -> None:
        record = self._get(self.records, record_id, "Medical record")
        self.records.delete(record)
        self.db.commit()
        self.events.publish(EntityChanged("medical_record", record_id, "deleted"))

    # Prescriptions
    def list_prescriptions(self, resident_id: str | None = None) -> list[PrescriptionRead]:
        return [PrescriptionRead.model_validate(p) for p in self.prescriptions.search(resident_id)]

    def recent_prescriptions(self, limit: int = 3) -> list[PrescriptionRead]:
        return self.list_prescriptions()[:limit]

    def prescriptions_due(self, within_days: int = 7, today: date | None = None) -> list[PrescriptionDue]:
        """Prescriptions needing a refill within `within_days`, including overdue ones."""
        today = today or date.today()
        due = self.prescriptions.refills_before(today + timedelta(days=within_days))
        return [
            PrescriptionDue(
                prescription=PrescriptionRead.model_validate(p),
                days_until_refill=(p.refill_date - today).days,
                overdue=p.refill_date < today,
            )
            for p in due
        ]

    def create_prescription(self, data: PrescriptionCreate) -> PrescriptionRead:
        self._require_resident(data.resident_id)
        prescription = self.prescriptions.add(Prescription(**data.model_dump()))
        self.db.commit()
        self.db.refresh(prescription)
        return self._emit_prescription(prescription, "created")

    def update_prescription(self, prescription_id: str, data: PrescriptionUpdate) -> PrescriptionRead:
        prescription = self._get(self.prescriptions, prescription_id, "Prescription")
        if data.resident_id:
            self._require_resident(data.resident_id)
        apply_updates(prescription, data)
        self.db.commit()
        self.db.refresh(prescription)
        return self._emit_prescription(prescription, "updated")

    def delete_prescription(self, prescription_id: str) -> None:
        prescription = self._get(self.prescriptions, prescription_id, "Prescription")
        self.prescriptions.delete(prescription)
        self.db.commit()
        self.events.publish(EntityChanged("prescription", prescription_id, "deleted"))

    # Helpers
    def _require_resident(self, resident_id: str) -> None:
        if self.db.get(Resident, resident_id) is None:
            raise NotFoundError("Resident not found")

    @staticmethod
    def _get(repo, entity_id: str, label: str):  # noqa: ANN001, ANN205
        entity = repo.get(entity_id)
        if entity is None:
            raise NotFoundError(f"{label} not found")
        return entity

    def _emit_record(self, record: MedicalRecord, action: str) -> MedicalRecordRead:
        dto = MedicalRecordRead.model_validate(record)
        self.events.publish(EntityChanged("medical_record", dto.id, action, dto.model_dump(mode="json")))
        return dto

    def _emit_prescription(self, prescription: Prescription, action: str) -> PrescriptionRead:
        dto = PrescriptionRead.model_validate(prescription)
        self.events.publish(EntityChanged("prescription", dto.id, action, dto.model_dump(mode="json")))
        return dto
