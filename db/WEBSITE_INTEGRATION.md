# Website integration — mampallicatering.vercel.app reads Neon directly

The CRM publishes the whole site content doc to Neon (`site_content`, `id = 'default'`).
The website project reads the same table with its own connection string — no CRM
dependency at request time.

## 1. Database

Run `db/site-content.sql` once in the Neon SQL editor (shared database).

## 2. Website env vars (Vercel → website project → Settings)

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string (reads only; ideally a read-only role) |
| `PUBLISH_SECRET` | Long random string, shared with the CRM's `PUBLISH_SECRET` |

CRM side (Vercel → CRM project → Settings):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Same Neon pooled connection string (writes via `/api/site-content`) |
| `SITE_PUBLISH_URL` | `https://mampallicatering.vercel.app/api/publish` |
| `PUBLISH_SECRET` | Same value as the landing's `PUBLISH_SECRET` |

## 3. Website read layer (Next.js App Router)

```ts
// lib/site-content.ts
import { neon } from "@neondatabase/serverless";

export type WebsiteContent = {
  business: {
    phones: string[]; whatsapp: string; addressEn: string; addressTa: string;
    serviceZones?: string[];
  };
  menus: {
    id?: string; nameEn: string; nameTa: string; imageUrl: string;
    mainDishes: { en: string; ta: string }[];
    sideDishes: { en: string; ta: string }[];
    price: number; // per plate ₹, 0 hides the price
  }[];
  gallery: {
    id?: string; instagramUrl: string; altTitle: string; fallbackImage: string;
  }[];
  testimonials: {
    id?: string; rating: number; review: string; author: string; location: string;
  }[];
};

const FALLBACK: WebsiteContent = {
  business: { phones: [], whatsapp: "", addressEn: "", addressTa: "" },
  menus: [],
  gallery: [],
  testimonials: [],
};

export async function getWebsiteContent(): Promise<WebsiteContent> {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT data FROM site_content WHERE id = 'default'`;
    if (rows.length === 0) return FALLBACK;
    const data = (rows[0] as { data: WebsiteContent }).data;
    return { ...FALLBACK, ...data };
  } catch {
    return FALLBACK; // database unreachable → page still renders
  }
}
```

Fetch it in server components with a cache tag, e.g. `fetch` + `next: { tags: ["site-content"] }`
or call `getWebsiteContent()` inside a component rendered with `export const revalidate = 60`.

## 4. On-demand refresh endpoint (website project)

The CRM POSTs with NO body and a Bearer secret. Return `{ ok: true }`
with HTTP 200 on success; return 401 when the secret is wrong so the CRM
can surface "secret rejected".

```ts
// app/api/publish/route.ts
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${process.env.PUBLISH_SECRET}`) {
    return NextResponse.json({ error: "Forbidden." }, { status: 401 });
  }
  revalidateTag("site-content");
  return NextResponse.json({ ok: true });
}
```

Point the CRM's `SITE_PUBLISH_URL` at
`https://mampallicatering.vercel.app/api/publish`.

## 5. Field notes

- `menus[]`: render meal name (`nameTa || nameEn`), single `imageUrl`,
  **Main Dishes** list, **Side Dishes** list, and `price` per plate
  (hide the price when `0`). Dish lines are `{ en, ta }` — show `ta || en`
  when the visitor picks Tamil.
- Gallery items are **Instagram-only**: render `blockquote.instagram-media`
  with `data-instgrm-permalink={instagramUrl}` +
  `https://www.instagram.com/embed.js`. When the embed fails (or offline),
  render `fallbackImage` with `alt={altTitle}` + a "View on Instagram" link
  to `instagramUrl`. No categories — one grid, document order.
- Testimonials: show stars (`rating`), `review`, author, and location only.
  `review` is English — when the visitor picks Tamil, translate it
  landing-side (e.g. a small EN→TA map with English fallback).
- Tamil-first display: use `nameTa || nameEn` (same fallback rule as the CRM).
