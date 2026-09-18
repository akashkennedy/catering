# Catering CRM — Project Specification

**Client:** Catering business (single admin/owner user)
**Purpose:** Track events, food templates, ingredients, employees, utensil rentals, and payment status. Mobile-responsive, works offline, exportable PDF reports.

---

## 1. Project Phasing

| Phase                   | Scope                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| **Phase 1 (this spec)** | Full frontend, all features, data persisted in `localStorage` via Zustand                            |
| **Phase 2 (later)**     | Swap localStorage for Supabase/Postgres backend — no UI changes expected, only the persistence layer |

Single admin user throughout — no roles, multi-user auth, or real-time sync required for Phase 1.

---

## 2. Tech Stack

| Layer             | Choice                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Framework         | Next.js 16.3 (App Router)                                                                  |
| Language          | TypeScript                                                                                 |
| UI Library        | React 19                                                                                   |
| Styling           | Tailwind CSS                                                                               |
| Component Kit     | Mantine                                                                                    |
| State Management  | Zustand (with `persist` middleware)                                                        |
| Storage (Phase 1) | localStorage (via Zustand persist)                                                         |
| Storage (Phase 2) | Supabase (Postgres)                                                                        |
| Forms             | React Hook Form + Zod                                                                      |
| Offline / PWA     | Serwist                                                                                    |
| Icons             | Lucide React                                                                               |
| PDF Generation    | Client-side PDF library (e.g. `@react-pdf/renderer` or `pdfmake`) with Tamil font embedded |
| Deployment        | Vercel                                                                                     |
| AI Coding Tools   | Cursor, Antigravity, Opencode                                                              |

**Note:** Confirm Serwist and Mantine both support Next.js 16 / React 19 before scaffolding — PWA tooling can lag a framework's major version by a few weeks.

---

## 3. Data Model (Zustand store slices)

All entities live in localStorage via Zustand persist. Each has a `master` list where relevant, plus per-event associations.

### 3.1 Event

```
Event {
  id
  name              // event/client name
  phone
  location
  headcount
  date
  templateId        // selected food template
  status             // planning / confirmed / done
  clientPaymentStatus  // paid / pending
  ingredientOverrides[]  // per-event edits to scaled ingredient qty/price
  employeeAssignments[]  // { employeeId or adHocEmployee, amountToPay, amountPaid }
  utensilAssignments[]   // { vendorId or adHocVendor, utensilId, qty, rentPrice, rentedFrom, rentedTo, returned }
  createdAt / updatedAt
}
```

### 3.2 FoodTemplate (master)

```
FoodTemplate {
  id
  name              // "Template 1", "Template 2", etc.
  dishes[]          // dish name
  ingredients[]     // { ingredientId, qtyPer100, unit }
}
```

- Ingredient quantities are always defined **per 100 people**; scaling formula: `qty = qtyPer100 * (event.headcount / 100)`

### 3.3 Ingredient (master)

```
Ingredient {
  id
  name              // English + Tamil name
  nameTamil
  unit              // kg, l, pcs, etc.
  globalPrice        // price per unit, editable in Global Settings
}
```

### 3.4 Employee (master)

```
Employee {
  id
  name
  phone
  defaultRate
}
```

- Ad-hoc employees can be added directly on an event without being saved to master (optional "save to master list" toggle).

### 3.5 Vendor (master)

```
Vendor {
  id
  name
  phone
}
```

### 3.6 Utensil (master)

```
Utensil {
  id
  name
  unitRentPrice    // reference price, editable per event
}
```

### 3.7 GlobalSettings

```
GlobalSettings {
  ingredientPrices{}   // overrides / source of truth for Ingredient.globalPrice
  defaultLanguage       // tamil / english
  defaultTemplateId (optional)
}
```

---

## 4. Feature Modules

### 4.1 Events

- List view: all events, searchable/filterable by name, date, status
- Create/edit event: Name, Phone, Location, Headcount, Date, Template selection
- Detail view with three tabs: **Ingredients** | **Employees** | **Utensils**
- Client payment status toggle (paid / pending), visible on list and detail view

### 4.2 Food Templates (master data screen)

- Create/edit/delete templates
- Each template: name + list of dishes + ingredient list with qty-per-100
- One template per event (not combinable)

### 4.3 Ingredients

- Global master list screen: name (English + Tamil), unit, global price
- On event: selecting a template auto-generates the scaled ingredient list (qty × headcount/100, price = qty × globalPrice)
- Scaled quantities and prices are **editable per event** without affecting the template or global master data
- Ingredients tab shows: name, quantity, unit, unit price, subtotal, and a running total

