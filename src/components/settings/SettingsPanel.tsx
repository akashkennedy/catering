"use client";

import { Box, Group, NumberInput, SegmentedControl, Stack, Text, Title } from "@mantine/core";

import { Bilingual } from "@/components/Bilingual";
import { ThemeControl } from "@/components/ThemeControl";
import { ui } from "@/lib/i18n";
import { useIngredientsStore } from "@/store/ingredients";
import {
  useSettingsStore,
  type DefaultLanguage,
  type UiLanguage,
} from "@/store/settings";

export function SettingsPanel() {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const setUiLanguage = useSettingsStore((state) => state.setUiLanguage);
  const defaultLanguage = useSettingsStore((state) => state.defaultLanguage);
  const setDefaultLanguage = useSettingsStore((state) => state.setDefaultLanguage);
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const setIngredientPrice = useIngredientsStore((state) => state.setIngredientPrice);

  return (
    <Stack gap="lg">
      <Title order={2}>
        <Bilingual label={ui.nav.settings} />
      </Title>

      <Box hiddenFrom="sm" className="dash-card">
        <Stack gap="sm">
          <Text fw={600} size="sm">
            <Bilingual label={ui.settings.dark} />
          </Text>
          <ThemeControl />
        </Stack>
      </Box>

      <div className="dash-card">
        <Stack gap="sm">
          <Text fw={600} size="sm">
            <Bilingual label={ui.settings.uiLanguage} />
          </Text>
          <Text size="xs" c="dimmed">
            <Bilingual label={ui.settings.uiLanguageNote} />
          </Text>
          <SegmentedControl
            value={uiLanguage}
            onChange={(value) => setUiLanguage(value as UiLanguage)}
            data={[
              { label: <Bilingual label={ui.settings.tamil} />, value: "ta" },
              { label: <Bilingual label={ui.settings.english} />, value: "en" },
            ]}
          />
        </Stack>
      </div>

      <div className="dash-card">
        <Stack gap="sm">
          <Text fw={600} size="sm">
            <Bilingual label={ui.settings.defaultLanguage} />
          </Text>
          <Text size="xs" c="dimmed">
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
      </div>

      <div className="dash-card">
        <Stack gap="md">
          <div>
            <Text fw={600} size="sm">
              <Bilingual label={ui.settings.ingredientPrices} />
            </Text>
            <Text size="xs" c="dimmed">
              <Bilingual label={ui.settings.ingredientPricesNote} />
            </Text>
          </div>
          {ingredients.length === 0 ? (
            <Text c="dimmed">
              <Bilingual label={ui.settings.noIngredients} />
            </Text>
          ) : (
            ingredients.map((ingredient) => (
              <Group key={ingredient.id} justify="space-between" wrap="nowrap" gap="md" style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <Stack gap={0}>
                  <Text fw={500} style={{ color: "var(--ink)" }}>{ingredient.name}</Text>
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
      </div>
    </Stack>
  );
}