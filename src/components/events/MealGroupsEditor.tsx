"use client";

import { useState } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Plus, Trash } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { CheckRow } from "@/components/CheckRow";
import { preferredText, ui } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import {
  templateDisplayName,
  dishDisplayName,
  type FoodTemplate,
} from "@/store/templates";
import type { EventMealGroup } from "@/store/events";

export const MEAL_HEADCOUNT_PRESETS = [100, 200, 300, 500];

function groupId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `g-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

export function emptyMealGroup(headcount: number): EventMealGroup {
  return {
    id: groupId(),
    templateId: null,
    headcount: headcount > 0 ? headcount : 100,
    selectedDishIds: [],
  };
}

type MealGroupsEditorProps = {
  groups: EventMealGroup[];
  templates: FoodTemplate[];
  defaultHeadcount: number;
  onChange: (groups: EventMealGroup[]) => void;
};

function MealGroupCard({
  index,
  group,
  templates,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number;
  group: EventMealGroup;
  templates: FoodTemplate[];
  onChange: (group: EventMealGroup) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const [courseQuery, setCourseQuery] = useState("");
  const template = templates.find((item) => item.id === group.templateId) ?? null;
  const templateOptions = templates.map((item) => ({
    value: item.id,
    label: templateDisplayName(item, uiLanguage),
  }));

  const allDishIds = (template?.dishes ?? []).map((dish) => dish.id);
  // Explicit selection only — nothing is preselected. Stale ids (dishes
  // removed from the template since) are dropped from the display.
  const checkedIds = group.selectedDishIds.filter((id) => allDishIds.includes(id));
  const q = courseQuery.trim().toLowerCase();
  const visibleDishes = (template?.dishes ?? []).filter((dish) => {
    if (!q) return true;
    return (
      dish.nameEn.toLowerCase().includes(q) ||
      dish.nameTa.includes(courseQuery.trim())
    );
  });

  return (
    <Card withBorder padding="sm">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={600}>
            <Bilingual label={ui.events.mealNumber(index + 1)} />
          </Text>
          {canRemove && (
            <ActionIcon
              variant="subtle"
              color="kumkum"
              aria-label={preferredText(ui.events.removeMeal, uiLanguage)}
              onClick={onRemove}
            >
              <Trash size={16} />
            </ActionIcon>
          )}
        </Group>

        <Select
          label={<Bilingual label={ui.events.meals} />}
          placeholder={preferredText(ui.events.selectTemplate, uiLanguage)}
          data={templateOptions}
          searchable
          clearable
          value={group.templateId}
          onChange={(value) =>
            onChange({ ...group, templateId: value, selectedDishIds: [] })
          }
        />

        <div>
          <NumberInput
            label={<Bilingual label={ui.common.headcount} />}
            value={group.headcount}
            min={1}
            allowNegative={false}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
            }}
            onChange={(value) =>
              onChange({
                ...group,
                headcount: typeof value === "number" && value > 0 ? Math.floor(value) : group.headcount,
              })
            }
          />
          <Group gap="xs" mt="xs">
            {MEAL_HEADCOUNT_PRESETS.map((preset) => (
              <Button
                key={preset}
                variant={group.headcount === preset ? "filled" : "light"}
                size="xs"
                onClick={() => onChange({ ...group, headcount: preset })}
              >
                {preset}
              </Button>
            ))}
          </Group>
        </div>

        {template && template.dishes.length > 0 && (
          <div>
            <Group justify="space-between" gap="xs" mb={4}>
              <Text size="sm" fw={500}>
                <Bilingual label={ui.events.includeCourses} />
              </Text>
              <Group gap={4}>
                <Button
                  variant="subtle"
                  size="compact-xs"
                  onClick={() => onChange({ ...group, selectedDishIds: allDishIds })}
                >
                  <Bilingual label={ui.events.selectAllCourses} />
                </Button>
                <Button
                  variant="subtle"
                  size="compact-xs"
                  color="kumkum"
                  disabled={checkedIds.length === 0}
                  onClick={() => onChange({ ...group, selectedDishIds: [] })}
                >
                  <Bilingual label={ui.events.clearCourses} />
                </Button>
              </Group>
            </Group>
            <Text size="xs" c="dimmed" mb="xs">
              <Bilingual
                label={ui.events.selectedCount(checkedIds.length, allDishIds.length)}
              />
            </Text>
            {template.dishes.length > 6 && (
              <TextInput
                placeholder={preferredText(ui.events.searchCourses, uiLanguage)}
                aria-label={preferredText(ui.events.searchCourses, uiLanguage)}
                value={courseQuery}
                onChange={(event) => setCourseQuery(event.currentTarget.value)}
                mb="xs"
              />
            )}
            <Stack gap={4} className="course-check-list">
              {visibleDishes.map((dish) => {
                const dishChecked = checkedIds.includes(dish.id);
                return (
                  <CheckRow
                    key={dish.id}
                    checked={dishChecked}
                    onChange={(next) => {
                      const nextIds = next
                        ? [...checkedIds, dish.id]
                        : checkedIds.filter((id) => id !== dish.id);
                      onChange({ ...group, selectedDishIds: nextIds });
                    }}
                    label={`${dishDisplayName(dish, uiLanguage)} (${dish.ingredients.length})`}
                  />
                );
              })}
              {visibleDishes.length === 0 && (
                <Text size="sm" c="dimmed">
                  <Bilingual label={ui.templates.noMatch} />
                </Text>
              )}
            </Stack>
          </div>
        )}
      </Stack>
    </Card>
  );
}

export function MealGroupsEditor({
  groups,
  templates,
  defaultHeadcount,
  onChange,
}: MealGroupsEditorProps) {
  return (
    <Stack gap="sm">
      {groups.length === 0 && (
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.events.noMeals} />
        </Text>
      )}
      {groups.map((group, index) => (
        <MealGroupCard
          key={group.id}
          index={index}
          group={group}
          templates={templates}
          canRemove={groups.length > 0}
          onChange={(updated) =>
            onChange(groups.map((item) => (item.id === group.id ? updated : item)))
          }
          onRemove={() => onChange(groups.filter((item) => item.id !== group.id))}
        />
      ))}
      <Button
        variant="light"
        leftSection={<Plus size={16} />}
        onClick={() => onChange([...groups, emptyMealGroup(defaultHeadcount || 100)])}
      >
        <Bilingual label={ui.events.addMeal} />
      </Button>
    </Stack>
  );
}
