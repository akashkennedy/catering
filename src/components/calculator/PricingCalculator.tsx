"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calculator } from "lucide-react";
import { z } from "zod";

import { Bilingual } from "@/components/Bilingual";
import { CheckRow } from "@/components/CheckRow";
import { formatINR } from "@/lib/format";
import { ui, preferredText } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { dishDisplayName, templateDisplayName, useTemplatesStore } from "@/store/templates";
import { useIngredientsStore } from "@/store/ingredients";
import { buildScaledIngredients, resolveGroupDishes } from "@/store/events";
import { useEventDraftStore } from "@/store/eventDraft";

const calculatorSchema = z.object({
  templateId: z.string().nullable(),
  headcount: z.coerce.number().min(1, "Headcount must be 1 or more"),
  markup: z.coerce.number().min(0, "Markup must be 0 or more"),
});

type CalculatorValues = z.infer<typeof calculatorSchema>;

export function PricingCalculator() {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const router = useRouter();
  const templates = useTemplatesStore((state) => state.templates);
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const setPrefill = useEventDraftStore((state) => state.setPrefill);

  const { control, handleSubmit } = useForm<CalculatorValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: { templateId: null, headcount: 100, markup: 0 },
  });

  const templateId = useWatch({ control, name: "templateId" }) as string | null;
  const headcount = useWatch({ control, name: "headcount" }) as number;
  const markup = useWatch({ control, name: "markup" }) as number;

  const template = templates.find((t) => t.id === templateId) ?? null;
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);
  const effectiveTemplate = template
    ? { ...template, dishes: resolveGroupDishes(template, selectedDishIds) }
    : null;
  const allDishIds = (template?.dishes ?? []).map((dish) => dish.id);
  const checkedDishIds = selectedDishIds.length > 0 ? selectedDishIds : allDishIds;
  const scaledLines = buildScaledIngredients(effectiveTemplate, ingredients, headcount || 0);
  const rawCost = scaledLines.reduce((sum, line) => sum + line.price, 0);
  const suggestedQuote = Math.round(rawCost * (1 + (markup || 0) / 100) * 100) / 100;

  const templateOptions = templates.map((item) => ({
    value: item.id,
    label: templateDisplayName(item, uiLanguage),
  }));

  const convertToEvent = handleSubmit((values) => {
    if (!template) return;
    const filtered = {
      ...template,
      dishes: resolveGroupDishes(template, selectedDishIds),
    };
    const scaled = buildScaledIngredients(filtered, ingredients, values.headcount);
    const cost = scaled.reduce((sum, line) => sum + line.price, 0);
    const quote = Math.round(cost * (1 + (values.markup || 0) / 100) * 100) / 100;
    setPrefill({
      headcount: values.headcount,
      templateId: template.id,
      totalAmount: quote,
      selectedDishIds,
    });
    router.push("/events");
  });

  return (
    <Stack gap="md">
      <Stack gap={4}>
        <Title order={2}>
          <Bilingual label={ui.calculator.title} />
        </Title>
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.calculator.subtitle} />
        </Text>
      </Stack>

      <div className="dash-card">
        <Stack gap="md">
          <Controller
            name="templateId"
            control={control}
            render={({ field }) => (
              <Select
                label={<Bilingual label={ui.common.template} />}
                placeholder={preferredText(ui.events.selectTemplate, uiLanguage)}
                data={templateOptions}
                searchable
                clearable
                withAsterisk
                {...field}
                value={field.value ?? null}
                onChange={(value) => {
                  setSelectedDishIds([]);
                  field.onChange(value ?? null);
                }}
              />
            )}
          />
          <Controller
            name="headcount"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={<Bilingual label={ui.common.headcount} />}
                placeholder={preferredText(ui.events.headcountPlaceholder, uiLanguage)}
                min={1}
                allowNegative={false}
                withAsterisk
                {...field}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                }}
              />
            )}
          />
          {template && template.dishes.length > 0 && (
            <div>
              <Text size="sm" fw={500} mb={4}>
                <Bilingual label={ui.events.includeCourses} />
              </Text>
              <Stack gap={4}>
                {template.dishes.map((dish) => {
                  const dishChecked = checkedDishIds.includes(dish.id);
                  return (
                    <CheckRow
                      key={dish.id}
                      checked={dishChecked}
                      onChange={(next) => {
                        const nextIds = next
                          ? [...checkedDishIds, dish.id]
                          : checkedDishIds.filter((id) => id !== dish.id);
                        setSelectedDishIds(
                          nextIds.length === allDishIds.length ? [] : nextIds
                        );
                      }}
                      label={`${dishDisplayName(dish, uiLanguage)} (${dish.ingredients.length})`}
                    />
                  );
                })}
              </Stack>
            </div>
          )}
          <Controller
            name="markup"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={<Bilingual label={ui.calculator.markup} />}
                description={<Bilingual label={ui.calculator.markupNote} />}
                min={0}
                allowNegative={false}
                decimalScale={2}
                rightSection="%"
                {...field}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                }}
              />
            )}
          />
        </Stack>
      </div>

      <div className="dash-card">
        <Group gap="xs" mb="xs" justify="space-between">
          <Group gap="xs">
            <Calculator size={18} style={{ color: "var(--ink-muted)" }} />
            <Text size="sm" fw={600} c="dimmed">
              <Bilingual label={ui.calculator.rawCost} />
            </Text>
          </Group>
        </Group>
        {!template ? (
          <Text size="sm" c="dimmed">
            <Bilingual label={ui.calculator.noTemplate} />
          </Text>
        ) : (
          <Stack gap="sm" style={{ flex: 1 }}>
            <div className="dash-stat">
              <span className="dash-stat__label">
                <Bilingual label={ui.calculator.rawCost} />
              </span>
              <span className="dash-stat__value">{formatINR(rawCost)}</span>
            </div>
            <div className="dash-stat" style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <span className="dash-stat__label">
                <Bilingual label={ui.calculator.suggestedQuote} />
              </span>
              <span className="dash-stat__value">{formatINR(suggestedQuote)}</span>
            </div>
            <Text size="xs" c="dimmed">
              <Bilingual label={ui.calculator.convertNote} />
            </Text>
            <Button fullWidth h={44} onClick={convertToEvent}>
              <Bilingual label={ui.calculator.convertToEvent} />
            </Button>
          </Stack>
        )}
      </div>
    </Stack>
  );
}