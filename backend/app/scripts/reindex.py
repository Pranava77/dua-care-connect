"""Rebuild the vector index from the database: python -m app.scripts.reindex"""

from __future__ import annotations

from app.container import Container
from app.core.config import get_settings


def reindex(container: Container) -> None:
    cards, chunks = container.reindex()
    print(f"Indexed {cards} record cards and {chunks} document chunks using {container.embeddings.name}.")


def main() -> None:
    container = Container(get_settings(), background_events=False)
    container.init_db()
    container.load_saved_ai_settings()  # use the key saved in Settings, if any
    reindex(container)


if __name__ == "__main__":
    main()
