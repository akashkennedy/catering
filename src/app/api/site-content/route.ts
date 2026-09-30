import { NextResponse } from "next/server";
import { z } from "zod";

import { requirePermission } from "@/lib/requirePermission";
import { DbNotConfiguredError } from "@/lib/db";
import { GALLERY_MAX_IMAGES } from "@/lib/galleryImage";
import {
  deleteOrphanGalleryImages,
  deleteOrphanMenuImages,
  galleryImageIdsExist,
  getSiteContentRow,
  menuImageIdsExist,
  publishSiteContentRow,
} from "@/lib/siteDb";
import { PUBLISH_HOOK_URL } from "@/lib/sitePublish";

const businessSchema = z.object({
  phones: z.array(z.string()),
  whatsapp: z.string(),
  addressEn: z.string(),
  addressTa: z.string(),
  serviceZones: z.array(z.string()).optional(),
});

const dishLineSchema = z.object({ en: z.string(), ta: z.string() });
const menuSchema = z.object({
  nameEn: z.string(),
  nameTa: z.string(),
  imageUrl: z.string(),
  imageId: z.string().optional().default(""),
  mainDishes: z.array(dishLineSchema),
  sideDishes: z.array(dishLineSchema),
  price: z.number(),
});

const gallerySchema = z.object({
  imageId: z.string().min(1),
  altTitle: z.string(),
});

const testimonialSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string(),
  author: z.string(),
  location: z.string(),
});

const payloadSchema = z.object({
  business: businessSchema,
  menus: z.array(menuSchema),
  gallery: z.array(gallerySchema).max(GALLERY_MAX_IMAGES),
  testimonials: z.array(testimonialSchema),
});

async function requirePublishPermission(): Promise<NextResponse | null> {
  const auth = await requirePermission("canManageSettings");
  if ("response" in auth) return auth.response;
  return null;
}

async function requireViewPermission(): Promise<NextResponse | null> {
  const auth = await requirePermission("canViewWebsite");
  if ("response" in auth) return auth.response;
  return null;
}

