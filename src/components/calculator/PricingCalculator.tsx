"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Calculator } from "lucide-react";
import { z } from "zod";

import { Bilingual } from "@/components/Bilingual";
import { formatINR } from "@/lib/format";
import { ui, labelText } from "@/lib/i18n";
import { useTemplatesStore } from "@/store/templates";
import { useIngredientsStore } from "@/store/ingredients";
import { buildScaledIngredients } from "@/store/events";
import { useEventDraftStore } from "@/store/eventDraft";

const calculatorSchema = z.object({
  templateId: z.string().nullable(),
  headcount: z.coerce.number().min(1, "Headcount must be 1 or more"),
  markup: z.coerce.number().min(0, "Markup must be 0 or more"),
});

type CalculatorValues = z.infer<typeof calculatorSchema>;

export function PricingCalculator() {
  const router = useRouter();
  const templates = useTemplatesStore((state) => state.templates);
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const setPrefill = useEventDraftStore((state) => state.setPrefill);

  const { control } = useForm<CalculatorValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: { templateId: null, headcount: 100, markup: 0 },
  });

  const templateId = useWatch({ control, name: "templateId" }) as string | null;
  const headcount = useWatch({ control, name: "headcount" }) as number;
  const markup = useWatch({ control, name: "markup" }) as number;

  const template = templates.find((t) => t.id === templateId) ?? null;
  const scaledLines = buildScaledIngredients(template, ingredients, headcount || 0);
  const rawCost = scaledLines.reduce((sum, line) => sum + line.price, 0);
  const suggestedQuote = Math.round(rawCost * (1 + (markup || 0) / 100) * 100) / 100;

  const templateOptions = templates.map((template) => ({
    value: template.id,
    label: template.name,
  }));

  const convertToEvent = () => {
    if (!template) return;
    setPrefill({ headcount, templateId: template.id, totalQuoted: suggestedQuote });
    router.push("/events");
  };

  return (
    <Stack gap="md">
      <Stack gap={4}>
        <Title order={1}>
          <Bilingual label={ui.calculator.title} />
        </Title>
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.calculator.subtitle} />
        </Text>
      </Stack>

      <Card withBorder padding="md" radius="md">
        <Stack gap="md">
          <Controller
            name="templateId"
            control={control}
            render={({ field }) => (
              <Select
                label={<Bilingual label={ui.common.template} />}
                placeholder={labelText(ui.events.selectTemplate)}
                data={templateOptions}
                searchable
                clearable
                withAsterisk
                {...field}
                value={field.value ?? null}
                onChange={(value) => field.onChange(value ?? null)}
              />
            )}
          />
          <Controller
            name="headcount"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={<Bilingual label={ui.common.headcount} />}
                placeholder={labelText(ui.events.headcountPlaceholder)}
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
      </Card>

      <Card withBorder padding="md" radius="md">
        <Group gap="sm" mb="xs" wrap="nowrap">
          <Calculator size={18} />
          <Text fw={600}>
            <Bilingual label={ui.calculator.rawCost} />
          </Text>
        </Group>
        <Divider mb="sm" />
        {!template ? (
          <Text size="sm" c="dimmed">
            <Bilingual label={ui.calculator.noTemplate} />
          </Text>
        ) : (
          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm">
                <Bilingual label={ui.calculator.rawCost} />
              </Text>
              <Text fw={600}>{formatINR(rawCost)}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">
                <Bilingual label={ui.calculator.suggestedQuote} />
              </Text>
              <Text fw={700}>{formatINR(suggestedQuote)}</Text>
            </Group>
            <Text size="xs" c="dimmed">
              <Bilingual label={ui.calculator.convertNote} />
            </Text>
            <Button fullWidth h={44} onClick={convertToEvent}>
              <Bilingual label={ui.calculator.convertToEvent} />
            </Button>
          </Stack>
        )}
      </Card>
    </Stack>
  );
}