"use client";

import { memo } from "react";
import { ActionIcon, Card, Group, Stack, Text } from "@mantine/core";
import { Pencil, Trash } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import type { Ingredient } from "@/store/ingredients";
import { formatINR } from "@/lib/format";

type IngredientCardsProps = {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
};

type IngredientCardItemProps = {
  ingredient: Ingredient;
  index: number;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
};

const IngredientCardItem = memo(function IngredientCardItem({
  ingredient,
  index,
  onEdit,
  onDelete,
}: IngredientCardItemProps) {
  return (
    <Card withBorder padding="sm">
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Text size="xs" c="dimmed">
            #{index + 1}
          </Text>
          <Text fw={600} lineClamp={2}>
            {ingredient.tamilName || ingredient.name || "—"}
          </Text>
          {ingredient.name && (
            <Text size="sm" c="dimmed" lineClamp={1}>
              {ingredient.name}
            </Text>
          )}
          <Group gap="xs" wrap="wrap">
            <span className="dash-pill dash-pill--leaf">
              <Bilingual label={ui.ingredients.tags[ingredient.tag]} />
            </span>
            <Text size="sm">
              {ingredient.unit || "—"}
            </Text>
          </Group>
          <Text size="sm" fw={500}>
            {formatINR(ingredient.globalPrice)}
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
            color="kumkum"
            aria-label={`Delete ${ingredient.name}`}
            onClick={() => onDelete(ingredient)}
          >
            <Trash size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
});

export function IngredientCards({
  ingredients,
  onEdit,
  onDelete,
}: IngredientCardsProps) {
  return (
    <Stack gap="sm" className="sm:hidden">
      {ingredients.map((ingredient, index) => (
        <IngredientCardItem
          key={ingredient.id}
          ingredient={ingredient}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
}