function dbErrorResponse(error: unknown): NextResponse {
  if (error instanceof DbNotConfiguredError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  return NextResponse.json({ error: "Database request failed." }, { status: 500 });
}

/** Pull the live website content doc (requires canViewWebsite). */
export async function GET() {
  const denied = await requireViewPermission();
  if (denied) return denied;
  try {
    const row = await getSiteContentRow();
    if (!row) return NextResponse.json({ data: null, updatedAt: null });
    return NextResponse.json(row);
  } catch (error) {
    return dbErrorResponse(error);
  }
}

/**
 * Publish the website content doc (requires canManageSettings).
 *
 * The landing (mampallicatering.vercel.app) reads the SAME `site_content`
 * row in the flat shape:
 *   { business: { phones, whatsapp, addressEn, addressTa, serviceZones? },
 *     menus: [{ nameEn/nameTa, imageUrl (legacy fallback), imageId? (bytes in site_menu_images),
 *       mainDishes[{en,ta}], sideDishes[{en,ta}], price }],
 *   gallery: [{ imageId, altTitle }],  // max 10; bytes in site_gallery_images,
 *     testimonials: [{ rating, review (EN), author, location }] }
 * We write the CRM doc through AS-IS — never transform it.
 *
 * Order: validate → write the DB row FIRST, then POST the landing publish
 * hook. Never POST before the write commits; on write failure do NOT call
 * the hook. The secret is read from Vercel env (`PUBLISH_SECRET`, same value
 * as the landing's `PUBLISH_SECRET`).
 */
export async function POST(request: Request) {
  const denied = await requirePublishPermission();
  if (denied) return denied;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid site content payload." }, { status: 400 });
  }

  // Flat-shape sanity: JSON must round-trip. Warnings only — old landing
  // renders empty lists as null sections, so zero menus/testimonials is allowed.
  const doc = parsed.data;
  try {
    JSON.parse(JSON.stringify(doc));
  } catch {
    return NextResponse.json({ error: "Site content does not serialize to JSON." }, { status: 400 });
  }
  const warnings: string[] = [];
  if (doc.menus.length === 0) {
    warnings.push("Zero menus — the site falls back to its built-in menus.");
  }
  // Every referenced menu photo must have stored (compressed) bytes.
  try {
    const missingMenu = await menuImageIdsExist(doc.menus.map((menu) => menu.imageId));
    if (missingMenu.length > 0) {
      return NextResponse.json(
        { error: "A menu photo was not uploaded yet. Re-upload it and try again." },
        { status: 400 }
      );
    }
  } catch (error) {
    return dbErrorResponse(error);
  }
  for (const menu of doc.menus) {
    if (!menu.nameEn.trim()) {
      return NextResponse.json({ error: "A menu is missing its meal name." }, { status: 400 });
    }
    if (!menu.nameTa.trim()) warnings.push(`Menu "${menu.nameEn}" missing Tamil name.`);
    if (menu.mainDishes.length === 0) {
      return NextResponse.json(
        { error: `Menu "${menu.nameEn}" needs at least one main dish.` },
        { status: 400 }
      );
    }
  }
  if (doc.gallery.length > GALLERY_MAX_IMAGES) {
    return NextResponse.json(
      { error: `Gallery allows a maximum of ${GALLERY_MAX_IMAGES} photos.` },
      { status: 400 }
    );
  }
  for (const item of doc.gallery) {
    if (!item.imageId.trim()) {
      return NextResponse.json({ error: "A gallery item is missing its photo." }, { status: 400 });
    }
    if (!item.altTitle.trim()) {
      return NextResponse.json({ error: "A gallery item is missing its alt title." }, { status: 400 });
    }
  }
  // Every referenced photo must have stored (compressed) bytes.
  try {
    const missing = await galleryImageIdsExist(doc.gallery.map((item) => item.imageId));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: "A gallery photo was not uploaded yet. Re-upload it and try again." },
        { status: 400 }
      );
    }
  } catch (error) {
    return dbErrorResponse(error);
  }
  for (const t of doc.testimonials) {
    if (!t.author.trim() || !t.review.trim() || !t.location.trim()) {
      return NextResponse.json(
        { error: "A testimonial is missing reviewer, review, or location." },
        { status: 400 }
      );
    }
  }

  // 1. Write the DB row FIRST (flat shape — what the landing reads).
  let updatedAt: string;
  try {
    updatedAt = await publishSiteContentRow(doc);
    // Best-effort: drop bytes no longer referenced (never blocks publish).
    try {
      await deleteOrphanGalleryImages(doc.gallery.map((item) => item.imageId));
      await deleteOrphanMenuImages(doc.menus.map((menu) => menu.imageId));
    } catch {
      /* orphan sweep is best-effort */
    }
  } catch (error) {
    // Write failed → do NOT call the publish hook.
    return dbErrorResponse(error);
  }

  // 2. POST the landing publish hook (no body, Bearer secret).
  // Secret comes from Vercel env — same secret as the landing's PUBLISH_SECRET.
  const publishUrl =
    process.env.SITE_PUBLISH_URL || process.env.SITE_REVALIDATE_URL || PUBLISH_HOOK_URL;
  const publishSecret =
    process.env.PUBLISH_SECRET || process.env.SITE_REVALIDATE_SECRET || "";
  if (!publishSecret) {
    return NextResponse.json({
      ok: true,
      updatedAt,
      published: false,
      publishError:
        "Saved to database, but PUBLISH_SECRET is not set in Vercel env — the live site still shows stale content.",
      warnings,
    });
  }
  try {
    const response = await fetch(publishUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${publishSecret}` },
    });
    if (response.status === 401) {
      return NextResponse.json({
        ok: true,
        updatedAt,
        published: false,
        publishError:
          "Saved to database, but the publish secret was rejected (401). Check PUBLISH_SECRET in Vercel — the live site still shows stale content.",
        warnings,
      });
    }
    let hookOk = response.ok;
    try {
      const hookBody = (await response.json()) as { ok?: boolean };
      hookOk = response.ok && hookBody.ok === true;
    } catch {
      hookOk = false;
    }
    if (!hookOk) {
      return NextResponse.json({
        ok: true,
        updatedAt,
        published: false,
        publishError: `Saved to database, but the publish hook returned ${response.status} — the live site still shows stale content.`,
        warnings,
      });
    }
    return NextResponse.json({
      ok: true,
      updatedAt,
      published: true,
      warnings,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      updatedAt,
      published: false,
      publishError:
        "Saved to database, but the publish hook could not be reached — the live site still shows stale content.",
      warnings,
    });
  }
}
