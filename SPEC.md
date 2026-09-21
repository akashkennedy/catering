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
- Relocated widgets: **Utensils Not Yet Returned** now renders at the top of the **Utensils page**; **Inventory Alerts** at the top of the **Ingredients page**. The old `QuickAddWidget` card is deleted.
- **Total Earnings formula (corrects §11.1/§11.2):** cash-collected basis, identical to the Finance page — a `paid` event contributes its full `totalAmount`, otherwise only `advancePaid`. Shared helper `eventCollected()` in `src/lib/financeReport.ts`. Month filter = current `YYYY-MM` date prefix; All-time = no filter. (The old `totalQuoted − costs` formula is **not** used; there is no `totalQuoted` field — the event amount fields are `ratePerPerson`, `totalAmount`, `totalAmountOverridden`, `advancePaid`.)

### 12.5 Ingredients page (rename reverted — route stays `/ingredients`)

- The planned Ingredients → Inventory rename was **reverted**: route stays **`/ingredients`**. All hrefs (sidebar, mobile More sheet, global search, notification links) point to `/ingredients`.
- Display name stays **Ingredients / பொருட்கள்** everywhere (nav, page title, search labels, settings copy). Internal code names (`useIngredientsStore`, `Ingredient*` components, `Ingredient` type) unchanged.

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
/ingredients           → Ingredients page (ingredient master list)
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
- Mobile nav: bottom bar (Dashboard, Events, Rental, Calculator + More drawer holding Templates, Ingredients, Employees, Follow-up, Finance, Settings).

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
- More-sheet contents unchanged: Templates, Ingredients, Employees, Follow-up, Finance, Settings (active-route highlighted, closes on navigate).

### 13.3 Theme control placement (extends §12.7)

- ~~Desktop sidebar keeps the animated Dark-mode toggle row + Settings nav button, but the toggle is now wrapped in `visibleFrom="sm"` so it only renders on desktop.~~
- ~~Mobile gets its own Dark-mode card at the top of **Settings** (`hiddenFrom="sm"`, `dash-card` styled, label via `ui.settings.dark`), rendering the same `ThemeControl`.~~
- **Superseded: the Dark-mode toggle now lives only in Settings** (top `dash-card` on all breakpoints, same `ThemeControl`); the sidebar has no theme row. No behavior change — still `light | dark` only, persisted `catering-theme`.

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
- Mobile bottom bar is now Dashboard, Events, **center Plus FAB** (raised 52px leaf circle, localized `aria-label`, opens the same full event form via `MobileBottomNav onAddEvent`), Calculator, More. **Rental moved into the More drawer** (now: Rental, Templates, Ingredients, Employees, Follow-up, Finance, Settings). Desktop sidebar keeps Rental in the main nav list.

### 13.11 PWA manifest link fix (APK showed Chrome URL bar)

- Root cause: `src/app/manifest.ts` is served by Next.js at **`/manifest.webmanifest`**, but `layout.tsx` linked **`/manifest.json`** (404) — so browsers/APK wrappers found no manifest and fell back to a regular Chrome tab with the URL bar. Fixed the link to `/manifest.webmanifest` (verified 200 + `display: standalone` + correct `<link rel="manifest">` on `/`).
- Hardened `manifest.ts`: added `id` + `scope` (`/`), and the 192px icon now has a `purpose: "any"` entry alongside `maskable` (Chrome installability requires an `any` icon ≥144px).
- Note for APK rebuilds via PWABuilder/Bubblewrap (TWA): after redeploying, if the URL bar still appears inside the APK, the remaining step is outside this repo — publish `/.well-known/assetlinks.json` with the signing cert's SHA-256 fingerprint so Chrome trusts the APK as the site owner.

### 13.12 Status-bar overlap fix + loading states (offline queue still deferred)

