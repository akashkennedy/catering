import { db, DbNotConfiguredError } from "./db";

/**
 * Neon (Postgres) access for the shared website content doc.
 * Server-only: DATABASE_URL must never be exposed to the browser.
 * The website project reads the same table with its own connection string.
 */

export type SiteContentRow = {
  data: unknown;
  updatedAt: string;
};

export class SiteDbNotConfiguredError extends DbNotConfiguredError {
  constructor() {
    super();
    this.name = "SiteDbNotConfiguredError";
  }
}

export function siteDb() {
  return db();
}

export async function getSiteContentRow(): Promise<SiteContentRow | null> {
  const sql = siteDb();
  const rows = await sql`
    SELECT data, updated_at AS "updatedAt"
    FROM site_content
    WHERE id = 'default'
  `;
  if (rows.length === 0) return null;
  const row = rows[0] as { data: unknown; updatedAt: Date | string };
  return {
    data: row.data,
    updatedAt:
      row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

/** True when every gallery imageId has stored bytes. */
export async function galleryImageIdsExist(imageIds: string[]): Promise<string[]> {
  if (imageIds.length === 0) return [];
  const sql = siteDb();
  const rows = (await sql`
    SELECT id FROM site_gallery_images WHERE id = ANY(${imageIds})
  `) as { id: string }[];
  const found = new Set(rows.map((row) => row.id));
  return imageIds.filter((id) => !found.has(id));
}

/** Delete stored bytes no longer referenced by the published gallery. */
export async function deleteOrphanGalleryImages(keepIds: string[]): Promise<void> {
  const sql = siteDb();
  const rows = (await sql`
    SELECT data FROM site_content WHERE id = 'default'
  `) as { data: unknown }[];
  const referenced = new Set(keepIds);
  // Also keep ids referenced by the currently stored doc, so a failed
  // publish never orphans the live images.
  try {
    const data = rows[0]?.data as { gallery?: { imageId?: unknown }[] } | null;
    for (const item of data?.gallery ?? []) {
      if (typeof item?.imageId === "string" && item.imageId) referenced.add(item.imageId);
    }
  } catch {
    /* keep the incoming ids only */
  }
  const keep = [...referenced];
  if (keep.length === 0) {
    await sql`DELETE FROM site_gallery_images`;
  } else {
    await sql`DELETE FROM site_gallery_images WHERE id <> ALL(${keep})`;
  }
}

/** True when every menu imageId has stored bytes. */
export async function menuImageIdsExist(imageIds: string[]): Promise<string[]> {
  const ids = imageIds.filter(Boolean);
  if (ids.length === 0) return [];
  const sql = siteDb();
  const rows = (await sql`
    SELECT id FROM site_menu_images WHERE id = ANY(${ids})
  `) as { id: string }[];
  const found = new Set(rows.map((row) => row.id));
  return ids.filter((id) => !found.has(id));
}

/** Delete menu bytes no longer referenced by the published menus. */
export async function deleteOrphanMenuImages(keepIds: string[]): Promise<void> {
  const sql = siteDb();
  const rows = (await sql`
    SELECT data FROM site_content WHERE id = 'default'
  `) as { data: unknown }[];
  const referenced = new Set(keepIds.filter(Boolean));
  // Also keep ids referenced by the currently stored doc, so a failed
  // publish never orphans the live images.
  try {
    const data = rows[0]?.data as { menus?: { imageId?: unknown }[] } | null;
    for (const menu of data?.menus ?? []) {
      if (typeof menu?.imageId === "string" && menu.imageId) referenced.add(menu.imageId);
    }
  } catch {
    /* keep the incoming ids only */
  }
  const keep = [...referenced];
  if (keep.length === 0) {
    await sql`DELETE FROM site_menu_images`;
  } else {
    await sql`DELETE FROM site_menu_images WHERE id <> ALL(${keep})`;
  }
}

export async function publishSiteContentRow(data: unknown): Promise<string> {
  const sql = siteDb();
  const rows = await sql`
    INSERT INTO site_content (id, data, updated_at)
    VALUES ('default', ${JSON.stringify(data)}, NOW())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    RETURNING updated_at AS "updatedAt"
  `;
  const updatedAt = (rows[0] as { updatedAt: Date | string }).updatedAt;
  return updatedAt instanceof Date ? updatedAt.toISOString() : String(updatedAt);
}
