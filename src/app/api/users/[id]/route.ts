import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";
import { getUserById, setPermissions } from "@/lib/authDb";

const permissionsSchema = z.object({
  canViewFinance: z.boolean(),
  canViewOtherEmployeeRates: z.boolean(),
  canManageEmployees: z.boolean(),
  canManageSettings: z.boolean(),
  canViewEmployees: z.boolean(),
  canViewWebsite: z.boolean(),
  canExportExcel: z.boolean(),
});

/**
 * Update a login's permissions. Effective immediately (checked per request).
 * Guards: admin accounts can never be edited down, and nobody (including the
 * admin) can edit their own permissions — both prevent lockouts.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("canManageEmployees");
  if ("response" in auth) return auth.response;
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = permissionsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid permissions." }, { status: 400 });
  }
  const target = await getUserById(id);
  if (!target) {
    return NextResponse.json({ error: "Login not found." }, { status: 404 });
  }
  if (target.isAdmin) {
    return NextResponse.json(
      { error: "Admin accounts always keep full access." },
      { status: 403 }
    );
  }
  if (target.id === auth.session.user.id) {
    return NextResponse.json(
      { error: "You cannot change your own permissions." },
      { status: 403 }
    );
  }
  await setPermissions(id, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("canManageEmployees");
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const target = await getUserById(id);
  if (!target) {
    return NextResponse.json({ error: "Login not found." }, { status: 404 });
  }
  if (target.isAdmin || target.id === auth.session.user.id) {
    return NextResponse.json({ error: "That login cannot be removed." }, { status: 403 });
  }
  const sql = db();
  await sql`DELETE FROM users WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
