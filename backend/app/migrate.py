"""Run Alembic migrations from application code (startup, seed, tests)."""

from __future__ import annotations

import logging

from alembic import command
from alembic.config import Config
from alembic.runtime.migration import MigrationContext
from sqlalchemy import MetaData, inspect
from sqlalchemy.engine import Engine

from app.core.config import BACKEND_DIR

log = logging.getLogger(__name__)


def alembic_config() -> Config:
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "migrations"))
    return cfg


def upgrade(engine: Engine) -> None:
    """Bring the database to the latest schema.

    A database created before migrations existed (app tables present, no recorded revision)
    is stamped at the first revision, which matches that schema, and then upgraded normally.
    """
    cfg = alembic_config()
    with engine.begin() as connection:
        cfg.attributes["connection"] = connection
        app_tables = set(inspect(connection).get_table_names()) - {"alembic_version"}
        current = MigrationContext.configure(connection).get_current_revision()
        if app_tables and current is None:
            log.info("Existing database without migration history: stamping baseline revision")
            command.stamp(cfg, BASELINE)
        command.upgrade(cfg, "head")


def drop_everything(engine: Engine) -> None:
    """Drop every table, including Alembic's version table (used by `seed --reset`)."""
    metadata = MetaData()
    metadata.reflect(bind=engine)
    metadata.drop_all(bind=engine)


# The first revision: the schema as it stood when migrations were introduced.
BASELINE = "0001_initial"
