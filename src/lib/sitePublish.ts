/**
 * Shared `site_content` (id='default') contract for
 * https://mampallicatering.vercel.app + the CRM site-manager.
 *
 * The landing reads the NeonDB row in the OLD flat shape (business flat,
 * menus flat with courses/items, gallery flat, testimonials flat with
 * quoteEn/quoteTa + event/place). Extra keys are ignored by old landing
 * builds, so the CRM writes its doc through AS-IS. After every write we
 * MUST POST its publish hook (`POST $SITE_PUBLISH_URL`, no body, header
 * `Authorization: Bearer $PUBLISH_SECRET`, expect HTTP 200 + { ok: true }).
 *
 * Server-only (no secrets here). The secret lives in Vercel env
 * (`PUBLISH_SECRET`, same value as the landing's `PUBLISH_SECRET`) and is
 * only used in the API route that calls the hook.
 *
 * Data contract (top-level keys NEVER renamed/deleted):
 *   menus[], gallery[], business{}, testimonials[]
 *
 * NOTE: `buildLandingPayload` / `validateLandingPayload` below are legacy
 * nested-shape helpers and are NO LONGER used by `/api/site-content`
 * (the landing expects flat). Kept only to avoid breaking imports.
 */

export const PUBLISH_HOOK_URL =
  "https://mampallicatering.vercel.app/api/publish";

export const DEFAULT_SERVICE_ZONES = [
  "Thiruvarambu",
  "Marthandam",
  "Nagercoil",
  "Thuckalay",
  "Kulasekharam",
  "Kanyakumari",
  "Karungal",
  "Trivandrum Border",
];

export const DEFAULT_MENU_IMAGE = "/images/img_02.jpg";

export function stripDigits(value: string): string {
  return (value ?? "").replace(/\D/g, "");
}

export function initialsOf(author: string): string {
  const parts = author.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  // Skip connectors like "&" so "Anand & Priya" → "AP".
  const words = parts.filter((p) => /[A-Za-z\u0B80-\u0BFF]/.test(p[0] ?? ""));
  const picked = (words.length > 0 ? words : parts).slice(0, 2);
  return picked.map((w) => w[0]!.toUpperCase()).join("");
}

/**
 * Normalize an image reference to a site-hosted path.
 * Allowed: `/images/….jpg` or absolute URLs whose path starts with `/images/`.
 * Returns null for hotlinked CDN URLs (Instagram/Facebook/etc.) — callers drop
 * the item or fall back to DEFAULT_MENU_IMAGE.
 */
export function normalizeImageUrl(url: string): string | null {
  const trimmed = (url ?? "").trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/images/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith("/images/")) return parsed.pathname;
    return null;
  } catch {
    return null;
  }
}

type Bilingual = { en: string; ta: string };

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asBilingual(value: unknown, fallbackEn = ""): Bilingual {
  if (value && typeof value === "object") {
    const raw = value as Record<string, unknown>;
    const en = asString(raw.en) || fallbackEn;
    // Never leave ta empty — fall back to English so Tamil visitors still
    // get readable content (authors should still provide real translations).
    const ta = asString(raw.ta) || en;
    return { en, ta };
  }
  return { en: fallbackEn, ta: fallbackEn };
}

// ---------------------------------------------------------------------------
// CRM input shapes (superset — includes landing extras added by the manager).
// ---------------------------------------------------------------------------

export type CrmMenuCourse = {
  nameEn: string;
  nameTa: string;
  items: { en: string; ta: string }[];
};

export type CrmMenu = {
  id?: string;
  templateId?: string | null;
  nameEn: string;
  nameTa: string;
  tagEn: string;
  tagTa: string;
  descEn: string;
  descTa: string;
  price: number;
  photoUrl: string;
  courses: CrmMenuCourse[];
  // Landing display extras (optional, published through as-is).
  tabKey?: string;
  taglineEn?: string;
  taglineTa?: string;
  unitEn?: string;
  unitTa?: string;
  isVegOnly?: boolean;
  sideTitle?: string;
  sideDesc?: string;
  sideBadge?: string;
  sideImage?: string;
};

export type CrmBusiness = {
  phones: string[];
  whatsapp: string;
  addressEn: string;
  addressTa: string;
  serviceZones?: string[];
};

export type CrmGalleryItem = {
  id?: string;
  kind: string;
  url: string;
  captionEn: string;
  captionTa: string;
  category: string;
};

export type CrmTestimonial = {
  id?: string;
  quoteEn: string;
  quoteTa: string;
  author: string;
  event: string;
  eventTa?: string;
  place: string;
  rating: number;
  source?: string;
  profileUrl?: string;
  authorPhotoUrl?: string;
  googleReviewId?: string;
};

