"""Pydantic base classes for domain DTOs. Kept free of persistence imports so any layer can use them."""

from pydantic import BaseModel, ConfigDict


class DTO(BaseModel):
    """Base for data-transfer objects crossing the domain boundary."""

    model_config = ConfigDict(from_attributes=True, extra="ignore")


class InputDTO(BaseModel):
    """Base for create/update payloads. Unknown fields (e.g. nested display names sent by the UI) are ignored."""

    model_config = ConfigDict(extra="ignore")
