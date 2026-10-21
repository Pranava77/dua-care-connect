from fastapi import APIRouter, Depends

from app.api.deps import get_services, require
from app.api.schemas import ok
from app.container import DomainServices
from app.domain.accounting.schemas import InvoiceCreate, InvoiceStatus, InvoiceUpdate, PaymentCreate

router = APIRouter(tags=["accounting"])


@router.get("/invoices", dependencies=[Depends(require("accounting:read"))])
def list_invoices(status: InvoiceStatus | None = None, resident_id: str | None = None,
                  services: DomainServices = Depends(get_services)):
    invoices = services.accounting.list_invoices(status=status, resident_id=resident_id)
    return ok([i.model_dump(mode="json") for i in invoices], count=True)


@router.post("/invoices", status_code=201, dependencies=[Depends(require("accounting:create"))])
def create_invoice(data: InvoiceCreate, services: DomainServices = Depends(get_services)):
    return ok(services.accounting.create_invoice(data).model_dump(mode="json"))


@router.patch("/invoices/{invoice_id}", dependencies=[Depends(require("accounting:update"))])
def update_invoice(invoice_id: str, data: InvoiceUpdate, services: DomainServices = Depends(get_services)):
    return ok(services.accounting.update_invoice(invoice_id, data).model_dump(mode="json"))


@router.delete("/invoices/{invoice_id}", dependencies=[Depends(require("accounting:delete"))])
def delete_invoice(invoice_id: str, services: DomainServices = Depends(get_services)):
    services.accounting.delete_invoice(invoice_id)
    return ok(None)


@router.get("/payments", dependencies=[Depends(require("accounting:read"))])
def list_payments(services: DomainServices = Depends(get_services)):
    return ok([p.model_dump(mode="json") for p in services.accounting.list_payments()], count=True)


@router.post("/payments", status_code=201, dependencies=[Depends(require("accounting:create"))])
def record_payment(data: PaymentCreate, services: DomainServices = Depends(get_services)):
    return ok(services.accounting.record_payment(data).model_dump(mode="json"))


@router.get("/accounting/stats", dependencies=[Depends(require("accounting:read"))])
def financial_stats(services: DomainServices = Depends(get_services)):
    return ok(services.accounting.stats().model_dump())


@router.get("/accounting/outstanding", dependencies=[Depends(require("accounting:read"))])
def outstanding(services: DomainServices = Depends(get_services)):
    return ok([o.model_dump(mode="json") for o in services.accounting.outstanding()], count=True)
