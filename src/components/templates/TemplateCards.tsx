"use client";

import { ActionIcon, Card, Group, Stack, Text } from "@mantine/core";
import { Pencil, Trash } from "lucide-react";

import type { FoodTemplate } from "@/store/templates";

type TemplateCardsProps = {
  templates: FoodTemplate[];
  onEdit: (template: FoodTemplate) => void;
  onDelete: (template: FoodTemplate) => void;
};

export function TemplateCards({ templates, onEdit, onDelete }: TemplateCardsProps) {
  return (
    <Stack gap="sm" className="sm:hidden">
      {templates.map((template) => {
        const dishCount = template.dishes.length;
        const ingredientCount = template.dishes.reduce(
          (sum, dish) => sum + dish.ingredients.length,
          0
        );
        return (
          <Card key={template.id} withBorder padding="sm">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={2}>
                <Text fw={600}>{template.name}</Text>
                <Text size="sm" c="dimmed">
                  {dishCount} {dishCount === 1 ? "dish" : "dishes"} · {ingredientCount}{" "}
                  {ingredientCount === 1 ? "ingredient" : "ingredients"}
                </Text>
              </Stack>
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  aria-label={`Edit ${template.name}`}
                  onClick={() => onEdit(template)}
                >
                  <Pencil size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label={`Delete ${template.name}`}
                  onClick={() => onDelete(template)}
                >
                  <Trash size={16} />
                </ActionIcon>
              </Group>
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}
