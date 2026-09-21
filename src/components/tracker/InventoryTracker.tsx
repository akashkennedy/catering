"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Group, Select, Stack, Text, TextInput, Title } from "@mantine/core";
import { Plus } from "lucide-react";
import { useMediaQuery } from "@mantine/hooks";

import { PurchaseCards } from "./PurchaseCards";
import { PurchaseEntryModal } from "./PurchaseEntryModal";
import { PurchaseTable } from "./PurchaseTable";
import { Bilingual } from "@/components/Bilingual";
import { ListPageSkeleton } from "@/components/LoadingSkeletons";
import { formatINR } from "@/lib/format";
import { formatIndianDate, todayLocalISO } from "@/lib/date";
import { formatStock } from "@/lib/stock";
import { preferredText, ui } from "@/lib/i18n";
import {
  filterPurchasesByRange,
  summarizePurchases,
  thisMonthRange,
  thisWeekRange,
  type DateRange,
} from "@/lib/purchaseReport";
import { useIngredientsStore } from "@/store/ingredients";
import { useEventsStore } from "@/store/events";
import { useStockLedgerStore } from "@/store/stockLedger";
import { useSettingsStore } from "@/store/settings";

type Preset = "week" | "month" | "custom";

/** Browsable purchase-history view over the shared stock ledger. Read-only
 *  except for the log-purchase button, which reuses `addPurchaseEntry`. */
