"use client";

import { ActionIcon, Group, Table } from "@mantine/core";
import { Pencil, Trash } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import type { Utensil } from "@/store/utensils";
import { formatINR } from "@/lib/format";

type UtensilTableProps = {
  utensils: Utensil[];
  onEdit: (utensil: Utensil) => void;
  onDelete: (utensil: Utensil) => void;
};

export function UtensilTable({ utensils, onEdit, onDelete }: UtensilTableProps) {
  return (
    <div className="hidden sm:block">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th><Bilingual label={ui.common.name} /></Table.Th>
            <Table.Th><Bilingual label={ui.utensils.rentPrice} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.actions} /></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {utensils.map((utensil) => (
            <Table.Tr key={utensil.id}>
              <Table.Td>{utensil.name}</Table.Td>
              <Table.Td>{formatINR(utensil.rentPrice)}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    aria-label={`Edit ${utensil.name}`}
                    onClick={() => onEdit(utensil)}
                  >
                    <Pencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label={`Delete ${utensil.name}`}
                    onClick={() => onDelete(utensil)}
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