export type CrmDoc = {
  business: CrmBusiness;
  menus: CrmMenu[];
  gallery: CrmGalleryItem[];
  testimonials: CrmTestimonial[];
};

// ---------------------------------------------------------------------------
// Landing output shapes.
// ---------------------------------------------------------------------------

export type LandingMenu = {
  templateId: string | null;
  nameEn: string;
  nameTa: string;
  descEn: string;
  descTa: string;
  price: number;
  photoUrl: string;
  tagEn: string;
  tagTa: string;
  courses: { nameEn: string; nameTa: string; items: Bilingual[] }[];
  // Additive display extras (landing ignores unknown keys on old builds).
  tabKey: string;
  taglineEn: string;
  taglineTa: string;
  unitEn: string;
  unitTa: string;
  isVegOnly: boolean;
  sideTitle: string;
  sideDesc: string;
  sideBadge: string;
  sideImage: string;
};

export type LandingBusiness = {
  phones: string[];
  whatsapp: string;
  addressEn: string;
  addressTa: string;
  serviceZones: string[];
};

export type LandingGalleryItem = {
  kind: "photo";
  url: string;
  captionEn: string;
  captionTa: string;
  category: string;
};

export type LandingTestimonial = {
  id: string;
  author: string;
  event: Bilingual;
  location: string;
  initials: string;
  rating: number;
  quote: Bilingual;
  source: string;
  profileUrl: string;
  authorPhotoUrl: string;
  googleReviewId: string;
};

export type LandingDoc = {
  business: LandingBusiness;
  menus: LandingMenu[];
  gallery: LandingGalleryItem[];
  testimonials: LandingTestimonial[];
};

