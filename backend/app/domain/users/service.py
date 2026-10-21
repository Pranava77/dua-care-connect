from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.db import utcnow
from app.core.errors import AuthError, ConflictError, NotFoundError
from app.core.rbac import UserRole
from app.core.security import hash_password, verify_password
from app.domain.users.models import User
from app.domain.users.repository import UserRepository
from app.domain.users.schemas import AuthUser, Credentials, SignUp


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def authenticate(self, creds: Credentials) -> AuthUser:
        user = self.repo.by_email(creds.email)
        if user is None or not user.is_active or not verify_password(creds.password, user.password_hash):
            raise AuthError("Invalid email or password")
        user.last_login = utcnow()
        self.db.commit()
        return AuthUser.model_validate(user)

    def sign_up(self, data: SignUp) -> AuthUser:
        if self.repo.by_email(data.email):
            raise ConflictError("An account with this email already exists")
        user = self.repo.add(User(
            email=data.email.lower(),
            name=data.name or data.email.split("@")[0],
            role="receptionist",  # least-privileged role; an admin can promote later
            password_hash=hash_password(data.password),
            last_login=utcnow(),
        ))
        self.db.commit()
        return AuthUser.model_validate(user)

    def get(self, user_id: str) -> AuthUser:
        user = self.repo.get(user_id)
        if user is None or not user.is_active:
            raise NotFoundError("User not found")
        return AuthUser.model_validate(user)

    def list(self) -> list[AuthUser]:
        return [AuthUser.model_validate(u) for u in self.repo.list(order_by=User.email)]

    def set_role(self, user_id: str, role: UserRole) -> AuthUser:
        user = self.repo.get(user_id)
        if user is None:
            raise NotFoundError("User not found")
        user.role = role
        self.db.commit()
        return AuthUser.model_validate(user)
