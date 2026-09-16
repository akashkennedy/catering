# Catering CRM — Project Specification

**Client:** Catering business (single admin/owner user)
**Purpose:** Track events, food templates, ingredients, employees, utensil rentals, and payment status. Mobile-responsive, works offline, exportable PDF reports.

---

## 1. Project Phasing

| Phase | Scope |
|---|---|
| **Phase 1 (this spec)** | Full frontend, all features, data persisted in `localStorage` via Zustand |
| **Phase 2 (later)** | Swap localStorage for Supabase/Postgres backend — no UI changes expected, only the persistence layer |

Single admin user throughout — no roles, multi-user auth, or real-time sync required for Phase 1.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.3 (App Router) |
| Language | TypeScript |
| UI Library | React 19 |
| Styling | Tailwind CSS |
| Component Kit | Mantine |
| State Management | Zustand (with `persist` middleware) |
| Storage (Phase 1) | localStorage (via Zustand persist) |
| Storage (Phase 2) | Supabase (Postgres) |
| Forms | React Hook Form + Zod |
| Offline / PWA | Serwist |
| Icons | Lucide React |
| PDF Generation | Client-side PDF library (e.g. `@react-pdf/renderer` or `pdfmake`) with Tamil font embedded |
| Deployment | Vercel |
| AI Coding Tools | Cursor, Antigravity, Opencode |

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
- Utensil items themselves keep their existing master list (§3.6) — only the *vendor* concept changes.

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
