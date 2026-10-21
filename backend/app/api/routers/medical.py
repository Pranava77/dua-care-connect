from fastapi import APIRouter, Depends, Query

from app.api.deps import get_services, require
from app.api.schemas import ok
from app.container import DomainServices
from app.domain.medical.schemas import (
    MedicalRecordCreate,
    MedicalRecordUpdate,
    PrescriptionCreate,
    PrescriptionUpdate,
)

router = APIRouter(prefix="/medical", tags=["medical"])


@router.get("/records", dependencies=[Depends(require("medical:read"))])
def list_records(resident_id: str | None = None, services: DomainServices = Depends(get_services)):
    return ok([r.model_dump(mode="json") for r in services.medical.list_records(resident_id)], count=True)


@router.post("/records", status_code=201, dependencies=[Depends(require("medical:create"))])
def create_record(data: MedicalRecordCreate, services: DomainServices = Depends(get_services)):
    return ok(services.medical.create_record(data).model_dump(mode="json"))


@router.patch("/records/{record_id}", dependencies=[Depends(require("medical:update"))])
def update_record(record_id: str, data: MedicalRecordUpdate, services: DomainServices = Depends(get_services)):
    return ok(services.medical.update_record(record_id, data).model_dump(mode="json"))


@router.delete("/records/{record_id}", dependencies=[Depends(require("medical:delete"))])
def delete_record(record_id: str, services: DomainServices = Depends(get_services)):
    services.medical.delete_record(record_id)
    return ok(None)


@router.get("/prescriptions", dependencies=[Depends(require("medical:read"))])
def list_prescriptions(resident_id: str | None = None, recent: int | None = None,
                       services: DomainServices = Depends(get_services)):
    items = services.medical.recent_prescriptions(recent) if recent else services.medical.list_prescriptions(resident_id)
    return ok([p.model_dump(mode="json") for p in items], count=True)


@router.get("/prescriptions/due", dependencies=[Depends(require("medical:read"))])
def prescriptions_due(days: int = Query(7, ge=0, le=365), services: DomainServices = Depends(get_services)):
    return ok([d.model_dump(mode="json") for d in services.medical.prescriptions_due(days)], count=True)


@router.post("/prescriptions", status_code=201, dependencies=[Depends(require("medical:create"))])
def create_prescription(data: PrescriptionCreate, services: DomainServices = Depends(get_services)):
    return ok(services.medical.create_prescription(data).model_dump(mode="json"))


@router.patch("/prescriptions/{prescription_id}", dependencies=[Depends(require("medical:update"))])
def update_prescription(prescription_id: str, data: PrescriptionUpdate, services: DomainServices = Depends(get_services)):
    return ok(services.medical.update_prescription(prescription_id, data).model_dump(mode="json"))


@router.delete("/prescriptions/{prescription_id}", dependencies=[Depends(require("medical:delete"))])
def delete_prescription(prescription_id: str, services: DomainServices = Depends(get_services)):
    services.medical.delete_prescription(prescription_id)
    return ok(None)
