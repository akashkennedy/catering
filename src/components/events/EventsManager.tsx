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
import { useEventsStore, type CateringEvent, type EventStatus } from "@/store/events";

type StatusFilter = "all" | EventStatus;

export function EventsManager() {
  const events = useEventsStore((state) => state.events);
  const deleteEvent = useEventsStore((state) => state.deleteEvent);
  const [formOpened, setFormOpened] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CateringEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<CateringEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredEvents = events.filter((event) => {
    const matchesName = event.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesDate = dateFilter === "" || event.date === dateFilter;
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesName && matchesDate && matchesStatus;
  });

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={1}>Events</Title>
        <Button
          leftSection={<Plus size={18} />}
          onClick={() => {
            setEditingEvent(null);
            setFormOpened(true);
          }}
        >
          Add Event
        </Button>
      </Group>

      <Stack gap="sm" mb="md">
        <TextInput
          placeholder="Search by name"
          leftSection={<Search size={16} />}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
        />
        <Group gap="sm" wrap="wrap">
          <Input
            type="date"
            w={180}
            placeholder="Filter by date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.currentTarget.value)}
          />
          <SegmentedControl
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
            data={[
              { label: "All", value: "all" },
              { label: "Planned", value: "planned" },
              { label: "Confirmed", value: "confirmed" },
              { label: "Completed", value: "completed" },
              { label: "Cancelled", value: "cancelled" },
            ]}
          />
        </Group>
      </Stack>

      {events.length === 0 ? (
        <Text c="dimmed">No events yet. Add one to get started.</Text>
      ) : filteredEvents.length === 0 ? (
        <Text c="dimmed">No events match your filters.</Text>
      ) : (
        <>
          <EventTable
            events={filteredEvents}
            onEdit={(event) => {
              setEditingEvent(event);
              setFormOpened(true);
            }}
            onDelete={setDeletingEvent}
          />
          <EventCards
            events={filteredEvents}
            onEdit={(event) => {
              setEditingEvent(event);
              setFormOpened(true);
            }}
            onDelete={setDeletingEvent}
          />
        </>
      )}

      <EventFormModal opened={formOpened} event={editingEvent} onClose={() => setFormOpened(false)} />

      <Modal
        opened={deletingEvent !== null}
        onClose={() => setDeletingEvent(null)}
        title="Delete event"
        centered
      >
        <Stack gap="md">
          <Text>Are you sure you want to delete &quot;{deletingEvent?.name}&quot;?</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingEvent(null)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                if (deletingEvent) deleteEvent(deletingEvent.id);
                setDeletingEvent(null);
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