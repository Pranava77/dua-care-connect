from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.core.events import EntityChanged, EventBus
from app.domain.common import apply_updates
from app.domain.documents.service import DocumentService
from app.domain.residents.models import Resident
from app.domain.residents.repository import ResidentRepository
from app.domain.residents.schemas import ResidentCreate, ResidentRead, ResidentUpdate


class ResidentService:
    def __init__(self, db: Session, events: EventBus, documents: DocumentService):
        self.db = db
        self.events = events
        self.repo = ResidentRepository(db)
        self.documents = documents

    def list(self) -> list[ResidentRead]:
        return [ResidentRead.model_validate(r) for r in self.repo.all()]

    def recent(self, limit: int = 3) -> list[ResidentRead]:
        return [ResidentRead.model_validate(r) for r in self.repo.recent(limit)]

    def find_by_name(self, query: str) -> list[ResidentRead]:
        return [ResidentRead.model_validate(r) for r in self.repo.find_by_name(query)]

    def get(self, resident_id: str) -> ResidentRead:
        return ResidentRead.model_validate(self._get(resident_id))

    def create(self, data: ResidentCreate) -> ResidentRead:
        resident = self.repo.add(Resident(**data.model_dump()))
        self.db.commit()
        return self._emit(resident, "created")

    def update(self, resident_id: str, data: ResidentUpdate) -> ResidentRead:
        resident = self._get(resident_id)
        apply_updates(resident, data)
        self.db.commit()
        return self._emit(resident, "updated")

    def delete(self, resident_id: str) -> None:
        """Discharge a resident. Documents (and their files) are removed explicitly;
        medical records, prescriptions and invoices cascade at the database level."""
        resident = self._get(resident_id)
        self.documents.delete_for_resident(resident_id)
        self.repo.delete(resident)
        self.db.commit()
        self.events.publish(EntityChanged("resident", resident_id, "deleted", {"resident_id": resident_id}))

    def _get(self, resident_id: str) -> Resident:
        resident = self.repo.get(resident_id)
        if resident is None:
            raise NotFoundError("Resident not found")
        return resident

    def _emit(self, resident: Resident, action: str) -> ResidentRead:
        dto = ResidentRead.model_validate(resident)
        self.events.publish(EntityChanged("resident", dto.id, action, dto.model_dump(mode="json")))
        return dto
