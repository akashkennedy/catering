"use client";

import { useState } from "react";
import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { Plus } from "lucide-react";

import { UtensilCards } from "./UtensilCards";
import { UtensilFormModal } from "./UtensilFormModal";
import { UtensilTable } from "./UtensilTable";
import { useUtensilsStore, type Utensil } from "@/store/utensils";

export function UtensilsManager() {
  const utensils = useUtensilsStore((state) => state.utensils);
  const deleteUtensil = useUtensilsStore((state) => state.deleteUtensil);
  const [formOpened, setFormOpened] = useState(false);
  const [editingUtensil, setEditingUtensil] = useState<Utensil | null>(null);
  const [deletingUtensil, setDeletingUtensil] = useState<Utensil | null>(null);

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={1}>Rental</Title>
        <Button
          leftSection={<Plus size={18} />}
          onClick={() => {
            setEditingUtensil(null);
            setFormOpened(true);
          }}
        >
          Add Utensil
        </Button>
      </Group>

      {utensils.length === 0 ? (
        <Text c="dimmed">No utensils yet. Add one to get started.</Text>
      ) : (
        <>
          <UtensilTable
            utensils={utensils}
            onEdit={(utensil) => {
              setEditingUtensil(utensil);
              setFormOpened(true);
            }}
            onDelete={setDeletingUtensil}
          />
          <UtensilCards
            utensils={utensils}
            onEdit={(utensil) => {
              setEditingUtensil(utensil);
              setFormOpened(true);
            }}
            onDelete={setDeletingUtensil}
          />
        </>
      )}

      <UtensilFormModal opened={formOpened} utensil={editingUtensil} onClose={() => setFormOpened(false)} />

      <Modal
        opened={deletingUtensil !== null}
        onClose={() => setDeletingUtensil(null)}
        title="Delete utensil"
        centered
      >
        <Stack gap="md">
          <Text>Are you sure you want to delete &quot;{deletingUtensil?.name}&quot;?</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingUtensil(null)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                if (deletingUtensil) deleteUtensil(deletingUtensil.id);
                setDeletingUtensil(null);
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}