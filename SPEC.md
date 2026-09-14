# Feature Implementation Prompts — Catering CRM

How to use this file: paste the **Master Template** structure once per feature, filling in the scope/acceptance criteria for whichever feature you're on. The ordered list below gives you those fill-ins ready to go, in build order. Run them one at a time — one feature, one commit, one push, then move to the next prompt.

---

## Master Template (structure every prompt follows)

```
You are implementing ONE feature for the Catering CRM app. Refer to SPEC.md
in this repo for full context on the data model, tech stack, and overall app.

FEATURE: <feature name>

SCOPE — implement ONLY this:
<bullet list>

DO NOT:
- Touch code for other features not listed above
- Change the data model beyond what this feature needs
- Add UI, routes, or store slices for future features
- Install new dependencies unless explicitly required for this feature (ask first if unsure)

BEFORE CODING:
1. Re-read the relevant section of SPEC.md and confirm you understand the data shape.
2. Look at existing components/store slices already in the repo and match their
   patterns (naming, folder structure, Mantine usage, Zustand slice style) —
   don't introduce a new pattern for something already established.

AFTER CODING:
1. Run `npm run lint` and `npx tsc --noEmit` — fix any errors before continuing.
2. Self-review your diff against the acceptance criteria below. List each
   criterion and state met/not met.
3. Describe how you manually verified the feature works (what you'd click
   through to confirm it).
4. If everything passes: stage only files relevant to this feature, commit
   with message format `feat(<scope>): <description>`, and push to the
   current branch.
5. If something doesn't pass, stop and report what's blocking — do not
   commit broken or incomplete work.

ACCEPTANCE CRITERIA:
<checklist>
```

---

## Build Order & Fill-Ins

### 0. Project Scaffold

**Scope:** Next.js 16.3 (App Router) + TypeScript project init, Tailwind, Mantine, Zustand, React Hook Form + Zod, Lucide React installed and configured. Base layout with nav shell (empty routes per SPEC.md §5). Git repo initialized with a `.gitignore`.
**Acceptance criteria:**

- [ ] `npm run dev` runs with no errors
- [ ] Mantine theme provider wraps the app
- [ ] Empty pages exist for all routes in SPEC.md §5 (can just render a placeholder heading)
- [ ] Tailwind + Mantine don't visually conflict (test one styled button)
- [ ] Initial commit made

### 1. Global Settings + Ingredient Master List

**Scope:** SPEC.md §3.3, §3.7, §4.7. Ingredient CRUD (name, Tamil name, unit, global price) stored in Zustand+localStorage. Global Settings screen to edit prices and default language.
**Acceptance criteria:**

- [ ] Can add/edit/delete an ingredient with all fields
- [ ] Data survives a page refresh (localStorage persistence working)
- [ ] Global settings screen lets you edit default language and see/edit ingredient prices
- [ ] Mobile: list becomes stacked cards below ~640px

### 2. Employee & Vendor Master Lists

**Scope:** SPEC.md §3.4, §3.5, §4.4 (master list part only), §4.5 (master vendor list only). Two simple CRUD screens: employees (name, phone, default rate) and vendors (name, phone).
**Acceptance criteria:**

- [ ] Employee CRUD works and persists
- [ ] Vendor CRUD works and persists
- [ ] Both mobile-responsive

### 3. Utensil Master List

**Scope:** SPEC.md §3.6, §4.5 (master utensil list only). CRUD for utensil name + reference rent price.
**Acceptance criteria:**

- [ ] Utensil CRUD works and persists
- [ ] Mobile-responsive

### 4. Food Templates

**Scope:** SPEC.md §3.2, §4.2. Template CRUD: name, list of dishes, ingredients with qty-per-100 (pulling from the Ingredient master list built in step 1).
**Acceptance criteria:**

- [ ] Can create a template, add multiple dishes, and attach ingredients with qty-per-100 to it
- [ ] Templates list/edit/delete correctly
- [ ] Ingredient picker pulls live from the master ingredient list

### 5. Events — Core CRUD

**Scope:** SPEC.md §3.1 (core fields only, skip nested arrays for now), §4.1 (create/edit/list only, no tabs yet). Name, phone, location, headcount, date, status, template selection, client payment status.
**Acceptance criteria:**

- [ ] Can create/edit/delete an event with all core fields
- [ ] Event list is searchable/filterable by name/date/status
- [ ] Selecting a template on the event just saves the templateId for now (scaling comes next step)

### 6. Event Detail — Ingredients Tab (the scaling logic)

**Scope:** SPEC.md §4.3, the scaling formula in §3.2. Event detail page with tab navigation (Ingredients tab only for now). Selecting/changing the event's template auto-generates a scaled ingredient list (qty × headcount/100, price = qty × globalPrice). Quantities/prices editable per event without touching the template or global master data.
**Acceptance criteria:**

- [ ] Changing headcount or template recalculates the ingredient list correctly
- [ ] Editing a quantity/price on this tab does NOT change the template or global ingredient price
- [ ] Running total displayed
- [ ] Tab UI in place (even if Employees/Utensils tabs are just placeholders still)

### 7. Event Detail — Employees Tab

**Scope:** SPEC.md §4.4 (per-event part). Assign from master list or add ad-hoc (with optional "save to master" toggle). Amount to pay / amount paid / pending (computed) per person.
**Acceptance criteria:**

- [ ] Can assign existing employees and see their default rate pre-filled (editable)
- [ ] Can add a one-off employee, optionally saving to master list
- [ ] Pending amount computes correctly (toPay − paid)

### 8. Event Detail — Utensils Tab

**Scope:** SPEC.md §4.5 (per-event part). Assign vendor (master or ad-hoc) + utensils + qty + rental price + duration (from/to dates) + returned status.
**Acceptance criteria:**

- [ ] Can assign a vendor and one or more utensils with quantities and prices
- [ ] Rental duration dates capture correctly
- [ ] Returned status togglable per item
- [ ] Total utensil cost shown for the event

### 9. PDF Export

**Scope:** SPEC.md §4.6. Language toggle (Tamil/English), pulls ingredient list + client payment status + employee payment summary into a generated PDF.
**Acceptance criteria:**

- [ ] Tamil script renders correctly in the PDF (test this first — it's the highest-risk part)
- [ ] English version renders correctly
- [ ] Client payment status and employee payment summary both appear
- [ ] PDF downloads/opens correctly on mobile

### 10. PWA / Offline Support

**Scope:** SPEC.md §7. Serwist setup — app shell installable and loads with no connectivity.
**Acceptance criteria:**

- [ ] App is installable on a phone
- [ ] App shell loads with network disabled
- [ ] Existing localStorage data is still accessible offline

---

## Notes

- Steps 1–3 (master data) can technically be done in any order relative to each other — 4 needs 1, and 5+ need 1–4 done.
- Don't skip the "manually verify" step in the template even though you're doing localStorage-only — it's the only safety net before commits pile up on a broken feature.
- If an AI tool's output touches files outside the stated scope, that's a signal to stop and re-prompt rather than accept the diff.
