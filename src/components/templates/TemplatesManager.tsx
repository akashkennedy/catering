"use client";

import { useState } from "react";
import { Button, Group, Modal, Stack, Text, TextInput, Title } from "@mantine/core";
import { Download, Plus, Search } from "lucide-react";

import { TemplateCards } from "./TemplateCards";
import { TemplateFormModal } from "./TemplateFormModal";
import { TemplateTable } from "./TemplateTable";
import { Bilingual } from "@/components/Bilingual";
import { preferredText, ui } from "@/lib/i18n";
import { importLegacyData, type LegacyImportResult } from "@/lib/legacyImport";
import { useSettingsStore } from "@/store/settings";
import { templateDisplayName, templateMatchesQuery, useTemplatesStore, type FoodTemplate } from "@/store/templates";

export function TemplatesManager() {
  const templates = useTemplatesStore((state) => state.templates);
  const deleteTemplate = useTemplatesStore((state) => state.deleteTemplate);
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const [formOpened, setFormOpened] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FoodTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<FoodTemplate | null>(null);
  const [query, setQuery] = useState("");
  const [importResult, setImportResult] = useState<LegacyImportResult | null>(null);
  const filtered = query.trim()
    ? templates.filter((template) => templateMatchesQuery(template, query))
    : templates;

  return (
    <div className="dash-card" style={{ padding: 0 }}>
      <div style={{ padding: 16 }}>
        <Group justify="space-between" mb="md">
          <Title order={2}>
            <Bilingual label={ui.nav.templates} />
          </Title>
          <Group gap="xs">
            <Button
              variant="light"
              leftSection={<Download size={18} />}
              onClick={() => setImportResult(importLegacyData())}
              title={preferredText(ui.templates.importLegacyNote, uiLanguage)}
            >
              <Bilingual label={ui.templates.importLegacy} />
            </Button>
            <Button
              leftSection={<Plus size={18} />}
              onClick={() => {
                setEditingTemplate(null);
                setFormOpened(true);
              }}
            >
              <Bilingual label={ui.templates.addTemplate} />
            </Button>
          </Group>
        </Group>

        {importResult && (
          <Text size="sm" c="dimmed" mb="md">
            {uiLanguage === "ta"
              ? `${importResult.templatesAdded} உணவுகள், ${importResult.ingredientsAdded} பொருட்கள் சேர்க்கப்பட்டன.`
              : `Added ${importResult.templatesAdded} meals, ${importResult.ingredientsAdded} ingredients.`}
          </Text>
        )}

        {templates.length > 0 && (
          <TextInput
            leftSection={<Search size={16} aria-hidden />}
            placeholder={preferredText(ui.templates.searchTemplates, uiLanguage)}
            aria-label={preferredText(ui.templates.searchTemplates, uiLanguage)}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            mb="md"
          />
        )}

        {templates.length === 0 ? (
          <Text c="dimmed">
            <Bilingual label={ui.templates.empty} />
          </Text>
        ) : filtered.length === 0 ? (
          <Text c="dimmed">
            <Bilingual label={ui.templates.noMatch} />
          </Text>
        ) : (
          <>
            <TemplateTable
              templates={filtered}
              onEdit={(template) => {
                setEditingTemplate(template);
                setFormOpened(true);
              }}
              onDelete={setDeletingTemplate}
            />
            <TemplateCards
              templates={filtered}
              onEdit={(template) => {
                setEditingTemplate(template);
                setFormOpened(true);
              }}
              onDelete={setDeletingTemplate}
            />
          </>
        )}
      </div>

      <TemplateFormModal opened={formOpened} template={editingTemplate} onClose={() => setFormOpened(false)} />

      <Modal
        opened={deletingTemplate !== null}
        onClose={() => setDeletingTemplate(null)}
        title={<Bilingual label={ui.templates.deleteTitle} />}
        centered
      >
        <Stack gap="md">
            <Text>
              <Bilingual
                label={
                  deletingTemplate
                    ? ui.deleteConfirm(templateDisplayName(deletingTemplate, uiLanguage))
                    : { en: "", ta: "" }
                }
              />
            </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingTemplate(null)}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button
              color="kumkum"
              onClick={() => {
                if (deletingTemplate) deleteTemplate(deletingTemplate.id);
                setDeletingTemplate(null);
              }}
            >
              <Bilingual label={ui.common.delete} />
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}