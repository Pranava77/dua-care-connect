from __future__ import annotations

import re
import uuid
from pathlib import Path


class LocalFileStorage:
    """FileStorage adapter backed by a local directory."""

    def __init__(self, root: Path):
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)

    def save(self, data: bytes, *, filename: str) -> str:
        safe = re.sub(r"[^A-Za-z0-9._-]", "_", Path(filename).name)[-80:]
        key = f"{uuid.uuid4().hex}_{safe}"
        (self.root / key).write_bytes(data)
        return key

    def read(self, key: str) -> bytes:
        return self._path(key).read_bytes()

    def delete(self, key: str) -> None:
        self._path(key).unlink(missing_ok=True)

    def _path(self, key: str) -> Path:
        path = (self.root / key).resolve()
        if self.root.resolve() not in path.parents:
            raise ValueError("Invalid storage key")
        return path
