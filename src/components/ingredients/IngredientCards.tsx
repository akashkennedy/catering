"use client";

import { ActionIcon, Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import { PackagePlus, Pencil, Trash } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import type { Ingredient } from "@/store/ingredients";
import { formatINR } from "@/lib/format";
import { formatMeasurement } from "@/lib/units";
import { formatStock, isLowStock, remainingStock } from "@/lib/stock";
import { useStockLedgerStore } from "@/store/stockLedger";

type IngredientCardsProps = {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
  onLogPurchase: (ingredient: Ingredient) => void;
};

export function IngredientCards({
  ingredients,
  onEdit,
  onDelete,
  onLogPurchase,
}: IngredientCardsProps) {
  const ledgerEntries = useStockLedgerStore((state) => state.entries);

  return (
    <Stack gap="sm" className="sm:hidden">
      {ingredients.map((ingredient) => {
        const remaining = remainingStock(ingredient, ledgerEntries);
        const low = isLowStock(ingredient, ledgerEntries);
        return (
          <Card key={ingredient.id} withBorder padding="sm">
            <Stack gap="xs">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={2}>
                  <Text fw={600}>{ingredient.name}</Text>
                  {ingredient.tamilName && (
                    <Text size="sm" c="dimmed">
                      {ingredient.tamilName}
                    </Text>
                  )}
                  <Text size="sm">
                    <Bilingual label={ui.ingredients.unitPrefix} />{" "}
                    {formatMeasurement(ingredient.qty, ingredient.unit)}
                  </Text>
                  <Text size="sm" fw={500}>
                    <Bilingual label={ui.ingredients.pricePrefix} /> {formatINR(ingredient.globalPrice)}
                  </Text>
                  <Group gap={6} wrap="nowrap">
                    <Text size="sm" fw={low ? 600 : 500} c={low ? "red" : undefined}>
                      <Bilingual label={ui.ingredients.inStock} />{" "}
                      {formatStock(remaining, ingredient.unit)}
                    </Text>
                    {low && (
                      <Badge color="red" variant="light" size="sm">
                        <Bilingual label={ui.ingredients.lowStock} />
                      </Badge>
                    )}
                  </Group>
                </Stack>
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    aria-label={`Edit ${ingredient.name}`}
                    onClick={() => onEdit(ingredient)}
                  >
                    <Pencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label={`Delete ${ingredient.name}`}
                    onClick={() => onDelete(ingredient)}
                  >
                    <Trash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
              <Button
                variant="subtle"
                size="xs"
                leftSection={<PackagePlus size={16} />}
                onClick={() => onLogPurchase(ingredient)}
              >
                <Bilingual label={ui.ingredients.logPurchase} />
              </Button>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}