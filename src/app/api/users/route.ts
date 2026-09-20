import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";
import {
  FULL_PERMISSIONS,
  USERNAME_PATTERN,
  getPermissions,
  normalizeUsername,
  setPermissions,
} from "@/lib/authDb";
import { hashPassword } from "@/lib/password";

const createUserSchema = z.object({
  username: z.string().trim().min(3).max(30).regex(USERNAME_PATTERN),
  password: z.string().min(8).max(200),
  employeeId: z.string().nullable().optional(),
});

type Row = Record<string, unknown>;

function newId(): string {
  return `usr-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** List all logins with their effective permissions (admin-only screen data). */
export async function GET() {
  const auth = await requirePermission("canManageEmployees");
  if ("response" in auth) return auth.response;
  const sql = db();
  const rows = (await sql`
    SELECT u.id, u.username, u.is_admin, u.employee_id, u.created_at,
           e.name AS employee_name
    FROM users u LEFT JOIN employees e ON e.id = u.employee_id
    ORDER BY u.created_at ASC
  `) as Row[];
  const users = [];
  for (const row of rows) {
    const userId = String(row.id);
    const isAdmin = row.is_admin === true;
    const stored = isAdmin ? null : await getPermissions(userId);
    users.push({
      id: userId,
      username: String(row.username),
      isAdmin,
      employeeId: typeof row.employee_id === "string" ? row.employee_id : null,
      employeeName: typeof row.employee_name === "string" ? row.employee_name : null,
      permissions: stored ?? { ...FULL_PERMISSIONS },
    });
  }
  return NextResponse.json({ users });
}

/** Create a login linked to an employee (or standalone). */
export async function POST(request: Request) {
  const auth = await requirePermission("canManageEmployees");
  if ("response" in auth) return auth.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "A username (3-30 chars: letters, digits, . _ -) and a password of at least 8 characters are required." },
      { status: 400 }
    );
  }
  const username = normalizeUsername(parsed.data.username);
  const sql = db();
  const existing = await sql`SELECT id FROM users WHERE username = ${username} LIMIT 1`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
  }
  if (parsed.data.employeeId) {
    const linked = await sql`SELECT id FROM users WHERE employee_id = ${parsed.data.employeeId} LIMIT 1`;
    if (linked.length > 0) {
      return NextResponse.json(
        { error: "That employee already has a login." },
        { status: 409 }
      );
    }
  }
  const id = newId();
  await sql`
    INSERT INTO users (id, username, password_hash, is_admin, employee_id)
    VALUES (${id}, ${username}, ${await hashPassword(parsed.data.password)}, FALSE, ${parsed.data.employeeId ?? null})
  `;
  // New employee logins start on the restricted default template (§18.3).
  await setPermissions(id, {
    canViewFinance: false,
    canViewOtherEmployeeRates: false,
    canManageEmployees: true,
    canManageSettings: true,
  });
  return NextResponse.json({ ok: true, id, username });
}
