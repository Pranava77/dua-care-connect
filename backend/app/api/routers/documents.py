from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import Response
from pydantic import ValidationError

from app.api.deps import current_user, get_services, require
from app.api.schemas import ok
from app.container import DomainServices
from app.core.errors import DomainError, PermissionDeniedError
from app.domain.documents.schemas import DocumentCreate, DocumentUpdate
from app.domain.users.schemas import AuthUser

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", dependencies=[Depends(require("documents:read"))])
def list_documents(resident_id: str | None = None, category: str | None = None,
                   services: DomainServices = Depends(get_services)):
    docs = services.documents.list(resident_id=resident_id, category=category)
    return ok([d.model_dump(mode="json") for d in docs], count=True)


@router.get("/stats", dependencies=[Depends(require("documents:read"))])
def document_stats(services: DomainServices = Depends(get_services)):
    return ok(services.documents.stats().model_dump())


@router.post("", status_code=201, dependencies=[Depends(require("documents:create"))])
async def upload_document(
    file: UploadFile = File(...),
    name: str = Form(...),
    category: str = Form(...),
    uploaded_by: str = Form(...),
    resident_id: str | None = Form(None),
    status: str = Form("Pending"),
    description: str | None = Form(None),
    services: DomainServices = Depends(get_services),
):
    try:
        meta = DocumentCreate(name=name, category=category, uploaded_by=uploaded_by,
                              resident_id=resident_id or None, status=status, description=description or None)
    except ValidationError as exc:
        raise DomainError(exc.errors(include_url=False)[0]["msg"]) from exc
    content = await file.read()
    doc = services.documents.upload(meta, filename=file.filename or name,
                                    content_type=file.content_type or "application/octet-stream", content=content)
    return ok(doc.model_dump(mode="json"))


@router.patch("/{document_id}")
def update_document(document_id: str, data: DocumentUpdate, user: AuthUser = Depends(current_user),
                    services: DomainServices = Depends(get_services)):
    if not services.documents.can_edit(document_id, user_name=user.name, permissions=user.permissions):
        raise PermissionDeniedError("Missing permission: documents:update")
    return ok(services.documents.update(document_id, data).model_dump(mode="json"))


@router.delete("/{document_id}", dependencies=[Depends(require("documents:delete"))])
def delete_document(document_id: str, services: DomainServices = Depends(get_services)):
    services.documents.delete(document_id)
    return ok(None)


@router.get("/{document_id}/file", dependencies=[Depends(require("documents:read"))])
def download_document(document_id: str, services: DomainServices = Depends(get_services)):
    file = services.documents.read_file(document_id)
    safe_name = file.name.replace('"', "")
    return Response(content=file.data, media_type=file.content_type,
                    headers={"Content-Disposition": f'inline; filename="{safe_name}"'})
