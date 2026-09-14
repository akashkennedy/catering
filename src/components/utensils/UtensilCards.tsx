"use client";

import { ActionIcon, Card, Group, Stack, Text } from "@mantine/core";
import { Pencil, Trash } from "lucide-react";

import type { Utensil } from "@/store/utensils";

type UtensilCardsProps = {
  utensils: Utensil[];
  onEdit: (utensil: Utensil) => void;
  onDelete: (utensil: Utensil) => void;
};

export function UtensilCards({ utensils, onEdit, onDelete }: UtensilCardsProps) {
  return (
    <Stack gap="sm" className="sm:hidden">
      {utensils.map((utensil) => (
        <Card key={utensil.id} withBorder padding="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={2}>
              <Text fw={600}>{utensil.name}</Text>
              <Text size="sm" fw={500}>
                Reference rent price: {utensil.rentPrice}
              </Text>
            </Stack>
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
          </Group>
        </Card>
      ))}
    </Stack>
  );
}