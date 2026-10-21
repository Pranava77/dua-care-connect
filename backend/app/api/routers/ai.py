from fastapi import APIRouter, Depends

from app.adapters.domain_gateway import ServiceGateway
from app.ai.reports.service import ReportKind
from app.api.deps import current_user, get_container, get_gateway, require
from app.api.schemas import ok
from app.container import Container
from app.domain.users.schemas import AuthUser

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/status")
def status(_: AuthUser = Depends(current_user), container: Container = Depends(get_container)):
    return ok(container.ai_status())


@router.get("/alerts")
def alerts(user: AuthUser = Depends(require("dashboard:read")), container: Container = Depends(get_container),
           gateway: ServiceGateway = Depends(get_gateway)):
    return ok([a.model_dump() for a in container.reports.alerts(gateway, user)], count=True)


@router.get("/reports/kinds")
def report_kinds(user: AuthUser = Depends(require("reports:generate")), container: Container = Depends(get_container)):
    return ok([k for k in container.reports.kinds() if k["permission"] in user.permissions])


@router.post("/reports/{kind}")
async def draft_report(kind: ReportKind, user: AuthUser = Depends(require("reports:generate")),
                       container: Container = Depends(get_container), gateway: ServiceGateway = Depends(get_gateway)):
    report = await container.reports.draft(kind, gateway, user)
    return ok(report.model_dump())


@router.post("/documents/{document_id}/analyze", dependencies=[Depends(require("documents:create"))])
async def analyze_document(document_id: str, container: Container = Depends(get_container),
                           gateway: ServiceGateway = Depends(get_gateway)):
    suggestion = await container.docintel.analyze(gateway, document_id)
    return ok(suggestion.model_dump())
