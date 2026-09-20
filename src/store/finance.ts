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
  loaded: boolean;
  addExpense: (input: ExpenseInput) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addOtherIncome: (input: OtherIncomeInput) => Promise<void>;
  deleteOtherIncome: (id: string) => Promise<void>;
  /** Flushes queued writes, then replaces the cache with server truth. */
  loadFinance: () => Promise<void>;
};

function newClientId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `local-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

async function postJson(path: string, body: unknown): Promise<boolean> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function deletePath(path: string): Promise<boolean> {
  try {
    const response = await fetch(path, {
      method: "DELETE",
      credentials: "same-origin",
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Shared in-flight load so simultaneous mounts fire a single request.
let loadFinanceRequest: Promise<void> | null = null;

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      expenses: [],
      otherIncomes: [],
      loaded: false,
      addExpense: async (input) => {
        const expense: Expense = { id: newClientId(), ...input };
        set((state) => ({ expenses: [...state.expenses, expense] }));
        const ok = await postJson("/api/expenses", expense);
        if (!ok) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "POST", path: "/api/expenses", body: expense });
        }
      },
      deleteExpense: async (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }));
        const ok = await deletePath(`/api/expenses/${encodeURIComponent(id)}`);
        if (!ok) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "DELETE", path: `/api/expenses/${encodeURIComponent(id)}` });
        }
      },
      addOtherIncome: async (input) => {
        const income: OtherIncome = { id: newClientId(), ...input };
        set((state) => ({ otherIncomes: [...state.otherIncomes, income] }));
        const ok = await postJson("/api/other-incomes", income);
        if (!ok) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "POST", path: "/api/other-incomes", body: income });
        }
      },
      deleteOtherIncome: async (id) => {
        set((state) => ({
          otherIncomes: state.otherIncomes.filter((income) => income.id !== id),
        }));
        const ok = await deletePath(`/api/other-incomes/${encodeURIComponent(id)}`);
        if (!ok) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "DELETE", path: `/api/other-incomes/${encodeURIComponent(id)}` });
        }
      },
      loadFinance: async () => {
        if (useFinanceStore.getState().loaded) return;
        if (!loadFinanceRequest) {
          loadFinanceRequest = (async () => {
            const { flushOutbox } = await import("@/lib/outbox");
            await flushOutbox();
            try {
              const [expensesRes, incomesRes] = await Promise.all([
                fetch("/api/expenses", { credentials: "same-origin" }),
                fetch("/api/other-incomes", { credentials: "same-origin" }),
              ]);
              if (!expensesRes.ok || !incomesRes.ok) return;
              const expensesBody = (await expensesRes.json()) as { expenses?: Expense[] };
              const incomesBody = (await incomesRes.json()) as { otherIncomes?: OtherIncome[] };
              set({
                expenses: Array.isArray(expensesBody.expenses) ? expensesBody.expenses : get().expenses,
                otherIncomes: Array.isArray(incomesBody.otherIncomes)
                  ? incomesBody.otherIncomes
                  : get().otherIncomes,
                loaded: true,
              });
            } catch {
              // Offline: keep the localStorage cache as the read source.
            }
          })().finally(() => {
            loadFinanceRequest = null;
          });
        }
        await loadFinanceRequest;
      },
    }),
    {
      name: "catering-finance",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        expenses: state.expenses,
        otherIncomes: state.otherIncomes,
      }),
    }
  )
);