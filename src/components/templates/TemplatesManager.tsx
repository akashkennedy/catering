"use client";

import { useState } from "react";
import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { Plus } from "lucide-react";

import { TemplateCards } from "./TemplateCards";
import { TemplateFormModal } from "./TemplateFormModal";
import { TemplateTable } from "./TemplateTable";
import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { useTemplatesStore, type FoodTemplate } from "@/store/templates";

export function TemplatesManager() {
  const templates = useTemplatesStore((state) => state.templates);
  const deleteTemplate = useTemplatesStore((state) => state.deleteTemplate);
  const [formOpened, setFormOpened] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FoodTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<FoodTemplate | null>(null);

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={1}>
          <Bilingual label={ui.nav.templates} />
        </Title>
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

      {templates.length === 0 ? (
        <Text c="dimmed">
          <Bilingual label={ui.templates.empty} />
        </Text>
      ) : (
        <>
          <TemplateTable
            templates={templates}
            onEdit={(template) => {
              setEditingTemplate(template);
              setFormOpened(true);
            }}
            onDelete={setDeletingTemplate}
          />
          <TemplateCards
            templates={templates}
            onEdit={(template) => {
              setEditingTemplate(template);
              setFormOpened(true);
            }}
            onDelete={setDeletingTemplate}
          />
        </>
      )}

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
                  ? ui.deleteConfirm(deletingTemplate.name)
                  : { en: "", ta: "" }
              }
            />
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingTemplate(null)}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button
              color="red"
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
    </>
  );
}