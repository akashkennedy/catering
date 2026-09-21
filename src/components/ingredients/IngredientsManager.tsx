"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Button, Group, Modal, Stack, Text, TextInput, Title } from "@mantine/core";
import { Plus, Search } from "lucide-react";
import { useMediaQuery } from "@mantine/hooks";

import { IngredientCards } from "./IngredientCards";
import { IngredientFormModal } from "./IngredientFormModal";
import { IngredientTable } from "./IngredientTable";
import { Bilingual } from "@/components/Bilingual";
import { ListPageSkeleton } from "@/components/LoadingSkeletons";
import { preferredText, ui } from "@/lib/i18n";
import { INGREDIENT_TAGS, type IngredientTag } from "@/lib/ingredientTags";
import { seedIngredientCatalog } from "@/lib/seedIngredients";
import { useSettingsStore } from "@/store/settings";
import { useIngredientsStore, type Ingredient } from "@/store/ingredients";

type TagFilter = "all" | IngredientTag;

export function IngredientsManager() {
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const deleteIngredient = useIngredientsStore((state) => state.deleteIngredient);
  const loadIngredients = useIngredientsStore((state) => state.loadIngredients);
  const loaded = useIngredientsStore((state) => state.loaded);
  // Render only the matching list variant (table xor cards) instead of
  // mounting both and hiding one with CSS.
  const isMobile = useMediaQuery("(max-width: 639px)");

  useEffect(() => {
    void loadIngredients();
  }, [loadIngredients]);
  const [formOpened, setFormOpened] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | null>(null);
  const [activeTag, setActiveTag] = useState<TagFilter>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const searchPlaceholder = preferredText(ui.ingredients.searchIngredients, uiLanguage);

  useEffect(() => {
    seedIngredientCatalog();
  }, []);

  const counts = useMemo(() => {
    const byTag: Record<string, number> = {};
    for (const ingredient of ingredients) {
      byTag[ingredient.tag] = (byTag[ingredient.tag] ?? 0) + 1;
    }
    return byTag;
  }, [ingredients]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return ingredients.filter((ingredient) => {
      if (activeTag !== "all" && ingredient.tag !== activeTag) return false;
      if (!q) return true;
      return (
        ingredient.name.toLowerCase().includes(q) ||
        ingredient.tamilName.toLowerCase().includes(q)
      );
    });
  }, [ingredients, activeTag, deferredQuery]);

  const handleEdit = useCallback((ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormOpened(true);
  }, []);

  const filters = [
    { value: "all" as const, label: ui.ingredients.tags.all, count: ingredients.length },
    ...INGREDIENT_TAGS.map((tag) => ({
      value: tag,
      label: ui.ingredients.tags[tag],
      count: counts[tag] ?? 0,
    })),
  ];

  return (
    <Stack gap="lg">
      <div className="dash-card" style={{ padding: 0 }}>
        <div style={{ padding: 16 }}>
          <Group justify="space-between" mb="md">
            <Title order={2}>
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

          <TextInput
            role="search"
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            leftSection={<Search size={16} aria-hidden />}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            mb="md"
          />

          <div className="ingredient-filters" role="tablist" aria-label="Filter ingredients">
            {filters.map((filter) => {
              const active = activeTag === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`ingredient-filter-chip${active ? " ingredient-filter-chip--active" : ""}`}
                  onClick={() => setActiveTag(filter.value)}
                >
                  <Bilingual label={filter.label} />
                  <span className="ingredient-filter-chip__count">{filter.count}</span>
                </button>
              );
            })}
          </div>

          {!loaded ? (
            <ListPageSkeleton />
          ) : filtered.length === 0 ? (
            <Text c="dimmed">
              <Bilingual label={deferredQuery.trim() ? ui.ingredients.noMatch : ui.ingredients.empty} />
            </Text>
          ) : isMobile ? (
            <IngredientCards
              ingredients={filtered}
              onEdit={handleEdit}
              onDelete={setDeletingIngredient}
            />
          ) : (
            <IngredientTable
              ingredients={filtered}
              onEdit={handleEdit}
              onDelete={setDeletingIngredient}
            />
          )}
        </div>
      </div>

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
              color="kumkum"
              onClick={() => {
                if (deletingIngredient) {
                  deleteIngredient(deletingIngredient.id);
                }
                setDeletingIngredient(null);
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