from fastapi import APIRouter, Depends

from app.api.deps import current_user, get_services, require
from app.api.schemas import ok
from app.container import DomainServices
from app.core.security import create_access_token
from app.domain.users.schemas import AuthUser, Credentials, RoleUpdate, SignUp

router = APIRouter(tags=["auth"])


def _session(user: AuthUser) -> dict:
    user_json = user.model_dump(mode="json")
    return {"user": user_json, "session": {"access_token": create_access_token(user.id), "user": user_json}}


@router.post("/auth/login")
def login(creds: Credentials, services: DomainServices = Depends(get_services)):
    return ok(_session(services.users.authenticate(creds)))


@router.post("/auth/signup")
def signup(data: SignUp, services: DomainServices = Depends(get_services)):
    return ok(_session(services.users.sign_up(data)))


@router.get("/auth/me")
def me(user: AuthUser = Depends(current_user)):
    return ok(user.model_dump(mode="json"))


@router.get("/users")
def list_users(_: AuthUser = Depends(require("system:admin")), services: DomainServices = Depends(get_services)):
    return ok([u.model_dump(mode="json") for u in services.users.list()], count=True)


@router.patch("/users/{user_id}/role")
def set_role(user_id: str, data: RoleUpdate, _: AuthUser = Depends(require("system:admin")),
             services: DomainServices = Depends(get_services)):
    return ok(services.users.set_role(user_id, data.role).model_dump(mode="json"))
