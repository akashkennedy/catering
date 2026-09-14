"use client";

import { useState } from "react";
import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { Plus } from "lucide-react";

import { IngredientCards } from "./IngredientCards";
import { IngredientFormModal } from "./IngredientFormModal";
import { IngredientTable } from "./IngredientTable";
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
        <Title order={1}>Ingredients</Title>
        <Button
          leftSection={<Plus size={18} />}
          onClick={() => {
            setEditingIngredient(null);
            setFormOpened(true);
          }}
        >
          Add Ingredient
        </Button>
      </Group>

      {ingredients.length === 0 ? (
        <Text c="dimmed">No ingredients yet. Add one to get started.</Text>
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
        title="Delete ingredient"
        centered
      >
        <Stack gap="md">
          <Text>Are you sure you want to delete &quot;{deletingIngredient?.name}&quot;?</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingIngredient(null)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                if (deletingIngredient) deleteIngredient(deletingIngredient.id);
                setDeletingIngredient(null);
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