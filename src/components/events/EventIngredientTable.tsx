"use client";

import { NumberInput, Switch, Table, Text } from "@mantine/core";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import type { Ingredient } from "@/store/ingredients";
import type { EventIngredientLine } from "@/store/events";
import { normalizeUnit } from "@/lib/units";

type EventIngredientTableProps = {
  lines: EventIngredientLine[];
  ingredients: Ingredient[];
  onLineChange: (
    lineId: string,
    patch: { qty?: number; price?: number; purchased?: boolean }
  ) => void;
};

export function EventIngredientTable({
  lines,
  ingredients,
  onLineChange,
}: EventIngredientTableProps) {
  return (
    <div className="hidden sm:block">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th><Bilingual label={{ en: "Ingredient", ta: "பொருள்" }} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.qty} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.unit} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.price} /></Table.Th>
            <Table.Th><Bilingual label={ui.events.purchased} /></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {lines.map((line) => {
            const ingredient = ingredients.find((item) => item.id === line.ingredientId);
            return (
              <Table.Tr key={line.id}>
                <Table.Td>
                  <Text fw={500}>
                    {ingredient?.name ?? <Bilingual label={ui.events.unknownIngredient} />}
                  </Text>
                  {ingredient?.tamilName && (
                    <Text size="xs" c="dimmed">
                      {ingredient.tamilName}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    value={line.qty}
                    min={0}
                    allowNegative={false}
                    w={110}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                    }}
                    onChange={(value) =>
                      onLineChange(line.id, { qty: typeof value === "number" ? value : 0 })
                    }
                  />
                </Table.Td>
                <Table.Td>{normalizeUnit(ingredient?.unit) || "—"}</Table.Td>
                <Table.Td>
                  <NumberInput
                    value={line.price}
                    min={0}
                    allowNegative={false}
                    decimalScale={2}
                    w={130}
                    leftSection="₹"
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                    }}
                    onChange={(value) =>
                      onLineChange(line.id, { price: typeof value === "number" ? value : 0 })
                    }
                  />
                </Table.Td>
                <Table.Td>
                  <Switch
                    checked={line.purchased}
                    onChange={() => onLineChange(line.id, { purchased: !line.purchased })}
                    size="sm"
                  />
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </div>
  );
}