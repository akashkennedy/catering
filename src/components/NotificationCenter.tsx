"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Popover,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { Bell, CalendarClock, Check, CreditCard, Package, Truck, X } from "lucide-react";
import Link from "next/link";

import { formatINR } from "@/lib/format";
import { todayLocalISO } from "@/lib/date";
import { formatPhone } from "@/lib/phone";
import { clientPendingAmount, eventEmployeePending } from "@/lib/eventFinances";
import { dueEveReminders, duePaymentReminders } from "@/lib/autoReminders";
import { preferredText, ui } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { isLowStock, remainingStock } from "@/lib/stock";
import { useRemindersStore } from "@/store/reminders";
import { useEventsStore } from "@/store/events";
import { useIngredientsStore } from "@/store/ingredients";
import { useStockLedgerStore } from "@/store/stockLedger";

type NotificationItem = {
  id: string;
  type: "reminder" | "data";
  icon: React.ReactNode;
  label: string;
  detail: string;
  href: string;
  accent: "kumkum" | "leaf";
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
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const reminders = useRemindersStore((s) => s.reminders);
  const dismissReminder = useRemindersStore((s) => s.dismissReminder);
  const dismissAllReminders = useRemindersStore((s) => s.dismissAll);
  const events = useEventsStore((s) => s.events);
  const loadEvents = useEventsStore((s) => s.loadEvents);
  const ingredients = useIngredientsStore((s) => s.ingredients);
  const ledgerEntries = useStockLedgerStore((s) => s.entries);
  const uiLanguage = useSettingsStore((s) => s.uiLanguage);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const dismiss = useCallback((id: string) => {
    if (id.startsWith("reminder-")) {
      dismissReminder(id.replace("reminder-", ""));
    }
    setHidden((prev) => new Set(prev).add(id));
  }, [dismissReminder]);

  const dismissAll = useCallback(() => {
    dismissAllReminders();
  }, [dismissAllReminders]);

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];
    const today = todayLocalISO();

    const activeReminders = reminders
      .filter((r) => !r.dismissed)
      .sort((a, b) => a.remindAt.localeCompare(b.remindAt));
    for (const r of activeReminders) {
      items.push({
        id: `reminder-${r.id}`,
        type: "reminder",
        icon: <CalendarClock size={16} />,
        label: formatPhone(r.phone),
        detail: `${formatRemindAt(r.remindAt)}${r.note ? ` · ${r.note}` : ""}`,
        href: "/follow-ups",
        accent: "leaf",
      });
    }

    for (const event of events) {
      if (event.status === "paid") continue;
      const pending = clientPendingAmount(event) + eventEmployeePending(event);
      if (pending <= 0) continue;
      items.push({
        id: `payment-${event.id}`,
        type: "data",
        icon: <CreditCard size={16} />,
        label: event.name,
        detail: `${formatINR(pending)} pending`,
        href: `/events/${event.id}`,
        accent: "kumkum",
      });
    }

    for (const event of dueEveReminders(events)) {
      items.push({
        id: `eve-${event.id}`,
        type: "data",
        icon: <CalendarClock size={16} />,
        label: preferredText(ui.autoRemind.eventTomorrow, uiLanguage),
        detail: preferredText(ui.autoRemind.eventTomorrowDetail(event.name), uiLanguage),
        href: `/events/${event.id}`,
        accent: "kumkum",
      });
    }

    for (const event of duePaymentReminders(events)) {
      items.push({
        id: `overdue-${event.id}`,
        type: "data",
        icon: <CreditCard size={16} />,
        label: preferredText(ui.autoRemind.paymentOverdue, uiLanguage),
        detail: preferredText(
          ui.autoRemind.paymentOverdueDetail(event.name, formatINR(clientPendingAmount(event))),
          uiLanguage
        ),
        href: `/events/${event.id}`,
        accent: "kumkum",
      });
    }

    for (const event of events) {
      if (["completed", "paid"].includes(event.status)) continue;
      for (const line of event.utensils ?? []) {
        if (line.returned) continue;
        items.push({
          id: `utensil-${event.id}-${line.id}`,
          type: "data",
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
          type: "data",
          icon: <Package size={16} />,
          label: ingredient.name,
          detail: `${remaining} ${ingredient.unit ?? ""} remaining`,
          href: "/ingredients",
          accent: "kumkum",
        });
      }
    }

    return items.filter((item) => !hidden.has(item.id));
  }, [reminders, events, ingredients, ledgerEntries, hidden, uiLanguage]);

  const count = notifications.length;
  const reminderCount = notifications.filter((n) => n.type === "reminder").length;

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
            <Group gap="xs">
              {count > 0 ? (
                <Badge size="sm" variant="light" color="kumkum">
                  {count}
                </Badge>
              ) : null}
              {reminderCount > 0 ? (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="kumkum"
                  onClick={dismissAll}
                  leftSection={<Check size={12} />}
                >
                  Clear reminders
                </Button>
              ) : null}
            </Group>
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
                <div key={item.id} className="notification-item">
                  <Link
                    href={item.href}
                    onClick={() => setOpened(false)}
                    className="notification-item__link"
                  >
                    <div className="notification-item__icon" style={{
                      color: item.accent === "kumkum" ? "var(--accent-kumkum)" : "var(--accent-leaf)",
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
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    color="dimmed"
                    aria-label="Dismiss"
                    onClick={() => dismiss(item.id)}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  >
                    <X size={14} />
                  </ActionIcon>
                </div>
              ))}
            </Stack>
          )}
        </ScrollArea.Autosize>
      </Popover.Dropdown>
    </Popover>
  );
}