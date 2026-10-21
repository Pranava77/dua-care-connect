from datetime import datetime

from pydantic import ConfigDict, EmailStr, Field, model_validator

from app.core.rbac import UserRole, permissions_for
from app.domain.dto import DTO, InputDTO


class Credentials(InputDTO):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class SignUp(Credentials):
    name: str | None = Field(default=None, max_length=120)


class AuthUser(DTO):
    """The authenticated principal, shaped like the frontend's `User` type."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    email: str
    name: str
    role: UserRole
    permissions: list[str] = []
    isActive: bool = Field(validation_alias="is_active")
    lastLogin: datetime | None = Field(default=None, validation_alias="last_login")

    @model_validator(mode="after")
    def _derive_permissions(self):  # noqa: ANN202
        self.permissions = list(permissions_for(self.role))
        return self


class RoleUpdate(InputDTO):
    role: UserRole
