"use client";

import { useState } from "react";
import {
  ActionIcon,
  Box,
  Combobox,
  Group,
  Text,
  TextInput,
  useCombobox,
} from "@mantine/core";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { preferredText, ui, type Label } from "@/lib/i18n";
import { useHydrated } from "@/hooks/useHydrated";
import { useSettingsStore } from "@/store/settings";
import { useEventsStore } from "@/store/events";
import { useTemplatesStore } from "@/store/templates";
import { useIngredientsStore } from "@/store/ingredients";
import { useEmployeesStore } from "@/store/employees";
import { useUtensilsStore } from "@/store/utensils";

const MAX_PER_TYPE = 6;

type SearchResult = {
  key: string;
  name: string;
  typeLabel: Label;
  href: string;
};

type MobileSearchOverlayProps = {
  opened: boolean;
  onClose: () => void;
};

export function MobileSearchOverlay({ opened, onClose }: MobileSearchOverlayProps) {
  const hydrated = useHydrated();
  const router = useRouter();
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = useState("");
  const query = value.trim().toLowerCase();
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const placeholder = preferredText(ui.search.placeholder, uiLanguage);

  const events = useEventsStore((state) => state.events);
  const templates = useTemplatesStore((state) => state.templates);
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const employees = useEmployeesStore((state) => state.employees);
  const utensils = useUtensilsStore((state) => state.utensils);

  if (!hydrated || !opened) {
    return null;
  }

  const matches = (name: string) => name.toLowerCase().includes(query);

  const results: SearchResult[] = [
    ...events
      .filter((event) => matches(event.name))
      .slice(0, MAX_PER_TYPE)
      .map((event) => ({
        key: `event:${event.id}`,
        name: event.name,
        typeLabel: ui.nav.events,
        href: `/events/${event.id}`,
      })),
    ...templates
      .filter((template) => matches(template.name))
      .slice(0, MAX_PER_TYPE)
      .map((template) => ({
        key: `template:${template.id}`,
        name: template.name,
        typeLabel: ui.nav.templates,
        href: "/templates",
      })),
    ...ingredients
      .filter(
        (ingredient) =>
          matches(ingredient.name) || matches(ingredient.tamilName)
      )
      .slice(0, MAX_PER_TYPE)
      .map((ingredient) => ({
        key: `ingredient:${ingredient.id}`,
        name: ingredient.name,
        typeLabel: ui.nav.ingredients,
        href: "/inventory",
      })),
    ...employees
      .filter((employee) => matches(employee.name))
      .slice(0, MAX_PER_TYPE)
      .map((employee) => ({
        key: `employee:${employee.id}`,
        name: employee.name,
        typeLabel: ui.nav.employees,
        href: "/employees",
      })),
    ...utensils
      .filter((utensil) => matches(utensil.name))
      .slice(0, MAX_PER_TYPE)
      .map((utensil) => ({
        key: `utensil:${utensil.id}`,
        name: utensil.name,
        typeLabel: ui.nav.rental,
        href: "/utensils",
      })),
  ];

  const options = results.length > 0;
  const showDropdown = query.length > 0 && (options || combobox.dropdownOpened);

  const navigate = (key: string) => {
    const result = results.find((r) => r.key === key);
    if (!result) return;
    setValue("");
    combobox.closeDropdown();
    onClose();
    router.push(result.href);
  };

  const handleClose = () => {
    setValue("");
    combobox.closeDropdown();
    onClose();
  };

  return (
    <div
      className="mobile-search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={placeholder}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
    >
      <div className="mobile-search-overlay__header">
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={handleClose}
          aria-label="Close search"
        >
          <ArrowLeft size={20} />
        </ActionIcon>
        <Box style={{ flex: 1 }}>
          <Combobox
            store={combobox}
            onOptionSubmit={navigate}
            withinPortal
            shadow="md"
            styles={{
              dropdown: {
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--ink)",
              },
            }}
          >
            <Combobox.Target>
              <TextInput
                role="search"
                aria-label={placeholder}
                placeholder={placeholder}
                leftSection={<Search size={16} aria-hidden />}
                autoFocus
                value={value}
                onChange={(event) => {
                  setValue(event.currentTarget.value);
                  if (event.currentTarget.value.trim()) {
                    combobox.openDropdown();
                  } else {
                    combobox.closeDropdown();
                  }
                }}
                onFocus={() => {
                  if (value.trim()) combobox.openDropdown();
                }}
                onBlur={() => combobox.closeDropdown()}
                variant="unstyled"
                styles={{
                  input: {
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "var(--ink)",
                  },
                }}
              />
            </Combobox.Target>
            <Combobox.Dropdown hidden={!showDropdown}>
              <Combobox.Options>
                {options ? (
                  results.map((result) => (
                    <Combobox.Option key={result.key} value={result.key}>
                      <Group gap="sm" justify="space-between" wrap="nowrap">
                        <Text size="sm" truncate component="span">
                          {result.name}
                        </Text>
                        <Text
                          size="xs"
                          c="dimmed"
                          fw={600}
                          style={{ textTransform: "none" }}
                          component="span"
                          truncate
                        >
                          {preferredText(result.typeLabel, uiLanguage)}
                        </Text>
                      </Group>
                    </Combobox.Option>
                  ))
                ) : (
                  <Combobox.Empty>
                    <Text size="sm" c="dimmed">
                      {preferredText(ui.search.noResults, uiLanguage)}
                    </Text>
                  </Combobox.Empty>
                )}
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        </Box>
      </div>
    </div>
  );
}
