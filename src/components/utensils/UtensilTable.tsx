"use client";

import { ActionIcon, Badge, Group, Table, Text } from "@mantine/core";
import { CalendarClock, PackagePlus, Pencil, Trash } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import type { Utensil } from "@/store/utensils";
import { formatINR } from "@/lib/format";
import { isVesselLow, vesselAvailability } from "@/lib/vesselStock";
import { useVesselStockLedgerStore } from "@/store/vesselStockLedger";

type UtensilTableProps = {
  utensils: Utensil[];
  onEdit: (utensil: Utensil) => void;
  onDelete: (utensil: Utensil) => void;
  onLogRentIn: (utensil: Utensil) => void;
  onAssign: (utensil: Utensil) => void;
};

export function UtensilTable({
  utensils,
  onEdit,
  onDelete,
  onLogRentIn,
  onAssign,
}: UtensilTableProps) {
  const ledgerEntries = useVesselStockLedgerStore((state) => state.entries);

  return (
    <div className="hidden sm:block">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th><Bilingual label={ui.common.name} /></Table.Th>
            <Table.Th><Bilingual label={ui.utensils.rentPrice} /></Table.Th>
            <Table.Th><Bilingual label={ui.utensils.availableColumn} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.actions} /></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {utensils.map((utensil) => {
            const available = vesselAvailability(utensil, ledgerEntries);
            const low = isVesselLow(utensil, ledgerEntries);
            const threshold = utensil.lowStockThreshold ?? 0;
            return (
              <Table.Tr key={utensil.id}>
                <Table.Td>{utensil.name}</Table.Td>
                <Table.Td>{formatINR(utensil.rentPrice)}</Table.Td>
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    <Text
                      size="sm"
                      c={low ? "red" : undefined}
                      fw={low ? 600 : undefined}
                    >
                      {available}
                    </Text>
                    {low ? (
                      <Badge color="red" variant="light" size="sm">
                        <Bilingual label={ui.utensils.lowStock} />
                      </Badge>
                    ) : threshold > 0 ? (
                      <Text size="xs" c="dimmed" fw={300}>
                        / {threshold}
                      </Text>
                    ) : null}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      aria-label={`Log rented in for ${utensil.name}`}
                      onClick={() => onLogRentIn(utensil)}
                    >
                      <PackagePlus size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      aria-label={`Assign ${utensil.name} to an event`}
                      onClick={() => onAssign(utensil)}
                    >
                      <CalendarClock size={16} />
                    </ActionIcon>
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
            );
          })}
        </Table.Tbody>
      </Table>
    </div>
  );
}