# V3 Expansion Prompts — Catering CRM

Same master template as before (FEATURE-PROMPTS.md). SPEC.md §12 documents all of this — point the AI there. Build order: Event field expansion first (most client-visible, good for a feedback checkpoint), then the two stock-ledger builds (Ingredients first since it's simpler, then reuse the approach for Vessels), then Income/Expense, then the trivial Invoice relabel last.

**You asked to build one feature at a time and check in with your client after each — do exactly that. Don't queue up multiple steps in one AI session; stop after step 1, show the client, then decide whether to continue to step 2.**

---

## 1. Event Field Expansion + Status Pipeline (data model)

**Scope:** SPEC.md §12.2. Add `venue`, `address`, `functionType`, `ratePerPerson`, `totalAmount` (computed, editable), `advancePaid`, `balance` (computed) to Event. Change `status` enum to enquiry/confirmed/preparing/completed/paid. Migrate existing `totalQuoted` data into `totalAmount`. Reconcile `clientPaymentStatus` with the new `status`/`balance` so there's one source of truth — decide and document which one drives the UI (recommend: `status = paid` is the single source; `balance === 0` is just a helper check, `clientPaymentStatus` field gets removed).
**Acceptance criteria:**

- [ ] All new fields present and validated (INR formatting per §10.1 for money fields, phone validation already covers phone)
- [ ] `venue` and `address` are distinct fields, both present on the form
- [ ] `functionType` captured (free text or small preset list — AI's choice, keep it simple)
- [ ] `totalAmount = ratePerPerson * headcount` by default, override persists if manually edited
- [ ] `balance = totalAmount - advancePaid`, always recalculates when either changes
- [ ] Existing events migrate cleanly — no data loss on `totalQuoted`
- [ ] Only one payment-status source of truth remains; old dual-field confusion resolved
- [ ] Status dropdown/selector updated to the 5-stage pipeline everywhere it's used (event list, detail, dashboard)

## 2. Ingredient Stock Ledger + Low Stock Alert

**Scope:** SPEC.md §12.4. Add `openingStock` and `lowStockThreshold` to Ingredient. New `StockLedgerEntry` entity (type: purchase/used, qty, date, optional eventId/note). Remaining = opening + purchases − used. Marking an event's ingredient as consumed creates a `used` ledger entry rather than flipping a boolean. Update the dashboard's Inventory Alerts widget (§11.2) to check `remaining <= lowStockThreshold` instead of the old "unbought" logic.
**Acceptance criteria:**

- [ ] Can log a purchase entry against an ingredient (increases remaining)
- [ ] Marking an event ingredient as used creates a ledger entry tied to that event (decreases remaining)
- [ ] Remaining stock calculation is correct — spot check by hand
- [ ] Low Stock Alert widget correctly reflects the new threshold-based logic
- [ ] Old "purchased" boolean approach from §11.1 is fully removed, not left dangling alongside the new system

## 3. Vessels/Equipment Stock Layer

**Scope:** SPEC.md §12.5. Apply the same stock pattern built in step 3 to the Utensils master list — reuse the StockLedgerEntry pattern (or a parallel entity, AI's choice, but keep it consistent with step 3's approach) so vessels you own show as opening stock, outside rentals as purchase-equivalent, and event assignment as used/availability. This sits alongside the existing Rental tab (outside vendor tracking, §10.3) — don't merge or remove that, this is an additional layer.
**Acceptance criteria:**

- [ ] Vessel availability calculation correct (owned + rented-in − assigned to events)
- [ ] Low Stock Alert extends to vessels: warns when availability is insufficient for upcoming events' needs
- [ ] Existing Rental tab (vendor, cost, duration, returned) still works unchanged — this is additive, not a replacement
- [ ] Clear in the UI which number is "how many you own/available" vs. the Rental tab's per-event rental record

## 4. Income / Expense / Profit Module

**Scope:** SPEC.md §12.7. New `Expense` entity (category, amount, date, note) and `OtherIncome` entity (amount, date, note). Business-level report: Income (event collections + OtherIncome) − Expense = Profit, filterable by month, consistent with the existing Total Earnings widget's filter pattern.
**Acceptance criteria:**

- [ ] Can log expenses by category and other income entries
- [ ] Report correctly rolls up Income/Expense/Profit for a selected month
- [ ] Explicitly resolved and documented: staff salary is NOT logged as a separate Expense category here — it's already captured via per-event employee payments — note this decision in a code comment to prevent future double-counting
- [ ] This is clearly a separate report from the existing per-event Total Earnings widget (§11.2), not a replacement — both should coexist correctly

## 5. Rename PDF Export to "Invoice"

**Scope:** SPEC.md §12.1. Purely a label change — relabel the existing PDF export button/feature as "Invoice" in the UI. No new document format, no new logic.
**Acceptance criteria:**

- [ ] Button/menu label reads "Invoice" (bilingual per §10.4) wherever the export was previously labeled
- [ ] No functional changes to the PDF content itself

---

## Not needed this round

- Previous Orders lookup (§12.3), Staff work time (§12.6) — decided against, existing features already cover the need.
- Order Reminder (§12.8) — already covered by the existing Customer Follow-up feature. Just confirm during review that it reasonably covers "remind me about this order," no new build.
- Admin/Staff roles, separate Customer entity, fixed monthly salary — explicitly decided against, see §12.1.
