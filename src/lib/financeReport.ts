import type { CateringEvent } from "@/store/events";
import type { Expense, OtherIncome } from "@/store/finance";
import { eventTotalAmount } from "@/lib/eventFinances";

export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Money collected from a client for an event (cash-basis income): once an
 * event is marked `paid` the full totalAmount counts as received, otherwise
 * only whatever advancePaid has come in so far. totalAmount and advancePaid
 * are already tracked on the Event entity — this report rolls them up and
 * does not add fields to Event.
 */
export function eventCollected(event: CateringEvent): number {
  return event.status === "paid" ? eventTotalAmount(event) : (event.advancePaid ?? 0);
}

function withinMonth<T extends { date: string }>(
  items: readonly T[],
  monthKey: string | null
): T[] {
  return monthKey
    ? items.filter((item) => (item.date ?? "").startsWith(monthKey))
    : [...items];
}

export function filteredExpenses(
  expenses: readonly Expense[],
  monthKey: string | null
): Expense[] {
  return withinMonth(expenses, monthKey);
}

export function filteredOtherIncomes(
  otherIncomes: readonly OtherIncome[],
  monthKey: string | null
): OtherIncome[] {
  return withinMonth(otherIncomes, monthKey);
}

export type FinanceSummary = {
  income: number;
  eventIncome: number;
  otherIncome: number;
  expense: number;
  profit: number;
};

/**
 * Business-level report rollup filtered by month the same way the Total
 * Earnings dashboard widget filters (event/entry date within the selected
 * month). Income = event collections + other income; Profit = Income − Expenses.
 */
export function financeSummary(
  events: readonly CateringEvent[],
  otherIncomes: readonly OtherIncome[],
  expenses: readonly Expense[],
  monthKey: string | null
): FinanceSummary {
  const eventIncome = withinMonth(events, monthKey).reduce(
    (sum, event) => sum + eventCollected(event),
    0
  );
  const otherIncome = filteredOtherIncomes(otherIncomes, monthKey).reduce(
    (sum, entry) => sum + entry.amount,
    0
  );
  const expense = filteredExpenses(expenses, monthKey).reduce(
    (sum, entry) => sum + entry.amount,
    0
  );
  const income = eventIncome + otherIncome;
  return { income, eventIncome, otherIncome, expense, profit: income - expense };
}