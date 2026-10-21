"""Split extracted text into overlapping chunks suitable for embedding."""

from __future__ import annotations

import re


def chunk_text(text: str, *, size: int = 1000, overlap: int = 150) -> list[str]:
    text = re.sub(r"[ \t]+", " ", text).strip()
    if not text:
        return []
    if len(text) <= size:
        return [text]
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + size, len(text))
        if end < len(text):
            # Prefer breaking at a paragraph, then sentence, then word boundary.
            window = text[start:end]
            for sep in ("\n\n", ". ", "\n", " "):
                cut = window.rfind(sep)
                if cut > size // 2:
                    end = start + cut + len(sep)
                    break
        chunks.append(text[start:end].strip())
        if end >= len(text):
            break
        start = max(end - overlap, start + 1)
    return [c for c in chunks if c]


def chunk_pages(pages: list[tuple[int, str]], *, size: int = 1000, overlap: int = 150) -> list[tuple[int, str]]:
    return [(page, chunk) for page, text in pages for chunk in chunk_text(text, size=size, overlap=overlap)]
