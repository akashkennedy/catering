"use client";

import { ActionIcon, Group, Table } from "@mantine/core";
import { Pencil, Trash } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import type { Ingredient } from "@/store/ingredients";
import { formatINR } from "@/lib/format";
import { formatMeasurement } from "@/lib/units";

type IngredientTableProps = {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
};

export function IngredientTable({ ingredients, onEdit, onDelete }: IngredientTableProps) {
  return (
    <div className="hidden sm:block">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th><Bilingual label={ui.common.name} /></Table.Th>
            <Table.Th><Bilingual label={ui.ingredients.tamilName} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.unit} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.price} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.actions} /></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {ingredients.map((ingredient) => (
            <Table.Tr key={ingredient.id}>
              <Table.Td>{ingredient.name}</Table.Td>
              <Table.Td>{ingredient.tamilName || "—"}</Table.Td>
              <Table.Td>{formatMeasurement(ingredient.qty, ingredient.unit)}</Table.Td>
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
                    color="red"
                    aria-label={`Delete ${ingredient.name}`}
                    onClick={() => onDelete(ingredient)}
                  >
                    <Trash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}