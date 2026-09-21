"use client";

import { ActionIcon, Badge, Card, Group, Stack, Table, Text } from "@mantine/core";
import { Trash } from "lucide-react";
import { useMediaQuery } from "@mantine/hooks";

import { Bilingual } from "@/components/Bilingual";
import { ui, preferredText } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { formatINR } from "@/lib/format";
import { formatIndianDate } from "@/lib/date";
import type { Expense } from "@/store/finance";

type ExpenseListProps = {
  expenses: Expense[];
  onDelete: (expense: Expense) => void;
};

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  // Render only the matching list variant (table xor cards) instead of
  // mounting both and hiding one with CSS.
  const isMobile = useMediaQuery("(max-width: 639px)");
  if (isMobile) {
    return (
      <Stack gap="sm">
        {expenses.map((expense) => (
          <Card key={expense.id} withBorder padding="md">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={6}>
                <Badge variant="light" size="sm" style={{ alignSelf: "flex-start" }}>
                  {preferredText(ui.finance.categories[expense.category], uiLanguage)}
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
              <Group gap="sm" align="flex-start" wrap="nowrap">
                <Text fw={600}>{formatINR(expense.amount)}</Text>
                <ActionIcon
                  variant="subtle"
                  color="kumkum"
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
    );
  }
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
                    {preferredText(ui.finance.categories[expense.category], uiLanguage)}
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
                    color="kumkum"
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
    </>
  );
}