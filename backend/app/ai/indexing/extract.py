"""Extract plain text from uploaded files. Returns (page_number, text) pairs."""

from __future__ import annotations

import io
import logging
import re
import zipfile

log = logging.getLogger(__name__)

DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


def extract_text(data: bytes, content_type: str) -> list[tuple[int, str]]:
    try:
        if content_type == "application/pdf":
            return _pdf(data)
        if content_type == DOCX:
            return _docx(data)
        if content_type.startswith("text/"):
            return [(1, data.decode("utf-8", errors="replace"))]
    except Exception:
        log.exception("Text extraction failed for %s", content_type)
    # Images, legacy .doc and scanned files have no extractable text; the
    # document-intelligence service can transcribe them with a multimodal model.
    return []


def needs_transcription(pages: list[tuple[int, str]]) -> bool:
    return sum(len(t.strip()) for _, t in pages) < 20


def _pdf(data: bytes) -> list[tuple[int, str]]:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(data))
    return [(i + 1, page.extract_text() or "") for i, page in enumerate(reader.pages)]


def _docx(data: bytes) -> list[tuple[int, str]]:
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        xml = zf.read("word/document.xml").decode("utf-8", errors="replace")
    paragraphs = re.findall(r"<w:p[ >].*?</w:p>", xml, flags=re.S)
    text = "\n".join("".join(re.findall(r"<w:t[^>]*>(.*?)</w:t>", p, flags=re.S)) for p in paragraphs)
    return [(1, text)]
