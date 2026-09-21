"use client";

import { ActionIcon, Card, Group, Stack, Table, Text } from "@mantine/core";
import { Trash } from "lucide-react";
import { useMediaQuery } from "@mantine/hooks";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { formatINR } from "@/lib/format";
import { formatIndianDate } from "@/lib/date";
import type { OtherIncome } from "@/store/finance";

type OtherIncomeListProps = {
  otherIncomes: OtherIncome[];
  onDelete: (income: OtherIncome) => void;
};

/** Renders other income entries as desktop rows or mobile cards. */
export function OtherIncomeList({ otherIncomes, onDelete }: OtherIncomeListProps) {
  // Render only the matching list variant (table xor cards) instead of
  // mounting both and hiding one with CSS.
  const isMobile = useMediaQuery("(max-width: 639px)");
  if (isMobile) {
    return (
      <Stack gap="sm">
        {otherIncomes.map((income) => (
          <Card key={income.id} withBorder padding="md">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={6}>
                <Text size="sm" c="dimmed">
                  {formatIndianDate(income.date)}
                </Text>
                {income.note ? (
                  <Text size="sm" lineClamp={2}>
                    {income.note}
                  </Text>
                ) : null}
              </Stack>
              <Group gap="sm" align="flex-start" wrap="nowrap">
                <Text fw={600}>{formatINR(income.amount)}</Text>
                <ActionIcon
                  variant="subtle"
                  color="kumkum"
                  aria-label={`Delete other income on ${income.date}`}
                  onClick={() => onDelete(income)}
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
              <Table.Th><Bilingual label={ui.finance.note} /></Table.Th>
              <Table.Th><Bilingual label={ui.finance.amount} /></Table.Th>
              <Table.Th><Bilingual label={ui.common.actions} /></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {otherIncomes.map((income) => (
              <Table.Tr key={income.id}>
                <Table.Td>{formatIndianDate(income.date)}</Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={1}>
                    {income.note || "—"}
                  </Text>
                </Table.Td>
                <Table.Td>{formatINR(income.amount)}</Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="subtle"
                    color="kumkum"
                    aria-label={`Delete other income on ${income.date}`}
                    onClick={() => onDelete(income)}
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
