import { NextResponse } from "next/server";

import { DbNotConfiguredError, db } from "@/lib/db";
import {
  compressGalleryImage,
  galleryImageUrl,
  newGalleryImageId,
} from "@/lib/galleryImage";
import { requirePermission } from "@/lib/requirePermission";

/**
 * Upload a gallery photo. Compresses server-side (1600px max edge,
 * WebP q75) and stores bytes in site_gallery_images.
 * Requires canManageSettings. The 10-image cap is enforced when the
 * gallery doc is published (POST /api/site-content), not here, so an
 * in-progress upload never blocks replacing an existing photo.
 */
export async function POST(request: Request) {
  const auth = await requirePermission("canManageSettings");
  if ("response" in auth) return auth.response;
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload body." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image file provided." }, { status: 400 });
  }
  let compressed;
  try {
    const input = Buffer.from(await file.arrayBuffer());
    compressed = await compressGalleryImage(input, file.type);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not process that image.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const id = newGalleryImageId();
  try {
    const sql = db();
    await sql`
      INSERT INTO site_gallery_images (id, data, mime, width, height, size_bytes)
      VALUES (${id}, ${compressed.bytes}, ${compressed.mime}, ${compressed.width}, ${compressed.height}, ${compressed.bytes.length})
      ON CONFLICT (id) DO NOTHING
    `;
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Database request failed." }, { status: 500 });
  }
  return NextResponse.json({
    imageId: id,
    url: galleryImageUrl(id),
    width: compressed.width,
    height: compressed.height,
    sizeBytes: compressed.bytes.length,
  });
}