- **Status bar (AppsGeyser APK):** the WebView reports `safe-area-inset-top: 0`, so the old `padding-top: env(...)` rule did nothing and the 60px header slid under the phone status bar. Fix in `globals.css` (mobile only): `--apk-sat: env(safe-area-inset-top, 24px)` (24px Android status-bar fallback), header height/offset vars overridden to `calc(60px + var(--apk-sat))` so page content is pushed down too, and the search overlay + More drawer tops use the same var. Real-inset browsers (iOS PWA, Chrome) are unaffected — they still use the true inset value.
- **Loading states:** new shared `LoadingSkeletons.tsx` (`CardSkeleton`, `StackedCardsSkeleton`, `ListPageSkeleton`, text-free so no i18n/store deps) + per-route `loading.tsx` for `/`, `/events`, `/events/[id]`, `/ingredients`, `/utensils`, `/employees`, `/templates`, `/finance`, `/follow-ups`, `/calculator`, `/settings`. `ShellSearch` renders a `Skeleton` input until hydrated instead of `null`. All 12 RHF form modals wire `isSubmitting` to their submit `Button loading` (blocks double-submit today; lights up automatically when Phase 2 makes saves async).
- **Offline mutation queue → DB sync:** still deferred as agreed — planned design is the §13-outlined outbox (`catering-outbox`, UUID ops, `useOnlineStatus`, FIFO flush with backoff, last-write-wins), to be built with the Phase 2 backend. Phase 2 (§1 + §8) unchanged.

### 13.13 Mock auth gate (no real auth yet)

- `useAuthStore` (`src/store/auth.ts`, persisted `catering-auth`, session survives restarts until logout) with placeholder credentials `admin` / `admin` exported as `MOCK_USERNAME` / `MOCK_PASSWORD` — the swap point for real backend auth later.
- `AuthGate` in the root layout renders a `CardSkeleton` until hydrated, then the `LoginForm` when logged out, otherwise the normal shell (`AppLayout` + `ReminderNotifier`, so no notifications pre-login). Fully local, works offline in the APK.
- `LoginForm` follows the app's usual template: centered `dash-card` (max 400px, full-width on phones), RHF + Zod, Mantine `TextInput` + `PasswordInput` with `admin` placeholder hints, full-width leaf submit with `loading={isSubmitting}`, kumkum invalid-credentials error, bilingual labels via new `ui.auth` i18n keys (no language switcher on the form — follows the stored UI language).
- Logout: nav-styled button under Settings in the desktop sidebar + entry at the bottom of the mobile More drawer.

---

## 14. V5 Addendum — dual-language invoice PDFs (supersedes §4.6 PDF language toggle)

- **Two PDFs, both dual-language** (Tamil + English together, always Noto Sans Tamil): **Buy list** (name + qty, no prices) and **Detailed** (name + qty + price with totals). Filename suffixes `_buy-list` / `_detailed`; the old per-language export + `generateEventPdf` are removed.
- **Layout:** `# | பொருள் | Ingredient | Qty | Unit | [Price ₹]`; rows grouped under bilingual category headings (`INGREDIENT_TAGS` order, sorted by English name); unknown-tag/unknown-ingredient lines fall under Grocery, never dropped.
- **Pre-print step:** event detail's Invoice button opens `PrintPreviewModal` (full sheet) with category filter toggles (plain buttons in `ingredient-filter-chip` style — see §16 — tags present in the event, all-on), the existing editable qty/price line tables (edits save to the event via the normal store update), a live filtered subtotal, and the two download buttons. Detailed total = printed lines only; event total/advance/balance shown for context. No employees in either PDF (unchanged).
- Settings → document-language card is retained but no longer consumed by event PDFs.

---

## 15. V6 Addendum — Calculator removed, New Event button on top

