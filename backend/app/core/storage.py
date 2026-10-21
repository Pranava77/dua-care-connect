from typing import Protocol


class FileStorage(Protocol):
    """Port for binary file storage (local disk, S3, ...)."""

    def save(self, data: bytes, *, filename: str) -> str:
        """Store bytes and return an opaque storage key."""
        ...

    def read(self, key: str) -> bytes: ...

    def delete(self, key: str) -> None: ...
