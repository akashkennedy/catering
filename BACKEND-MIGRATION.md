# V9 — Backend Migration + Auth + Granular Employee Permissions

Paste the "SPEC ADDENDUM" section below into your actual SPEC.md as the next numbered section (after whatever §17 site-manager currently is — call it §18). The "BUILD PROMPTS" section below follows the same master-template workflow as your other prompt files.

This is the biggest architectural shift so far: moving every entity off localStorage onto NeonDB, adding real authentication, and building granular per-employee permissions on top. Budget more review time per step than usual — a data-layer bug here is much harder to spot than a UI bug.

---

## SPEC ADDENDUM

## §18. V9 Addendum — Backend Migration (NeonDB) + Auth + Granular Permissions

Supersedes: §1 (Phase 2 is now Phase-now), §13.13 (mock auth gate is replaced by real auth), and the earlier "UI-only roles" decision — the client now needs real per-employee access control because he specifically doesn't want employees seeing earnings, not just a decluttered view.

**Explicitly accepted trade-off:** offline support (the original reason for localStorage-first) is not rebuilt as part of this migration. The app will require an internet connection going forward. Revisit offline sync (the outbox pattern already noted as deferred) later if it becomes a real problem in the field.

### 18.1 Database schema (NeonDB / Postgres)
Every existing Zustand-persisted entity gets a real table: `events`, `food_templates`, `template_courses` (if course-nesting from the legacy import is kept), `ingredients` (with `category`, stock ledger as its own `stock_ledger_entries` table), `employees`, `expenses`, `other_income`, `reminders`, `site_content`, plus new tables for auth (below). Foreign keys replace the current in-object nesting (e.g. `event_employee_assignments`, `event_utensil_rentals` as their own tables referencing `events.id`).

### 18.2 Auth (custom, no library)
```
User {
  id
  email
  passwordHash        // bcrypt or argon2 — a hashing library is fine, "no library" means no auth framework (NextAuth/Auth.js), not no crypto
  isAdmin              // bool — the client's own account
  employeeId (nullable) // links to an Employee record when this user is staff, null for the admin account
  createdAt
}

Session {
  id                   // random token, stored in an httpOnly cookie
  userId
  expiresAt
}
```
- Login: email + password → verify hash → create Session row → set httpOnly cookie.
- Logout: delete the Session row, clear cookie.
- Every API route checks the session cookie server-side before returning data — this is what makes the permission system real (§18.3), unlike the old UI-only hide.
- The existing mock `admin`/`admin` gate (§13.13) is fully replaced — no shared credential remains.