function newId(): string {
  return `site-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function buildLandingMenu(raw: CrmMenu): LandingMenu | null {
  const nameEn = asString(raw.nameEn).trim();
  if (!nameEn) return null; // items missing a name are dropped
  const nameTa = asString(raw.nameTa).trim() || nameEn;
  const photo = normalizeImageUrl(asString(raw.photoUrl)) ?? DEFAULT_MENU_IMAGE;
  const sideImage =
    normalizeImageUrl(asString(raw.sideImage)) ?? photo;

  const courses = Array.isArray(raw.courses)
    ? raw.courses
        .filter((c) => asString(c?.nameEn).trim() !== "")
        .map((c) => ({
          nameEn: asString(c.nameEn).trim(),
          nameTa: asString(c.nameTa).trim() || asString(c.nameEn).trim(),
          items: Array.isArray(c.items)
            ? c.items
                .filter((i) => asString(i?.en).trim() !== "")
                .map((i) => ({
                  en: asString(i.en).trim(),
                  ta: asString(i.ta).trim() || asString(i.en).trim(),
                }))
            : [],
        }))
    : [];

  const tagEn = asString(raw.tagEn).trim();
  const tagTa = asString(raw.tagTa).trim() || tagEn;
  const descEn = asString(raw.descEn).trim();
  const descTa = asString(raw.descTa).trim() || descEn;
  const taglineEn = asString(raw.taglineEn).trim() || descEn;
  const taglineTa = asString(raw.taglineTa).trim() || taglineEn;

  return {
    templateId: typeof raw.templateId === "string" ? raw.templateId : null,
    nameEn,
    nameTa,
    descEn,
    descTa,
    price: typeof raw.price === "number" && Number.isFinite(raw.price) ? raw.price : 0,
    photoUrl: photo,
    tagEn,
    tagTa,
    courses,
    tabKey: asString(raw.tabKey).trim() || nameEn,
    taglineEn,
    taglineTa,
    unitEn: asString(raw.unitEn).trim() || "/ per leaf plate",
    unitTa: asString(raw.unitTa).trim() || "/ இலைக்கு",
    isVegOnly: raw.isVegOnly !== false,
    sideTitle: asString(raw.sideTitle).trim(),
    sideDesc: asString(raw.sideDesc).trim(),
    sideBadge: asString(raw.sideBadge).trim(),
    sideImage,
  };
}

function buildLandingBusiness(raw: CrmBusiness): LandingBusiness {
  const phones = (Array.isArray(raw.phones) ? raw.phones : [])
    .map((p) => stripDigits(asString(p)))
    .filter((d) => d !== "");
  const whatsapp = stripDigits(asString(raw.whatsapp));
  const zones =
    Array.isArray(raw.serviceZones) && raw.serviceZones.length > 0
      ? raw.serviceZones.map((z) => asString(z).trim()).filter(Boolean)
      : [...DEFAULT_SERVICE_ZONES];
  return {
    phones,
    whatsapp,
    addressEn: asString(raw.addressEn),
    addressTa: asString(raw.addressTa) || asString(raw.addressEn),
    serviceZones: zones,
  };
}

function buildLandingGallery(items: CrmGalleryItem[]): LandingGalleryItem[] {
  return (Array.isArray(items) ? items : []).flatMap((raw) => {
    const url = normalizeImageUrl(asString(raw.url));
    // Never hotlink Instagram/Facebook CDN URLs — drop them.
    if (!url) return [];
    const captionEn = asString(raw.captionEn).trim();
    return [
      {
        kind: "photo" as const,
        url,
        captionEn,
        captionTa: asString(raw.captionTa).trim() || captionEn,
        category: asString(raw.category).trim() || "sadya",
      },
    ];
  });
}

function buildLandingTestimonial(
  raw: CrmTestimonial & { id?: string; event?: unknown; quote?: unknown; location?: unknown; initials?: unknown }
): LandingTestimonial | null {
  // Accept both CRM-flat shape and already-transformed landing shape on pull.
  const author = asString(raw.author).trim();
  if (!author) return null;
  const quote =
    raw.quote && typeof raw.quote === "object"
      ? asBilingual(raw.quote)
      : {
          en: asString(raw.quoteEn).trim(),
          ta: asString(raw.quoteTa).trim() || asString(raw.quoteEn).trim(),
        };
  if (!quote.en) return null;
  const event =
    raw.event && typeof raw.event === "object"
      ? asBilingual(raw.event)
      : {
          en: asString(raw.event).trim(),
          ta: asString((raw as CrmTestimonial).eventTa).trim() || asString(raw.event).trim(),
        };
  const location =
    asString((raw as { location?: unknown }).location).trim() ||
    asString(raw.place).trim();
  const rating = Math.min(
    5,
    Math.max(1, Math.round(typeof raw.rating === "number" ? raw.rating : 5))
  );
  return {
    id: asString(raw.id) || newId(),
    author,
    event,
    location,
    initials:
      asString((raw as { initials?: unknown }).initials).trim() || initialsOf(author),
    rating,
    quote,
    source: raw.source === "google" ? "google" : "manual",
    profileUrl: asString(raw.profileUrl),
    authorPhotoUrl: asString(raw.authorPhotoUrl),
    googleReviewId: asString(raw.googleReviewId),
  };
}

/** Map the CRM doc to the landing contract. Drops nameless menus. */
export function buildLandingPayload(doc: CrmDoc): LandingDoc {
  const menus = (doc.menus ?? [])
    .map((m) => buildLandingMenu(m))
    .filter((m): m is LandingMenu => m !== null);
  return {
    business: buildLandingBusiness(doc.business),
    menus,
    gallery: buildLandingGallery(doc.gallery ?? []),
    testimonials: (doc.testimonials ?? [])
      .map((t) => buildLandingTestimonial(t as CrmTestimonial & Record<string, unknown>))
      .filter((t): t is LandingTestimonial => t !== null),
  };
}

export type LandingValidation = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

/** Validate the landing payload before writing. JSON must round-trip. */
export function validateLandingPayload(doc: LandingDoc): LandingValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  try {
    JSON.parse(JSON.stringify(doc));
  } catch {
    errors.push("Payload does not serialize to JSON.");
    return { ok: false, errors, warnings };
  }
  if (!doc.business) errors.push("Missing business.");
  if (!Array.isArray(doc.menus)) errors.push("Missing menus[].");
  if (!Array.isArray(doc.gallery)) errors.push("Missing gallery[].");
  if (!Array.isArray(doc.testimonials)) errors.push("Missing testimonials[].");

  if (Array.isArray(doc.menus)) {
    if (doc.menus.length === 0) {
      warnings.push("Zero valid menus — the site falls back to its built-in menus.");
    }
    doc.menus.forEach((m, i) => {
      if (!m.nameEn?.trim()) errors.push(`menus[${i}] missing name.`);
      if (!m.nameTa?.trim()) warnings.push(`menus[${i}] missing Tamil name (falls back to English).`);
      if (!m.descTa?.trim()) warnings.push(`menus[${i}] missing Tamil description.`);
      if (!m.photoUrl?.startsWith("/images/"))
        errors.push(`menus[${i}] image must be a /images/ path.`);
    });
  }
  if (doc.business) {
    if (!/^\d+$/.test(doc.business.whatsapp ?? "") && doc.business.whatsapp !== "") {
      errors.push("business.whatsapp must be digits only.");
    }
    for (const p of doc.business.serviceZones ?? []) {
      if (!p?.trim()) warnings.push("Empty service zone entry.");
    }
  }
  for (const t of doc.testimonials ?? []) {
    if (t.rating < 1 || t.rating > 5) errors.push(`Testimonial "${t.author}" rating out of range.`);
    if (!t.quote?.ta) warnings.push(`Testimonial "${t.author}" missing Tamil quote.`);
  }
  return { ok: errors.length === 0, errors, warnings };
}
