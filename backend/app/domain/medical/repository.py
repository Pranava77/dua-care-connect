from __future__ import annotations

from datetime import date

from app.domain.common import SqlRepository
from app.domain.medical.models import MedicalRecord, Prescription


class MedicalRecordRepository(SqlRepository[MedicalRecord]):
    model = MedicalRecord

    def search(self, resident_id: str | None = None) -> list[MedicalRecord]:
        where = [MedicalRecord.resident_id == resident_id] if resident_id else []
        return self.list(*where, order_by=MedicalRecord.last_check_date.desc())


class PrescriptionRepository(SqlRepository[Prescription]):
    model = Prescription

    def search(self, resident_id: str | None = None) -> list[Prescription]:
        where = [Prescription.resident_id == resident_id] if resident_id else []
        return self.list(*where, order_by=Prescription.created_at.desc())

    def refills_before(self, cutoff: date) -> list[Prescription]:
        return self.list(Prescription.refill_date <= cutoff, order_by=Prescription.refill_date)
