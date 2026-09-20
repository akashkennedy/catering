"use client";

import { Card, NumberInput, Stack, Text } from "@mantine/core";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import type { Ingredient } from "@/store/ingredients";
import type { EventIngredientLine } from "@/store/events";
import { normalizeUnit } from "@/lib/units";

type EventIngredientCardsProps = {
  lines: EventIngredientLine[];
  ingredients: Ingredient[];
  onLineChange: (
    lineId: string,
    patch: { qty?: number; price?: number }
  ) => void;
};

export function EventIngredientCards({
  lines,
  ingredients,
  onLineChange,
}: EventIngredientCardsProps) {
  return (
    <Stack gap="sm" className="sm:hidden">
      {lines.map((line) => {
        const ingredient = ingredients.find((item) => item.id === line.ingredientId);
        return (
          <Card key={line.id} withBorder padding="sm">
            <Stack gap="xs">
              <div>
                <Text fw={600}>
                  {ingredient?.name ?? <Bilingual label={ui.events.unknownIngredient} />}
                </Text>
                {ingredient?.tamilName && (
                  <Text size="xs" c="dimmed">
                    {ingredient.tamilName}
                  </Text>
                )}
                {ingredient?.unit && (
                  <Text size="xs" c="dimmed">
                    <Bilingual label={ui.ingredients.unitPrefix} /> {normalizeUnit(ingredient.unit)}
                  </Text>
                )}
              </div>
              <Stack gap="xs">
                <NumberInput
                  label={<Bilingual label={ui.common.qty} />}
                  value={line.qty}
                  min={0}
                  allowNegative={false}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                  }}
                  onChange={(value) =>
                    onLineChange(line.id, { qty: typeof value === "number" ? value : 0 })
                  }
                />
                <NumberInput
                  label={<Bilingual label={ui.common.price} />}
                  value={line.price}
                  min={0}
                  allowNegative={false}
                  decimalScale={2}
                  leftSection="₹"
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                  }}
                  onChange={(value) =>
                    onLineChange(line.id, { price: typeof value === "number" ? value : 0 })
                  }
                />
              </Stack>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}