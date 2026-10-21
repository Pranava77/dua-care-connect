from app.ai.indexing.cards import build_card, build_chunk_records
from app.ai.indexing.chunking import chunk_text
from app.ai.indexing.extract import extract_text


def test_prescription_card_carries_module_and_resident():
    card = build_card("prescription", {
        "id": "7", "resident_id": "1", "residents": {"name": "Alice"}, "medication": "Metformin", "dosage": "500mg",
        "frequency": "Twice daily", "refill_date": "2024-02-15", "prescribing_doctor": "Dr. W",
    })
    assert card.id == "prescription:7"
    assert card.metadata["module"] == "medical"
    assert card.metadata["resident_id"] == "1"
    assert "Metformin 500mg" in card.text


def test_unknown_entity_is_skipped():
    assert build_card("spaceship", {"id": "1"}) is None


def test_chunking_overlaps_and_respects_size():
    text = " ".join(f"Sentence number {i} about care plans." for i in range(200))
    chunks = chunk_text(text, size=500, overlap=100)
    assert len(chunks) > 5
    assert all(len(c) <= 500 for c in chunks)
    assert chunks[0][-40:].split()[-1] in chunks[1]  # overlap carries context forward


def test_chunk_records_are_namespaced_per_document():
    records = build_chunk_records({"id": "d1", "name": "Lab", "category": "Medical", "resident_id": "1"},
                                  [(1, "a"), (2, "b")])
    assert [r.id for r in records] == ["chunk:d1:0", "chunk:d1:1"]
    assert records[1].metadata["page"] == 2


def test_extract_plain_text_and_unknown_types():
    assert extract_text(b"hello", "text/plain") == [(1, "hello")]
    assert extract_text(b"\x89PNG", "image/png") == []
