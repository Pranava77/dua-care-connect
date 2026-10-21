"""Role-based access control. Mirrors src/lib/rbac.ts so frontend and backend agree."""

from typing import Literal, get_args

UserRole = Literal["admin", "doctor", "nurse", "accountant", "hr", "receptionist"]

Permission = Literal[
    "residents:read", "residents:create", "residents:update", "residents:delete",
    "medical:read", "medical:create", "medical:update", "medical:delete",
    "documents:read", "documents:create", "documents:update", "documents:delete",
    "accounting:read", "accounting:create", "accounting:update", "accounting:delete",
    "hr:read", "hr:create", "hr:update", "hr:delete",
    "reports:read", "reports:generate", "reports:export",
    "dashboard:read",
    "system:admin", "system:settings",
]

ALL_PERMISSIONS: tuple[Permission, ...] = get_args(Permission)

ROLE_PERMISSIONS: dict[UserRole, list[Permission]] = {
    "admin": list(ALL_PERMISSIONS),
    "doctor": [
        "residents:read", "residents:create", "residents:update",
        "medical:read", "medical:create", "medical:update", "medical:delete",
        "documents:read", "documents:create",
        "reports:read", "reports:generate",
        "dashboard:read",
    ],
    "nurse": [
        "residents:read", "residents:update",
        "medical:read", "medical:create", "medical:update",
        "documents:read", "documents:create",
        "dashboard:read",
    ],
    "accountant": [
        "residents:read",
        "accounting:read", "accounting:create", "accounting:update", "accounting:delete",
        "documents:read", "documents:create",
        "reports:read", "reports:generate", "reports:export",
        "dashboard:read",
    ],
    "hr": [
        "residents:read",
        "hr:read", "hr:create", "hr:update", "hr:delete",
        "documents:read", "documents:create",
        "reports:read", "reports:generate",
        "dashboard:read",
    ],
    "receptionist": [
        "residents:read", "residents:create", "residents:update",
        "documents:read", "documents:create",
        "dashboard:read",
    ],
}

# Modules whose data can end up in the vector index. A user may retrieve from a
# module only if they hold its ":read" permission.
DATA_MODULES = ("residents", "medical", "documents", "accounting", "hr")


def permissions_for(role: UserRole) -> list[Permission]:
    return list(ROLE_PERMISSIONS[role])


def has_permission(permissions: list[str], permission: str) -> bool:
    return permission in permissions


def allowed_modules(permissions: list[str]) -> list[str]:
    return [m for m in DATA_MODULES if f"{m}:read" in permissions]
