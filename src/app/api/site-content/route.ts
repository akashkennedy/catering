import { NextResponse } from "next/server";
import { z } from "zod";

import { resolveRequestSession } from "@/lib/authSession";
import { requirePermission } from "@/lib/requirePermission";
import { DbNotConfiguredError } from "@/lib/db";
import {
  getSiteContentRow,
  publishSiteContentRow,
} from "@/lib/siteDb";

const businessSchema = z.object({
  phones: z.array(z.string()),
  whatsapp: z.string(),
  addressEn: z.string(),
  addressTa: z.string(),
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

async function requireSession(): Promise<NextResponse | null> {
  const session = await resolveRequestSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return null;
}

async function requirePublishPermission(): Promise<NextResponse | null> {
  const auth = await requirePermission("canManageSettings");
  if ("response" in auth) return auth.response;
  return null;
}

function dbErrorResponse(error: unknown): NextResponse {
  if (error instanceof DbNotConfiguredError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  return NextResponse.json({ error: "Database request failed." }, { status: 500 });
}

/** Pull the live website content doc (CRM login required). */
export async function GET() {
  const denied = await requireSession();
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
 * Best-effort: pings the website's revalidate endpoint when configured.
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
  try {
    const updatedAt = await publishSiteContentRow(parsed.data);
    let revalidated = false;
    const revalidateUrl = process.env.SITE_REVALIDATE_URL;
    const revalidateSecret = process.env.SITE_REVALIDATE_SECRET;
    if (revalidateUrl && revalidateSecret) {
      try {
        const response = await fetch(revalidateUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secret: revalidateSecret }),
        });
        revalidated = response.ok;
      } catch {
        revalidated = false;
      }
    }
    return NextResponse.json({ ok: true, updatedAt, revalidated });
  } catch (error) {
    return dbErrorResponse(error);
  }
}
