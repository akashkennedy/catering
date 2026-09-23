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
  business: { phones: string[]; whatsapp: string; addressEn: string; addressTa: string };
  menus: {
    id: string; nameEn: string; nameTa: string; tagEn: string; tagTa: string;
    descEn: string; descTa: string; price: number; photoUrl: string;
    templateId: string | null;
    courses: { id: string; nameEn: string; nameTa: string; items: { en: string; ta: string }[] }[];
  }[];
  gallery: {
    id: string; kind: "photo" | "instagram"; url: string;
    captionEn: string; captionTa: string; category: string;
  }[];
  testimonials: {
    id: string; quoteEn: string; quoteTa: string; author: string; event: string;
    place: string; rating: number; source: "manual" | "google"; profileUrl: string;
    authorPhotoUrl: string; googleReviewId: string;
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

- `menus[].templateId` refers to CRM template ids — informational only for the website.
- Instagram gallery items: render `blockquote.instagram-media` with
  `data-instgrm-permalink={url}` + `https://www.instagram.com/embed.js`.
- Google testimonials: show author + stars + "via Google" badge + `profileUrl` link
  (required style once Places API sync lands; same fields already carry it).
- Tamil-first display: use `nameTa || nameEn` (same fallback rule as the CRM).
