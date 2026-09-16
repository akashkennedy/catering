"use client";

import { ActionIcon, Badge, Card, Group, Stack, Table, Text } from "@mantine/core";
import { Trash } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui, labelText } from "@/lib/i18n";
import { formatINR } from "@/lib/format";
import { formatIndianDate } from "@/lib/date";
import type { Expense } from "@/store/finance";

type ExpenseListProps = {
  expenses: Expense[];
  onDelete: (expense: Expense) => void;
};

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  return (
    <>
      <div className="hidden sm:block">
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th><Bilingual label={ui.common.date} /></Table.Th>
              <Table.Th><Bilingual label={ui.finance.category} /></Table.Th>
              <Table.Th><Bilingual label={ui.finance.note} /></Table.Th>
              <Table.Th><Bilingual label={ui.finance.amount} /></Table.Th>
              <Table.Th><Bilingual label={ui.common.actions} /></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {expenses.map((expense) => (
              <Table.Tr key={expense.id}>
                <Table.Td>{formatIndianDate(expense.date)}</Table.Td>
                <Table.Td>
                  <Badge variant="light" size="sm">
                    {labelText(ui.finance.categories[expense.category])}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={1}>
                    {expense.note || "—"}
                  </Text>
                </Table.Td>
                <Table.Td>{formatINR(expense.amount)}</Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label={`Delete expense on ${expense.date}`}
                    onClick={() => onDelete(expense)}
                  >
                    <Trash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
      <Stack gap="sm" className="sm:hidden">
        {expenses.map((expense) => (
          <Card key={expense.id} withBorder padding="sm">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={2}>
                <Badge variant="light" size="sm" style={{ alignSelf: "flex-start" }}>
                  {labelText(ui.finance.categories[expense.category])}
                </Badge>
                <Text size="sm" c="dimmed">
                  {formatIndianDate(expense.date)}
                </Text>
                {expense.note ? (
                  <Text size="sm" lineClamp={2}>
                    {expense.note}
                  </Text>
                ) : null}
              </Stack>
              <Group gap="xs" align="flex-start" wrap="nowrap">
                <Text fw={600}>{formatINR(expense.amount)}</Text>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label={`Delete expense on ${expense.date}`}
                  onClick={() => onDelete(expense)}
                >
                  <Trash size={16} />
                </ActionIcon>
              </Group>
            </Group>
          </Card>
        ))}
      </Stack>
    </>
  );
}