"""In-process domain events.

Domain services publish facts ("an invoice changed") without knowing who listens.
The AI indexing layer subscribes to keep the vector store in sync, which keeps
the domain free of any AI dependency.
"""

import logging
from collections import defaultdict
from collections.abc import Callable
from concurrent.futures import Executor
from dataclasses import dataclass, field
from typing import Any, Literal

log = logging.getLogger(__name__)

EntityType = Literal[
    "resident", "staff", "leave_request", "medical_record", "prescription",
    "document", "invoice", "payment",
]


@dataclass(frozen=True)
class Event:
    pass


@dataclass(frozen=True)
class EntityChanged(Event):
    entity_type: EntityType
    entity_id: str
    action: Literal["created", "updated", "deleted"]
    data: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class DocumentFileStored(Event):
    document_id: str
    storage_key: str
    content_type: str
    data: dict[str, Any] = field(default_factory=dict)


Handler = Callable[[Any], None]


class EventBus:
    """Dispatches events to subscribers, optionally on a background executor."""

    def __init__(self, executor: Executor | None = None):
        self._handlers: dict[type[Event], list[Handler]] = defaultdict(list)
        self._executor = executor

    def subscribe(self, event_type: type[Event], handler: Handler) -> None:
        self._handlers[event_type].append(handler)

    def publish(self, event: Event) -> None:
        for handler in self._handlers.get(type(event), []):
            if self._executor is None:
                self._run(handler, event)
            else:
                self._executor.submit(self._run, handler, event)

    @staticmethod
    def _run(handler: Handler, event: Event) -> None:
        try:
            handler(event)
        except Exception:
            log.exception("Event handler %s failed for %s", getattr(handler, "__name__", handler), event)
