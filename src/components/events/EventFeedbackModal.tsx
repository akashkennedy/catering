"use client";

import { useState } from "react";
import { Button, Group, Modal, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { Star } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { preferredText, ui } from "@/lib/i18n";
import { useMobileSheet } from "@/hooks/useMobileSheet";
import { useSettingsStore } from "@/store/settings";
import type { CateringEvent } from "@/store/events";
import { useSiteContentStore } from "@/store/siteContent";

type EventFeedbackModalProps = {
  opened: boolean;
  event: CateringEvent | null;
  onClose: () => void;
};

/**
 * Collects a star rating + review when an event completes and saves it
 * straight into the website testimonials (visible on the landing page
 * immediately, published to the site on the next Publish).
 */
export function EventFeedbackModal({ opened, event, onClose }: EventFeedbackModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("sheet");
  const addTestimonial = useSiteContentStore((state) => state.addTestimonial);

  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [author, setAuthor] = useState("");
  const [lastOpenedEvent, setLastOpenedEvent] = useState<string | null>(null);

  // Reset the form whenever a (new) event's feedback is opened.
  const openedKey = opened ? (event?.id ?? "new") : null;
  if (openedKey !== lastOpenedEvent) {
    setLastOpenedEvent(openedKey);
    if (opened) {
      setRating(5);
      setReview("");
      setAuthor(event?.name ?? "");
    }
  }

  const canSave = review.trim().length > 0 && author.trim().length > 0;

  const handleSave = () => {
    if (!event || !canSave) return;
    addTestimonial({
      quoteEn: review.trim(),
      quoteTa: review.trim(),
      author: author.trim(),
      event: event.name,
      place: event.venue || event.address,
      rating,
      source: "manual",
      profileUrl: "",
      authorPhotoUrl: "",
      googleReviewId: "",
    });
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={<Bilingual label={ui.feedback.title} />} {...sheet}>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.feedback.subtitle} />
        </Text>

        <div>
          <Text size="sm" fw={500} mb={4}>
            <Bilingual label={ui.feedback.rating} />
          </Text>
          <Group gap={4} role="radiogroup" aria-label={preferredText(ui.feedback.rating, uiLanguage)}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                aria-label={`${value} stars`}
                onClick={() => setRating(value)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  color: value <= rating ? "var(--accent-leaf)" : "var(--ink-muted)",
                  opacity: value <= rating ? 1 : 0.45,
                }}
              >
                <Star
                  size={28}
                  fill={value <= rating ? "currentColor" : "none"}
                  aria-hidden
                />
              </button>
            ))}
          </Group>
        </div>

        <Textarea
          label={<Bilingual label={ui.feedback.review} />}
          placeholder={preferredText(ui.feedback.reviewPlaceholder, uiLanguage)}
          value={review}
          onChange={(e) => setReview(e.currentTarget.value)}
          minRows={3}
          autosize
        />

        <TextInput
          label={<Bilingual label={ui.feedback.author} />}
          value={author}
          onChange={(e) => setAuthor(e.currentTarget.value)}
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            <Bilingual label={ui.feedback.skip} />
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            <Bilingual label={ui.common.save} />
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
