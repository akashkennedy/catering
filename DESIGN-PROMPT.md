# UI Design Implementation Prompts — Catering CRM

Same master template as before (see SPEC.md). DESIGN.md now holds the full, approved design system (colors, type, layout, dark mode, mobile nav, form treatment) — point the AI there for every step below. This is the largest single round yet since it touches every existing screen; go through it in order and don't skip the token step.

---

## 1. Design Tokens + Theme Provider (foundation — do this first, nothing else until it's done)
**Scope:** DESIGN.md color tables (light + dark), typography section. Set up CSS variables (or Mantine theme config) for both light and dark token sets. Install and configure Catamaran font (Google Fonts, both Latin and Tamil subsets). Build a theme toggle mechanism (state + persistence, doesn't need UI yet — that's step 2).
**Acceptance criteria:**
- [ ] All color tokens from DESIGN.md exist as CSS variables/theme values, light and dark
- [ ] Catamaran loads correctly for both English and Tamil text — verify Tamil glyphs actually render (don't assume, check visually)
- [ ] Theme state persists (localStorage, consistent with the rest of the app's persistence approach)
- [ ] No component changes yet — this step is infrastructure only

## 2. Dark Mode Toggle + Global Application
**Scope:** DESIGN.md dark mode principle #5 ("not an afterthought"). Add a visible toggle (placement: your choice — settings screen and/or quick-access, note which you picked). Apply the theme to the root layout so every existing screen inherits it, even before component-level polish happens.
**Acceptance criteria:**
- [ ] Toggle switches the whole app between light/dark instantly, no flash of wrong theme on reload
- [ ] Every existing screen (even unstyled ones) at minimum uses `--bg-paper` and `--ink` correctly in both modes — full component polish comes in later steps, but nothing should be unreadable
- [ ] Toggle state persists across sessions

## 3. Desktop Shell (Sidebar + Top Bar)
**Scope:** DESIGN.md "Layout — Desktop". Build the sidebar nav (Dashboard, Events, Templates, Ingredients, Employees, Rental, Finance, Settings) and top bar (search + language indicator) per the spec — adapted from the reference template, not copied (no gradient background, no avatar/bell cluster).
**Acceptance criteria:**
- [ ] Sidebar active-state uses `--accent-turmeric`, not the reference template's green
- [ ] Works correctly in both light and dark mode
- [ ] Existing page routes plug into this shell without breaking

## 4. Dashboard Widget Restyle
**Scope:** DESIGN.md stat-callout and widget-card treatment. Restyle the existing dashboard widgets (Upcoming Events, Total Earnings, Payment Status Overview, Inventory/Low Stock Alerts, Utensils Not Returned, Quick Add, Pricing Calculator link) to match: `--surface` cards, border/spacing separation (not heavy shadows), status pills using `--accent-leaf`/`--accent-kumkum` correctly per the "red is earned" rule.
**Acceptance criteria:**
- [ ] All existing dashboard widgets restyled, functionality unchanged
- [ ] Pending/alert states correctly use kumkum red; paid/good states use leaf green
- [ ] Works in both light and dark mode
- [ ] No widget lost its existing data/logic in the restyle — this is visual only

## 5. Form Template (New Event / Edit Event)
**Scope:** DESIGN.md "Layout — Forms" section. Rebuild the New Event / Edit Event forms using the two-column reference treatment: section headers, label-above-input fields, bottom action bar with turmeric primary button. Collapse to single column on mobile.
**Acceptance criteria:**
- [ ] Two-column desktop layout, single-column mobile, matching the reference template's field structure
- [ ] Section headers group fields logically (Event Details / Customer Details / Pricing, or similar sensible grouping of the existing fields)
- [ ] Primary action button uses `--accent-turmeric`
- [ ] Works in both light and dark mode
- [ ] All existing form fields and validation still function — this is a visual/structural rebuild, not a field change

## 6. Mobile Bottom Tab Navigation
**Scope:** DESIGN.md "Layout — Mobile". Build the bottom tab bar: Dashboard, Events, Rental, Calculator as primary tabs, plus a More tab (5th, always last) opening a sheet/list with Templates, Ingredients, Employees, Finance, Settings.
**Acceptance criteria:**
- [ ] Bottom tab bar fixed, correct active/inactive styling per DESIGN.md
- [ ] More tab correctly surfaces the remaining 5 sections
- [ ] Works in both light and dark mode
- [ ] Desktop sidebar (step 3) remains the nav on wider viewports — this is mobile-only, confirm the breakpoint behaves correctly

## 7. Mobile Form Sheets
**Scope:** DESIGN.md forms note on mobile ("full-screen sheet, not a centered modal"). Convert New Event / Edit Event (and, for consistency, other master-data forms — Templates, Ingredients, Employees) to open as full-screen sheets on mobile rather than modals.
**Acceptance criteria:**
- [ ] Forms open full-screen on mobile with a clear close/back action
- [ ] Desktop behavior (modal or inline, whichever already exists) is unaffected
- [ ] Consistent across every form in the app, not just Events

## 8. Remaining Screens Pass
**Scope:** Apply the same token system + card/border treatment (established in steps 3–5) to every screen not explicitly covered above: Templates, Ingredients, Employees, Rental, Finance (Income/Expense), Settings.
**Acceptance criteria:**
- [ ] Every screen visually consistent with the established system — no screen left on old/unstyled treatment
- [ ] Dark mode correct everywhere
- [ ] Do this screen-by-screen with a commit per screen (or small logical groups) rather than one giant commit — easier to review and easier to roll back if one screen has an issue

---

## Notes
- Steps 1–2 are non-negotiable prerequisites — don't let the AI jump to "make the dashboard look nice" before tokens and dark mode plumbing exist, or you'll be redoing component-level color choices twice.
- Step 8 is the long tail — feel free to split it into multiple sessions/commits per the existing one-feature-at-a-time approach rather than treating it as a single item.
- The 4 primary mobile tabs (Dashboard, Events, Rental, Calculator) are DESIGN.md's proposal, not locked in — flag it there if you want different ones before starting step 6.
