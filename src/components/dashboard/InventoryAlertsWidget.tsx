"use client";

import { Card, Divider, Group, Stack, Text } from "@mantine/core";
import { Package } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { normalizeUnit } from "@/lib/units";
import { useEventsStore } from "@/store/events";
import { useIngredientsStore } from "@/store/ingredients";

const MAX_ITEMS = 8;

function todayAtMidnight(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString().slice(0, 10);
}

export function InventoryAlertsWidget() {
  const events = useEventsStore((state) => state.events);
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const today = todayAtMidnight();

  const upcoming = events.filter(
    (event) => event.status !== "cancelled" && event.date && event.date >= today
  );

  const qtyByIngredient = new Map<string, number>();
  for (const event of upcoming) {
    for (const line of event.ingredients ?? []) {
      if (!line.purchased) {
        qtyByIngredient.set(
          line.ingredientId,
          (qtyByIngredient.get(line.ingredientId) ?? 0) + line.qty
        );
      }
    }
  }

  const rows = Array.from(qtyByIngredient.entries())
    .map(([ingredientId, qty]) => {
      const ingredient = ingredients.find((item) => item.id === ingredientId);
      return { ingredientId, ingredient, qty };
    })
    .filter((row) => row.qty > 0)
    .sort((a, b) => b.qty - a.qty);

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
          {visible.map(({ ingredientId, ingredient, qty }) => (
            <Group key={ingredientId} justify="space-between" gap="sm">
              <Text size="sm" fw={500} lineClamp={1}>
                {ingredient?.name ?? (
                  <Bilingual label={ui.events.unknownIngredient} />
                )}
              </Text>
              <Text
                size="sm"
                c="dimmed"
                component="span"
                style={{ whiteSpace: "nowrap" }}
              >
                {qty} {normalizeUnit(ingredient?.unit)}
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