- The **Pricing Calculator** (`/calculator`, `PricingCalculator.tsx`, §§11.3/12.8) is **deleted**: route, desktop sidebar entry, mobile bottom-bar tab, `ui.nav.calculator` + `ui.calculator` i18n keys, and the calculator→event prefill plumbing (`eventDraft.ts` store, `EventFormModal.createPrefill`, `EventsManager` draft wiring) are all gone.
- Desktop sidebar order is now: **New Event button pinned at the top**, then Dashboard, Events, Customer Follow-up, Templates, Ingredients, Employees, Rental, Finance. Mobile bottom bar is Dashboard, Events, center Plus FAB, More (Calculator tab removed).
- The Templates-page **Import old app** button is removed (legacy seed/import libs remain in-tree but unreachable from the UI).

---

## 16. V7 Addendum — legacy import, template list tidy, double-tick fix

- **Legacy import (one-time, from `mampally-new.vercel.app`):** `src/lib/legacySeed.ts` is a frozen copy of the old app's data — 2 meals (Saapadu 42 courses, Biriyani 40 courses) + 182 unique ingredients with Tamil names, units, categories and prices. `importLegacyData()` (`src/lib/legacyImport.ts`) adds missing ingredients (matched by lowercased English name; units via `normalizeUnit`, categories mapped `masala→masala-spices` / `meat→meat-fish`) then adds both meals as templates with all courses + `qtyPer100`; re-runs skip existing entries, never duplicating. The UI button existed on the Templates page and was later removed (§15); the libs stay for future re-imports. Most old courses import with zero ingredients (only 16 links exist in the old app) — ready to fill in the template editor.
- **Template list tidy:** mobile cards and desktop rows are **click-to-edit** (card has `role="button"` + Enter/Space support); the per-row pencil buttons are deleted, only the kumkum delete icon remains (`stopPropagation` so it never opens the editor). Course pills were replaced by a single dimmed comma-separated line (`Name (count), …`, capped at 5 dishes + bilingual `moreItems` remainder). Templates page also has search across template/dish names (`templateMatchesQuery`) with a no-match empty state.
- **Double-tick fix (old Android WebViews ignore `appearance: none`):** all Mantine `Checkbox` / `Chip` / `Switch` usages are gone app-wide (zero remaining). Replacements with no native `<input>` inside: shared `CheckRow` (button + `role="checkbox"` + single Lucide `Check`, leaf fill, theme-aware CSS in `globals.css`) used in the meal course pickers, calculator-era pickers (removed with §15), and both save-to-master toggles; shared `ToggleSwitch` (`role="switch"`) for the utensil returned toggles; plain-button `ingredient-filter-chip` toggles for print-preview categories.

---

## 17. V8 Addendum — public landing page + client manager (narrow scope)

