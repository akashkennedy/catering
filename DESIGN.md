# Design.md — Catering CRM Visual Direction

Status: **Approved — this is the shared design system for both the Catering CRM and the Mampalli Catering landing page.** Ready to build.

---

## Design Plan

### Color (Light Mode)
Grounded in South Indian catering (turmeric, banana leaf, kumkum) but kept restrained — minimal, not festive/loud.

| Token | Hex | Role |
|---|---|---|
| `--bg-paper` | `#F8F5EF` | Warm paper background |
| `--surface` | `#FFFFFF` | Card/widget surface, sits on top of bg-paper |
| `--ink` | `#2B2420` | Primary text (warm near-black, not pure black) |
| `--ink-muted` | `#6B5F52` | Secondary text, labels, timestamps |
| `--accent-turmeric` | `#C68A2E` | Primary accent — CTAs, active states, primary buttons, Golden Yellow |
| `--accent-leaf` | `#33513B` | Secondary accent — success, "paid"/"returned" states, Green |
| `--accent-kumkum` | `#8B2E2E` | Reserved ONLY for pending/alerts/overdue — never decorative |
| `--border` | `#E8E1D3` | Dividers, card borders |

### Color (Dark Mode)
Same hues, shifted for contrast — not a simple invert. Accents get slightly brighter/lighter so they still read clearly on a dark surface.

| Token | Hex | Role |
|---|---|---|
| `--bg-paper` | `#1C1A16` | Warm near-black background (not pure black) |
| `--surface` | `#26221C` | Card/widget surface, sits on top of bg-paper |
| `--ink` | `#F0EBE0` | Primary text (warm off-white) |
| `--ink-muted` | `#A79A87` | Secondary text, labels, timestamps |
| `--accent-turmeric` | `#D9A544` | Primary accent — brighter for dark-bg contrast |
| `--accent-leaf` | `#4C7A5A` | Secondary accent — brighter for dark-bg contrast |
| `--accent-kumkum` | `#C24949` | Alerts — brighter for dark-bg contrast |
| `--border` | `#3A352C` | Dividers, card borders |

**Rule:** Kumkum red is earned, not decorative — it only appears where something needs the user's attention (pending payment, overdue return, unbought ingredient, low stock). This is what makes a glance at the dashboard tell you what needs action. This rule applies identically in both modes.

### Typography
- **Catamaran** — one family for everything, English and Tamil both. Originally developed for Tamil Nadu government use, so it handles both scripts at matching weight/rhythm instead of pairing two mismatched fonts.
- Weights: 400 (body), 600 (subheadings/labels), 700 (headings/emphasis)
- Tamil and English text render at **equal visual weight** beside each other — never one styled as smaller/secondary. This was an explicit client requirement (§10.4 of SPEC.md).

### Layout — Desktop
Reference: sidebar-shell template (dashboard.webp) — adapted to this palette, not copied literally (drop its teal/coral gradient background, gold "Hot" pill styling, and generic card-shadow treatment).
- Left sidebar: nav items (Dashboard, Events, Templates, Ingredients, Employees, Rental, Finance, Settings), `--surface` background, active item gets `--accent-turmeric` background with `--ink` text (not the template's green — turmeric is this app's primary accent)
- Top bar: search field + language indicator (Tamil/English, always both visible per §10.4) — no user-avatar-and-bell cluster unless there's a real notifications feature to back it
- Main content: widget cards on `--surface`, separated by `--border` and spacing, not heavy shadows (per existing Principles below)
- Stat callouts (e.g. Total Earnings, pending amounts) use the reference template's card structure — label, big number, small delta/status pill — but the pill uses `--accent-leaf` for positive/paid and `--accent-kumkum` for pending/negative, never the template's arbitrary green/red

### Layout — Mobile
- **Bottom tab bar**, fixed, `--surface` background, `--border` top hairline
- **4 primary tabs:** Dashboard, Events, Rental, Calculator — chosen as the screens most used on-the-go at a venue. **More tab** (5th, always last) opens a sheet/list for everything else: Templates, Ingredients, Employees, Finance, Settings. *(Flag if you want different tabs in the primary 4 — easy to swap before implementation.)*
- Active tab: icon + label in `--accent-turmeric`; inactive: `--ink-muted`
- Dashboard widgets stack single-column, full-width, as already specified below
- Detailed forms (New/Edit Event) open as a **full-screen sheet** on mobile, not a centered modal (a centered modal at mobile width just becomes the full screen anyway — build it as a sheet from the start rather than a modal that happens to fill the screen)

### Layout — Forms (New Event / Edit Event)
Reference: two-column modal form template (the "Update Organization Details" screenshot) — adapted:
- Two-column field grid on desktop (label above input, per the reference), collapsing to single column on mobile
- Section headers (e.g. "Personal Information" / "Business Information" in the reference) map to this app's own sections — e.g. "Event Details" / "Customer Details" / "Pricing"
- Bottom action bar: secondary action (e.g. "Save as Draft") + primary action (e.g. "Save Event") — primary button uses `--accent-turmeric`, not the reference's black
- Dropdowns, date pickers, and text areas follow the reference's clean bordered-input style (thin `--border` outline, no heavy box-shadow)
- This same form treatment applies everywhere a detailed multi-field form exists (New Event, Edit Event, and by extension Templates/Ingredients master-data forms for consistency)

### Principles
1. Red is earned, not decorative — the single most important rule for this design
2. No template chrome — no ALL-CAPS eyebrow labels, no icon-in-a-circle above every widget title, no arrow-suffixed button text
3. Tamil and English at equal visual weight, always shown together (not a language toggle)
4. Spend boldness in one place (the turmeric accent) — everything else stays quiet and disciplined
5. Dark mode is not an afterthought — every component must be built against both token sets from the start, not patched in later

---

## Explicitly Avoided (AI-generated design tells)
- The generic warm-cream (`#F4F1EA`) + terracotta (`#D97757`) combo — picked a distinct palette instead
- SaaS-card kit: identical border-radius + soft shadow on every card, regardless of hierarchy
- ALL-CAPS tracked-out eyebrow labels above headings
- Center-aligned marketing-page layout for what is a functional CRM
- The reference template's teal/coral gradient background and mismatched accent colors — this app uses only the turmeric/leaf/kumkum system

---

## Open / To Revisit
- Confirm the 4 primary mobile tabs (Dashboard, Events, Rental, Calculator proposed above)
- Icon set styling (Lucide React is already chosen — confirm stroke width/style fits the palette)
- Exact spacing scale / type scale (px or rem values) — define during implementation, suggest a standard 4px base scale unless there's a reason not to
- Dark mode toggle placement (settings screen vs. quick-access in top bar/nav) — not yet decided
