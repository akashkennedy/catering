"use client";

import { useState } from "react";
import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { Plus } from "lucide-react";

import { TemplateCards } from "./TemplateCards";
import { TemplateFormModal } from "./TemplateFormModal";
import { TemplateTable } from "./TemplateTable";
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
        <Title order={1}>Templates</Title>
        <Button
          leftSection={<Plus size={18} />}
          onClick={() => {
            setEditingTemplate(null);
            setFormOpened(true);
          }}
        >
          Add Template
        </Button>
      </Group>

      {templates.length === 0 ? (
        <Text c="dimmed">No templates yet. Add one to get started.</Text>
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
        title="Delete template"
        centered
      >
        <Stack gap="md">
          <Text>Are you sure you want to delete &quot;{deletingTemplate?.name}&quot;?</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingTemplate(null)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                if (deletingTemplate) deleteTemplate(deletingTemplate.id);
                setDeletingTemplate(null);
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