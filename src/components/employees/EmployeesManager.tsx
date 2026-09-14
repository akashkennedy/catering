"use client";

import { useState } from "react";
import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { Plus } from "lucide-react";

import { EmployeeCards } from "./EmployeeCards";
import { EmployeeFormModal } from "./EmployeeFormModal";
import { EmployeeTable } from "./EmployeeTable";
import { useEmployeesStore, type Employee } from "@/store/employees";

export function EmployeesManager() {
  const employees = useEmployeesStore((state) => state.employees);
  const deleteEmployee = useEmployeesStore((state) => state.deleteEmployee);
  const [formOpened, setFormOpened] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={1}>Employees</Title>
        <Button
          leftSection={<Plus size={18} />}
          onClick={() => {
            setEditingEmployee(null);
            setFormOpened(true);
          }}
        >
          Add Employee
        </Button>
      </Group>

      {employees.length === 0 ? (
        <Text c="dimmed">No employees yet. Add one to get started.</Text>
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

      <EmployeeFormModal opened={formOpened} employee={editingEmployee} onClose={() => setFormOpened(false)} />

      <Modal
        opened={deletingEmployee !== null}
        onClose={() => setDeletingEmployee(null)}
        title="Delete employee"
        centered
      >
        <Stack gap="md">
          <Text>Are you sure you want to delete &quot;{deletingEmployee?.name}&quot;?</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingEmployee(null)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                if (deletingEmployee) deleteEmployee(deletingEmployee.id);
                setDeletingEmployee(null);
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
