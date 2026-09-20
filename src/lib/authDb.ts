import { randomUUID } from "node:crypto";

import { db } from "./db";
import { normalizeUsername } from "./username";

export { USERNAME_PATTERN, isValidUsername, normalizeUsername } from "./username";

/**
 * Database-backed users, sessions and permissions.
 * Server-only. All functions throw DbNotConfiguredError when DATABASE_URL
 * is missing — callers fall back to the legacy env-credential flow.
 */

export type DbUser = {
  id: string;
  username: string;
  passwordHash: string;
  isAdmin: boolean;
  employeeId: string | null;
};

export type DbSession = {
  id: string;
  userId: string;
  expiresAt: string;
};

export type DbPermissions = {
  userId: string;
  canViewFinance: boolean;
  canViewOtherEmployeeRates: boolean;
  canManageEmployees: boolean;
  canManageSettings: boolean;
  canViewEmployees: boolean;
  canViewWebsite: boolean;
  canExportExcel: boolean;
};

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export const DEFAULT_EMPLOYEE_PERMISSIONS = {
  canViewFinance: false,
  canViewOtherEmployeeRates: false,
  canManageEmployees: true,
  canManageSettings: true,
  canViewEmployees: false,
  canViewWebsite: false,
  canExportExcel: false,
} as const;

export const FULL_PERMISSIONS = {
  canViewFinance: true,
  canViewOtherEmployeeRates: true,
  canManageEmployees: true,
  canManageSettings: true,
  canViewEmployees: true,
  canViewWebsite: true,
  canExportExcel: true,
} as const;

function toDbUser(row: Record<string, unknown>): DbUser {
  return {
    id: String(row.id),
    username: String(row.username),
    passwordHash: String(row.password_hash),
    isAdmin: row.is_admin === true,
    employeeId:
      typeof row.employee_id === "string" && row.employee_id ? row.employee_id : null,
  };
}

export async function getUserByUsername(username: string): Promise<DbUser | null> {
  const sql = db();
  const rows = await sql`SELECT * FROM users WHERE username = ${normalizeUsername(username)} LIMIT 1`;
  if (rows.length === 0) return null;
  return toDbUser(rows[0] as Record<string, unknown>);
}

export async function getUserById(id: string): Promise<DbUser | null> {
  const sql = db();
  const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) return null;
  return toDbUser(rows[0] as Record<string, unknown>);
}

export async function createSession(userId: string): Promise<{ id: string; expiresAt: string }> {
  const sql = db();
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
  await sql`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${id}, ${userId}, ${expiresAt}::timestamptz)
  `;
  return { id, expiresAt };
}

export async function getSession(sessionId: string): Promise<DbSession | null> {
  const sql = db();
  const rows = await sql`SELECT * FROM sessions WHERE id = ${sessionId} LIMIT 1`;
  if (rows.length === 0) return null;
  const row = rows[0] as { id: unknown; user_id: unknown; expires_at: unknown };
  const expiresAt =
    row.expires_at instanceof Date ? row.expires_at.toISOString() : String(row.expires_at);
  if (Number.isNaN(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now()) {
    return null;
  }
  return { id: String(row.id), userId: String(row.user_id), expiresAt };
}

export async function deleteSession(sessionId: string): Promise<void> {
  const sql = db();
  await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
}

export async function deleteExpiredSessions(): Promise<void> {
  const sql = db();
  await sql`DELETE FROM sessions WHERE expires_at <= NOW()`;
}

export async function getPermissions(userId: string): Promise<DbPermissions | null> {
  const sql = db();
  const rows = await sql`SELECT * FROM permissions WHERE user_id = ${userId} LIMIT 1`;
  if (rows.length === 0) return null;
  const row = rows[0] as Record<string, unknown>;
  return {
    userId: String(row.user_id),
    canViewFinance: row.can_view_finance === true,
    canViewOtherEmployeeRates: row.can_view_other_employee_rates === true,
    canManageEmployees: row.can_manage_employees === true,
    canManageSettings: row.can_manage_settings === true,
    canViewEmployees: row.can_view_employees === true,
    canViewWebsite: row.can_view_website === true,
    canExportExcel: row.can_export_excel === true,
  };
}

/** Admin always resolves to full permissions, even with no row. */
export async function resolvePermissions(user: DbUser): Promise<DbPermissions> {
  if (user.isAdmin) {
    return { userId: user.id, ...FULL_PERMISSIONS };
  }
  const stored = await getPermissions(user.id);
  if (stored) return stored;
  return { userId: user.id, ...DEFAULT_EMPLOYEE_PERMISSIONS };
}

export async function setPermissions(
  userId: string,
  permissions: {
    canViewFinance: boolean;
    canViewOtherEmployeeRates: boolean;
    canManageEmployees: boolean;
    canManageSettings: boolean;
    canViewEmployees: boolean;
    canViewWebsite: boolean;
    canExportExcel: boolean;
  }
): Promise<void> {
  const sql = db();
  await sql`
    INSERT INTO permissions
      (user_id, can_view_finance, can_view_other_employee_rates, can_manage_employees, can_manage_settings, can_view_employees, can_view_website, can_export_excel, updated_at)
    VALUES
      (${userId}, ${permissions.canViewFinance}, ${permissions.canViewOtherEmployeeRates}, ${permissions.canManageEmployees}, ${permissions.canManageSettings}, ${permissions.canViewEmployees}, ${permissions.canViewWebsite}, ${permissions.canExportExcel}, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      can_view_finance = EXCLUDED.can_view_finance,
      can_view_other_employee_rates = EXCLUDED.can_view_other_employee_rates,
      can_manage_employees = EXCLUDED.can_manage_employees,
      can_manage_settings = EXCLUDED.can_manage_settings,
      can_view_employees = EXCLUDED.can_view_employees,
      can_view_website = EXCLUDED.can_view_website,
      can_export_excel = EXCLUDED.can_export_excel,
      updated_at = NOW()
  `;
}
