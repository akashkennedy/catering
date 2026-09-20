-- 0006_view_permissions: who can see the website manager, the employee
-- list, and the Excel export. Defaults are restrictive (FALSE); admin
-- accounts are granted all three below. Effective immediately per request.

ALTER TABLE permissions ADD COLUMN IF NOT EXISTS can_view_employees BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS can_view_website BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS can_export_excel BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE permissions p
SET can_view_employees = TRUE,
    can_view_website = TRUE,
    can_export_excel = TRUE
FROM users u
WHERE u.id = p.user_id AND u.is_admin = TRUE;
