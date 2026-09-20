"use client";

import { useEffect, useState } from "react";
import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { Plus } from "lucide-react";

import { AccountsManager } from "./AccountsManager";
import { EmployeeCards } from "./EmployeeCards";
import { EmployeeFormModal } from "./EmployeeFormModal";
import { EmployeeTable } from "./EmployeeTable";
import { ListPageSkeleton } from "@/components/LoadingSkeletons";
import { useAuthStore } from "@/store/auth";
import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { useEmployeesStore, type Employee } from "@/store/employees";

export function EmployeesManager() {
  const employees = useEmployeesStore((state) => state.employees);
  const deleteEmployee = useEmployeesStore((state) => state.deleteEmployee);
  const loadEmployees = useEmployeesStore((state) => state.loadEmployees);
  const loaded = useEmployeesStore((state) => state.loaded);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);
  const [formOpened, setFormOpened] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const canManageEmployees = useAuthStore((state) => state.permissions.canManageEmployees);

  return (
    <>
    <div className="dash-card" style={{ padding: 0 }}>
      <div style={{ padding: 16 }}>
        <Group justify="space-between" mb="md">
          <Title order={2}>
            <Bilingual label={ui.nav.employees} />
          </Title>
          <Button
            leftSection={<Plus size={18} />}
            onClick={() => {
              setEditingEmployee(null);
              setFormOpened(true);
            }}
          >
            <Bilingual label={ui.employees.addEmployee} />
          </Button>
        </Group>

        {!loaded ? (
          <ListPageSkeleton />
        ) : employees.length === 0 ? (
          <Text c="dimmed">
            <Bilingual label={ui.employees.empty} />
          </Text>
        ) : (
          <>
            <EmployeeTable
              employees={employees}
              onEdit={(employee) => {
                setEditingEmployee(employee);
                setFormOpened(true);
              }}
              onDelete={setDeletingEmployee}
            />
            <EmployeeCards
              employees={employees}
              onEdit={(employee) => {
                setEditingEmployee(employee);
                setFormOpened(true);
              }}
              onDelete={setDeletingEmployee}
            />
          </>
        )}
      </div>

      <EmployeeFormModal opened={formOpened} employee={editingEmployee} onClose={() => setFormOpened(false)} />

      <Modal
        opened={deletingEmployee !== null}
        onClose={() => setDeletingEmployee(null)}
        title={<Bilingual label={ui.employees.deleteTitle} />}
        centered
      >
        <Stack gap="md">
          <Text>
            <Bilingual
              label={
                deletingEmployee
                  ? ui.deleteConfirm(deletingEmployee.name)
                  : { en: "", ta: "" }
              }
            />
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingEmployee(null)}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button
              color="kumkum"
              onClick={() => {
                if (deletingEmployee) deleteEmployee(deletingEmployee.id);
                setDeletingEmployee(null);
              }}
            >
              <Bilingual label={ui.common.delete} />
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
    {canManageEmployees && (
      <div style={{ marginTop: 16 }}>
        <AccountsManager />
      </div>
    )}
    </>
  );
}