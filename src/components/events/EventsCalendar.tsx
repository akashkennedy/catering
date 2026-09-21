"use client";

import { useMemo, useState } from "react";
import {
  ActionIcon,
  Anchor,
  Badge,
  Group,
  Modal,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { useMobileSheet } from "@/hooks/useMobileSheet";
import { formatIndianDate, todayLocalISO } from "@/lib/date";
import { preferredText, ui } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import type { CateringEvent, EventStatus } from "@/store/events";
import { EVENT_STATUS_OPTIONS } from "./EventFormModal";

const STATUS_COLORS: Record<EventStatus, string> = {
  enquiry: "blue",
  confirmed: "cyan",
  preparing: "violet",
  completed: "teal",
  paid: "green",
};

function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(key: string, delta: number): string {
  const [year, month] = key.split("-").map(Number);
  const shifted = new Date(year, month - 1 + delta, 1);
  return monthKeyOf(shifted);
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Month-grid calendar over the (already filtered) events. Monday-first. */
export function EventsCalendar({ events }: { events: CateringEvent[] }) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("sheet");
  const today = todayLocalISO();
  const [monthKey, setMonthKey] = useState(() => today.slice(0, 7));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const map = new Map<string, CateringEvent[]>();
    for (const event of events) {
      if (!isIsoDate(event.date)) continue;
      const bucket = map.get(event.date) ?? [];
      bucket.push(event);
      map.set(event.date, bucket);
    }
    return map;
  }, [events]);

  const [year, monthIndex] = useMemo(() => {
    const [y, m] = monthKey.split("-").map(Number);
    return [y, m - 1] as const;
  }, [monthKey]);

  const cells = useMemo(() => {
    const first = new Date(year, monthIndex, 1);
    const leading = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const list: (number | null)[] = [];
    for (let i = 0; i < leading; i += 1) list.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) list.push(day);
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [year, monthIndex]);

  const monthLabel = `${preferredText(ui.events.monthNames[monthIndex] ?? { en: monthKey, ta: monthKey }, uiLanguage)} ${year}`;
  const selectedEvents = selectedDay ? (byDate.get(selectedDay) ?? []) : [];
  const statusLabel = (status: EventStatus) =>
    EVENT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? {
      en: status,
      ta: "",
    };

  return (
    <>
      <div className="dash-card">
        <Group justify="space-between" align="center" mb="sm" wrap="nowrap">
          <Title order={3}>{monthLabel}</Title>
          <Group gap="xs" wrap="nowrap">
            <ActionIcon
              variant="default"
              aria-label={preferredText(ui.events.prevMonth, uiLanguage)}
              onClick={() => setMonthKey((key) => shiftMonth(key, -1))}
            >
              <ChevronLeft size={16} />
            </ActionIcon>
            <ActionIcon
              variant="default"
              aria-label={preferredText(ui.events.nextMonth, uiLanguage)}
              onClick={() => setMonthKey((key) => shiftMonth(key, 1))}
            >
              <ChevronRight size={16} />
            </ActionIcon>
          </Group>
        </Group>
        <Group justify="flex-start" mb="sm">
          <button
            type="button"
            className="app-nav-item"
            style={{ cursor: "pointer", background: "none", border: "none", padding: "8px 12px" }}
            onClick={() => setMonthKey(today.slice(0, 7))}
          >
            <span className="app-nav-item__label">
              <Bilingual label={ui.events.today} />
            </span>
          </button>
        </Group>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: 4,
            minWidth: 0,
          }}
        >
          {ui.events.weekdayNamesShort.map((label) => (
            <Text key={label.en} size="xs" fw={700} c="dimmed" ta="center">
              <Bilingual label={label} />
            </Text>
          ))}
          {cells.map((day, index) => {
            if (day === null) {
              return <span key={`blank-${index}`} aria-hidden />;
            }
            const iso = `${monthKey}-${String(day).padStart(2, "0")}`;
            const dayEvents = byDate.get(iso) ?? [];
            const isToday = iso === today;
            const isSelected = iso === selectedDay;
            if (dayEvents.length === 0) {
              return (
                <span
                  key={iso}
                  aria-disabled
                  style={{
                    minWidth: 0,
                    minHeight: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    border: isToday
                      ? "2px solid var(--accent-leaf)"
                      : "1px solid transparent",
                    color: "var(--ink-muted)",
                    fontSize: "0.875rem",
                  }}
                >
                  {day}
                </span>
              );
            }
            return (
              <UnstyledButton
                key={iso}
                aria-label={`${iso} · ${preferredText(ui.eventsCount(dayEvents.length), uiLanguage)}`}
                onClick={() => setSelectedDay(iso)}
                style={{
                  minWidth: 0,
                  minHeight: 44,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  borderRadius: 8,
                  border: isSelected
                    ? "2px solid var(--accent-leaf)"
                    : isToday
                      ? "2px solid var(--accent-leaf)"
                      : "1px solid var(--border)",
                  background: isSelected
                    ? "color-mix(in srgb, var(--accent-leaf) 22%, transparent)"
                    : "color-mix(in srgb, var(--accent-leaf) 10%, transparent)",
                  color: "var(--ink)",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                }}
              >
                {day}
                <Badge color="leaf" variant="filled" size="xs">
                  {dayEvents.length}
                </Badge>
              </UnstyledButton>
            );
          })}
        </div>
      </div>

      <Modal
        opened={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? formatIndianDate(selectedDay) : ""}
        {...sheet}
      >
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            <Bilingual label={ui.eventsCount(selectedEvents.length)} />
          </Text>
          {selectedEvents.length === 0 ? (
            <Text size="sm" c="dimmed">
              <Bilingual label={ui.events.noEventsOnDay} />
            </Text>
          ) : (
            selectedEvents.map((event) => (
              <Group key={event.id} justify="space-between" align="center" wrap="nowrap">
                <Anchor
                  component={Link}
                  href={`/events/${event.id}`}
                  fw={600}
                  onClick={() => setSelectedDay(null)}
                  style={{ minWidth: 0 }}
                >
                  {event.name}
                </Anchor>
                <Badge color={STATUS_COLORS[event.status]} variant="light" size="sm">
                  <Bilingual label={statusLabel(event.status)} />
                </Badge>
              </Group>
            ))
          )}
        </Stack>
      </Modal>
    </>
  );
}
