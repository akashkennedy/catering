"use client";

import { useState } from "react";
import {
  Button,
  Group,
  Input,
  Modal,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Plus, Search } from "lucide-react";

import { EventCards } from "./EventCards";
import { EventFormModal } from "./EventFormModal";
import { EventTable } from "./EventTable";
import { Bilingual } from "@/components/Bilingual";
import { ui, preferredText } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { useEventsStore, type CateringEvent, type EventStatus } from "@/store/events";

type StatusFilter = "all" | EventStatus;

const STATUS_FILTER_DATA: { label: React.ReactNode; value: StatusFilter }[] = [
  { label: <Bilingual label={ui.events.statusAll} />, value: "all" },
  { label: <Bilingual label={ui.events.statusEnquiry} />, value: "enquiry" },
  { label: <Bilingual label={ui.events.statusConfirmed} />, value: "confirmed" },
  { label: <Bilingual label={ui.events.statusPreparing} />, value: "preparing" },
  { label: <Bilingual label={ui.events.statusCompleted} />, value: "completed" },
  { label: <Bilingual label={ui.events.statusPaid} />, value: "paid" },
];

export function EventsManager() {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const events = useEventsStore((state) => state.events);
  const deleteEvent = useEventsStore((state) => state.deleteEvent);
  const [manualOpen, setManualOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CateringEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<CateringEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const formOpened = manualOpen;

  const filteredEvents = events.filter((event) => {
    const matchesName = event.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesDate = dateFilter === "" || event.date === dateFilter;
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesName && matchesDate && matchesStatus;
  });

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={1}>
          <Bilingual label={ui.nav.events} />
        </Title>
        <Button
          leftSection={<Plus size={18} />}
          onClick={() => {
            setEditingEvent(null);
            setManualOpen(true);
          }}
        >
          <Bilingual label={ui.events.addEvent} />
        </Button>
      </Group>

      <Stack gap="sm" mb="md">
        <TextInput
          placeholder={preferredText(ui.events.searchByName, uiLanguage)}
          leftSection={<Search size={16} />}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
        />
        <Group gap="sm" wrap="wrap">
          <Input
            type="date"
            w={180}
            placeholder={preferredText(ui.events.filterByDate, uiLanguage)}
            value={dateFilter}
            onChange={(event) => setDateFilter(event.currentTarget.value)}
          />
          <SegmentedControl
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
            data={STATUS_FILTER_DATA}
          />
        </Group>
      </Stack>

      {events.length === 0 ? (
        <Text c="dimmed">
          <Bilingual label={ui.events.empty} />
        </Text>
      ) : filteredEvents.length === 0 ? (
        <Text c="dimmed">
          <Bilingual label={ui.events.emptyFiltered} />
        </Text>
      ) : (
        <>
          <EventTable
            events={filteredEvents}
            onEdit={(event) => {
              setEditingEvent(event);
              setManualOpen(true);
            }}
            onDelete={setDeletingEvent}
          />
          <EventCards
            events={filteredEvents}
            onEdit={(event) => {
              setEditingEvent(event);
              setManualOpen(true);
            }}
            onDelete={setDeletingEvent}
          />
        </>
      )}

      <EventFormModal
        opened={formOpened}
        event={editingEvent}
        onClose={() => {
          setManualOpen(false);
        }}
      />

      <Modal
        opened={deletingEvent !== null}
        onClose={() => setDeletingEvent(null)}
        title={<Bilingual label={ui.events.deleteTitle} />}
        centered
      >
        <Stack gap="md">
          <Text>
            <Bilingual
              label={
                deletingEvent
                  ? ui.deleteConfirm(deletingEvent.name)
                  : { en: "", ta: "" }
              }
            />
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingEvent(null)}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button
              color="kumkum"
              onClick={() => {
                if (deletingEvent) deleteEvent(deletingEvent.id);
                setDeletingEvent(null);
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