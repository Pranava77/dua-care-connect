from __future__ import annotations

from collections.abc import Callable, Iterator

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.adapters.domain_gateway import ServiceGateway
from app.container import Container, DomainServices
from app.core.errors import AuthError, NotFoundError, PermissionDeniedError
from app.core.rbac import has_permission
from app.core.security import decode_access_token
from app.domain.users.schemas import AuthUser

_bearer = HTTPBearer(auto_error=False)


def get_container(request: Request) -> Container:
    return request.app.state.container


def get_db(container: Container = Depends(get_container)) -> Iterator[Session]:
    db = container.session_factory()
    try:
        yield db
    finally:
        db.close()


def get_services(db: Session = Depends(get_db), container: Container = Depends(get_container)) -> DomainServices:
    return container.domain(db)


def get_gateway(services: DomainServices = Depends(get_services)) -> ServiceGateway:
    return ServiceGateway(services)


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    services: DomainServices = Depends(get_services),
) -> AuthUser:
    user_id = decode_access_token(credentials.credentials) if credentials else None
    if not user_id:
        raise AuthError("Not authenticated")
    try:
        return services.users.get(user_id)
    except NotFoundError as exc:
        raise AuthError("Not authenticated") from exc


def require(*permissions: str) -> Callable[[AuthUser], AuthUser]:
    """Dependency enforcing that the current user holds every listed permission."""

    def checker(user: AuthUser = Depends(current_user)) -> AuthUser:
        missing = [p for p in permissions if not has_permission(user.permissions, p)]
        if missing:
            raise PermissionDeniedError(f"Missing permission: {', '.join(missing)}")
        return user

    return checker
