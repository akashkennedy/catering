import { NextResponse } from "next/server";

import { DbNotConfiguredError, db } from "@/lib/db";
import { decodeBytea } from "@/lib/galleryImage";
import { requirePermission } from "@/lib/requirePermission";

/** Public menu photo bytes for the manager preview. No auth (cacheable). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const { imageId } = await params;
  if (!imageId) {
    return NextResponse.json({ error: "Missing image id." }, { status: 400 });
  }
  try {
    const sql = db();
    const rows = (await sql`
      SELECT data, mime, size_bytes FROM site_menu_images WHERE id = ${imageId} LIMIT 1
    `) as Record<string, unknown>[];
    if (rows.length === 0) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }
    const bytes = decodeBytea(rows[0]?.data);
    if (!bytes) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }
    const mime =
      typeof rows[0]?.mime === "string" && rows[0].mime ? String(rows[0].mime) : "image/webp";
    return new Response(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Length": String(bytes.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Database request failed." }, { status: 500 });
  }
}

/** Delete stored bytes. Requires canManageSettings. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const auth = await requirePermission("canManageSettings");
  if ("response" in auth) return auth.response;
  const { imageId } = await params;
  if (!imageId) {
    return NextResponse.json({ error: "Missing image id." }, { status: 400 });
  }
  try {
    const sql = db();
    await sql`DELETE FROM site_menu_images WHERE id = ${imageId}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Database request failed." }, { status: 500 });
  }
}
