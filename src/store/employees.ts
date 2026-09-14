import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Employee = {
  id: string;
  name: string;
  phone: string;
  defaultRate: number;
};

export type EmployeeInput = Omit<Employee, "id">;

type EmployeesState = {
  employees: Employee[];
  addEmployee: (input: EmployeeInput) => void;
  updateEmployee: (id: string, input: EmployeeInput) => void;
  deleteEmployee: (id: string) => void;
};

export const useEmployeesStore = create<EmployeesState>()(
  persist(
    (set) => ({
      employees: [],
      addEmployee: (input) =>
        set((state) => ({
          employees: [...state.employees, { id: crypto.randomUUID(), ...input }],
        })),
      updateEmployee: (id, input) =>
        set((state) => ({
          employees: state.employees.map((employee) =>
            employee.id === id ? { ...employee, ...input } : employee
          ),
        })),
      deleteEmployee: (id) =>
        set((state) => ({
          employees: state.employees.filter((employee) => employee.id !== id),
        })),
    }),
    {
      name: "catering-employees",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
