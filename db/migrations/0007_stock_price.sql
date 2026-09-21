-- Purchase price per stock ledger entry (powers the inventory tracker
-- spend totals; older rows default to 0 and are shown with price "—").
ALTER TABLE stock_ledger_entries
  ADD COLUMN IF NOT EXISTS price NUMERIC NOT NULL DEFAULT 0;
