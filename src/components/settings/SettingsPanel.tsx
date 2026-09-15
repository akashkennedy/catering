"use client";

import { Group, NumberInput, Paper, SegmentedControl, Stack, Text, Title } from "@mantine/core";

import { useIngredientsStore } from "@/store/ingredients";
import { useSettingsStore, type DefaultLanguage } from "@/store/settings";

export function SettingsPanel() {
  const defaultLanguage = useSettingsStore((state) => state.defaultLanguage);
  const setDefaultLanguage = useSettingsStore((state) => state.setDefaultLanguage);
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const setIngredientPrice = useIngredientsStore((state) => state.setIngredientPrice);

  return (
    <Stack gap="lg">
      <Title order={1}>Settings</Title>

      <Paper withBorder p="md">
        <Stack gap="sm">
          <Title order={3}>Default language</Title>
          <Text size="sm" c="dimmed">
            Used for labels across the app and exported documents.
          </Text>
          <SegmentedControl
            value={defaultLanguage}
            onChange={(value) => setDefaultLanguage(value as DefaultLanguage)}
            data={[
              { label: "English", value: "en" },
              { label: "Tamil", value: "ta" },
            ]}
          />
        </Stack>
      </Paper>

      <Paper withBorder p="md">
        <Stack gap="md">
          <div>
            <Title order={3}>Ingredient prices</Title>
            <Text size="sm" c="dimmed">
              Edit the global price used as the default when planning events.
            </Text>
          </div>
          {ingredients.length === 0 ? (
            <Text c="dimmed">No ingredients yet. Add them from the Ingredients page.</Text>
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