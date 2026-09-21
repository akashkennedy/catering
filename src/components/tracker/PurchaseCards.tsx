"use client";

import { Anchor, Card, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";

import { formatINR } from "@/lib/format";
import { formatIndianDate } from "@/lib/date";
import { formatStock } from "@/lib/stock";
import { preferredText, ui } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import type { CateringEvent } from "@/store/events";
import type { Ingredient } from "@/store/ingredients";
import type { StockLedgerEntry } from "@/store/stockLedger";

type PurchaseCardsProps = {
  entries: StockLedgerEntry[];
  ingredientsById: Map<string, Ingredient>;
  eventsById: Map<string, CateringEvent>;
};

/** Mobile purchase-history cards (rendered instead of the table). */
export function PurchaseCards({ entries, ingredientsById, eventsById }: PurchaseCardsProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  return (
    <div className="sm:hidden">
      <Stack gap="sm">
        {entries.map((entry) => {
          const ingredient = ingredientsById.get(entry.ingredientId);
          const linkedEvent = entry.eventId ? eventsById.get(entry.eventId) : undefined;
          const name = ingredient
            ? uiLanguage === "ta"
              ? ingredient.tamilName || ingredient.name
              : ingredient.name
            : entry.ingredientId;
          const price = entry.price ?? 0;
          return (
            <Card key={entry.id} withBorder p="sm">
              <Group justify="space-between" wrap="nowrap">
                <Text fw={600} size="sm" lineClamp={1}>
                  {name}
                </Text>
                <Text fw={700} size="sm">
                  {formatINR(Math.round(entry.qty * price * 100) / 100)}
                </Text>
              </Group>
              <Group justify="space-between" wrap="nowrap" mt={4}>
                <Text size="xs" c="dimmed">
                  {entry.date ? formatIndianDate(entry.date) : "—"}
                  {" · "}
                  {formatStock(entry.qty, ingredient?.unit)}
                  {" · "}
                  {price > 0 ? formatINR(price) : preferredText(ui.tracker.noPrice, uiLanguage)}
                </Text>
              </Group>
              {entry.note ? (
                <Text size="xs" c="dimmed" mt={2} lineClamp={1}>
                  {entry.note}
                </Text>
              ) : null}
              {linkedEvent ? (
                <Anchor component={Link} href={`/events/${linkedEvent.id}`} size="xs">
                  {linkedEvent.name}
                </Anchor>
              ) : null}
            </Card>
          );
        })}
      </Stack>
    </div>
  );
}
