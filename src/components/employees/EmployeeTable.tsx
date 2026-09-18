"use client";

import { ActionIcon, Group, Table } from "@mantine/core";
import { Pencil, Trash } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import type { Employee } from "@/store/employees";
import { formatINR } from "@/lib/format";
import { formatPhone } from "@/lib/phone";

type EmployeeTableProps = {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
};

export function EmployeeTable({ employees, onEdit, onDelete }: EmployeeTableProps) {
  return (
    <div className="hidden sm:block">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th><Bilingual label={ui.common.name} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.phone} /></Table.Th>
            <Table.Th><Bilingual label={ui.employees.defaultRate} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.actions} /></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {employees.map((employee) => (
            <Table.Tr key={employee.id}>
              <Table.Td>{employee.name}</Table.Td>
              <Table.Td>{employee.phone ? formatPhone(employee.phone) : "—"}</Table.Td>
              <Table.Td>{formatINR(employee.defaultRate)}</Table.Td>
              <Table.Td>
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
                    color="kumkum"
                    aria-label={`Delete ${employee.name}`}
                    onClick={() => onDelete(employee)}
                  >
                    <Trash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}