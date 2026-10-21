from app.core.rbac import ROLE_PERMISSIONS, allowed_modules


def test_admin_has_every_module():
    assert allowed_modules(ROLE_PERMISSIONS["admin"]) == ["residents", "medical", "documents", "accounting", "hr"]


def test_receptionist_cannot_read_medical_or_finance():
    modules = allowed_modules(ROLE_PERMISSIONS["receptionist"])
    assert "medical" not in modules and "accounting" not in modules and "hr" not in modules


def test_roles_match_frontend_definition():
    # src/lib/rbac.ts gives nurses medical create/update but not delete
    nurse = ROLE_PERMISSIONS["nurse"]
    assert "medical:update" in nurse and "medical:delete" not in nurse
