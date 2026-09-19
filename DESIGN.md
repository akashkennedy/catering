# DESIGN.md — Catering CRM Design System (as built)

Status: **Living document — describes the design actually implemented in code.** It replaces all earlier visual direction (turmeric-primary, side-by-side bilingual, auto theme). If this file conflicts with SPEC.md §§1–11, this file wins on visual matters; SPEC.md §12 records the functional history.

---

## 1. Color

Single primary accent + single danger color. No decorative reds, no competing accents.

### Light mode

| Token | Hex | Role |
|---|---|---|
| `--bg-paper` | `#F8F5EF` | Warm paper app background |
| `--surface` | `#FFFFFF` | Cards, header, sidebar, sheets |
| `--ink` | `#2B2420` | Primary text (warm near-black) |
| `--ink-muted` | `#6B5F52` | Secondary text, labels, timestamps |
| `--accent-leaf` | `#97A54B` | **Primary accent** — active nav, primary buttons, positive pills, dark-mode toggle fill |
| `--accent-kumkum` | `#8B2E2E` | **Danger only** — delete confirms, delete icons, pending/negative pills, low-stock badges |
| `--border` | `#E8E1D3` | Card borders, dividers |
| `--pill-leaf-fg` | `#5A6B2A` | Text on leaf pills |
| `--pill-kumkum-fg` | `#6E2424` | Text on kumkum pills |

### Dark mode

Same roles, shifted for contrast on dark surfaces:

| Token | Hex |
|---|---|
| `--bg-paper` | `#1C1A16` |
| `--surface` | `#26221C` |
| `--ink` | `#F0EBE0` |
| `--ink-muted` | `#A79A87` |
| `--accent-leaf` | `#5B6F33` |
| `--accent-kumkum` | `#C24949` |
| `--border` | `#3A352C` |
| `--pill-leaf-fg` | `#8AAB5E` |
| `--pill-kumkum-fg` | `#E08080` |

**Rules:**
1. Kumkum is earned, not decorative — only where something needs attention (pending payment, overdue return, low stock, delete actions). Applies identically in both modes.
2. Primary buttons never carry a color prop — they inherit the theme default (`primaryColor: "leaf"`, `autoContrast: true` in `src/theme.ts`).
3. No other hues in app UI. (PDF export uses its own print palette; unrelated.)

## 2. Typography

- **Catamaran** for everything (Google Font, `latin` + `tamil` subsets, weights 400/600/700). One family covers both scripts.
- Stat values: 1.5rem / 700. Card labels: 0.75rem / 600 / muted. Nav items: 600.
- Tamil and English are never shown together — the UI is monolingual per the selected language (see §3).

## 3. Language display

- Strictly monolingual: Tamil setting → Tamil everywhere; English setting → English everywhere (labels, buttons, placeholders, headings). Missing Tamil falls back to English.
- Settings offers Tamil / English only. No "Both" mode.

## 4. Layout — Desktop shell

- **Header (60px, `--surface`):** "Catering" wordmark left → search bar centered (`sm`+) → search icon (mobile only) + notification bell right.
- **Sidebar (260px, `--surface`):** nav items — Dashboard, Events, Customer Follow-up, Templates, Inventory, Employees, Rental, Calculator, Finance. Active item: leaf background + ink text; hover: 12% leaf wash. Bottom section: full-width New Event button (filled leaf, opens the full event form), then Dark-mode toggle row, then Settings button (Settings lives here, not in the nav list).
- **Dark-mode toggle:** full nav-item row (moon icon + "Dark" label) with an animated sliding sun/moon pill at the right edge; the whole row is clickable (`role="switch"`).
- **Main:** `md` page padding; dashboard cards on `--surface` with `--border`, 10px radius, separated by spacing — no heavy shadows.

## 5. Layout — Mobile

- **Bottom tab bar** (fixed, `--surface`, border hairline, ≤639px): Dashboard, Events, center Plus (raised leaf FAB opening the full event form), Calculator + **More** (5th) opening a right-side drawer with Rental, Templates, Inventory, Employees, Follow-up, Finance, Settings. Active tab: leaf icon + label; inactive: muted.
- Dashboard widgets stack single-column, full-width.
- Detail forms open as full-screen sheets on mobile.
- Master lists render as tables on desktop, stacked cards on mobile.

## 6. Dashboard

- Exactly three widget cards (Upcoming Events, Total Earnings, Payment Status) stacked in a single full-width column on all screens. New events are created from the sidebar New Event button (desktop) or the center Plus button (mobile).
- Rhythm: 56px section gap, 40px vertical gap between stacked widget cards, 20px card padding, 24px header-to-content gap in the three main cards.
- Stat pattern: small muted label → big value → status pill (leaf = positive/paid, kumkum = pending/negative).

## 7. Forms & inputs

- Two-column field grid on desktop, single column on mobile; label-above-input; thin `--border` inputs, no heavy shadows.
- All money in INR (₹), no number-input spinners, Indian-mobile phone validation, standardized units (`gm / kg / litre / piece`).
- Bottom action bar: `default`-variant secondary + filled primary (leaf) actions; destructive confirms in kumkum.

## 8. Principles

1. One accent (leaf), one danger (kumkum) — everything else quiet.
2. Red is earned, not decorative.
3. Monolingual UI — the selected language owns the whole screen.
4. Boldness in one place; disciplined spacing everywhere else (4px-base scale, section gaps ≥ card gaps ≥ content gaps).
5. Dark mode is a first-class token set, not a patch — every component reads CSS vars, never hardcoded colors.
6. No template chrome — no ALL-CAPS eyebrows, no icon-in-circle headers, no arrow-suffixed buttons.
