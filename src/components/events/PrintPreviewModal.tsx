"use client";

import { useState } from "react";
import { Button, Group, Modal, SegmentedControl, Stack, Text } from "@mantine/core";
import { Download, MessageCircle } from "lucide-react";
import { useMediaQuery } from "@mantine/hooks";

import { Bilingual } from "@/components/Bilingual";
import { preferredText, ui } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { useMobileSheet } from "@/hooks/useMobileSheet";
import { formatINR } from "@/lib/format";
import type { Ingredient } from "@/store/ingredients";
import type { CateringEvent, EventIngredientLine } from "@/store/events";
import type { IngredientTag } from "@/lib/ingredientTags";
import type { PdfLang } from "@/lib/pdf";
import { presentTags, tagOfLine } from "@/lib/printLines";
import { EventIngredientCards } from "./EventIngredientCards";
import { EventIngredientTable } from "./EventIngredientTable";

type PrintPreviewModalProps = {
  opened: boolean;
  event: CateringEvent;
  ingredients: Ingredient[];
  onLineChange: (lineId: string, patch: { qty?: number; price?: number }) => void;
  onClose: () => void;
};

/** Previews an event document and downloads the selected PDF format. */
export function PrintPreviewModal({
  opened,
  event,
  ingredients,
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
  const [pdfLang, setPdfLang] = useState<PdfLang>(uiLanguage === "ta" ? "ta" : "en");
  // Render only the matching list variant (table xor cards) instead of
  // mounting both and hiding one with CSS.
  const isMobile = useMediaQuery("(max-width: 639px)");

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
      // The PDF engine (~1MB) loads only when the user actually downloads.
      const { generateBuyListPdf, generateDetailedPdf } = await import("@/lib/pdf");
      const lines: EventIngredientLine[] = visibleLines;
      if (kind === "buy") {
        await generateBuyListPdf(event, ingredients, lines, selectedTags, pdfLang);
      } else {
        await generateDetailedPdf(event, ingredients, lines, selectedTags, pdfLang);
      }
    } finally {
      setGenerating(null);
    }
  };

  const sendWhatsApp = async (kind: "buy" | "detailed") => {
    const { buildCustomerWhatsAppUrl } = await import("@/lib/pdf");
    const url = buildCustomerWhatsAppUrl(event, subtotal, pdfLang, kind);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
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
          <Group gap="xs">
            {availableTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={active}
                  className={`ingredient-filter-chip${active ? " ingredient-filter-chip--active" : ""}`}
                  onClick={() =>
                    setTagOverride({
                      eventId: event.id,
                      tags: active
                        ? selectedTags.filter((item) => item !== tag)
                        : [...selectedTags, tag],
                    })
                  }
                >
                  {preferredText(ui.ingredients.tags[tag], uiLanguage)}
                </button>
              );
            })}
          </Group>
        </div>

        {visibleLines.length === 0 ? (
          <Text size="sm" c="dimmed">
            <Bilingual label={ui.events.noIngredients} />
          </Text>
        ) : isMobile ? (
          <EventIngredientCards
            lines={visibleLines}
            ingredients={ingredients}
            onLineChange={onLineChange}
          />
        ) : (
          <EventIngredientTable
            lines={visibleLines}
            ingredients={ingredients}
            onLineChange={onLineChange}
          />
        )}

        <Group justify="space-between" align="baseline">
          <Text fw={600}>
            <Bilingual label={ui.events.runningTotal} />
          </Text>
          <Text fw={700}>{formatINR(subtotal)}</Text>
        </Group>

        <div>
          <Text size="sm" fw={500} mb={4}>
            <Bilingual label={ui.events.pdfLanguage} />
          </Text>
          <SegmentedControl
            fullWidth
            value={pdfLang}
            onChange={(value) => setPdfLang(value === "ta" ? "ta" : "en")}
            data={[
              { value: "en", label: preferredText(ui.events.pdfEnglish, uiLanguage) },
              { value: "ta", label: preferredText(ui.events.pdfTamil, uiLanguage) },
            ]}
          />
        </div>

        <div className="btn-row-stack">
          <Button
            variant="default"
            leftSection={<Download size={18} />}
            loading={generating === "buy"}
            disabled={visibleLines.length === 0}
            onClick={() => download("buy")}
          >
            <Bilingual label={ui.events.buyListPdf} /> ({pdfLang === "ta" ? "தமிழ்" : "English"})
          </Button>
          <Button
            leftSection={<Download size={18} />}
            loading={generating === "detailed"}
            disabled={visibleLines.length === 0}
            onClick={() => download("detailed")}
          >
            <Bilingual label={ui.events.detailedPdf} /> ({pdfLang === "ta" ? "தமிழ்" : "English"})
          </Button>
        </div>

        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            <Bilingual label={ui.events.whatsappNote} />
          </Text>
          {(() => {
            const digits = (event.phone ?? "").replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
            const valid = digits.length === 10;
            if (!valid) {
              return (
                <Text size="sm" c="red">
                  <Bilingual label={ui.events.invalidCustomerPhone} />
                </Text>
              );
            }
            return (
              <div className="btn-row-stack">
                <Button
                  variant="light"
                  color="green"
                  leftSection={<MessageCircle size={18} />}
                  disabled={visibleLines.length === 0}
                  onClick={() => sendWhatsApp("buy")}
                >
                  <Bilingual label={ui.events.sendBuyListWhatsApp} />
                </Button>
                <Button
                  variant="light"
                  color="green"
                  leftSection={<MessageCircle size={18} />}
                  disabled={visibleLines.length === 0}
                  onClick={() => sendWhatsApp("detailed")}
                >
                  <Bilingual label={ui.events.sendDetailedWhatsApp} />
                </Button>
              </div>
            );
          })()}
        </Stack>
      </Stack>
    </Modal>
  );
}
