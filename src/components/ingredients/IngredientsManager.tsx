"use client";

import { useState } from "react";
import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { Plus } from "lucide-react";

import { IngredientCards } from "./IngredientCards";
import { IngredientFormModal } from "./IngredientFormModal";
import { IngredientTable } from "./IngredientTable";
import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { useIngredientsStore, type Ingredient } from "@/store/ingredients";

export function IngredientsManager() {
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const deleteIngredient = useIngredientsStore((state) => state.deleteIngredient);
  const [formOpened, setFormOpened] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | null>(null);

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={1}>
          <Bilingual label={ui.nav.ingredients} />
        </Title>
        <Button
          leftSection={<Plus size={18} />}
          onClick={() => {
            setEditingIngredient(null);
            setFormOpened(true);
          }}
        >
          <Bilingual label={ui.ingredients.addIngredient} />
        </Button>
      </Group>

      {ingredients.length === 0 ? (
        <Text c="dimmed">
          <Bilingual label={ui.ingredients.empty} />
        </Text>
      ) : (
        <>
          <IngredientTable
            ingredients={ingredients}
            onEdit={(ingredient) => {
              setEditingIngredient(ingredient);
              setFormOpened(true);
            }}
            onDelete={setDeletingIngredient}
          />
          <IngredientCards
            ingredients={ingredients}
            onEdit={(ingredient) => {
              setEditingIngredient(ingredient);
              setFormOpened(true);
            }}
            onDelete={setDeletingIngredient}
          />
        </>
      )}

      <IngredientFormModal opened={formOpened} ingredient={editingIngredient} onClose={() => setFormOpened(false)} />

      <Modal
        opened={deletingIngredient !== null}
        onClose={() => setDeletingIngredient(null)}
        title={<Bilingual label={ui.ingredients.deleteTitle} />}
        centered
      >
        <Stack gap="md">
          <Text>
            <Bilingual
              label={
                deletingIngredient
                  ? ui.deleteConfirm(deletingIngredient.name)
                  : { en: "", ta: "" }
              }
            />
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingIngredient(null)}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button
              color="red"
              onClick={() => {
                if (deletingIngredient) deleteIngredient(deletingIngredient.id);
                setDeletingIngredient(null);
              }}
            >
              <Bilingual label={ui.common.delete} />
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}