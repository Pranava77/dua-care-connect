from __future__ import annotations

from app.domain.common import SqlRepository
from app.domain.settings.models import AppSetting


class SettingsRepository(SqlRepository[AppSetting]):
    model = AppSetting

    def put(self, key: str, value: str, updated_by: str) -> None:
        row = self.get(key)
        if row is None:
            self.add(AppSetting(key=key, value=value, updated_by=updated_by))
        else:
            row.value = value
            row.updated_by = updated_by
