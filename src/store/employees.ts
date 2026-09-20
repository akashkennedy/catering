import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { fetchJson, newClientId, syncOrQueue } from "@/lib/storeSync";

export type Employee = {
  id: string;
  name: string;
  phone: string;
  defaultRate: number;
};

export type EmployeeInput = Omit<Employee, "id">;

type EmployeesState = {
  employees: Employee[];
  loaded: boolean;
  addEmployee: (input: EmployeeInput) => string;
  updateEmployee: (id: string, input: EmployeeInput) => void;
  deleteEmployee: (id: string) => void;
  loadEmployees: () => Promise<void>;
};

// Shared in-flight load so simultaneous mounts fire a single request.
let loadEmployeesRequest: Promise<void> | null = null;

export const useEmployeesStore = create<EmployeesState>()(
  persist(
    (set) => ({
      employees: [],
      loaded: false,
      addEmployee: (input) => {
        const id = newClientId();
        set((state) => ({
          employees: [...state.employees, { id, ...input }],
        }));
        void syncOrQueue("POST", "/api/employees", { id, ...input });
        return id;
      },
      updateEmployee: (id, input) => {
        set((state) => ({
          employees: state.employees.map((employee) =>
            employee.id === id ? { ...employee, ...input } : employee
          ),
        }));
        void syncOrQueue("PATCH", `/api/employees/${encodeURIComponent(id)}`, input);
      },
      deleteEmployee: (id) => {
        set((state) => ({
          employees: state.employees.filter((employee) => employee.id !== id),
        }));
        void syncOrQueue("DELETE", `/api/employees/${encodeURIComponent(id)}`);
      },
      loadEmployees: async () => {
        if (useEmployeesStore.getState().loaded) return;
        if (!loadEmployeesRequest) {
          loadEmployeesRequest = (async () => {
            const { flushOutbox } = await import("@/lib/outbox");
            await flushOutbox();
            const body = await fetchJson<{ employees?: Employee[] }>("/api/employees");
            if (body && Array.isArray(body.employees)) {
              set({ employees: body.employees, loaded: true });
            }
          })().finally(() => {
            loadEmployeesRequest = null;
          });
        }
        await loadEmployeesRequest;
      },
    }),
    {
      name: "catering-employees",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ employees: state.employees }),
    }
  )
);
