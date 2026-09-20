"use client";

import { useState } from "react";
import { Box, Button, SegmentedControl, Stack, Text, Title } from "@mantine/core";

import { Bilingual } from "@/components/Bilingual";
import { ThemeControl } from "@/components/ThemeControl";
import { exportDatabaseToExcel } from "@/lib/exportExcel";
import { ui } from "@/lib/i18n";
import {
  useSettingsStore,
  type DefaultLanguage,
  type UiLanguage,
} from "@/store/settings";

export function SettingsPanel() {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const setUiLanguage = useSettingsStore((state) => state.setUiLanguage);
  const defaultLanguage = useSettingsStore((state) => state.defaultLanguage);
  const setDefaultLanguage = useSettingsStore((state) => state.setDefaultLanguage);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "done" | "failed">("idle");

  const runExport = () => {
    setExporting(true);
    setExportStatus("idle");
    try {
      // Let the button paint its loading state before the synchronous export.
      setTimeout(() => {
        try {
          exportDatabaseToExcel();
          setExportStatus("done");
        } catch {
          setExportStatus("failed");
        } finally {
          setExporting(false);
        }
      }, 50);
    } catch {
      setExportStatus("failed");
      setExporting(false);
    }
  };

  return (
    <Stack gap="lg">
      <Title order={2}>
        <Bilingual label={ui.nav.settings} />
      </Title>

      <Box hiddenFrom="sm" className="dash-card">
        <Stack gap="sm">
          <Text fw={600} size="sm">
            <Bilingual label={ui.settings.dark} />
          </Text>
          <ThemeControl />
        </Stack>
      </Box>

      <div className="dash-card">
        <Stack gap="sm">
          <Text fw={600} size="sm">
            <Bilingual label={ui.settings.uiLanguage} />
          </Text>
          <Text size="xs" c="dimmed">
            <Bilingual label={ui.settings.uiLanguageNote} />
          </Text>
          <SegmentedControl
            value={uiLanguage}
            onChange={(value) => setUiLanguage(value as UiLanguage)}
            data={[
              { label: <Bilingual label={ui.settings.tamil} />, value: "ta" },
              { label: <Bilingual label={ui.settings.english} />, value: "en" },
            ]}
          />
        </Stack>
      </div>

      <div className="dash-card">
        <Stack gap="sm">
          <Text fw={600} size="sm">
            <Bilingual label={ui.settings.defaultLanguage} />
          </Text>
          <Text size="xs" c="dimmed">
            <Bilingual label={ui.settings.defaultLanguageNote} />
          </Text>
          <SegmentedControl
            value={defaultLanguage}
            onChange={(value) => setDefaultLanguage(value as DefaultLanguage)}
            data={[
              { label: <Bilingual label={ui.settings.english} />, value: "en" },
              { label: <Bilingual label={ui.settings.tamil} />, value: "ta" },
            ]}
          />
        </Stack>
      </div>

      <div className="dash-card">
        <Stack gap="sm">
          <Text fw={600} size="sm">
            <Bilingual label={ui.settings.exportExcel} />
          </Text>
          <Text size="xs" c="dimmed">
            <Bilingual label={ui.settings.exportExcelNote} />
          </Text>
          <div>
            <Button onClick={runExport} loading={exporting}>
              <Bilingual
                label={
                  exporting ? ui.settings.exportExcelWorking : ui.settings.exportExcelButton
                }
              />
            </Button>
          </div>
          {exportStatus === "done" ? (
            <Text size="sm" c="green">
              <Bilingual label={ui.settings.exportExcelDone} />
            </Text>
          ) : null}
          {exportStatus === "failed" ? (
            <Text size="sm" c="red">
              <Bilingual label={ui.settings.exportExcelFailed} />
            </Text>
          ) : null}
        </Stack>
      </div>
    </Stack>
  );
}