### 18.3 Granular permissions
```
Permission {
  userId
  canViewFinance        // Income & Expense, Total Earnings/Profit widgets
  canViewOtherEmployeeRates  // other employees' pay, not their own
  canManageEmployees     // create/edit employee accounts + permissions
  canManageSettings
  // extend as needed — default template below
}
```
- **Default for a new employee account:** everything `true` except `canViewFinance` and `canViewOtherEmployeeRates` — matches the client's stated "see everything except earnings" default.
- Admin (the client's own account) always has every permission, not editable away from itself.
- The client creates employee accounts and can toggle any permission per employee from an Employee management screen — this is the "control their access rights" ask.
- **Enforcement happens server-side in the API layer, not just by hiding UI** — a hidden nav item is not security; the API route itself must reject a request from a user without the relevant permission.

### 18.4 API layer
Replace direct Zustand-store mutations with Next.js API routes (or Server Actions) backed by NeonDB queries, for every entity in §18.1. Frontend stores become thin caches over fetch calls rather than the source of truth; loading states are already wired via `isSubmitting` on form modals (§13.12) and per-route `loading.tsx` skeletons already exist — both were built anticipating this move, so lean on them rather than rebuilding.

### 18.5 One-time data migration
The client has real data already in the app (localStorage). Build a one-time migration tool/route that reads existing localStorage data client-side and POSTs it to the new API on first load after this update ships, so nothing is lost. Confirm success before removing any localStorage read path.

### 18.6 Employee account management screen
New screen (Admin-only, gated by `canManageEmployees`): list employees, create a login (email + temporary password) for one, edit their permission toggles. This is a new UI on top of the existing Employee master list, not a replacement for it.

---

## BUILD PROMPTS

Same master template as your other prompt files. Build order matters a lot here — each step depends on the one before it.

### 1. NeonDB Schema + Connection Setup
**Scope:** §18.1. Set up the NeonDB Postgres instance, define all tables (migrations, not just ad-hoc SQL), and a query/ORM layer (Drizzle or plain `pg` — AI's choice, but pick one and use it consistently). No API routes or frontend changes yet — this is pure infrastructure.
**Acceptance criteria:**
- [ ] All tables from §18.1 exist with correct foreign keys
- [ ] A basic connection test (e.g. a script that inserts and reads back a row) succeeds
- [ ] Migration files are committed, not just run ad-hoc against the DB

### 2. Auth: Users, Sessions, Login/Logout
**Scope:** §18.2. Build the User and Session tables (if not already in step 1), password hashing, login/logout API routes, and session-check middleware. Replace the mock `admin`/`admin` gate entirely.
**Acceptance criteria:**
- [ ] Can create a user (admin account) with a hashed password, log in, and get a valid session cookie
- [ ] Logout correctly invalidates the session (deleted row, cleared cookie, subsequent requests rejected)
- [ ] No plaintext password ever touches the database or logs
- [ ] Old mock auth gate and its placeholder credentials are fully removed

### 3. Granular Permissions Model + Enforcement
**Scope:** §18.3. Build the Permission table/logic, the default-permission template for new employees, and server-side enforcement on at least the Finance-related API routes (prove the pattern works before applying it everywhere in step 4).
**Acceptance criteria:**
- [ ] New employee account defaults to every permission true except `canViewFinance` and `canViewOtherEmployeeRates`
- [ ] A request to a Finance API route from a user without `canViewFinance` is rejected server-side (test this directly, not just by checking the UI hides the button)
- [ ] Admin account's permissions cannot be edited away from full access

### 4. API Layer Migration (by entity group — do this in sub-batches, not one commit)
**Scope:** §18.4. Migrate each entity group from localStorage/Zustand-only to API-backed: (a) Events + Templates + Ingredients, (b) Employees + Rental/Utensils, (c) Finance (Expense/OtherIncome) + Reminders, (d) Site content. Apply permission checks (§18.3's pattern) to each route as you go, not as an afterthought.
**Acceptance criteria (per sub-batch):**
- [ ] All CRUD operations for that entity group work end-to-end through the API, not localStorage
- [ ] Loading states (existing `isSubmitting`/`loading.tsx` infrastructure) correctly reflect real network latency now
- [ ] Permission checks applied where relevant (e.g. Finance routes check `canViewFinance`)
- [ ] Commit each sub-batch separately — this step is large enough that one giant diff would be unreviewable

### 5. One-Time Data Migration Tool
**Scope:** §18.5. Build the client-side migration script/route that reads existing localStorage data and posts it to the new API on first load post-update.
**Acceptance criteria:**
- [ ] Running it against a populated localStorage correctly creates matching rows in NeonDB
- [ ] Running it twice doesn't duplicate data (idempotent, similar to the legacy-import pattern already used in §16)
- [ ] Verified against your own real local data before considering this done — not just seed/demo data

### 6. Employee Account Management Screen
**Scope:** §18.6. Admin-only screen (gated by `canManageEmployees`) to create employee logins and edit their permission toggles.
**Acceptance criteria:**
- [ ] Admin can create an employee login (email + temp password) linked to an existing Employee master record
- [ ] Admin can toggle any permission for that employee, changes take effect immediately (or on next login, document which)
- [ ] Screen itself is hidden from anyone without `canManageEmployees`

### 7. Remove localStorage Persistence
**Scope:** Final cleanup once steps 1–6 are verified working. Remove the old Zustand `persist` middleware/localStorage read paths entirely.
**Acceptance criteria:**
- [ ] No entity still reads from or writes to localStorage as its source of truth
- [ ] App works correctly on a fresh browser profile with no prior localStorage (proves the API is the real source of truth, not a fallback)
- [ ] Do this step last and only after confirming step 5's migration succeeded on real data — this is not reversible without redoing the migration

---

## Not in this round
- Offline sync/outbox pattern — explicitly deferred per this round's accepted trade-off (§18 intro)
- The 6-stage order pipeline and course-based nested template questions — still separately open from earlier rounds
