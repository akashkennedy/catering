"use client";

import { ActionIcon, Card, Group, Stack, Text } from "@mantine/core";
import { Pencil, Trash } from "lucide-react";

import type { Employee } from "@/store/employees";

type EmployeeCardsProps = {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
};

export function EmployeeCards({ employees, onEdit, onDelete }: EmployeeCardsProps) {
  return (
    <Stack gap="sm" className="sm:hidden">
      {employees.map((employee) => (
        <Card key={employee.id} withBorder padding="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={2}>
              <Text fw={600}>{employee.name}</Text>
              {employee.phone && (
                <Text size="sm" c="dimmed">
                  {employee.phone}
                </Text>
              )}
              <Text size="sm" fw={500}>
                Rate: {employee.defaultRate}
              </Text>
            </Stack>
            <Group gap="xs">
              <ActionIcon
                variant="subtle"
                aria-label={`Edit ${employee.name}`}
                onClick={() => onEdit(employee)}
              >
                <Pencil size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                aria-label={`Delete ${employee.name}`}
                onClick={() => onDelete(employee)}
              >
                <Trash size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}
