"use client";

import { Group, NumberInput, Paper, SegmentedControl, Stack, Text, Title } from "@mantine/core";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { useIngredientsStore } from "@/store/ingredients";
import { useSettingsStore, type DefaultLanguage } from "@/store/settings";

export function SettingsPanel() {
  const defaultLanguage = useSettingsStore((state) => state.defaultLanguage);
  const setDefaultLanguage = useSettingsStore((state) => state.setDefaultLanguage);
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const setIngredientPrice = useIngredientsStore((state) => state.setIngredientPrice);

  return (
    <Stack gap="lg">
      <Title order={1}>
        <Bilingual label={ui.nav.settings} />
      </Title>

      <Paper withBorder p="md">
        <Stack gap="sm">
          <Title order={3}>
            <Bilingual label={ui.settings.defaultLanguage} />
          </Title>
          <Text size="sm" c="dimmed">
            <Bilingual label={ui.settings.defaultLanguageNote} />
          </Text>
          <SegmentedControl
            value={defaultLanguage}
            onChange={(value) => setDefaultLanguage(value as DefaultLanguage)}
            data={[
              { label: <Bilingual label={ui.settings.english} />, value: "en" },
              { label: <Bilingual label={ui.settings.tamil} />, value: "ta" },
            ]}
          />
        </Stack>
      </Paper>

      <Paper withBorder p="md">
        <Stack gap="md">
          <div>
            <Title order={3}>
              <Bilingual label={ui.settings.ingredientPrices} />
            </Title>
            <Text size="sm" c="dimmed">
              <Bilingual label={ui.settings.ingredientPricesNote} />
            </Text>
          </div>
          {ingredients.length === 0 ? (
            <Text c="dimmed">
              <Bilingual label={ui.settings.noIngredients} />
            </Text>
          ) : (
            ingredients.map((ingredient) => (
              <Group key={ingredient.id} justify="space-between" wrap="nowrap" gap="md">
                <Stack gap={0}>
                  <Text fw={500}>{ingredient.name}</Text>
                  {ingredient.tamilName && (
                    <Text size="xs" c="dimmed">
                      {ingredient.tamilName}
                    </Text>
                  )}
                </Stack>
                <NumberInput
                  w={120}
                  value={ingredient.globalPrice}
                  min={0}
                  allowNegative={false}
                  decimalScale={2}
                  leftSection="₹"
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                  }}
                  onChange={(value) =>
                    setIngredientPrice(ingredient.id, typeof value === "number" ? value : 0)
                  }
                />
              </Group>
            ))
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}