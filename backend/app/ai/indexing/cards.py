"""Turn domain DTO payloads into searchable text cards. Pure functions, no I/O."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from app.ai.schemas import VectorRecord

RECORDS = "records"
DOCUMENTS = "documents"


def card_id(entity_type: str, entity_id: str) -> str:
    return f"{entity_type}:{entity_id}"


def _meta(entity_type: str, entity_id: str, module: str, title: str, url: str,
          resident_id: str | None = None) -> dict[str, Any]:
    meta = {"entity_type": entity_type, "entity_id": entity_id, "module": module, "title": title, "url": url}
    if resident_id:
        meta["resident_id"] = resident_id
    return meta


def _resident(d: dict) -> tuple[str, dict]:
    conditions = ", ".join(d.get("medical_conditions") or []) or "none recorded"
    text = (f"Resident {d['name']}, room {d['room_number']}, born {d['date_of_birth']}. "
            f"Medical conditions: {conditions}. Emergency contact: {d['emergency_contact']}.")
    return text, _meta("resident", d["id"], "residents", d["name"], f"/residents/{d['id']}", d["id"])


def _staff(d: dict) -> tuple[str, dict]:
    text = (f"Staff member {d['name']}, {d['position']} in the {d['department']} department. "
            f"Status {d.get('status', 'active')}. Email {d['email']}, phone {d['phone']}, hired {d['hire_date']}.")
    return text, _meta("staff", d["id"], "hr", d["name"], "/hr")


def _leave(d: dict) -> tuple[str, dict]:
    name = d["staff"]["name"]
    text = (f"Leave request by {name} from {d['from_date']} to {d['to_date']}. "
            f"Reason: {d['reason']}. Status: {d['status']}.")
    return text, _meta("leave_request", d["id"], "hr", f"Leave: {name}", "/hr")


def _medical_record(d: dict) -> tuple[str, dict]:
    name = d["residents"]["name"]
    text = (f"Medical record for {name}. Diagnosis: {d['diagnosis']}. Treatment: {d['treatment']}. "
            f"Last checked {d['last_check_date']} by {d['doctor']}. Notes: {d.get('notes') or 'none'}.")
    return text, _meta("medical_record", d["id"], "medical", f"{d['diagnosis']} — {name}",
                       f"/residents/{d['resident_id']}", d["resident_id"])


def _prescription(d: dict) -> tuple[str, dict]:
    name = d["residents"]["name"]
    text = (f"Prescription for {name}: {d['medication']} {d['dosage']}, {d['frequency']}. "
            f"Refill due {d['refill_date']}. Prescribed by {d['prescribing_doctor']}.")
    return text, _meta("prescription", d["id"], "medical", f"{d['medication']} — {name}",
                       f"/residents/{d['resident_id']}", d["resident_id"])


def _invoice(d: dict) -> tuple[str, dict]:
    lines = "; ".join(f"{s['name']} {s['amount']}" for s in d.get("services") or []) or "none listed"
    text = (f"Invoice {d['invoice_number']} for {d['resident_name']}: {d['amount']} {d['currency']}, "
            f"status {d['status']}, due {d['due_date']}. Services: {lines}. Notes: {d.get('notes') or 'none'}.")
    return text, _meta("invoice", d["id"], "accounting", f"{d['invoice_number']} — {d['resident_name']}",
                       "/accounting", d["resident_id"])


def _payment(d: dict) -> tuple[str, dict]:
    text = (f"Payment of {d['amount']} via {d['payment_method']} on {d['payment_date']} for invoice {d['invoice_id']}, "
            f"processed by {d['processed_by']}. Transaction {d.get('transaction_id') or 'n/a'}.")
    return text, _meta("payment", d["id"], "accounting", f"Payment {d.get('transaction_id') or d['id']}", "/accounting")


def _document(d: dict) -> tuple[str, dict]:
    about = f" for {d['resident_name']}" if d.get("resident_name") else ""
    text = (f"Document '{d['name']}' ({d['category']}, status {d['status']}){about}, uploaded by {d['uploaded_by']}. "
            f"{d.get('description') or ''}")
    meta = _meta("document", d["id"], "documents", d["name"], "/documents", d.get("resident_id"))
    meta["document_id"] = d["id"]
    return text, meta


BUILDERS: dict[str, Callable[[dict], tuple[str, dict]]] = {
    "resident": _resident,
    "staff": _staff,
    "leave_request": _leave,
    "medical_record": _medical_record,
    "prescription": _prescription,
    "invoice": _invoice,
    "payment": _payment,
    "document": _document,
}


def build_card(entity_type: str, data: dict[str, Any]) -> VectorRecord | None:
    builder = BUILDERS.get(entity_type)
    if builder is None:
        return None
    text, meta = builder(data)
    return VectorRecord(id=card_id(entity_type, data["id"]), text=text, metadata=meta)


def build_chunk_records(document: dict[str, Any], chunks: list[tuple[int, str]]) -> list[VectorRecord]:
    """Records for the `documents` collection: one per text chunk of an uploaded file."""
    base = {
        "entity_type": "document_chunk",
        "entity_id": document["id"],
        "document_id": document["id"],
        "module": "documents",
        "title": document["name"],
        "url": "/documents",
        "category": document.get("category") or "",
    }
    if document.get("resident_id"):
        base["resident_id"] = document["resident_id"]
    return [
        VectorRecord(id=f"chunk:{document['id']}:{i}", text=text, metadata={**base, "page": page, "chunk": i})
        for i, (page, text) in enumerate(chunks)
    ]