- **Routes:** `/site` (public, no login/sidebar — `AuthGate` + `AppLayout` early-return via `isPublicSitePath`), `/site-manager` (CRM screen: desktop sidebar + mobile More drawer, `Globe` icon). 1:1 mirror of `mampallicatering.vercel.app` sections: header, hero, trust cards, stats, heritage, menus, standards, gallery, testimonials, contact (WhatsApp `wa.me` submit), footer.
- **Client-editable = exactly 4 editors:** Contact (phone numbers, WhatsApp digits, office address En+Ta), Menus (copy, course groups + `English | Tamil` per-line items, ₹ price with 0 hiding it, photo URL, optional live-template link auto-listing dish names), Gallery (photo link OR Instagram post + caption + fixed categories), Testimonials (quote En+Ta, author, event, place, 1–5 stars, `manual|google` source + profile URL, Google-ready `authorPhotoUrl`/`googleReviewId` fields). No visibility toggles, no restore — sections always render (empty lists return `null`). Everything else (hero, stats, about, standards, contact options/zones, footer) is hardcoded bilingual copy in `src/lib/siteCopy.ts` (dev-only).
- **Gallery Instagram embeds:** no API key needed — items store the post URL, public page renders `blockquote.instagram-media` + `embed.js` (`lazyOnload`, `instgrm.Embeds.process()` re-run on items/filter change). Offline or blocked script degrades to caption + "View on Instagram" link by construction. Posts must be public; manager validates the URL contains `instagram.com/`.
- **Store:** `siteContent.ts` (`catering-site`, v3 — v1 gallery items migrate to `kind: "photo"`, business gains address fields, v3 defaults local-only `lastPublishedAt`) seeded from the live site. Manager header has a **Live Preview** button opening `/site` in a new tab (the earlier inline preview rendering the public components was removed to keep the manager light).
- **Google reviews:** Phase 1 = manual paste with "via Google" badge (no API key, offline-safe, zero policy risk). `GOOGLE_MAPS_URL` in `siteCopy.ts` is empty — pasting the full Maps URL activates the "Review us on Google" button. Phase 2 = Places API auto-sync (max 5 reviews, server proxy since keys can't ship in-app, mandatory author attribution) into the existing Google-ready fields.
- **Photos** are URL strings (no uploads until Phase 2 storage buckets); seed URLs hotlink the live site temporarily. Visitor language is a local en/ta switch on the public page (visitors have no settings store).

---

## 18. V9 Addendum — Neon-backed website publishing (CRM edits the live site)

- **Goal:** the CRM site manager publishes straight to the live website project. Shared store: **Neon Postgres**, table `site_content` (`id TEXT PK`, `data JSONB`, `updated_at`, single row `id='default'`). Schema + access notes live in `db/site-content.sql`; website-side code in `db/WEBSITE_INTEGRATION.md`.
- **CRM side:** `src/lib/siteDb.ts` (server-only `@neondatabase/serverless` wrapper; missing `DATABASE_URL` → typed 503) + `src/app/api/site-content/route.ts` (`GET` pull / `POST` publish, both require the CRM login session cookie via `server-auth`, zod-validated payload). Publish best-effort pings the website revalidate endpoint (`SITE_REVALIDATE_URL` + `SITE_REVALIDATE_SECRET`); result surfaces `revalidated: true/false`. No RLS in Neon — writes are gated by the session-checked route, `DATABASE_URL` never leaves the server (see `.env.example`).
- **Manager UI:** Publish card on `/site-manager` (Publish to website / Load from database with confirm, last-published timestamp persisted locally, 503 shows the connect hint). Pull normalizes via `normalizeRemoteContent()` (missing ids regenerated, ratings clamped, unknown gallery kinds → photo) and never touches `lastPublishedAt` except from the server's `updatedAt`.
- **Website side (other repo):** reads the same table with its own connection string (read-only role recommended), falls back to empty content when unreachable, refreshes via `revalidateTag("site-content")` from its own `/api/revalidate-site` route.
- **Google reviews:** unchanged plan — manual paste now, Places API sync later into the same fields.

---

## 19. V10 Addendum — bilingual meal templates + multi-meal events (old-app logic port)

- **Source:** menu/course model reverse-engineered live from the sibling project (`mampally-new.vercel.app` catering module: `Meal { nameEn, nameTa, courses[] { items[] { qtyPer100, pricePerUnit } } }`, Setup/Plan tabs, per-order `mealGroups[] { mealId, people, selectedCourseIds[] }`). Ported as logic only, in our refined UI.
- **Bilingual templates:** `FoodTemplate { nameEn, nameTa }`, `TemplateDish { nameEn, nameTa }` (store `catering-templates`, v1 migrate: legacy `name` → `nameEn`, `nameTa: ""`). Helpers `templateDisplayName()` / `dishDisplayName()` (Tamil falls back to English) and `templateMatchesQuery()` (matches En, Ta, and dish names). Template form has side-by-side English + Tamil inputs with offline auto-fill (`suggestTamilName()`: ingredient dictionary + small dish map — Saapadu, Sambar, Poriyal…); Tamil optional, never blocking. All dropdowns, tables, cards and global search show current-language names.
- **Course setup parity:** template cards/table show a dimmed comma-separated dish line (`Name (count), …`, capped at 5 dishes + bilingual `moreItems` remainder); template list has search; the editor shows live unit + `globalPrice` reference per ingredient row (`unit · ₹price/unit · ≈ ₹line-cost / 100`) and per-dish totals in each dish header.
- **Multi-meal events (supersedes one-template-per-event, §4.2):** `EventMealGroup { id, templateId, headcount, selectedDishIds }` where `[]` = all dishes; `CateringEvent.mealGroups[]` (store `catering-events` v5→v6 migrate: legacy `templateId + headcount` → one group; legacy `templateId` kept synced to the first group). `buildScaledIngredientsForGroups()` scales each group's selected dishes by its own headcount and sums duplicates; `resolveGroupDishes()` treats empty/unknown selections as all dishes. Shared `MealGroupsEditor` (template select, headcount + 100/200/300/500 chips, course checkboxes with search) is used in both the event form (replaces the single template dropdown; overall headcount stays for pricing) and event detail (group edits rescale immediately; overall headcount edits no longer wipe group scaling; groupless legacy events keep the old path). The pricing calculator briefly had the same course filter before its deletion (§15).
- **Pricing rule (deliberate divergence from the old app):** no `pricePerUnit` snapshots on template items — scaling always resolves live `Ingredient.globalPrice` with per-event overrides (SPEC §7 data-integrity rule); the old "apply price to meal-only vs master" modal was not ported. (Phase C briefly added meal/course headings to the PDF; §14's rewrite replaced them with pure category lists.)

---

## 20. V11 Addendum — Backend migration (NeonDB) + real auth + permissions

Supersedes §1 (Phase 2 is now), §13.13 (mock gate replaced), and UI-only roles. Source plan: `BACKEND-MIGRATION.md` (kept in-repo as the build record). **Explicitly accepted trade-off:** full offline is gone, but localStorage stays as an **offline read cache** (API is source of truth; loads overwrite cache; writes apply locally then sync) — not the doc's pure online-only variant.

- **Schema** (`db/migrations/0001–0004`, tracked in `schema_migrations`, applied via `npm run db:migrate`): `users`, `sessions`, `permissions`; `ingredients`, `food_templates` + `template_dishes` + `template_dish_ingredients`; `events` + `event_meal_groups` / `event_ingredient_lines` / `event_employee_lines` / `event_utensil_lines`; `employees`, `utensils`, `stock_ledger_entries`, `vessel_stock_entries`, `expenses`, `other_income`, `reminders`, `vendor_names`, `site_content`. All ids are app-generated UUID TEXT (preserves client ids through migration). Ingredient references are plain TEXT (no FK) to preserve dangling-tolerant "Unknown ingredient" behavior; structural nesting uses FKs with `ON DELETE CASCADE`. Money/qty are NUMERIC (coerced with `Number()` on read — pg returns NUMERIC as string over HTTP).
- **DB layer:** shared `@neondatabase/serverless` client (`src/lib/db.ts`; `siteDb.ts` delegates to it). No ORM (deliberate: consistent with the V9 site-content code). Scripts: `db:check` (scratch-table round-trip probe), `db:migrate` (ordered, idempotent, `$$`-aware splitter), `db:seed-admin` (`ADMIN_USERNAME`/`ADMIN_PASSWORD`, bcrypt-12, skips when present).
- **Auth upgrade:** `bcryptjs` hashing (pure JS, Edge-safe); DB `users` (`email` unique/lowercased, `passwordHash`, `isAdmin`, `employeeId`) + `sessions` (random token cookie, 7-day TTL, `deleteExpiredSessions` helper). Login tries DB first, falls back to legacy env-credential HMAC flow **only while `DATABASE_URL` is unset** (keeps dev + pre-migration working); rate limiting kept. Logout deletes the DB row. `/api/auth/me` exposes `{ user, permissions }`; the auth store carries `userId/isAdmin/employeeId/permissions` (admin/legacy resolve to full). First admin comes from the seed script — no shared credential remains once migrated.
- **Permissions (server-enforced via `requirePermission()`; UI hiding is secondary):** `permissions` table (`canViewFinance`, `canViewOtherEmployeeRates`, `canManageEmployees`, `canManageSettings`); new employee logins default to everything-true except the two finance flags; admin always resolves full and admin/self permission edits are 403. Enforcement map: finance + income routes → `canViewFinance`; employee master writes + users routes → `canManageEmployees`; site publish → `canManageSettings`; everything else → any session. `!canViewOtherEmployeeRates` masks others' `toPay/paid` to 0 in events GET (own linked lines stay) and PATCH preserves hidden pay values so masked zeros can never overwrite real data (deletes still apply).
- **API migration:** every entity group has session-gated routes (30 total, see build output); POSTs accept client ids with `ON CONFLICT DO NOTHING` (idempotent replay); PATCHes are full-replace; DELETEs are idempotent. Frontend stores keep `persist` as cache + `loaded` flag + `load*()` (flush outbox, then server-overwrites-cache) called on screen mount; mutations are optimistic-local then background-sync, failures queued in `catering-outbox` (ordered replay, 4xx-dropped except 401/429). UI gating: Finance nav + `/finance` + EarningsWidget hidden without `canViewFinance`; pay columns/totals hidden per the masking rule; accounts section hidden without `canManageEmployees`.
- **Migration tool:** `/migrate` page (+ Settings link) POSTs every cached record per entity with a per-entity moved/failed report; safe to re-run. Dev-seed wipe also clears the outbox so cleared data cannot replay.
- **Accounts screen:** Logins & access section on `/employees` (admin-gated): list logins with admin badge, create login (email + min-8 temp password, optional employee link, duplicate guards), per-user permission toggles effective immediately (optimistic with rollback), delete with server-side admin/self guards.

---

## 21. Project status (living section — update on every push)

### Committed & pushed to `origin/dev`
| Commit | Content |
|---|---|
| `f695488` | Bilingual meal/course templates, multi-meal events, legacy import, tidy click-to-edit list (§§16, 19) |
| `b703a6e` | Dual-language buy-list + detailed PDFs, category groups, print preview (§14) |
| `937f6af` | Double-tick fix: native-input-free checks/switches/chips (§16) |
| `65dcb5a` | Calculator removed, New Event button to sidebar top, import button removed (§15) |
| `58d4c6d` | SPEC V7 addendum only |
| `7c09805` | feat: add auth schema and session infrastructure (users/sessions/permissions tables, bcryptjs, login/logout API, requirePermission gate) |
| `475e9b9` | finance: add expense API routes and finance permissions (requirePermission('canViewFinance'), 403 enforcement, default employee permissions) |
| `6e3247c` | catalog+events: add catalog and event schema, stores, and API routes (0002/0003 migrations, ingredients/templates/event lines, CRUD API) |
| `45b8244` | operations: add employee, finance, and infrastructure tables and API routes (0004 migrations, employees/utensils/expenses/other_income/reminders/vendor_names/site_content, full API coverage) |
| `7c24e68` | migration tool: add /migrate tool, data migration scripts, and site content management (db:migrate/db:check/db:seed-admin, /migrate page with idempotent replay) |
| `ee1c4c9` | accounts: add employee account management and authentication infrastructure (AccountsManager, authSession, employee default permissions: all true except canViewFinance/canViewOtherEmployeeRates) |
| `8f62edb` | spec: add V9-V11 addenda documenting backend migration, auth, permissions, and project status |
| `082d7d4` | fix: Vercel build — commit `src/lib/db.ts`, storeSync/outbox/localMigration libs + `@neondatabase/serverless` dep (were untracked; 48 Turbopack errors) |
| `1eba764` | feat: `scripts/db-seed-catalog.mjs` (`db:seed-catalog`) — idempotent seed of ingredients/templates/courses from TS sources; live seed: 182 ingredients, 2 templates, 82 dishes, 16 links |
| `064d327` | chore: commit `.env.example`, migration docs, site SQL, Neon functions scaffold |
| `0fb1d39` | feat: Settings — remove ingredient-prices + migrate cards, add Export-to-Excel (.xlsx, 14 sheets); delete `/migrate`, MigrateManager, localMigration |
| `ae7ab94` | feat: remove Rental (`/utensils`) page + nav + search entries (−1080 lines); event Rental tabs, utensil/vessel APIs, stores, tables, data kept |
| `8e5f1e3` | feat: new events no longer preselect courses (`[]` = none; server holds zero legacy groups so no migration needed) + search/select-one-by-one UI with Select all/Clear + wider xl event form with 2-col course list |
| `b88aa22` | feat: logins use username instead of email (migration `0005_username`, validation `^[a-z0-9._-]{3,30}$`, `ADMIN_USERNAME` in seed script) |
| `e0c8f37` | feat: 3 view permissions (migration `0006`: `canViewEmployees/Website/ExportExcel`, all OFF by default) + login placeholders + sign-in focus-ring removal + first-load skeletons |
| `000ad6e` | feat: remove mark-used feature from invoice (Used column, badges, stock `used`-writes; historic `used` rows kept read-only) |
| `4df60a1` | feat: text-free spinner app-wide; dashboard loads events on mount |
| `6b2fc82` | perf (P0): parallel API queries, lazy PDF/Excel chunks, store load dedup, single-variant lists (measured 310→206ms per event read) |
| `41bfa04` | fix: dedupe ingredients 551→182 live (old browser migrations had tripled rows); catalog variant merge; 409 on duplicate names |
| `b9a8831` | feat: Ingredients tab in mobile bottom bar; centered + button |
| `bd9108a` | feat: dashboard 2×2 stat grid (plain CSS), event costs in finance totals, `(123)-456-7890` phones, hidden scrollbars, `preferredText` undefined-guard |

### Verified on Neon DB (live tests green)
- **Migrations**: all 4 (0001_auth → 0004_operations) applied via `npm run db:migrate`; idempotent on re-run
- **Round-trip probe**: `npm run db:check` succeeds (write+read back scratch row)
- **Admin seed**: `npm run db:seed-admin` creates admin account; bcrypt-12 hashed; idempotent on re-run
- **Login round-trip**: DB auth with email + bcrypt; session cookie created; `/api/auth/me` returns user+permissions
- **403 enforcement**: `requirePermission('canViewFinance')` on `/api/expenses` returns 403 for restricted users; new employee defaults `canViewFinance=false`; admin has full permissions
- **Idempotent /migrate**: running `npm run db:migrate` twice produces "skip all — already applied"
- **Static verification**: `tsc` clean, `eslint` 0 errors, `npm run build` 36/36 routes green

### Deliberately left out of git
- `hello.ts`, `neon.ts` (root scratch files), `.env` (credential env-var file, gitignored), `.neon` gitignore entry — user's own Neon experiments, untouched.

---

## 22. Session log 2026-09-20 — current truth + next steps (for AI handoff)

### What is live right now
- **Branch:** `dev` on `origin/dev` (Vercel previews build `dev`; `main` untouched). HEAD `bd9108a`, working tree clean except scratch logs.
- **Neon project `mampalli-catering-crm`:** migrations `0001`–`0006` applied. Contents: **182 ingredients** (unique names), **2 seed templates** (Saapadu 42 courses, Biriyani 40 courses) + 1 user template, 84 dishes, 18 dish links, **2 users** (1 admin, 1 restricted employee login), 0 events/groups at last check.
- **Auth:** username-based (`username` UNIQUE, lowercased). Login tries DB (bcrypt) first, legacy env-HMAC fallback only when `DATABASE_URL` unset. First admin seeded via `ADMIN_USERNAME`/`ADMIN_PASSWORD` (local `.env` still says `ADMIN_EMAIL` — rename before re-seeding).
- **Permissions (7 flags, server-enforced):** `canViewFinance`, `canViewOtherEmployeeRates`, `canManageEmployees`, `canManageSettings`, `canViewEmployees`, `canViewWebsite`, `canExportExcel`. New logins: everything true except finance/rates/view/export (all false). Admin always full; self/admin edits 403. Enforcement: finance routes → finance flag; employees GET → view-employees; site-content GET → view-website; POST site → manage-settings; users routes → manage-employees; masked pay preserved on PATCH. UI mirrors all of it (nav, search, pages, export card, no-access cards).
- **UI map (current):** `/` dashboard = 4-card 2×2 grid (Orders always; Amount/Expenses/Pending finance-gated) + Upcoming + Pending-payments; `/events` (+`/[id]` detail with ingredients/staff/rental tabs, manual course picking, xl form); `/templates`, `/ingredients`, `/employees` (+Logins & access), `/finance` (event-linked totals), `/follow-ups`, `/settings` (language, document lang, Excel export gated), `/site-manager` (gated), public `/site`. **No** `/utensils`, **no** `/migrate`. Mobile bar: Dashboard · Events · + · Ingredients · More. Login: placeholders, no focus ring (scoped). All loading states: text-free spinner. Scrollbars hidden globally (scroll still works).
- **Data rules:** stable seed ids (`ing-*`, `tpl-*`, `dish-*`); `ON CONFLICT DO NOTHING` + `RETURNING *` writes (conflict falls back to SELECT so replays return the row); NUMERIC arrives as string over HTTP (coerce with `Number()`); ingredient refs are plain TEXT (dangling tolerated); `ingredients` POST 409s on duplicate names.
- **Perf state:** API reads/writes parallelized; `@react-pdf/renderer` + `xlsx` load on click only (light `printLines.ts` for render); all 10 stores dedupe loads via `loaded` + shared in-flight promise; lists render table XOR cards via `(max-width: 639px)` media query. Measured: single-event read 310ms → 206ms live.

### Known issues / open threads (do these next)
1. **Undefined-label crash under investigation:** user reported `can't access property "en", label is undefined` (Firefox wording = `preferredText` got `undefined`). Full static audit found every key valid; `preferredText` now renders `""` + logs a dev stack instead of crashing. NEXT: get repro page/action from user (or read the dev console stack) and fix the data path that smuggles `undefined` through a cast.
2. **Deferred P1/P2 perf:** `lucide-react` missing from `optimizePackageImports`; zod/RHF statically bundled in 11 gated modals (→ `next/dynamic`); `useMemo`/`useDeferredValue` gaps (Templates/Events managers, MobileSearchOverlay); `persist` still mirrors the whole server into localStorage (unbounded for events/ledgers); in-memory login rate-limit Map (per-instance, leaks — needs DB/Redis store); two `setValue`-in-effect derivations (EventFormModal total, IngredientFormModal autofill).
3. **Non-admin dashboard shows 1 card** (Orders only) — by design; confirm with user before changing.
4. **Utensil/vessel APIs + tables remain** (event Rental tabs depend on them) though the page is gone — intentional.
5. **Historic `used` stock rows remain readable** but nothing writes them anymore — intentional.
6. **`main` never merged** — decide merge strategy (merge `dev` → `main` when previews are accepted).
7. **`.env.example` documents `ADMIN_USERNAME`;** real `.env` is local-only (gitignored) — Vercel env vars must be kept in sync manually (`DATABASE_URL`, `AUTH_SESSION_SECRET`, `AUTH_USERNAME/PASSWORD` legacy fallback).

### How to work in this repo (conventions Claude should follow)
- `npm run build` must stay green (tsc + Turbopack); verify with `npx tsc --noEmit`.
- DB changes go in `db/migrations/NNNN_name.sql` (idempotent, `$$`-aware splitter) + `npm run db:migrate`; NEVER destructive SQL without asking.
- API routes: session/permission gate first (`requirePermission`), client-id upserts, `RETURNING *` with SELECT fallback on conflict.
- UI is bilingual (EN/TA via `ui.*` in `src/lib/i18n.ts` + `<Bilingual>`); never hardcode user-facing strings.
- Commit per workstream on `dev`; only push when the user says "push".
