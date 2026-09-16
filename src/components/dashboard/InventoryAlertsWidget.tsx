"use client";

import { Card, Divider, Group, Stack, Text } from "@mantine/core";
import { Package } from "lucide-react";
import type { ReactNode } from "react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { formatStock, isLowStock, remainingStock } from "@/lib/stock";
import {
  assignedNeedsForEvents,
  vesselAvailability,
} from "@/lib/vesselStock";
import { todayLocalISO } from "@/lib/date";
import { useIngredientsStore } from "@/store/ingredients";
import { useStockLedgerStore } from "@/store/stockLedger";
import { useUtensilsStore } from "@/store/utensils";
import { useVesselStockLedgerStore } from "@/store/vesselStockLedger";
import { useEventsStore } from "@/store/events";

const MAX_ITEMS = 8;

type AlertRow = {
  key: string;
  name: ReactNode;
  value: ReactNode;
};

export function InventoryAlertsWidget() {
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const ledgerEntries = useStockLedgerStore((state) => state.entries);
  const utensils = useUtensilsStore((state) => state.utensils);
  const vesselEntries = useVesselStockLedgerStore((state) => state.entries);
  const events = useEventsStore((state) => state.events);

  const today = todayLocalISO();
  const upcomingEventIds = new Set(
    events.filter((event) => event.date >= today).map((event) => event.id)
  );

  const ingredientRows: AlertRow[] = ingredients
    .map((ingredient) => ({
      ingredient,
      remaining: remainingStock(ingredient, ledgerEntries),
      threshold: ingredient.lowStockThreshold ?? 0,
    }))
    .filter(({ threshold, remaining }) => threshold > 0 && remaining <= threshold)
    .sort((a, b) => a.remaining - b.remaining)
    .map(({ ingredient, remaining }) => ({
      key: ingredient.id,
      name: ingredient.name ?? <Bilingual label={ui.events.unknownIngredient} />,
      value: (
        <Text
          size="sm"
          c={isLowStock(ingredient, ledgerEntries) ? "red" : "dimmed"}
          component="span"
          style={{ whiteSpace: "nowrap" }}
        >
          {formatStock(remaining, ingredient.unit)}
        </Text>
      ),
    }));

  const vesselRows: AlertRow[] = utensils
    .map((utensil) => {
      const available = vesselAvailability(utensil, vesselEntries);
      const needed = assignedNeedsForEvents(utensil.id, vesselEntries, upcomingEventIds);
      const threshold = utensil.lowStockThreshold ?? 0;
      const low = threshold > 0 && available <= threshold;
      const insufficient = needed > available;
      return { utensil, available, needed, low, insufficient };
    })
    .filter(({ low, insufficient }) => low || insufficient)
    .sort((a, b) => b.needed - b.available - (a.needed - a.available))
    .map(({ utensil, available, needed, low, insufficient }) => ({
      key: `vessel-${utensil.id}`,
      name: utensil.name,
      value: (
        <Group gap={6} wrap="nowrap">
          <Text
            size="sm"
            c={low || insufficient ? "red" : "dimmed"}
            component="span"
            style={{ whiteSpace: "nowrap" }}
          >
            {available}
          </Text>
          {insufficient ? (
            <Text
              size="xs"
              c="dimmed"
              component="span"
              style={{ whiteSpace: "nowrap" }}
            >
              <Bilingual label={ui.utensils.neededForEvents(needed)} />
            </Text>
          ) : null}
        </Group>
      ),
    }));

  const rows = [...ingredientRows, ...vesselRows];
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
          {visible.map((row) => (
            <Group key={row.key} justify="space-between" gap="sm">
              <Text size="sm" fw={500} lineClamp={1}>
                {row.name}
              </Text>
              {row.value}
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