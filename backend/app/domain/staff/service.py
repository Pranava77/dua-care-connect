from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.core.events import EntityChanged, EventBus
from app.domain.common import apply_updates
from app.domain.staff.models import LeaveRequest, Staff
from app.domain.staff.repository import LeaveRequestRepository, StaffRepository
from app.domain.staff.schemas import (
    LeaveRequestCreate,
    LeaveRequestRead,
    LeaveStatus,
    StaffCreate,
    StaffRead,
    StaffUpdate,
)


class StaffService:
    def __init__(self, db: Session, events: EventBus):
        self.db = db
        self.events = events
        self.staff = StaffRepository(db)
        self.leave = LeaveRequestRepository(db)

    def list(self) -> list[StaffRead]:
        return [StaffRead.model_validate(s) for s in self.staff.all()]

    def get(self, staff_id: str) -> StaffRead:
        return StaffRead.model_validate(self._get_staff(staff_id))

    def create(self, data: StaffCreate) -> StaffRead:
        member = self.staff.add(Staff(**data.model_dump()))
        self.db.commit()
        return self._emit_staff(member, "created")

    def update(self, staff_id: str, data: StaffUpdate) -> StaffRead:
        member = self._get_staff(staff_id)
        apply_updates(member, data)
        self.db.commit()
        return self._emit_staff(member, "updated")

    def delete(self, staff_id: str) -> None:
        member = self._get_staff(staff_id)
        leave_ids = [lr.id for lr in self.leave.list(LeaveRequest.staff_id == staff_id)]
        self.staff.delete(member)
        self.db.commit()
        self.events.publish(EntityChanged("staff", staff_id, "deleted"))
        for leave_id in leave_ids:
            self.events.publish(EntityChanged("leave_request", leave_id, "deleted"))

    def list_leave(self, status: LeaveStatus | None = None) -> list[LeaveRequestRead]:
        return [LeaveRequestRead.model_validate(lr) for lr in self.leave.search(status)]

    def create_leave(self, data: LeaveRequestCreate) -> LeaveRequestRead:
        self._get_staff(data.staff_id)
        request = self.leave.add(LeaveRequest(**data.model_dump()))
        self.db.commit()
        self.db.refresh(request)
        return self._emit_leave(request, "created")

    def update_leave_status(self, leave_id: str, status: LeaveStatus) -> LeaveRequestRead:
        request = self.leave.get(leave_id)
        if request is None:
            raise NotFoundError("Leave request not found")
        request.status = status
        self.db.commit()
        return self._emit_leave(request, "updated")

    def _get_staff(self, staff_id: str) -> Staff:
        member = self.staff.get(staff_id)
        if member is None:
            raise NotFoundError("Staff member not found")
        return member

    def _emit_staff(self, member: Staff, action: str) -> StaffRead:
        dto = StaffRead.model_validate(member)
        self.events.publish(EntityChanged("staff", dto.id, action, dto.model_dump(mode="json")))
        return dto

    def _emit_leave(self, request: LeaveRequest, action: str) -> LeaveRequestRead:
        dto = LeaveRequestRead.model_validate(request)
        self.events.publish(EntityChanged("leave_request", dto.id, action, dto.model_dump(mode="json")))
        return dto
