"""Event subscribers that keep the index current. Registered once at startup."""

from __future__ import annotations

from app.ai.indexing.indexer import Indexer
from app.core.events import DocumentFileStored, EntityChanged, EventBus
from app.core.storage import FileStorage


def register_index_handlers(bus: EventBus, indexer: Indexer, storage: FileStorage) -> None:
    def on_entity_changed(event: EntityChanged) -> None:
        if event.action == "deleted":
            indexer.remove_entity(event.entity_type, event.entity_id)
        else:
            indexer.index_entity(event.entity_type, event.data)

    def on_document_file_stored(event: DocumentFileStored) -> None:
        indexer.index_document_file(event.data, storage.read(event.storage_key), event.content_type)

    bus.subscribe(EntityChanged, on_entity_changed)
    bus.subscribe(DocumentFileStored, on_document_file_stored)
