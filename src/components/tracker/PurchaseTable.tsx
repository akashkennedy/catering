"use client";

import { Table, Text } from "@mantine/core";

import { Bilingual } from "@/components/Bilingual";
import { formatINR } from "@/lib/format";
import { formatIndianDate } from "@/lib/date";
import { formatStock } from "@/lib/stock";
import { preferredText, ui } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import type { Ingredient } from "@/store/ingredients";
import type { StockLedgerEntry } from "@/store/stockLedger";

type PurchaseTableProps = {
  entries: StockLedgerEntry[];
  ingredientsById: Map<string, Ingredient>;
};

function ingredientName(
  ingredient: Ingredient | undefined,
  uiLanguage: "en" | "ta",
  fallbackId: string
): string {
  if (!ingredient) return fallbackId;
  if (uiLanguage === "ta") return ingredient.tamilName || ingredient.name;
  return ingredient.name;
}

/** Desktop purchase-history table (hidden on mobile — cards take over). */
export function PurchaseTable({ entries, ingredientsById }: PurchaseTableProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  return (
    <div className="hidden sm:block">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 40 }}>#</Table.Th>
            <Table.Th>
              <Bilingual label={ui.common.date} />
            </Table.Th>
            <Table.Th>
              <Bilingual label={ui.common.name} />
            </Table.Th>
            <Table.Th>
              <Bilingual label={ui.common.qty} />
            </Table.Th>
            <Table.Th>
              <Bilingual label={ui.common.price} />
            </Table.Th>
            <Table.Th style={{ textAlign: "right" }}>
              <Bilingual label={ui.tracker.cost} />
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {entries.map((entry, index) => {
            const ingredient = ingredientsById.get(entry.ingredientId);
            const price = entry.price ?? 0;
            return (
              <Table.Tr key={entry.id}>
                <Table.Td c="dimmed">{index + 1}</Table.Td>
                <Table.Td>{entry.date ? formatIndianDate(entry.date) : "—"}</Table.Td>
                <Table.Td>
                  {ingredientName(ingredient, uiLanguage, entry.ingredientId)}
                  {entry.note ? (
                    <Text size="xs" c="dimmed">
                      {entry.note}
                    </Text>
                  ) : null}
                </Table.Td>
                <Table.Td>{formatStock(entry.qty, ingredient?.unit)}</Table.Td>
                <Table.Td>
                  {price > 0 ? (
                    formatINR(price)
                  ) : (
                    <Text size="sm" c="dimmed">
                      {preferredText(ui.tracker.noPrice, uiLanguage)}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }} fw={600}>
                  {formatINR(Math.round(entry.qty * price * 100) / 100)}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </div>
  );
}
