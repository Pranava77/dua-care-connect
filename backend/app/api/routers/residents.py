from fastapi import APIRouter, Depends

from app.api.deps import get_services, require
from app.api.schemas import ok
from app.container import DomainServices
from app.domain.residents.schemas import ResidentCreate, ResidentUpdate

router = APIRouter(prefix="/residents", tags=["residents"])


@router.get("", dependencies=[Depends(require("residents:read"))])
def list_residents(recent: int | None = None, services: DomainServices = Depends(get_services)):
    items = services.residents.recent(recent) if recent else services.residents.list()
    return ok([r.model_dump(mode="json") for r in items], count=True)


@router.get("/{resident_id}", dependencies=[Depends(require("residents:read"))])
def get_resident(resident_id: str, services: DomainServices = Depends(get_services)):
    return ok(services.residents.get(resident_id).model_dump(mode="json"))


@router.post("", status_code=201, dependencies=[Depends(require("residents:create"))])
def create_resident(data: ResidentCreate, services: DomainServices = Depends(get_services)):
    return ok(services.residents.create(data).model_dump(mode="json"))


@router.patch("/{resident_id}", dependencies=[Depends(require("residents:update"))])
def update_resident(resident_id: str, data: ResidentUpdate, services: DomainServices = Depends(get_services)):
    return ok(services.residents.update(resident_id, data).model_dump(mode="json"))


@router.delete("/{resident_id}", dependencies=[Depends(require("residents:delete"))])
def delete_resident(resident_id: str, services: DomainServices = Depends(get_services)):
    services.residents.delete(resident_id)
    return ok(None)
