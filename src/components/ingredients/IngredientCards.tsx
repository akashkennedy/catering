"use client";

import { ActionIcon, Card, Group, Stack, Text } from "@mantine/core";
import { Pencil, Trash } from "lucide-react";

import type { Ingredient } from "@/store/ingredients";
import { formatINR } from "@/lib/format";
import { formatMeasurement } from "@/lib/units";

type IngredientCardsProps = {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
};

export function IngredientCards({ ingredients, onEdit, onDelete }: IngredientCardsProps) {
  return (
    <Stack gap="sm" className="sm:hidden">
      {ingredients.map((ingredient) => (
        <Card key={ingredient.id} withBorder padding="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={2}>
              <Text fw={600}>{ingredient.name}</Text>
              {ingredient.tamilName && (
                <Text size="sm" c="dimmed">
                  {ingredient.tamilName}
                </Text>
              )}
              <Text size="sm">Unit: {formatMeasurement(ingredient.qty, ingredient.unit)}</Text>
              <Text size="sm" fw={500}>
                Price: {formatINR(ingredient.globalPrice)}
              </Text>
            </Stack>
            <Group gap="xs">
              <ActionIcon
                variant="subtle"
                aria-label={`Edit ${ingredient.name}`}
                onClick={() => onEdit(ingredient)}
              >
                <Pencil size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                aria-label={`Delete ${ingredient.name}`}
                onClick={() => onDelete(ingredient)}
              >
                <Trash size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}