export function InventoryTracker() {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const entries = useStockLedgerStore((state) => state.entries);
  const ledgerLoaded = useStockLedgerStore((state) => state.loaded);
  const loadStockLedger = useStockLedgerStore((state) => state.loadStockLedger);
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const ingredientsLoaded = useIngredientsStore((state) => state.loaded);
  const loadIngredients = useIngredientsStore((state) => state.loadIngredients);
  const events = useEventsStore((state) => state.events);
  const loadEvents = useEventsStore((state) => state.loadEvents);
  const isMobile = useMediaQuery("(max-width: 639px)");

  const [preset, setPreset] = useState<Preset>("week");
  const [custom, setCustom] = useState<DateRange>(() => thisWeekRange());
  const [eventFilter, setEventFilter] = useState<string>("");
  const [logOpened, setLogOpened] = useState(false);

  useEffect(() => {
    void loadStockLedger();
    void loadIngredients();
    void loadEvents();
  }, [loadStockLedger, loadIngredients, loadEvents]);

  const range: DateRange = useMemo(() => {
    if (preset === "month") return thisMonthRange();
    if (preset === "custom") return custom;
    return thisWeekRange();
  }, [preset, custom]);

  const rangeValid = range.from <= range.to;

  const filtered = useMemo(() => {
    const inRange = rangeValid ? filterPurchasesByRange(entries, range) : [];
    if (!eventFilter) return inRange;
    return inRange.filter((entry) => entry.eventId === eventFilter);
  }, [entries, range, rangeValid, eventFilter]);
  const summary = useMemo(() => summarizePurchases(filtered), [filtered]);

  const ingredientsById = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients]
  );
  const eventsById = useMemo(
    () => new Map(events.map((event) => [event.id, event])),
    [events]
  );
  const eventsInRange = useMemo(() => {
    const ids = new Set<string>();
    for (const entry of rangeValid ? filterPurchasesByRange(entries, range) : []) {
      if (entry.eventId) ids.add(entry.eventId);
    }
    return events.filter((event) => ids.has(event.id));
  }, [entries, range, rangeValid, events]);

  const presets: { value: Preset; label: string }[] = [
    { value: "week", label: preferredText(ui.tracker.thisWeek, uiLanguage) },
    { value: "month", label: preferredText(ui.tracker.thisMonth, uiLanguage) },
    { value: "custom", label: preferredText(ui.tracker.custom, uiLanguage) },
  ];

  const loaded = ledgerLoaded && ingredientsLoaded;

  return (
    <Stack gap="lg">
      <div className="dash-card" style={{ padding: 0 }}>
        <div style={{ padding: 16 }}>
          <Group justify="space-between" mb="md" wrap="wrap">
            <div>
              <Title order={2}>
                <Bilingual label={ui.tracker.title} />
              </Title>
              <Text size="sm" c="dimmed">
                <Bilingual label={ui.tracker.subtitle} />
              </Text>
            </div>
            <Button leftSection={<Plus size={18} />} onClick={() => setLogOpened(true)}>
              <Bilingual label={ui.tracker.logPurchase} />
            </Button>
          </Group>

          <div className="ingredient-filters" role="tablist" aria-label="Date range">
            {presets.map((item) => {
              const active = preset === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`ingredient-filter-chip${active ? " ingredient-filter-chip--active" : ""}`}
                  onClick={() => setPreset(item.value)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {preset === "custom" ? (
            <Group gap="sm" mt="md" wrap="wrap">
              <TextInput
                label={<Bilingual label={ui.tracker.from} />}
                type="date"
                value={custom.from}
                max={todayLocalISO()}
                onChange={(event) =>
                  setCustom((prev) => ({ ...prev, from: event.currentTarget.value }))
                }
              />
              <TextInput
                label={<Bilingual label={ui.tracker.to} />}
                type="date"
                value={custom.to}
                max={todayLocalISO()}
                onChange={(event) =>
                  setCustom((prev) => ({ ...prev, to: event.currentTarget.value }))
                }
              />
            </Group>
          ) : null}

          <Select
            label={<Bilingual label={ui.tracker.filterEvent} />}
            placeholder={preferredText(ui.tracker.allEvents, uiLanguage)}
            data={[
              { value: "", label: preferredText(ui.tracker.allEvents, uiLanguage) },
              ...eventsInRange.map((event) => ({
                value: event.id,
                label: event.date ? `${event.name} (${formatIndianDate(event.date)})` : event.name,
              })),
            ]}
            clearable
            value={eventFilter}
            onChange={(value) => setEventFilter(value ?? "")}
            mt="md"
            maw={320}
          />

          {!loaded ? (
            <div style={{ marginTop: 16 }}>
              <ListPageSkeleton />
            </div>
          ) : !rangeValid ? (
            <Text c="red" mt="md">
              <Bilingual label={ui.tracker.invalidRange} />
            </Text>
          ) : (
            <>
              <Group gap="xl" mt="md" wrap="wrap">
                <div>
                  <Text size="xs" c="dimmed">
                    <Bilingual label={ui.tracker.totalSpent} />
                  </Text>
                  <Text fw={700} size="xl">
                    {formatINR(summary.totalSpent)}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    &nbsp;
                  </Text>
                  <Text fw={600} size="lg">
                    <Bilingual label={ui.tracker.entries(summary.count)} />
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    &nbsp;
                  </Text>
                  <Text size="sm" c="dimmed">
                    {range.from === range.to
                      ? formatIndianDate(range.from)
                      : `${formatIndianDate(range.from)} – ${formatIndianDate(range.to)}`}
                  </Text>
                </div>
              </Group>

              {summary.byIngredient.length > 0 ? (
                <div style={{ marginTop: 12 }}>
                  <Text size="sm" fw={600} mb={4}>
                    <Bilingual label={ui.tracker.byIngredient} />
                  </Text>
                  <Stack gap={2}>
                    {summary.byIngredient.map((row) => {
                      const ingredient = ingredientsById.get(row.ingredientId);
                      const name = ingredient
                        ? uiLanguage === "ta"
                          ? ingredient.tamilName || ingredient.name
                          : ingredient.name
                        : row.ingredientId;
                      return (
                        <Group key={row.ingredientId} justify="space-between" wrap="nowrap">
                          <Text size="sm" lineClamp={1}>
                            {name}{" "}
                            <Text span size="xs" c="dimmed">
                              ({formatStock(row.qty, ingredient?.unit)})
                            </Text>
                          </Text>
                          <Text size="sm" fw={600}>
                            {formatINR(row.cost)}
                          </Text>
                        </Group>
                      );
                    })}
                  </Stack>
                </div>
              ) : null}

              <div style={{ marginTop: 16 }}>
                {filtered.length === 0 ? (
                  <Text c="dimmed">
                    <Bilingual label={ui.tracker.empty} />
                  </Text>
                ) : isMobile ? (
                  <PurchaseCards entries={filtered} ingredientsById={ingredientsById} eventsById={eventsById} />
                ) : (
                  <PurchaseTable entries={filtered} ingredientsById={ingredientsById} eventsById={eventsById} />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <PurchaseEntryModal opened={logOpened} onClose={() => setLogOpened(false)} />
    </Stack>
  );
}
