"use client";

import { useState } from "react";
import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { Plus } from "lucide-react";

import { UtensilCards } from "./UtensilCards";
import { UtensilFormModal } from "./UtensilFormModal";
import { UtensilTable } from "./UtensilTable";
import { RentInModal } from "./RentInModal";
import { AssignToEventModal } from "./AssignToEventModal";
import { Bilingual } from "@/components/Bilingual";
import { UtensilsNotReturnedWidget } from "@/components/dashboard/UtensilsNotReturnedWidget";
import { ui } from "@/lib/i18n";
import { useUtensilsStore, type Utensil } from "@/store/utensils";
import { useVesselStockLedgerStore } from "@/store/vesselStockLedger";

export function UtensilsManager() {
  const utensils = useUtensilsStore((state) => state.utensils);
  const deleteUtensil = useUtensilsStore((state) => state.deleteUtensil);
  const removeEntriesForUtensil = useVesselStockLedgerStore(
    (state) => state.removeEntriesForUtensil
  );
  const [formOpened, setFormOpened] = useState(false);
  const [editingUtensil, setEditingUtensil] = useState<Utensil | null>(null);
  const [deletingUtensil, setDeletingUtensil] = useState<Utensil | null>(null);
  const [rentInUtensil, setRentInUtensil] = useState<Utensil | null>(null);
  const [assignUtensil, setAssignUtensil] = useState<Utensil | null>(null);

  return (
    <Stack gap="lg">
      <UtensilsNotReturnedWidget />
      <div className="dash-card" style={{ padding: 0 }}>
      <div style={{ padding: 16 }}>
        <Group justify="space-between" mb="md">
          <Title order={2}>
            <Bilingual label={ui.nav.rental} />
          </Title>
          <Button
            leftSection={<Plus size={18} />}
            onClick={() => {
              setEditingUtensil(null);
              setFormOpened(true);
            }}
          >
            <Bilingual label={ui.utensils.addUtensil} />
          </Button>
        </Group>

        {utensils.length === 0 ? (
          <Text c="dimmed">
            <Bilingual label={ui.utensils.empty} />
          </Text>
        ) : (
          <>
            <UtensilTable
              utensils={utensils}
              onEdit={(utensil) => {
                setEditingUtensil(utensil);
                setFormOpened(true);
              }}
              onDelete={setDeletingUtensil}
              onLogRentIn={setRentInUtensil}
              onAssign={setAssignUtensil}
            />
            <UtensilCards
              utensils={utensils}
              onEdit={(utensil) => {
                setEditingUtensil(utensil);
                setFormOpened(true);
              }}
              onDelete={setDeletingUtensil}
              onLogRentIn={setRentInUtensil}
              onAssign={setAssignUtensil}
            />
          </>
        )}
      </div>
      </div>

      <UtensilFormModal opened={formOpened} utensil={editingUtensil} onClose={() => setFormOpened(false)} />

      <RentInModal
        opened={rentInUtensil !== null}
        utensil={rentInUtensil}
        onClose={() => setRentInUtensil(null)}
      />

      <AssignToEventModal
        opened={assignUtensil !== null}
        utensil={assignUtensil}
        onClose={() => setAssignUtensil(null)}
      />

      <Modal
        opened={deletingUtensil !== null}
        onClose={() => setDeletingUtensil(null)}
        title={<Bilingual label={ui.utensils.deleteTitle} />}
        centered
      >
        <Stack gap="md">
          <Text>
            <Bilingual
              label={
                deletingUtensil
                  ? ui.deleteConfirm(deletingUtensil.name)
                  : { en: "", ta: "" }
              }
            />
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingUtensil(null)}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button
              color="kumkum"
              onClick={() => {
                if (deletingUtensil) {
                  removeEntriesForUtensil(deletingUtensil.id);
                  deleteUtensil(deletingUtensil.id);
                }
                setDeletingUtensil(null);
              }}
            >
              <Bilingual label={ui.common.delete} />
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}