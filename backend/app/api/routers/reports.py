from fastapi import APIRouter, Depends
from fastapi.responses import Response

from app.api.deps import current_user, get_services, require
from app.api.schemas import ok
from app.container import DomainServices
from app.core.errors import PermissionDeniedError
from app.domain.reports.schemas import ExportType
from app.domain.users.schemas import AuthUser

router = APIRouter(tags=["reports"])

EXPORT_PERMISSIONS: dict[str, str] = {
    "residents": "residents:read",
    "staff": "hr:read",
    "invoices": "accounting:read",
    "documents": "documents:read",
    "reports": "reports:export",
}


@router.get("/reports", dependencies=[Depends(require("reports:read"))])
def list_reports(services: DomainServices = Depends(get_services)):
    return ok([r.model_dump(mode="json") for r in services.reports.list()], count=True)


@router.post("/reports/{report_id}/generate", dependencies=[Depends(require("reports:generate"))])
def generate_report(report_id: str, services: DomainServices = Depends(get_services)):
    return ok(services.reports.generate(report_id).model_dump(mode="json"))


@router.get("/export/{export_type}")
def export(export_type: ExportType, user: AuthUser = Depends(current_user),
           services: DomainServices = Depends(get_services)):
    if EXPORT_PERMISSIONS[export_type] not in user.permissions:
        raise PermissionDeniedError(f"Missing permission: {EXPORT_PERMISSIONS[export_type]}")
    return Response(content=services.export.to_csv(export_type), media_type="text/csv",
                    headers={"Content-Disposition": f'attachment; filename="{export_type}.csv"'})


@router.get("/dashboard/summary")
def dashboard_summary(user: AuthUser = Depends(require("dashboard:read")),
                      services: DomainServices = Depends(get_services)):
    """Headline counts (aggregates only) for every dashboard user; detail lists only for modules the user can read."""
    medical = "medical:read" in user.permissions
    return ok({
        "residents": len(services.residents.list()),
        "medicalCases": len(services.medical.list_records()),
        "prescriptions": len(services.medical.list_prescriptions()),
        "staff": len(services.staff.list()),
        "recentResidents": [r.model_dump(mode="json") for r in services.residents.recent(3)],
        "recentPrescriptions": [p.model_dump(mode="json") for p in services.medical.recent_prescriptions(3)]
        if medical else [],
    })
