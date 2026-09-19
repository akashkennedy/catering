"use client";

import { useState } from "react";
import { Button, Chip, Group, Modal, Stack, Text } from "@mantine/core";
import { Download } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { preferredText, ui } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { useMobileSheet } from "@/hooks/useMobileSheet";
import { formatINR } from "@/lib/format";
import type { Ingredient } from "@/store/ingredients";
import type { CateringEvent, EventIngredientLine } from "@/store/events";
import type { IngredientTag } from "@/lib/ingredientTags";
import {
  generateBuyListPdf,
  generateDetailedPdf,
  presentTags,
  tagOfLine,
} from "@/lib/pdf";
import { EventIngredientCards } from "./EventIngredientCards";
import { EventIngredientTable } from "./EventIngredientTable";

type PrintPreviewModalProps = {
  opened: boolean;
  event: CateringEvent;
  ingredients: Ingredient[];
  usedIngredientIds: Set<string>;
  onMarkUsed: (lineId: string) => void;
  onLineChange: (lineId: string, patch: { qty?: number; price?: number }) => void;
  onClose: () => void;
};

export function PrintPreviewModal({
  opened,
  event,
  ingredients,
  usedIngredientIds,
  onMarkUsed,
  onLineChange,
  onClose,
}: PrintPreviewModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("full", "lg");
  const [tagOverride, setTagOverride] = useState<{
    eventId: string;
    tags: IngredientTag[];
  } | null>(null);
  const [generating, setGenerating] = useState<"buy" | "detailed" | null>(null);

  const availableTags = presentTags(event.ingredients ?? [], ingredients);
  const selectedTags =
    tagOverride && tagOverride.eventId === event.id ? tagOverride.tags : availableTags;

  const visibleLines = (event.ingredients ?? []).filter((line) =>
    selectedTags.includes(tagOfLine(line, ingredients))
  );
  const subtotal = visibleLines.reduce((sum, line) => sum + line.price, 0);

  const download = async (kind: "buy" | "detailed") => {
    setGenerating(kind);
    try {
      const lines: EventIngredientLine[] = visibleLines;
      if (kind === "buy") {
        await generateBuyListPdf(event, ingredients, lines, selectedTags);
      } else {
        await generateDetailedPdf(event, ingredients, lines, selectedTags);
      }
    } finally {
      setGenerating(null);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={ui.events.printPreview} />}
      {...sheet}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.events.printNote} />
        </Text>

        <div>
          <Text size="sm" fw={500} mb={4}>
            <Bilingual label={ui.events.printCategories} />
          </Text>
          <Chip.Group
            multiple
            value={selectedTags}
            onChange={(value) =>
              setTagOverride({ eventId: event.id, tags: value as IngredientTag[] })
            }
          >
            <Group gap="xs">
              {availableTags.map((tag) => (
                <Chip key={tag} value={tag} size="sm">
                  {preferredText(ui.ingredients.tags[tag], uiLanguage)}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        </div>

        {visibleLines.length === 0 ? (
          <Text size="sm" c="dimmed">
            <Bilingual label={ui.events.noIngredients} />
          </Text>
        ) : (
          <>
            <EventIngredientTable
              lines={visibleLines}
              ingredients={ingredients}
              usedIngredientIds={usedIngredientIds}
              onMarkUsed={onMarkUsed}
              onLineChange={onLineChange}
            />
            <EventIngredientCards
              lines={visibleLines}
              ingredients={ingredients}
              usedIngredientIds={usedIngredientIds}
              onMarkUsed={onMarkUsed}
              onLineChange={onLineChange}
            />
          </>
        )}

        <Group justify="space-between" align="baseline">
          <Text fw={600}>
            <Bilingual label={ui.events.runningTotal} />
          </Text>
          <Text fw={700}>{formatINR(subtotal)}</Text>
        </Group>

        <Group grow>
          <Button
            variant="default"
            leftSection={<Download size={18} />}
            loading={generating === "buy"}
            disabled={visibleLines.length === 0}
            onClick={() => download("buy")}
          >
            <Bilingual label={ui.events.buyListPdf} />
          </Button>
          <Button
            leftSection={<Download size={18} />}
            loading={generating === "detailed"}
            disabled={visibleLines.length === 0}
            onClick={() => download("detailed")}
          >
            <Bilingual label={ui.events.detailedPdf} />
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
