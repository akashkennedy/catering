# Dashboard Prompts — Catering CRM

Same master template as before. SPEC.md §11 now documents this section — point the AI there. Build order goes from data model → simple read-only widgets → the two widgets needing new interactions (reminders, purchased toggle) → the calculator last, since it's the most self-contained and can be built/tested independently.

---

## 1. Data Model Additions
**Scope:** SPEC.md §11.1. Add `totalQuoted` to Event, `purchased` boolean to per-event ingredient rows, and a new `Reminder` entity (id, customerName, phone, note, remindAt, eventId optional, dismissed). Add `totalQuoted` as an editable field somewhere sensible on the event form (don't build any dashboard UI yet — just the data + form field).
**Acceptance criteria:**
- [ ] `totalQuoted` field exists on Event, editable, INR-validated per §10.1
- [ ] Each ingredient row on an event has a `purchased` toggle, defaults to false, visible on the Ingredients tab
- [ ] Reminder store slice exists (empty UI is fine for now) with persistence
- [ ] Existing events in localStorage don't break — missing fields default sensibly (e.g. `totalQuoted: 0`, `purchased: false`)

## 2. Dashboard Shell + Upcoming Events Widget
**Scope:** SPEC.md §11.2 (Upcoming Events only). Replace the `/` route's plain event list with a dashboard layout (grid of widget cards). First widget: Upcoming Events — next N events by date, tap-through to detail.
**Acceptance criteria:**
- [ ] Dashboard layout in place, responsive (stacks to single column on mobile)
- [ ] Upcoming Events widget shows correctly sorted, tapping an event navigates to its detail page
- [ ] Widget handles the empty state (no upcoming events) gracefully

## 3. Total Earnings + Payment Status Overview Widgets
**Scope:** SPEC.md §11.1 (earnings formula), §11.2 (both widgets). Total Earnings = sum of `totalQuoted − (ingredient + employee + rental costs)` across events, filterable by this month/all time. Payment Status Overview = pending client payments + pending employee payments across all events.
**Acceptance criteria:**
- [ ] Earnings calculation is correct — spot-check by hand against 2-3 real events
- [ ] Month/all-time filter works
- [ ] Payment overview correctly lists pending amounts pulled from existing per-event data (no duplicate logic — reuse the pending calculations already built in the Employees tab and client payment status)

## 4. Inventory Alerts + Utensils Not Returned Widgets
**Scope:** SPEC.md §11.2 (both). Inventory Alerts: aggregate ingredients where `purchased = false` across upcoming events, summed by ingredient. Utensils Not Yet Returned: rentals across events where returned status is false.
**Acceptance criteria:**
- [ ] Inventory Alerts correctly sums quantities of the same ingredient across multiple upcoming events
- [ ] Marking an ingredient as purchased on an event's Ingredients tab removes it from this widget on next view
- [ ] Utensils widget correctly lists outstanding rentals with event name/date for context

## 5. Customer Follow-up (Reminders)
**Scope:** SPEC.md §11.2 (Customer Follow-up), §11.4 (technical note — read this before starting). Quick-add reminder: phone number, optional note, remind-in dropdown (30 min / 1 hr / custom time). Dashboard widget lists active (non-dismissed) reminders. Uses the browser Notification API to fire while the app/tab is open.
**Acceptance criteria:**
- [ ] Can add a reminder in under 3 taps (this is meant for on-the-go use)
- [ ] Reminder fires a browser notification at the correct time while the tab is open in the background
- [ ] Widget lists upcoming/active reminders, with a dismiss action
- [ ] Confirm with a manual test what happens if the tab is closed before the reminder fires — document the actual behavior so expectations are clear (this is the known Phase 1 limitation from §11.4, but verify the exact failure mode)

## 6. Quick Add Shortcuts
**Scope:** SPEC.md §11.2 (Quick Add). Shortcut buttons on the dashboard for New Event / New Ingredient.
**Acceptance criteria:**
- [ ] Both shortcuts navigate directly to the relevant create form
- [ ] Placed sensibly on mobile (thumb-reachable, not buried)

## 7. Pricing Calculator
**Scope:** SPEC.md §11.3. Standalone tool (own route, e.g. `/calculator`): select a template, enter headcount, optional markup %. Shows raw ingredient cost (reuse existing scaling logic) and suggested quote price with markup applied. Optional "Convert to Event" action that pre-fills a new event with these values.
**Acceptance criteria:**
- [ ] Calculation reuses the existing template-scaling logic (don't duplicate/reimplement it — this is a good place to double-check that logic was factored into a reusable function back in the original Ingredients tab build)
- [ ] Markup % correctly applied to produce a suggested quote price
- [ ] Doesn't save anything unless "Convert to Event" is explicitly used
- [ ] "Convert to Event" correctly pre-fills headcount, template, and calculated `totalQuoted` on a new event form

---

## Deferred — not this round
- Notification reliability polish, dashboard visual styling — same as SPEC.md §11.5/§10.6.
