import { NextResponse } from "next/server";
import { z } from "zod";

import { requirePermission } from "@/lib/requirePermission";
import { DbNotConfiguredError } from "@/lib/db";
import {
  getSiteContentRow,
  publishSiteContentRow,
} from "@/lib/siteDb";
import {
  PUBLISH_HOOK_URL,
  buildLandingPayload,
  validateLandingPayload,
} from "@/lib/sitePublish";

const businessSchema = z.object({
  phones: z.array(z.string()),
  whatsapp: z.string(),
  addressEn: z.string(),
  addressTa: z.string(),
  serviceZones: z.array(z.string()).optional(),
});

const menuItemSchema = z.object({ en: z.string(), ta: z.string() });
const courseSchema = z.object({
  nameEn: z.string(),
  nameTa: z.string(),
  items: z.array(menuItemSchema),
});
const menuSchema = z.object({
  nameEn: z.string(),
  nameTa: z.string(),
  tagEn: z.string(),
  tagTa: z.string(),
  descEn: z.string(),
  descTa: z.string(),
  price: z.number(),
  photoUrl: z.string(),
  templateId: z.string().nullable(),
  courses: z.array(courseSchema),
  // Landing display extras (optional — manager sends them, old clients omit).
  tabKey: z.string().optional(),
  taglineEn: z.string().optional(),
  taglineTa: z.string().optional(),
  unitEn: z.string().optional(),
  unitTa: z.string().optional(),
  isVegOnly: z.boolean().optional(),
  sideTitle: z.string().optional(),
  sideDesc: z.string().optional(),
  sideBadge: z.string().optional(),
  sideImage: z.string().optional(),
});

const gallerySchema = z.object({
  kind: z.enum(["photo", "instagram"]),
  url: z.string(),
  captionEn: z.string(),
  captionTa: z.string(),
  category: z.string(),
});

const testimonialSchema = z.object({
  quoteEn: z.string(),
  quoteTa: z.string(),
  author: z.string(),
  event: z.string(),
  eventTa: z.string().optional(),
  place: z.string(),
  rating: z.number().min(1).max(5),
  source: z.enum(["manual", "google"]),
  profileUrl: z.string(),
  authorPhotoUrl: z.string(),
  googleReviewId: z.string(),
});

const payloadSchema = z.object({
  business: businessSchema,
  menus: z.array(menuSchema),
  gallery: z.array(gallerySchema),
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

  // Map CRM doc → landing contract + validate before touching the DB.
  const landing = buildLandingPayload(parsed.data);
  const validation = validateLandingPayload(landing);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.errors.join(" ") || "Invalid site content." },
      { status: 400 }
    );
  }
  try {
    JSON.parse(JSON.stringify(landing));
  } catch {
    return NextResponse.json({ error: "Site content does not serialize to JSON." }, { status: 400 });
  }

  // 1. Write the DB row FIRST.
  let updatedAt: string;
  try {
    updatedAt = await publishSiteContentRow(landing);
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
      warnings: validation.warnings,
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
        warnings: validation.warnings,
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
        warnings: validation.warnings,
      });
    }
    return NextResponse.json({
      ok: true,
      updatedAt,
      published: true,
      warnings: validation.warnings,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      updatedAt,
      published: false,
      publishError:
        "Saved to database, but the publish hook could not be reached — the live site still shows stale content.",
      warnings: validation.warnings,
    });
  }
}
