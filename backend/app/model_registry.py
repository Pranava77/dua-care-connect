"""Imports every SQLAlchemy model so `Base.metadata` describes the whole schema.

Used by Alembic (autogenerate and migrations) and anything else that needs the full table
list. Lives at the composition level because it spans domain and infra.
"""

from app.core.db import Base
from app.domain.accounting import models as accounting_models  # noqa: F401
from app.domain.documents import models as documents_models  # noqa: F401
from app.domain.medical import models as medical_models  # noqa: F401
from app.domain.reports import models as reports_models  # noqa: F401
from app.domain.residents import models as residents_models  # noqa: F401
from app.domain.settings import models as settings_models  # noqa: F401
from app.domain.staff import models as staff_models  # noqa: F401
from app.domain.users import models as users_models  # noqa: F401
from app.infra import sql_agent_store  # noqa: F401  (agent sessions, messages, actions, audit)

metadata = Base.metadata
