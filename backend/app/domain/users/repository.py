from __future__ import annotations

from sqlalchemy import func, select

from app.domain.common import SqlRepository
from app.domain.users.models import User


class UserRepository(SqlRepository[User]):
    model = User

    def by_email(self, email: str) -> User | None:
        return self.db.scalar(select(User).where(func.lower(User.email) == email.lower()))
