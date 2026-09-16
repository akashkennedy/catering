import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// NOTE — staff salary is deliberately NOT an expense category in this module.
// Staff pay is already captured per-event through EventEmployeeLine (toPay/paid)
// in the Events module, and per-event labour cost feeds the Total Earnings
// dashboard widget via eventEmployeeToPay(). Logging "staff salary" here too as
// a standing expense would count labour twice against profit. Do NOT "fix" this
// by adding a staff-salary category back in — the correct place to record staff
// pay is the per-event Employees tab.
export const EXPENSE_CATEGORIES = [
  "food materials",
  "other expenses",
  "electricity",
  "transport",
  "gas",
  "custom",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type Expense = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  note: string;
};

export type ExpenseInput = Omit<Expense, "id">;

export type OtherIncome = {
  id: string;
  amount: number;
  date: string;
  note: string;
};

export type OtherIncomeInput = Omit<OtherIncome, "id">;

type FinanceState = {
  expenses: Expense[];
  otherIncomes: OtherIncome[];
  addExpense: (input: ExpenseInput) => void;
  deleteExpense: (id: string) => void;
  addOtherIncome: (input: OtherIncomeInput) => void;
  deleteOtherIncome: (id: string) => void;
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      expenses: [],
      otherIncomes: [],
      addExpense: (input) =>
        set((state) => ({
          expenses: [...state.expenses, { id: crypto.randomUUID(), ...input }],
        })),
      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        })),
      addOtherIncome: (input) =>
        set((state) => ({
          otherIncomes: [
            ...state.otherIncomes,
            { id: crypto.randomUUID(), ...input },
          ],
        })),
      deleteOtherIncome: (id) =>
        set((state) => ({
          otherIncomes: state.otherIncomes.filter((income) => income.id !== id),
        })),
    }),
    {
      name: "catering-finance",
      storage: createJSONStorage(() => localStorage),
    }
  )
);