"use client";

import { ActionIcon, Card, Group, Stack, Text } from "@mantine/core";
import { Pencil, Trash } from "lucide-react";

import type { Vendor } from "@/store/vendors";

type VendorCardsProps = {
  vendors: Vendor[];
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
};

export function VendorCards({ vendors, onEdit, onDelete }: VendorCardsProps) {
  return (
    <Stack gap="sm" className="sm:hidden">
      {vendors.map((vendor) => (
        <Card key={vendor.id} withBorder padding="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={2}>
              <Text fw={600}>{vendor.name}</Text>
              {vendor.phone && (
                <Text size="sm" c="dimmed">
                  {vendor.phone}
                </Text>
              )}
            </Stack>
            <Group gap="xs">
              <ActionIcon
                variant="subtle"
                aria-label={`Edit ${vendor.name}`}
                onClick={() => onEdit(vendor)}
              >
                <Pencil size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                aria-label={`Delete ${vendor.name}`}
                onClick={() => onDelete(vendor)}
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
