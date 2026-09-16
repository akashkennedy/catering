"use client";

import { ActionIcon, Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import { CalendarClock, PackagePlus, Pencil, Trash } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import type { Utensil } from "@/store/utensils";
import { formatINR } from "@/lib/format";
import { isVesselLow, vesselAvailability } from "@/lib/vesselStock";
import { useVesselStockLedgerStore } from "@/store/vesselStockLedger";

type UtensilCardsProps = {
  utensils: Utensil[];
  onEdit: (utensil: Utensil) => void;
  onDelete: (utensil: Utensil) => void;
  onLogRentIn: (utensil: Utensil) => void;
  onAssign: (utensil: Utensil) => void;
};

export function UtensilCards({
  utensils,
  onEdit,
  onDelete,
  onLogRentIn,
  onAssign,
}: UtensilCardsProps) {
  const ledgerEntries = useVesselStockLedgerStore((state) => state.entries);

  return (
    <Stack gap="sm" className="sm:hidden">
      {utensils.map((utensil) => {
        const available = vesselAvailability(utensil, ledgerEntries);
        const low = isVesselLow(utensil, ledgerEntries);
        return (
          <Card key={utensil.id} withBorder padding="sm">
            <Stack gap="xs">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={2}>
                  <Text fw={600}>{utensil.name}</Text>
                  <Text size="sm" fw={500}>
                    <Bilingual label={ui.utensils.refPricePrefix} /> {formatINR(utensil.rentPrice)}
                  </Text>
                  <Group gap={6} wrap="nowrap">
                    <Text
                      size="sm"
                      fw={low ? 600 : 500}
                      c={low ? "red" : undefined}
                    >
                      <Bilingual label={ui.utensils.available} /> {available}
                    </Text>
                    {low && (
                      <Badge color="red" variant="light" size="sm">
                        <Bilingual label={ui.utensils.lowStock} />
                      </Badge>
                    )}
                  </Group>
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
              <Button
                variant="subtle"
                size="xs"
                leftSection={<PackagePlus size={16} />}
                onClick={() => onLogRentIn(utensil)}
              >
                <Bilingual label={ui.utensils.logRentIn} />
              </Button>
              <Button
                variant="subtle"
                size="xs"
                color="blue"
                leftSection={<CalendarClock size={16} />}
                onClick={() => onAssign(utensil)}
              >
                <Bilingual label={ui.utensils.assignToEvent} />
              </Button>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}