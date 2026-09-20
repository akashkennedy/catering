"use client";

import { ActionIcon, Card, Group, Stack, Text } from "@mantine/core";
import { Trash } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { preferredText, ui } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { dishDisplayName, templateDisplayName, type FoodTemplate } from "@/store/templates";

const MAX_VISIBLE_PILLS = 5;

type TemplateCardsProps = {
  templates: FoodTemplate[];
  onEdit: (template: FoodTemplate) => void;
  onDelete: (template: FoodTemplate) => void;
};

export function TemplateCards({ templates, onEdit, onDelete }: TemplateCardsProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  return (
    <Stack gap="sm" className="sm:hidden">
      {templates.map((template) => {
        const name = templateDisplayName(template, uiLanguage);
        const dishCount = template.dishes.length;
        const ingredientCount = template.dishes.reduce(
          (sum, dish) => sum + dish.ingredients.length,
          0
        );
        const visibleDishes = template.dishes.slice(0, MAX_VISIBLE_PILLS);
        const hiddenCount = dishCount - visibleDishes.length;
        const dishList =
          visibleDishes
            .map((dish) => `${dishDisplayName(dish, uiLanguage)} (${dish.ingredients.length})`)
            .join(", ") + (hiddenCount > 0 ? `, ${preferredText(ui.moreItems(hiddenCount), uiLanguage)}` : "");
        return (
          <Card
            key={template.id}
            withBorder
            padding="sm"
            role="button"
            tabIndex={0}
            aria-label={name}
            style={{ cursor: "pointer" }}
            onClick={() => onEdit(template)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onEdit(template);
              }
            }}
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text fw={600}>{name}</Text>
                <Text size="sm" c="dimmed">
                  <Bilingual label={ui.dishesTitle(dishCount)} /> ·{" "}
                  <Bilingual label={ui.ingredientsCount(ingredientCount)} />
                </Text>
                {visibleDishes.length > 0 && (
                  <Text size="xs" c="dimmed" mt={4}>
                    {dishList}
                  </Text>
                )}
              </Stack>
              <ActionIcon
                variant="subtle"
                color="kumkum"
                aria-label={`Delete ${name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(template);
                }}
              >
                <Trash size={16} />
              </ActionIcon>
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}
