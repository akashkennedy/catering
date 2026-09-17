"use client";

import { useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Group,
  Popover,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { Bell, CalendarClock, Check, CreditCard, Package, Truck } from "lucide-react";
import Link from "next/link";

import { Bilingual } from "@/components/Bilingual";
import { ui, labelText } from "@/lib/i18n";
import { formatINR } from "@/lib/format";
import { formatIndianDate, todayLocalISO } from "@/lib/date";
import { formatPhone } from "@/lib/phone";
import { clientPendingAmount, eventEmployeePending } from "@/lib/eventFinances";
import { isLowStock, remainingStock } from "@/lib/stock";
import { isVesselLow, vesselAvailability } from "@/lib/vesselStock";
import { useRemindersStore } from "@/store/reminders";
import { useEventsStore } from "@/store/events";
import { useIngredientsStore } from "@/store/ingredients";
import { useStockLedgerStore } from "@/store/stockLedger";
import { useUtensilsStore } from "@/store/utensils";
import { useVesselStockLedgerStore } from "@/store/vesselStockLedger";

type NotificationItem = {
  id: string;
  icon: React.ReactNode;
  label: string;
  detail: string;
  href: string;
  accent: "kumkum" | "turmeric";
};

function formatRemindAt(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  if (diffMs < 0) return "overdue";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `in ${hrs}h`;
  return `in ${Math.floor(hrs / 24)}d`;
}

export function NotificationCenter() {
  const [opened, setOpened] = useState(false);

  const reminders = useRemindersStore((s) => s.reminders);
  const dismissReminder = useRemindersStore((s) => s.dismissReminder);
  const events = useEventsStore((s) => s.events);
  const ingredients = useIngredientsStore((s) => s.ingredients);
  const ledgerEntries = useStockLedgerStore((s) => s.entries);
  const utensils = useUtensilsStore((s) => s.utensils);
  const vesselEntries = useVesselStockLedgerStore((s) => s.entries);

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];
    const today = todayLocalISO();
    const upcomingIds = new Set(
      events.filter((e) => e.date >= today).map((e) => e.id)
    );

    const activeReminders = reminders
      .filter((r) => !r.dismissed)
      .sort((a, b) => a.remindAt.localeCompare(b.remindAt));
    for (const r of activeReminders) {
      items.push({
        id: `reminder-${r.id}`,
        icon: <CalendarClock size={16} />,
        label: formatPhone(r.phone),
        detail: `${formatRemindAt(r.remindAt)}${r.note ? ` · ${r.note}` : ""}`,
        href: "/",
        accent: "turmeric",
      });
    }

    for (const event of events) {
      if (event.status === "paid") continue;
      const pending = clientPendingAmount(event) + eventEmployeePending(event);
      if (pending <= 0) continue;
      items.push({
        id: `payment-${event.id}`,
        icon: <CreditCard size={16} />,
        label: event.name,
        detail: `${formatINR(pending)} pending`,
        href: `/events/${event.id}`,
        accent: "kumkum",
      });
    }

    for (const event of events) {
      if (["completed", "paid"].includes(event.status)) continue;
      for (const line of event.utensils ?? []) {
        if (line.returned) continue;
        items.push({
          id: `utensil-${event.id}-${line.utensilId ?? line.utensilName}`,
          icon: <Truck size={16} />,
          label: line.utensilName,
          detail: `${line.qty}× · ${event.name}`,
          href: `/events/${event.id}`,
          accent: "kumkum",
        });
      }
    }

    for (const ingredient of ingredients) {
      if (isLowStock(ingredient, ledgerEntries)) {
        const remaining = remainingStock(ingredient, ledgerEntries);
        items.push({
          id: `stock-${ingredient.id}`,
          icon: <Package size={16} />,
          label: ingredient.name,
          detail: `${remaining} ${ingredient.unit ?? ""} remaining`,
          href: "/ingredients",
          accent: "kumkum",
        });
      }
    }

    for (const utensil of utensils) {
      if (isVesselLow(utensil, vesselEntries)) {
        const available = vesselAvailability(utensil, vesselEntries);
        items.push({
          id: `vessel-${utensil.id}`,
          icon: <Package size={16} />,
          label: utensil.name,
          detail: `${available} available`,
          href: "/utensils",
          accent: "kumkum",
        });
      }
    }

    return items;
  }, [reminders, events, ingredients, ledgerEntries, utensils, vesselEntries]);

  const count = notifications.length;

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      width={360}
      position="bottom-end"
      shadow="md"
      withinPortal
    >
      <Popover.Target>
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => setOpened((o) => !o)}
          aria-label={`Notifications (${count})`}
          style={{ position: "relative" }}
        >
          <Bell size={20} style={{ color: "var(--ink-muted)" }} />
          {count > 0 ? (
            <span
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--accent-kumkum)",
                border: "2px solid var(--surface)",
              }}
            />
          ) : null}
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          padding: 0,
        }}
      >
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <Group justify="space-between">
            <Text fw={600} size="sm" style={{ color: "var(--ink)" }}>
              Notifications
            </Text>
            {count > 0 ? (
              <Badge size="sm" variant="light" color="kumkum">
                {count}
              </Badge>
            ) : null}
          </Group>
        </div>
        <ScrollArea.Autosize mah={360}>
          {count === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center" }}>
              <Text size="sm" c="dimmed">
                All clear.
              </Text>
            </div>
          ) : (
            <Stack gap={0}>
              {notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpened(false)}
                  className="notification-item"
                >
                  <div className="notification-item__icon" style={{
                    color: item.accent === "kumkum" ? "var(--accent-kumkum)" : "var(--accent-turmeric)",
                  }}>
                    {item.icon}
                  </div>
                  <div className="notification-item__body">
                    <Text size="sm" fw={500} style={{ color: "var(--ink)" }} lineClamp={1}>
                      {item.label}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {item.detail}
                    </Text>
                  </div>
                </Link>
              ))}
            </Stack>
          )}
        </ScrollArea.Autosize>
      </Popover.Dropdown>
    </Popover>
  );
}