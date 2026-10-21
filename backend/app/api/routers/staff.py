from fastapi import APIRouter, Depends

from app.api.deps import get_services, require
from app.api.schemas import ok
from app.container import DomainServices
from app.domain.staff.schemas import LeaveRequestCreate, LeaveStatus, LeaveStatusUpdate, StaffCreate, StaffUpdate

router = APIRouter(tags=["hr"])


@router.get("/staff", dependencies=[Depends(require("hr:read"))])
def list_staff(services: DomainServices = Depends(get_services)):
    return ok([s.model_dump(mode="json") for s in services.staff.list()], count=True)


@router.post("/staff", status_code=201, dependencies=[Depends(require("hr:create"))])
def create_staff(data: StaffCreate, services: DomainServices = Depends(get_services)):
    return ok(services.staff.create(data).model_dump(mode="json"))


@router.patch("/staff/{staff_id}", dependencies=[Depends(require("hr:update"))])
def update_staff(staff_id: str, data: StaffUpdate, services: DomainServices = Depends(get_services)):
    return ok(services.staff.update(staff_id, data).model_dump(mode="json"))


@router.delete("/staff/{staff_id}", dependencies=[Depends(require("hr:delete"))])
def delete_staff(staff_id: str, services: DomainServices = Depends(get_services)):
    services.staff.delete(staff_id)
    return ok(None)


@router.get("/hr/leave", dependencies=[Depends(require("hr:read"))])
def list_leave(status: LeaveStatus | None = None, services: DomainServices = Depends(get_services)):
    return ok([lr.model_dump(mode="json") for lr in services.staff.list_leave(status)], count=True)


@router.post("/hr/leave", status_code=201, dependencies=[Depends(require("hr:create"))])
def create_leave(data: LeaveRequestCreate, services: DomainServices = Depends(get_services)):
    return ok(services.staff.create_leave(data).model_dump(mode="json"))


@router.patch("/hr/leave/{leave_id}", dependencies=[Depends(require("hr:update"))])
def update_leave(leave_id: str, data: LeaveStatusUpdate, services: DomainServices = Depends(get_services)):
    return ok(services.staff.update_leave_status(leave_id, data.status).model_dump(mode="json"))
