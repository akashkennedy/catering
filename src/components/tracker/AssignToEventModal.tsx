"use client";

import { useEffect, useMemo, useState } from "react";
import { ActionIcon, Button, Group, Modal, NumberInput, Select, Stack, Text } from "@mantine/core";
import { Plus, Trash } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { formatINR } from "@/lib/format";
import { formatIndianDate } from "@/lib/date";
import { formatStock } from "@/lib/stock";
import { preferredText, ui } from "@/lib/i18n";
import { useEventsStore, type EventIngredientLine } from "@/store/events";
import { useIngredientsStore } from "@/store/ingredients";
import { useSettingsStore } from "@/store/settings";
import { useMobileSheet } from "@/hooks/useMobileSheet";

type AssignToEventModalProps = {
  opened: boolean;
  onClose: () => void;
};

function newLineId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `evl-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

/**
 * Assigns inventory items to an event: pick an event, stage ingredient +
 * quantity lines, then append them to the event's ingredient list (price =
 * qty × master price, same formula as template scaling).
 */
export function AssignToEventModal({ opened, onClose }: AssignToEventModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("sheet");
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const events = useEventsStore((state) => state.events);
  const loadEvents = useEventsStore((state) => state.loadEvents);
  const updateEvent = useEventsStore((state) => state.updateEvent);

  const [eventId, setEventId] = useState("");
  const [ingredientId, setIngredientId] = useState("");
  const [qty, setQty] = useState<number | string>(1);
  const [staged, setStaged] = useState<EventIngredientLine[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (opened) void loadEvents();
  }, [opened, loadEvents]);

  const resetForm = () => {
    setEventId("");
    setIngredientId("");
    setQty(1);
    setStaged([]);
    setSaving(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const ingredientsById = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients]
  );

  const numericQty = typeof qty === "number" ? qty : Number(qty);

  const handleAdd = () => {
    const ingredient = ingredientsById.get(ingredientId);
    if (!ingredient || !Number.isFinite(numericQty) || numericQty <= 0) return;
    const roundedQty = Math.round(numericQty * 100) / 100;
    const price = Math.round(roundedQty * (ingredient.globalPrice ?? 0) * 100) / 100;
    setStaged((prev) => [...prev, { id: newLineId(), ingredientId, qty: roundedQty, price }]);
    setIngredientId("");
    setQty(1);
  };

  const handleSave = async () => {
    const event = events.find((item) => item.id === eventId);
    if (!event || staged.length === 0) return;
    setSaving(true);
    try {
      const { id, ...rest } = event;
      await updateEvent(id, { ...rest, ingredients: [...event.ingredients, ...staged] });
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={<Bilingual label={ui.tracker.assignTitle} />} {...sheet}>
      <Stack gap="md">
        <Select
          label={<Bilingual label={ui.tracker.selectEvent} />}
          placeholder={preferredText(ui.tracker.selectEvent, uiLanguage)}
          data={events.map((event) => ({
            value: event.id,
            label: event.date ? `${event.name} (${formatIndianDate(event.date)})` : event.name,
          }))}
          searchable
          value={eventId}
          onChange={(value) => setEventId(value ?? "")}
        />

        <Group gap="sm" align="flex-end" wrap="wrap">
          <Select
            label={<Bilingual label={ui.tracker.selectIngredient} />}
            placeholder={preferredText(ui.tracker.selectIngredient, uiLanguage)}
            data={ingredients.map((ingredient) => ({
              value: ingredient.id,
              label:
                uiLanguage === "ta" && ingredient.tamilName
                  ? ingredient.tamilName
                  : ingredient.name,
            }))}
            searchable
            value={ingredientId}
            onChange={(value) => setIngredientId(value ?? "")}
            style={{ flex: "1 1 160px" }}
          />
          <NumberInput
            label={<Bilingual label={ui.common.qty} />}
            value={qty}
            min={0}
            allowNegative={false}
            onChange={setQty}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
            }}
            w={110}
          />
          <Button
            leftSection={<Plus size={16} />}
            variant="default"
            disabled={!ingredientId || !Number.isFinite(numericQty) || numericQty <= 0}
            onClick={handleAdd}
          >
            <Bilingual label={ui.tracker.addItem} />
          </Button>
        </Group>

        {staged.length === 0 ? (
          <Text size="sm" c="dimmed">
            <Bilingual label={ui.tracker.noItems} />
          </Text>
        ) : (
          <Stack gap={4}>
            {staged.map((line) => {
              const ingredient = ingredientsById.get(line.ingredientId);
              const name = ingredient
                ? uiLanguage === "ta"
                  ? ingredient.tamilName || ingredient.name
                  : ingredient.name
                : line.ingredientId;
              return (
                <Group key={line.id} justify="space-between" wrap="nowrap">
                  <Text size="sm" lineClamp={1}>
                    {name}{" "}
                    <Text span size="xs" c="dimmed">
                      ({formatStock(line.qty, ingredient?.unit)} · {formatINR(line.price)})
                    </Text>
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="kumkum"
                    aria-label={`Remove ${name}`}
                    onClick={() => setStaged((prev) => prev.filter((item) => item.id !== line.id))}
                  >
                    <Trash size={16} />
                  </ActionIcon>
                </Group>
              );
            })}
          </Stack>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose}>
            <Bilingual label={ui.common.cancel} />
          </Button>
          <Button onClick={handleSave} loading={saving} disabled={!eventId || staged.length === 0}>
            <Bilingual label={ui.common.save} />
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