### 4.4 Employees

- Master list screen: name, phone, default rate
- On event: assign from master list, or add one-off employees (with option to save to master)
- Per-event employee row: amount to be paid, amount paid, pending (computed = toPay − paid)
- Aggregate "employees paid in full" status per event, used in PDF export

### 4.5 Utensils

- Master vendor list screen: name, phone
- Master utensil list screen: name, reference rent price
- On event: assign vendor (from master or one-off), select utensils + quantity, set rental price, rental duration (from/to date), and a returned status per item (or per rental group)
- Per-event utensils tab shows all rentals with total cost and outstanding-returns indicator

### 4.6 PDF Export

- Triggered from event detail view
- Language toggle: Tamil / English (uses `Ingredient.nameTamil` when Tamil selected)
- Contents:
  - Event header (name, phone, location, headcount, date)
  - Full ingredient list with quantities and prices
  - Client payment status (paid in full / pending)
  - Employee payment status summary (all paid / who's pending, from employee tab)
- Generated client-side; must render Tamil script correctly (embed a Tamil-supporting font in the PDF library config)

### 4.7 Global Settings

- Edit global ingredient prices (propagates to all future scaling; does not retroactively change already-created events' overridden values)
- Set default language for PDF export
- Optionally set a default food template

---

## 5. Navigation / Screen Structure

```
/                     → Dashboard (event list)
/events/new           → Create event
/events/[id]          → Event detail (tabs: Ingredients | Employees | Utensils)
/events/[id]/edit     → Edit event
/templates            → Food template master list
/templates/[id]       → Create/edit template
/ingredients          → Ingredient master list
/employees            → Employee master list
/vendors              → Vendor master list
/utensils             → Utensil master list
/settings             → Global settings (prices, defaults)
```

Mobile-first: tab navigation on event detail collapses to a bottom or scrollable tab bar on small screens; all master-list tables convert to stacked cards below ~640px.

---

## 6. Core User Flow

1. Admin creates a new event (name, phone, location, headcount, date)
2. Admin selects a food template → ingredient list auto-generates scaled to headcount
3. Admin optionally edits scaled quantities/prices for this specific event
4. Admin assigns employees (from master or ad-hoc) and sets amount to pay per person
5. Admin assigns utensils/vendors, sets rental price and duration
6. As event progresses, admin marks client payment status and employee payments as they occur, and marks utensils as returned
7. Admin exports a PDF (language of choice) to hand to the person conducting the function

---

## 7. Non-Functional Requirements

- **Mobile responsive:** usable end-to-end on a phone; primary usage assumed to be mobile at venues
- **Offline-capable (PWA):** app shell installable and loadable with no connectivity; data already lives in localStorage so records remain accessible offline
- **Performance:** fast navigation between events/screens (Next.js 16.3 Instant Navigations); avoid unnecessary re-renders on large master lists
- **Data integrity:** editing global prices or master templates must not silently alter already-created events' saved/overridden values

---

## 8. Out of Scope for Phase 1 (Phase 2 candidates)

- Supabase/Postgres backend migration
- Multi-user login, roles, permissions
- Real-time sync across devices
- Cross-event reporting (e.g. "all pending payments this month" dashboard) — currently per-event only
- Notifications/reminders (e.g. upcoming event, pending payment alerts)

---

## 9. Open Decisions (to revisit)

- Exact PDF library choice (must support Tamil font embedding well — test early)
- Whether "returned" status on utensils is tracked per-item or per rental group
- Whether ad-hoc employees/vendors get a "save to master" prompt automatically or only on request

---

## 10. V2 Addendum (post-client-feedback, supersedes relevant V1 sections)

These changes were requested after V1 was reviewed. Where they conflict with earlier sections, this addendum wins.

### 10.1 Currency & Formatting

- All monetary values (ingredient prices, employee payments, rental costs, totals) must be validated and formatted as INR (₹) throughout — inputs, tables, and PDF export.
- Number inputs (quantity, price, headcount, etc.) must not show browser default increment/decrement spinner arrows.
- Phone number fields (event, employee, ad-hoc entries) need validation and consistent formatting (Indian mobile number format).
- Measurement units (Gm / Litre / Piece / Kg) need standardized, consistent formatting/labels across ingredient master data, templates, and event ingredient tabs.

### 10.2 Event Date Validation

- Event date picker must not allow selecting a date before today (and handle related edge cases — e.g. editing an existing past-dated event shouldn't force-block saving other fields).

### 10.3 Vendor → Rental restructure (data model change)

- **Remove** the global Vendor master list (§3.5, §4.5 master vendor list) entirely — no separate `/vendors` screen or `Vendor` entity.
- The **Utensils** tab/section is renamed to **Rental**.
- Each rental entry stores vendor as a **free-text field with autosuggest** drawn from previously-typed vendor names (no master list, no separate CRUD) — implemented as a simple "recent values" list per field, not a formal entity.
- Utensil items themselves keep their existing master list (§3.6) — only the _vendor_ concept changes.

### 10.4 Full multilingual UI (Tamil beside English)

- Previously Tamil was scoped only to ingredient names and PDF export. This expands to **all UI labels, navigation, buttons, and headings app-wide** — Tamil displayed alongside English (not a language toggle/switch — both shown together).
- This is a larger, cross-cutting change touching every screen; implement incrementally (e.g. shared nav/layout first, then screen by screen) rather than as one commit.

### 10.5 Ingredient Tamil name auto-fill

- When adding a new ingredient, auto-fill its Tamil name from a **small built-in offline dictionary** of common Indian/Tamil/Kerala catering ingredients (no translation API call — must work offline).
- Dictionary should be a simple local lookup (e.g. a static English→Tamil map) that's easy to extend later; unmatched ingredients fall back to manual entry.

### 10.6 Deferred (not in this round)

- Overall UI color palette / visual polish — explicitly parked for a later pass.

---

## 11. Dashboard / Main Section (new, post-V2)

This is the app's home screen (`/`), replacing the plain event list with a proper dashboard.

### 11.1 Data model additions required

```
Event {
  ...existing fields...
  totalQuoted        // NEW: amount charged to the customer for this event
}

EventIngredientRow {
  ...existing fields...
  purchased           // NEW: bool, has this ingredient been bought yet
}

Reminder {              // NEW entity
  id
  customerName (optional)
  phone
  note (optional)
  remindAt            // datetime
  eventId (optional)  // can be linked to an event or standalone
  dismissed            // bool
}
```

Event "earnings/profit" = `totalQuoted − (sum of ingredient costs + employee payments + rental costs)` for that event.

### 11.2 Dashboard Widgets

- **Upcoming Events** — next N events sorted by date, quick-tap into detail
- **Customer Follow-up** — list of active (non-dismissed) reminders, with a quick "add reminder" action (phone number + note + remind-in dropdown: 30 min / 1 hr / custom)
- **Inventory Alerts** — ingredients across upcoming events where `purchased = false`, aggregated by ingredient so duplicates across events are summed
- **Total Earnings** — sum of `totalQuoted − costs` across events (filterable by this month / all time, at minimum)
- **Payment Status Overview** — pending client payments + pending employee payments across all events
- **Utensils Not Yet Returned** — rentals still outstanding across events
- **Quick Add** — shortcut buttons for New Event / New Ingredient

### 11.3 Pricing Calculator (standalone tool, not tied to a saved event)

- Inputs: select a food template, enter headcount, optional markup %
- Output: raw ingredient cost (using existing scaling logic from §4.3/§10.1) + suggested quote price with markup applied
- Does not save anything by default — a "Convert to Event" action can optionally create a real event pre-filled with these values

### 11.4 Reminders — technical note

- Phase 1 uses the browser Notification API — fires only while the browser is open (background tab is fine, fully closed browser is not).
- True push notifications (survive closed browser) require a backend and are Phase 2 scope.

### 11.5 Deferred

- Notification reliability/polish and further dashboard UI styling — parked for later, same as §10.6.

---

## 12. V3 Addendum — implemented state (what is actually built)

This section records what has been implemented on top of §§1–11 so a new agent (or the client) sees the real current state. Where it conflicts with earlier sections, this addendum wins. **Phase 2 (Supabase/Postgres swap, §1 + §8) is unchanged and still pending.**

### 12.1 UI language: monolingual selection (supersedes §10.4)

- The side-by-side bilingual display ("English · தமிழ்") is **removed**. The whole UI is monolingual, driven by a UI-language setting (`en | ta`, default `en`, persisted as `catering-settings` in localStorage).
- Tamil selected → Tamil everywhere (labels, buttons, placeholders, headings); English selected → English everywhere. Missing Tamil falls back to English, never blank.
- All input placeholders and `Select` option labels go through `preferredText(label, uiLanguage)` (`src/lib/i18n.ts`); every component rendering one subscribes to the settings store so it re-renders on language switch. The old `labelText()` bilingual joiner is deleted.
- Settings → language card offers only Tamil / English (the old "Both" mode is gone; stored `"both"` values migrate to `"en"`). A separate document-language setting (`en | ta`) still controls PDF export only.

### 12.2 Header layout

- App header (60px): **"Catering" title pinned left** (all breakpoints), **search bar centered** on desktop (`sm`+), search-icon + notification bell right. On mobile the search becomes a full-screen overlay (`MobileSearchOverlay`).

### 12.3 Color system (resolves the deferred palette, §10.6)

- Accent is **leaf green** (`#97A54B` light / `#5B6F33` dark, Mantine `primaryColor: "leaf"`). All primary buttons use the theme default — no per-button color props.
- Destructive actions (delete confirms, delete icons, low-stock badges) are uniformly **kumkum dark-red** (`#8B2E2E` / `#C24949`). The old turmeric palette and Mantine `red` are fully removed from UI code.
- Sidebar/nav active states, mobile bottom-nav active states, count pills, and reminder notification dots all use leaf.

### 12.4 Dashboard: decluttered (supersedes §11.2 widget list)

- `/` shows exactly three widgets stacked in a single full-width column on all screens: **Upcoming Events** (next 3 open events), **Total Earnings**, **Payment Status Overview**. Generous spacing (56px stack gap, 40px vertical gap between widget cards, 24px in-card gaps). New events are created from the sidebar **New Event** button (desktop, above the Dark-mode toggle) or the center **Plus** button in the mobile bottom bar — both open the full event form; there is no quick-add button on the dashboard (the old `QuickAddEventModal` is deleted, see §13.10).
- Relocated widgets: **Utensils Not Yet Returned** now renders at the top of the **Utensils page**; **Inventory Alerts** at the top of the **Inventory page**. The old `QuickAddWidget` card is deleted.
- **Total Earnings formula (corrects §11.1/§11.2):** cash-collected basis, identical to the Finance page — a `paid` event contributes its full `totalAmount`, otherwise only `advancePaid`. Shared helper `eventCollected()` in `src/lib/financeReport.ts`. Month filter = current `YYYY-MM` date prefix; All-time = no filter. (The old `totalQuoted − costs` formula is **not** used; there is no `totalQuoted` field — the event amount fields are `ratePerPerson`, `totalAmount`, `totalAmountOverridden`, `advancePaid`.)

### 12.5 Ingredients → Inventory rename (full, not labels-only)

- Route is now **`/inventory`** (old `/ingredients` route deleted). All hrefs (sidebar, mobile More sheet, global search, notification links) point to `/inventory`.
- Display name is **Inventory / சரக்கிருப்பு** everywhere (nav, page title, search labels, settings copy). Internal code names (`useIngredientsStore`, `Ingredient*` components, `Ingredient` type) intentionally unchanged.

### 12.6 Customer Follow-up is a full page

- New route **`/follow-ups`** rendering the reminders widget (phone + note + remind-in 30min/1hr/custom, active list sorted by time, dismiss action, browser-Notification permission prompt).
- Reachable from the desktop sidebar (after Events, `PhoneCall` icon) and the mobile More sheet. Reminder entity matches §11.1 (`customerName` nullable, `notified` flag included).

### 12.7 Theme system (no Auto)

- Theme mode is **`light | dark` only** (persisted `catering-theme`; stored `"auto"` migrates to `"light"`). No OS-follows-device behavior; bootstrap/sync scripts are light/dark only.
- Sidebar bottom = animated **Dark-mode toggle row** styled exactly like a nav item (moon icon + label + sliding sun/moon pill, whole row clickable, `role="switch"`), followed by the **Settings** nav button (moved out of the nav list).
- Settings page has **no theme section** (removed entirely); it keeps language, document-language, and ingredient-price cards.

### 12.8 Actual navigation map (supersedes §5)

```
/                     → Dashboard (3 widgets + Quick Event button)
/events               → Event list (search, date filter, status filter, delete confirm)
/events/[id]          → Event detail (ingredients / employees / utensils sections, PDF export)
/templates            → Food template master list
/inventory            → Inventory page (low-stock alerts widget + ingredient master list)
/employees            → Employee master list
/utensils             → Utensils page (not-returned widget + utensil master list)
/calculator           → Pricing calculator (template + headcount → cost/quote, Convert to Event)
/finance              → Income & Expense (summary cards, category pills, expense + other-income lists)
/follow-ups           → Customer follow-up reminders
/settings             → Language, document language, ingredient prices (no theme control)
/dev-seed             → Demo-data generator for client onboarding (load/clear sample data)
```

- No `/vendors` screen (per §10.3, vendor is a free-text + autosuggest field on rental lines; recent values suggested, no master entity).
- No `/events/new` or `/events/[id]/edit` routes — create/edit happens in modals (`EventFormModal`, `QuickAddEventModal`).
- Event status pipeline (actual): `enquiry → confirmed → preparing → completed → paid`.
- Expense categories (actual): `food materials | other expenses | electricity | transport | gas | custom`. Staff salary is deliberately **not** an expense category (labour is tracked per-event via employee toPay/paid).
- Ingredient units (actual): `gm | kg | litre | piece` (`src/lib/units.ts`).
- Mobile nav: bottom bar (Dashboard, Events, Rental, Calculator + More drawer holding Templates, Inventory, Employees, Follow-up, Finance, Settings).

### 12.9 Demo-data route

- `/dev-seed` loads representative sample data (events across statuses, inventory incl. low-stock items, employees, utensils, template, expenses, other income, reminder) via the stores' own add-actions, and can wipe everything again. Committed deliberately so the client can self-onboard; safe to delete later without affecting the app.

---

## 13. V4 Addendum — implemented state since §12 (what changed after the V3 addendum)

This section records only what was built **after** §12 was written. §§1–12 stay as-is. Where §13 conflicts with §12 on UI details, §13 wins. **Phase 2 (Supabase/Postgres swap, §1 + §8) is unchanged and still pending — nothing in §13 alters the Phase 2 plan.**

### 13.1 Responsive modal sheets (`useMobileSheet`, supersedes §12 mobile-modal notes)

- New shared hook `src/hooks/useMobileSheet.ts` with two variants, applied to **all** form modals (event, quick-add event, employee, event-employee, event-utensil, ingredient, purchase, template, expense, other-income, utensil, rent-in, assign-to-event):
  - `"full"` — large forms (event, template): edge-to-edge full-screen sheet on phones (`≤639px`), centered desktop modal with preserved desktop size (`lg` / `xl`).
  - `"sheet"` — small forms (everything else): bottom sheet on phones (slide-up 250ms, 16px top radius, `max-height: 92dvh`, 8px side/bottom gutters, `overflow-x: clip`), centered desktop modal.
- Supporting CSS in `src/app/globals.css`: `.mobile-sheet` content/body rules, 16px body padding + `safe-area-inset-bottom` inside sheets, touch momentum scroll (`-webkit-overflow-scrolling: touch`, `overscroll-behavior: contain`), `max-width: 100%` guards on inputs/selects/textareas inside modals.

### 13.2 Mobile "More" navigation is a right-side drawer (corrects §12/DESIGN mobile notes)

- `MobileBottomNav` bottom bar is unchanged (Dashboard, Events, Rental, Calculator + More, leaf active state).
- The **More** panel changed from a bottom sheet to a **right-side `Drawer` (`size={300}`)**, with `mobile-more-drawer` class handling full `100dvh` height plus top/bottom safe-area padding, and a bordered header. Panel title and More-button `aria-label` are localized (`ui.nav.more` = More / மேலும்).
- More-sheet contents unchanged: Templates, Inventory, Employees, Follow-up, Finance, Settings (active-route highlighted, closes on navigate).

### 13.3 Theme control placement (extends §12.7)

- Desktop sidebar keeps the animated Dark-mode toggle row + Settings nav button, but the toggle is now wrapped in `visibleFrom="sm"` so it only renders on desktop.
- Mobile gets its own Dark-mode card at the top of **Settings** (`hiddenFrom="sm"`, `dash-card` styled, label via `ui.settings.dark`), rendering the same `ThemeControl`. No behavior change — still `light | dark` only, persisted `catering-theme`.

### 13.4 Notification center behavior (extends §12.8 header bell)

- Bell (`NotificationCenter`) aggregates, newest-first: active reminders → pending client/employee payments (skips `paid` events) → unreturned event utensils (skips `completed`/`paid` events, keyed by stable `line.id`) → low ingredient stock → low vessel stock. Kumkum dot + count badge; empty state = "All clear."
- Reminder rows deep-link to **`/follow-ups`** (not `/`); per-row dismiss is session-hide for data items vs persistent `dismissReminder` for reminder items.
- "Clear reminders" button (old "Clear all") renders **only when reminders exist** and calls the persistent `dismissAllReminders()` store action (dismisses all non-dismissed reminders at once) — data/low-stock items are unaffected.
- Header search icon + bell are now `ActionIcon` buttons with localized `aria-label`s instead of plain clickable boxes.

### 13.5 Global search + mobile search overlay (extends §12.2 header)

- Desktop (`sm`+): centered `ShellSearch` combobox searching events, templates, ingredients (English + Tamil name), employees, utensils (max 6 per type), navigating to the owning page on select; localized placeholder / type labels / empty state.
- Mobile: search-icon opens a full-screen `MobileSearchOverlay` (`role="dialog"`, `aria-modal`, localized `aria-label`, Escape-to-close) with the same result sources.

### 13.6 Viewport / zoom accessibility

- `src/app/layout.tsx` viewport no longer pins `maximumScale: 1 / userScalable: false` — pinch-zoom is allowed. Only `width=device-width, initial-scale=1, viewport-fit=cover` remain, plus the existing dynamic `theme-color` status-bar handling.

### 13.7 i18n additions (extends §12.1)

- New `ui.nav.more` key (More / மேலும்) used by the bottom nav + More drawer title.
- Reminder widget `Select` options (30 min / 1 hr / custom) and per-row dismiss `aria-label`s now go through `preferredText(..., uiLanguage)` instead of hardcoded English.

### 13.8 Form / layout hardening (mobile + safe-area)

- `.form-actions` bar is now sticky-bottom with `flex-wrap: wrap` and `safe-area-inset-bottom` padding so Save/Cancel stay reachable on phones with gesture bars.
- `.form-two-col` grid/columns and children got `min-width: 0; max-width: 100%` guards so long Tamil strings / wide inputs cannot push horizontal overflow on narrow screens.
- AppShell mobile rules: header respects `safe-area-inset-top`; main content reserves `64px + safe-area-inset-bottom` so the bottom nav never covers actions.

### 13.9 Dev-seed safety + seed fixes, prod dep

- `/dev-seed` "Clear all data" now requires a **confirm modal** ("Are you sure? This cannot be undone." + Cancel / kumkum confirm); clearing also removes `stock-ledger` entries per ingredient and `vessel-stock-ledger` entries per utensil so no orphan ledger rows survive a wipe.
- Seed template lookup uses the **last** template in the store (not index 0), so the seeded events reliably link to the just-created "Wedding lunch" template even when seed is run on a non-empty store.
- `sharp` added to production dependencies (required by Next.js image optimization in prod builds; was missing and flagged in review).

### 13.10 Event creation entry points (supersedes the dashboard Quick Event button in §12.4)

- Desktop sidebar has a full-width **New Event** button directly **above** the Dark-mode toggle row (below the nav list, above theme + Settings). It opens the full event form (`EventFormModal` in create mode, `event={null}`) — the same form used on `/events`. State lives in `AppLayout` (`newEventOpened`).
- Dashboard (`/`) no longer has a top quick-add button — it is just the three stacked widgets. `QuickAddEventModal` is deleted.
- Mobile bottom bar is now Dashboard, Events, **center Plus FAB** (raised 52px leaf circle, localized `aria-label`, opens the same full event form via `MobileBottomNav onAddEvent`), Calculator, More. **Rental moved into the More drawer** (now: Rental, Templates, Inventory, Employees, Follow-up, Finance, Settings). Desktop sidebar keeps Rental in the main nav list.

### 13.11 PWA manifest link fix (APK showed Chrome URL bar)

- Root cause: `src/app/manifest.ts` is served by Next.js at **`/manifest.webmanifest`**, but `layout.tsx` linked **`/manifest.json`** (404) — so browsers/APK wrappers found no manifest and fell back to a regular Chrome tab with the URL bar. Fixed the link to `/manifest.webmanifest` (verified 200 + `display: standalone` + correct `<link rel="manifest">` on `/`).
- Hardened `manifest.ts`: added `id` + `scope` (`/`), and the 192px icon now has a `purpose: "any"` entry alongside `maskable` (Chrome installability requires an `any` icon ≥144px).
- Note for APK rebuilds via PWABuilder/Bubblewrap (TWA): after redeploying, if the URL bar still appears inside the APK, the remaining step is outside this repo — publish `/.well-known/assetlinks.json` with the signing cert's SHA-256 fingerprint so Chrome trusts the APK as the site owner.
