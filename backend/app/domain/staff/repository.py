from __future__ import annotations

from app.domain.common import SqlRepository
from app.domain.staff.models import LeaveRequest, Staff


class StaffRepository(SqlRepository[Staff]):
    model = Staff

    def all(self) -> list[Staff]:
        return self.list(order_by=Staff.name)


class LeaveRequestRepository(SqlRepository[LeaveRequest]):
    model = LeaveRequest

    def search(self, status: str | None = None) -> list[LeaveRequest]:
        where = [LeaveRequest.status == status] if status else []
        return self.list(*where, order_by=LeaveRequest.created_at.desc())
