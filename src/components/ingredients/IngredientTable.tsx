"use client";

import { memo } from "react";
import { ActionIcon, Group, Table, Text } from "@mantine/core";
import { Pencil, Trash } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import type { Ingredient } from "@/store/ingredients";
import { formatINR } from "@/lib/format";

type IngredientTableProps = {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
};

type IngredientTableRowProps = {
  ingredient: Ingredient;
  index: number;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
};

const IngredientTableRow = memo(function IngredientTableRow({
  ingredient,
  index,
  onEdit,
  onDelete,
}: IngredientTableRowProps) {
  return (
    <Table.Tr>
      <Table.Td c="dimmed">{index + 1}</Table.Td>
      <Table.Td>
        {ingredient.tamilName ? (
          <Text size="sm" fw={500}>
            {ingredient.tamilName}
          </Text>
        ) : (
          <Text size="sm" c="dimmed">—</Text>
        )}
      </Table.Td>
      <Table.Td>{ingredient.name || "—"}</Table.Td>
      <Table.Td>
        <Bilingual label={ui.ingredients.tags[ingredient.tag]} />
      </Table.Td>
      <Table.Td>{ingredient.unit || "—"}</Table.Td>
      <Table.Td>{formatINR(ingredient.globalPrice)}</Table.Td>
      <Table.Td>
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
      </Table.Td>
    </Table.Tr>
  );
});

export function IngredientTable({
  ingredients,
  onEdit,
  onDelete,
}: IngredientTableProps) {
  return (
    <div className="hidden sm:block">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 40 }}>#</Table.Th>
            <Table.Th><Bilingual label={ui.ingredients.tamilName} /></Table.Th>
            <Table.Th><Bilingual label={ui.ingredients.englishName} /></Table.Th>
            <Table.Th><Bilingual label={ui.ingredients.category} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.unit} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.price} /></Table.Th>
            <Table.Th style={{ width: 110 }}><Bilingual label={ui.common.actions} /></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {ingredients.map((ingredient, index) => (
            <IngredientTableRow
              key={ingredient.id}
              ingredient={ingredient}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}