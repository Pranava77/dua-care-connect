from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import Base, UTCDateTime  # noqa: F401  (re-exported for domain models)


ModelT = TypeVar("ModelT", bound=Base)


class SqlRepository(Generic[ModelT]):
    model: type[ModelT]

    def __init__(self, db: Session):
        self.db = db

    def get(self, entity_id: str) -> ModelT | None:
        return self.db.get(self.model, entity_id)

    def list(self, *where, order_by=None) -> list[ModelT]:  # noqa: ANN001
        stmt = select(self.model).where(*where)
        if order_by is not None:
            stmt = stmt.order_by(order_by)
        return list(self.db.scalars(stmt))

    def add(self, entity: ModelT) -> ModelT:
        self.db.add(entity)
        self.db.flush()
        return entity

    def delete(self, entity: ModelT) -> None:
        self.db.delete(entity)
        self.db.flush()


def apply_updates(entity: Base, updates: BaseModel) -> None:
    for key, value in updates.model_dump(exclude_unset=True).items():
        setattr(entity, key, value)
