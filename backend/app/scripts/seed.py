"""Load demo data and build the vector index.

    python -m app.scripts.seed            # seed an empty database
    python -m app.scripts.seed --reset    # wipe database, files and index first
"""

from __future__ import annotations

import argparse
import os
import shutil
from datetime import date, datetime, timedelta

from pydantic import TypeAdapter

from app.container import Container
from app.core.config import get_settings
from app.migrate import drop_everything
from app.core.security import hash_password
from app.domain.accounting.models import Invoice, Payment
from app.domain.documents.models import Document
from app.domain.medical.models import MedicalRecord, Prescription
from app.domain.reports.models import Report
from app.domain.residents.models import Resident
from app.domain.staff.models import LeaveRequest, Staff
from app.domain.users.models import User
from app.scripts import seed_data as data
from app.scripts.reindex import reindex

_DATE_FIELDS = {"date_of_birth", "hire_date", "last_check_date", "refill_date", "from_date", "to_date", "due_date"}
_DATETIME_FIELDS = {"created_at", "uploaded_at", "paid_at", "payment_date", "last_generated", "next_scheduled"}
# Birthdays and hire dates are facts; everything operational moves with the calendar so the demo
# always reads as "this week" (the data was written as if today were 5 February 2024).
_FIXED = {"date_of_birth", "hire_date"}
_DEMO_TODAY = date(2024, 2, 5)
_dt = TypeAdapter(datetime)


def _coerce(row: dict, shift: timedelta = timedelta(0)) -> dict:
    out = dict(row)
    for key, value in row.items():
        moves = key not in _FIXED
        if key in _DATE_FIELDS and isinstance(value, str):
            out[key] = date.fromisoformat(value) + (shift if moves else timedelta(0))
        elif key in _DATETIME_FIELDS and isinstance(value, str):
            out[key] = _dt.validate_python(value) + shift
    return out


def seed(container: Container, *, reset: bool = False) -> None:
    settings = container.settings
    if reset:
        drop_everything(container.engine)
        container.indexer.reset()
        shutil.rmtree(settings.storage_dir, ignore_errors=True)
        settings.storage_dir.mkdir(parents=True, exist_ok=True)
    container.init_db()

    password = os.environ.get("SEED_PASSWORD", "silversync-dev")
    shift = date.today() - _DEMO_TODAY
    c = lambda row: _coerce(row, shift)  # noqa: E731
    with container.session_factory() as db:
        if db.query(Resident).first() is not None:
            print("Database already has data; use --reset to reseed.")
            return
        db.add_all(Resident(**c(r)) for r in data.RESIDENTS)
        db.add_all(Staff(**c(s)) for s in data.STAFF)
        db.flush()
        db.add_all(MedicalRecord(**c(m)) for m in data.MEDICAL_RECORDS)
        db.add_all(Prescription(**c(p)) for p in data.PRESCRIPTIONS)
        db.add_all(LeaveRequest(**c(lr)) for lr in data.LEAVE_REQUESTS)
        db.add_all(Invoice(**c(i)) for i in data.INVOICES)
        db.flush()
        db.add_all(Payment(**c(p)) for p in data.PAYMENTS)
        db.add_all(Report(**c(r)) for r in data.REPORTS)
        for d in data.DOCUMENTS:
            doc = Document(**c(d))
            text = data.DOCUMENT_TEXT.get(d["id"])
            if text:
                doc.storage_key = container.storage.save(text.encode(), filename=f"{d['name']}.txt")
                doc.content_type = "text/plain"
            db.add(doc)
        db.add_all(User(**u, password_hash=hash_password(password)) for u in data.USERS)
        db.commit()
    print(f"Seeded demo data. Log in as e.g. doctor@silversync.com (password from SEED_PASSWORD).")
    reindex(container)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--reset", action="store_true", help="drop all data before seeding")
    args = parser.parse_args()
    container = Container(get_settings(), background_events=False)
    container.init_db()
    container.load_saved_ai_settings()  # index with the embedding model chosen in Settings, if any
    seed(container, reset=args.reset)


if __name__ == "__main__":
    main()
