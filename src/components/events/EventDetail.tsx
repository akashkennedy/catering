"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Anchor,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";

import { EventIngredientCards } from "./EventIngredientCards";
import { EventIngredientTable } from "./EventIngredientTable";
import { useEventsStore, buildScaledIngredients } from "@/store/events";
import { useIngredientsStore } from "@/store/ingredients";
import { useTemplatesStore } from "@/store/templates";

export function EventDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const event = useEventsStore((state) => state.events.find((item) => item.id === id));
  const updateEvent = useEventsStore((state) => state.updateEvent);
  const templates = useTemplatesStore((state) => state.templates);
  const ingredients = useIngredientsStore((state) => state.ingredients);

  if (!event) {
    return (
      <Stack gap="md">
        <Title order={1}>Event Detail</Title>
        <Text c="dimmed">Event not found.</Text>
        <Anchor component={Link} href="/events">
          Back to events
        </Anchor>
      </Stack>
    );
  }

  const templateOptions = templates.map((template) => ({
    value: template.id,
    label: template.name,
  }));

  const update = (patch: {
    headcount?: number;
    templateId?: string | null;
    ingredients: typeof event.ingredients;
  }) => {
    updateEvent(event.id, {
      name: event.name,
      phone: event.phone,
      location: event.location,
      headcount: event.headcount,
      date: event.date,
      status: event.status,
      templateId: event.templateId,
      clientPaymentStatus: event.clientPaymentStatus,
      ...patch,
    });
  };

  const handleHeadcountChange = (headcount: number) => {
    const template = templates.find((item) => item.id === event.templateId) ?? null;
    update({ headcount, ingredients: buildScaledIngredients(template, ingredients, headcount) });
  };

  const handleTemplateChange = (templateId: string | null) => {
    const template = templates.find((item) => item.id === templateId) ?? null;
    update({
      templateId,
      ingredients: buildScaledIngredients(template, ingredients, event.headcount),
    });
  };

  const handleLineChange = (lineId: string, patch: { qty?: number; price?: number }) => {
    update({
      ingredients: event.ingredients.map((line) =>
        line.id === lineId ? { ...line, ...patch } : line
      ),
    });
  };

  const runningTotal = event.ingredients.reduce((sum, line) => sum + line.price, 0);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="baseline">
        <div>
          <Title order={1}>{event.name}</Title>
          <Text size="sm" c="dimmed">
            {event.date || "No date"} · {event.headcount} guests
          </Text>
        </div>
        <Anchor component={Link} href="/events" size="sm">
          Back to events
        </Anchor>
      </Group>

      <Paper withBorder p="md">
        <Stack gap="md">
          <Text fw={600}>Event details</Text>
          <Group gap="md" wrap="wrap">
            <NumberInput
              label="Headcount"
              value={event.headcount}
              min={1}
              allowNegative={false}
              w={160}
              onChange={(value) => handleHeadcountChange(typeof value === "number" ? value : 1)}
            />
            <Select
              label="Template"
              placeholder="Select a template"
              data={templateOptions}
              searchable
              clearable
              w={260}
              value={event.templateId ?? null}
              onChange={(value) => handleTemplateChange(value ?? null)}
            />
          </Group>
          <Text size="sm" c="dimmed">
            Changing the headcount or template recalculates the ingredient list below.
          </Text>
        </Stack>
      </Paper>

      <Tabs defaultValue="ingredients">
        <Tabs.List>
          <Tabs.Tab value="ingredients">Ingredients</Tabs.Tab>
          <Tabs.Tab value="employees">Employees</Tabs.Tab>
          <Tabs.Tab value="utensils">Utensils</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="ingredients" pt="md">
          {event.ingredients.length === 0 ? (
            <Text c="dimmed">
              No ingredients yet. Select a template and set a headcount to generate the scaled
              ingredient list.
            </Text>
          ) : (
            <Stack gap="md">
              <EventIngredientTable
                lines={event.ingredients}
                ingredients={ingredients}
                onLineChange={handleLineChange}
              />
              <EventIngredientCards
                lines={event.ingredients}
                ingredients={ingredients}
                onLineChange={handleLineChange}
              />
              <Paper withBorder p="md">
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={600}>Running total</Text>
                  <Text fw={700}>₹{runningTotal.toFixed(2)}</Text>
                </Group>
              </Paper>
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="employees" pt="md">
          <Text c="dimmed">Employees tab coming soon.</Text>
        </Tabs.Panel>

        <Tabs.Panel value="utensils" pt="md">
          <Text c="dimmed">Utensils tab coming soon.</Text>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}