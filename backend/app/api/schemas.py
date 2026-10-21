from __future__ import annotations

from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiError(BaseModel):
    message: str


class Envelope(BaseModel, Generic[T]):
    """Response shape shared with the frontend: `{ data, error, count }`."""

    data: T | None = None
    error: ApiError | None = None
    count: int | None = None


def ok(data: Any, *, count: bool = False) -> dict[str, Any]:
    body: dict[str, Any] = {"data": data, "error": None}
    if count and isinstance(data, list):
        body["count"] = len(data)
    return body
