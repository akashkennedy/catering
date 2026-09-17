"use client";

import { ActionIcon, Badge, Group, Table, Text } from "@mantine/core";
import { PackagePlus, Pencil, Trash } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import type { Ingredient } from "@/store/ingredients";
import { formatINR } from "@/lib/format";
import { formatMeasurement } from "@/lib/units";
import { formatStock, isLowStock, remainingStock } from "@/lib/stock";
import { useStockLedgerStore } from "@/store/stockLedger";

type IngredientTableProps = {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
  onLogPurchase: (ingredient: Ingredient) => void;
};

export function IngredientTable({
  ingredients,
  onEdit,
  onDelete,
  onLogPurchase,
}: IngredientTableProps) {
  const ledgerEntries = useStockLedgerStore((state) => state.entries);

  return (
    <div className="hidden sm:block">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th><Bilingual label={ui.common.name} /></Table.Th>
            <Table.Th><Bilingual label={ui.ingredients.tamilName} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.unit} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.price} /></Table.Th>
            <Table.Th><Bilingual label={ui.ingredients.inStock} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.actions} /></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {ingredients.map((ingredient) => {
            const remaining = remainingStock(ingredient, ledgerEntries);
            const low = isLowStock(ingredient, ledgerEntries);
            const threshold = ingredient.lowStockThreshold ?? 0;
            return (
              <Table.Tr key={ingredient.id}>
                <Table.Td>{ingredient.name}</Table.Td>
                <Table.Td>{ingredient.tamilName || "—"}</Table.Td>
                <Table.Td>{formatMeasurement(ingredient.qty, ingredient.unit)}</Table.Td>
                <Table.Td>{formatINR(ingredient.globalPrice)}</Table.Td>
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    <Text
                      size="sm"
                      c={low ? "red" : undefined}
                      fw={low ? 600 : undefined}
                    >
                      {formatStock(remaining, ingredient.unit)}
                    </Text>
                    {low ? (
                      <Badge color="kumkum" variant="light" size="sm">
                        <Bilingual label={ui.ingredients.lowStock} />
                      </Badge>
                    ) : threshold > 0 ? (
                      <Text size="xs" c="dimmed" fw={300}>
                        / {formatStock(threshold, ingredient.unit)}
                      </Text>
                    ) : null}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      aria-label={`Log purchase for ${ingredient.name}`}
                      onClick={() => onLogPurchase(ingredient)}
                    >
                      <PackagePlus size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      aria-label={`Edit ${ingredient.name}`}
                      onClick={() => onEdit(ingredient)}
                    >
                      <Pencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="kumkum"
                      aria-label={`Delete ${ingredient.name}`}
                      onClick={() => onDelete(ingredient)}
                    >
                      <Trash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </div>
  );
}