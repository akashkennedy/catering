/**
 * Shared `site_content` (id='default') contract for
 * https://mampallicatering.vercel.app + the CRM site-manager.
 *
 * Flat shape (top-level keys NEVER renamed/deleted):
 *   business: { phones, whatsapp, addressEn, addressTa, serviceZones }
 *   menus: [{ nameEn/nameTa, imageUrl, mainDishes[{en,ta}], sideDishes[{en,ta}], price }]
 *   gallery: [{ instagramUrl, altTitle, fallbackImage }]
 *   testimonials: [{ rating, review (EN), author, location }]
 *
 * After every write the CRM MUST POST the landing publish hook
 * (`POST $SITE_PUBLISH_URL`, no body, header
 * `Authorization: Bearer $PUBLISH_SECRET`, expect HTTP 200 + { ok: true }).
 *
 * Server-only (no secrets here). The secret lives in Vercel env
 * (`PUBLISH_SECRET`, same value as the landing's `PUBLISH_SECRET`) and is
 * only used in the API route that calls the hook.
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
 * Returns null for hotlinked CDN URLs — callers fall back to DEFAULT_MENU_IMAGE.
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

// ---------------------------------------------------------------------------
// CRM shapes (what the manager edits and what is stored in Neon).
// ---------------------------------------------------------------------------

export type CrmDishLine = { en: string; ta: string };

export type CrmMenu = {
  id?: string;
  nameEn: string;
  nameTa: string;
  imageUrl: string;
  mainDishes: CrmDishLine[];
  sideDishes: CrmDishLine[];
  price: number;
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
  instagramUrl: string;
  altTitle: string;
  fallbackImage: string;
};

export type CrmTestimonial = {
  id?: string;
  rating: number;
  review: string;
  author: string;
  location: string;
};

export type CrmDoc = {
  business: CrmBusiness;
  menus: CrmMenu[];
  gallery: CrmGalleryItem[];
  testimonials: CrmTestimonial[];
};
