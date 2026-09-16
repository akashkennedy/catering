"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Modal,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IndianRupee, Plus, TrendingDown, TrendingUp } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui, labelText } from "@/lib/i18n";
import { formatINR } from "@/lib/format";
import { formatIndianDate } from "@/lib/date";
import {
  currentMonthKey,
  filteredExpenses,
  filteredOtherIncomes,
  financeSummary,
} from "@/lib/financeReport";
import { EXPENSE_CATEGORIES, useFinanceStore, type Expense, type OtherIncome } from "@/store/finance";
import { useEventsStore } from "@/store/events";
import { ExpenseFormModal } from "./ExpenseFormModal";
import { OtherIncomeFormModal } from "./OtherIncomeFormModal";
import { ExpenseList } from "./ExpenseList";
import { OtherIncomeList } from "./OtherIncomeList";

type FinanceFilter = "month" | "all";

type DeleteTarget = {
  kind: "expense" | "otherIncome";
  id: string;
  descriptor: string;
};

export function FinanceReport() {
  const events = useEventsStore((state) => state.events);
  const expenses = useFinanceStore((state) => state.expenses);
  const otherIncomes = useFinanceStore((state) => state.otherIncomes);
  const deleteExpense = useFinanceStore((state) => state.deleteExpense);
  const deleteOtherIncome = useFinanceStore((state) => state.deleteOtherIncome);

  const [filter, setFilter] = useState<FinanceFilter>("month");
  const [monthKey, setMonthKey] = useState<string>(currentMonthKey());
  const [expenseModalOpened, setExpenseModalOpened] = useState(false);
  const [otherIncomeModalOpened, setOtherIncomeModalOpened] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const activeMonthKey = filter === "month" ? monthKey : null;
  const visibleExpenses = filteredExpenses(expenses, activeMonthKey);
  const visibleOtherIncomes = filteredOtherIncomes(otherIncomes, activeMonthKey);
  const summary = financeSummary(events, otherIncomes, expenses, activeMonthKey);

  const categoryTotals = EXPENSE_CATEGORIES.map((category) => ({
    category,
    total: visibleExpenses.reduce(
      (sum, expense) => (expense.category === category ? sum + expense.amount : sum),
      0
    ),
  })).filter((row) => row.total > 0);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "expense") {
      deleteExpense(deleteTarget.id);
    } else {
      deleteOtherIncome(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Title order={1}>
          <Bilingual label={ui.finance.income} /> &amp; <Bilingual label={ui.finance.expenses} />
        </Title>
        <Group gap="xs" wrap="wrap">
          <Button
            variant="default"
            leftSection={<Plus size={16} />}
            onClick={() => setExpenseModalOpened(true)}
          >
            <Bilingual label={ui.finance.addExpense} />
          </Button>
          <Button
            leftSection={<Plus size={16} />}
            onClick={() => setOtherIncomeModalOpened(true)}
          >
            <Bilingual label={ui.finance.addOtherIncome} />
          </Button>
        </Group>
      </Group>

      <Group gap="md" align="end" wrap="wrap">
        <SegmentedControl
          size="xs"
          value={filter}
          onChange={(value) => setFilter(value as FinanceFilter)}
          data={[
            { label: <Bilingual label={ui.dashboard.earningsThisMonth} />, value: "month" },
            { label: <Bilingual label={ui.dashboard.earningsAllTime} />, value: "all" },
          ]}
        />
        {filter === "month" ? (
          <TextInput
            type="month"
            aria-label={labelText(ui.finance.month)}
            label={<Bilingual label={ui.finance.month} />}
            value={monthKey}
            onChange={(event) => setMonthKey(event.currentTarget.value)}
            size="xs"
            w={170}
          />
        ) : null}
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Card withBorder padding="md" radius="md">
          <Group gap="xs" mb="xs">
            <IndianRupee size={18} />
            <Text fw={600}>
              <Bilingual label={ui.finance.income} />
            </Text>
          </Group>
          <Divider mb="sm" />
          <Stack gap={4}>
            <Text fw={700} size="xl">
              {formatINR(summary.income)}
            </Text>
            <Text size="xs" c="dimmed">
              <Bilingual label={ui.finance.eventCollections} />: {formatINR(summary.eventIncome)}
            </Text>
            <Text size="xs" c="dimmed">
              <Bilingual label={ui.finance.otherIncome} />: {formatINR(summary.otherIncome)}
            </Text>
          </Stack>
        </Card>
        <Card withBorder padding="md" radius="md">
          <Group gap="xs" mb="xs">
            <TrendingDown size={18} />
            <Text fw={600}>
              <Bilingual label={ui.finance.expenses} />
            </Text>
          </Group>
          <Divider mb="sm" />
          <Stack gap={4}>
            <Text fw={700} size="xl">
              {formatINR(summary.expense)}
            </Text>
            <Text size="xs" c="dimmed">
              <Bilingual label={ui.finance.entries(visibleExpenses.length)} />
            </Text>
          </Stack>
        </Card>
        <Card withBorder padding="md" radius="md">
          <Group gap="xs" mb="xs">
            <TrendingUp size={18} />
            <Text fw={600}>
              <Bilingual label={ui.finance.profit} />
            </Text>
          </Group>
          <Divider mb="sm" />
          <Stack gap={4}>
            <Text fw={700} size="xl" c={summary.profit >= 0 ? "teal" : "red"}>
              {formatINR(summary.profit)}
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>

      <Stack gap="sm">
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Title order={2} size="h4">
            <Bilingual label={ui.finance.expenses} />
          </Title>
          <Button
            size="compact-sm"
            leftSection={<Plus size={16} />}
            onClick={() => setExpenseModalOpened(true)}
          >
            <Bilingual label={ui.finance.addExpense} />
          </Button>
        </Group>
        <Text size="xs" c="dimmed">
          <Bilingual label={ui.finance.salaryNote} />
        </Text>
        {visibleExpenses.length === 0 ? (
          <Text size="sm" c="dimmed">
            <Bilingual label={ui.finance.noExpenses} />
          </Text>
        ) : (
          <>
            {categoryTotals.length > 0 ? (
              <Group gap="xs" wrap="wrap">
                {categoryTotals.map((row) => (
                  <Badge key={row.category} variant="light" size="lg" radius="sm">
                    {labelText(ui.finance.categories[row.category])}: {formatINR(row.total)}
                  </Badge>
                ))}
              </Group>
            ) : null}
            <ExpenseList
              expenses={visibleExpenses}
              onDelete={(expense: Expense) =>
                setDeleteTarget({
                  kind: "expense",
                  id: expense.id,
                  descriptor: `${labelText(ui.finance.categories[expense.category])} · ${formatIndianDate(expense.date)}`,
                })
              }
            />
          </>
        )}
      </Stack>

      <Stack gap="sm">
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Title order={2} size="h4">
            <Bilingual label={ui.finance.otherIncome} />
          </Title>
          <Button
            size="compact-sm"
            leftSection={<Plus size={16} />}
            onClick={() => setOtherIncomeModalOpened(true)}
          >
            <Bilingual label={ui.finance.addOtherIncome} />
          </Button>
        </Group>
        {visibleOtherIncomes.length === 0 ? (
          <Text size="sm" c="dimmed">
            <Bilingual label={ui.finance.noOtherIncome} />
          </Text>
        ) : (
          <OtherIncomeList
            otherIncomes={visibleOtherIncomes}
            onDelete={(income: OtherIncome) =>
              setDeleteTarget({
                kind: "otherIncome",
                id: income.id,
                descriptor: `${formatINR(income.amount)} · ${formatIndianDate(income.date)}`,
              })
            }
          />
        )}
      </Stack>

      <ExpenseFormModal opened={expenseModalOpened} onClose={() => setExpenseModalOpened(false)} />
      <OtherIncomeFormModal opened={otherIncomeModalOpened} onClose={() => setOtherIncomeModalOpened(false)} />

      <Modal
        opened={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={<Bilingual label={ui.finance.deleteEntry} />}
        centered
      >
        <Stack gap="md">
          <Text>
            {deleteTarget ? <Bilingual label={ui.deleteConfirm(deleteTarget.descriptor)} /> : null}
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteTarget(null)}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button color="red" onClick={confirmDelete}>
              <Bilingual label={ui.common.delete} />
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}