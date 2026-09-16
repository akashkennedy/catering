"use client";

import { Card, Divider, Group, Stack, Text } from "@mantine/core";
import { Package } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { formatStock, isLowStock, remainingStock } from "@/lib/stock";
import { useIngredientsStore } from "@/store/ingredients";
import { useStockLedgerStore } from "@/store/stockLedger";

const MAX_ITEMS = 8;

export function InventoryAlertsWidget() {
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const ledgerEntries = useStockLedgerStore((state) => state.entries);

  const rows = ingredients
    .map((ingredient) => ({
      ingredient,
      remaining: remainingStock(ingredient, ledgerEntries),
    }))
    .filter(({ ingredient, remaining }) => {
      const threshold = ingredient.lowStockThreshold ?? 0;
      return threshold > 0 && remaining <= threshold;
    })
    .sort((a, b) => a.remaining - b.remaining);

  const visible = rows.slice(0, MAX_ITEMS);
  const hiddenCount = rows.length - MAX_ITEMS;

  return (
    <Card withBorder padding="md" radius="md" h="100%">
      <Group gap="xs" mb="xs">
        <Package size={18} />
        <Text fw={600}>
          <Bilingual label={ui.dashboard.inventoryAlerts} />
        </Text>
      </Group>
      <Divider mb="sm" />
      {visible.length === 0 ? (
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.dashboard.inventoryEmpty} />
        </Text>
      ) : (
        <Stack gap="xs">
          {visible.map(({ ingredient, remaining }) => (
            <Group
              key={ingredient.id}
              justify="space-between"
              gap="sm"
            >
              <Text size="sm" fw={500} lineClamp={1}>
                {ingredient.name ?? (
                  <Bilingual label={ui.events.unknownIngredient} />
                )}
              </Text>
              <Text
                size="sm"
                c={isLowStock(ingredient, ledgerEntries) ? "red" : "dimmed"}
                component="span"
                style={{ whiteSpace: "nowrap" }}
              >
                {formatStock(remaining, ingredient.unit)}
              </Text>
            </Group>
          ))}
          {hiddenCount > 0 ? (
            <Text size="xs" c="dimmed">
              <Bilingual label={ui.moreItems(hiddenCount)} />
            </Text>
          ) : null}
        </Stack>
      )}
    </Card>
  );
}