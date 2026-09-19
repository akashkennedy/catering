"use client";

import { ActionIcon, Stack, Text, Table } from "@mantine/core";
import { Trash } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { preferredText, ui } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { dishDisplayName, templateDisplayName, type FoodTemplate } from "@/store/templates";

const MAX_VISIBLE_PILLS = 5;

type TemplateTableProps = {
  templates: FoodTemplate[];
  onEdit: (template: FoodTemplate) => void;
  onDelete: (template: FoodTemplate) => void;
};

export function TemplateTable({ templates, onEdit, onDelete }: TemplateTableProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  return (
    <div className="hidden sm:block">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th><Bilingual label={ui.common.name} /></Table.Th>
            <Table.Th><Bilingual label={ui.templates.dishes} /></Table.Th>
            <Table.Th><Bilingual label={ui.templates.ingredients} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.actions} /></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
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
              <Table.Tr
                key={template.id}
                style={{ cursor: "pointer" }}
                onClick={() => onEdit(template)}
              >
                <Table.Td>
                  <Stack gap={4}>
                    <Text fw={600} size="sm">{name}</Text>
                    {visibleDishes.length > 0 && (
                      <Text size="xs" c="dimmed">
                        {dishList}
                      </Text>
                    )}
                  </Stack>
                </Table.Td>
                <Table.Td><Bilingual label={ui.dishesTitle(dishCount)} /></Table.Td>
                <Table.Td><Bilingual label={ui.ingredientsCount(ingredientCount)} /></Table.Td>
                <Table.Td>
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
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </div>
  );
}
