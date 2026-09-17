"use client";

import { ActionIcon, Group, Table } from "@mantine/core";
import { Pencil, Trash } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import type { FoodTemplate } from "@/store/templates";

type TemplateTableProps = {
  templates: FoodTemplate[];
  onEdit: (template: FoodTemplate) => void;
  onDelete: (template: FoodTemplate) => void;
};

export function TemplateTable({ templates, onEdit, onDelete }: TemplateTableProps) {
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
            const dishCount = template.dishes.length;
            const ingredientCount = template.dishes.reduce(
              (sum, dish) => sum + dish.ingredients.length,
              0
            );
            return (
              <Table.Tr key={template.id}>
                <Table.Td>{template.name}</Table.Td>
                <Table.Td><Bilingual label={ui.dishesTitle(dishCount)} /></Table.Td>
                <Table.Td><Bilingual label={ui.ingredientsCount(ingredientCount)} /></Table.Td>
                <Table.Td>
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
                      color="kumkum"
                      aria-label={`Delete ${template.name}`}
                      onClick={() => onDelete(template)}
                    >
                      <Trash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </div>
  );
}