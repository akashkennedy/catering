"use client";

import { useState } from "react";
import { Box, Button, Group, SegmentedControl, Stack, Text, Title } from "@mantine/core";

import { Bilingual } from "@/components/Bilingual";
import { ToggleSwitch } from "@/components/CheckRow";
import { ThemeControl } from "@/components/ThemeControl";
import { preferredText, ui } from "@/lib/i18n";
import { useAuthStore } from "@/store/auth";
import {
  useSettingsStore,
  type AlertKey,
  type DefaultLanguage,
  type UiLanguage,
} from "@/store/settings";

/** Renders application settings and coordinates database export. */
export function SettingsPanel() {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const setUiLanguage = useSettingsStore((state) => state.setUiLanguage);
  const defaultLanguage = useSettingsStore((state) => state.defaultLanguage);
  const setDefaultLanguage = useSettingsStore((state) => state.setDefaultLanguage);
  const canExportExcel = useAuthStore((state) => state.permissions.canExportExcel);
  const alerts = useSettingsStore((state) => state.alerts);
  const setAlert = useSettingsStore((state) => state.setAlert);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "done" | "failed">("idle");

  const alertRows: { key: AlertKey; label: string }[] = [
    { key: "enquiryMenus", label: preferredText(ui.settings.alertEnquiryMenus, uiLanguage) },
    { key: "confirmInvoice", label: preferredText(ui.settings.alertConfirmInvoice, uiLanguage) },
    { key: "paymentReceived", label: preferredText(ui.settings.alertPaymentReceived, uiLanguage) },
    { key: "feedbackRequest", label: preferredText(ui.settings.alertFeedbackRequest, uiLanguage) },
    { key: "eventEve", label: preferredText(ui.settings.alertEventEve, uiLanguage) },
    { key: "paymentOverdue", label: preferredText(ui.settings.alertPaymentOverdue, uiLanguage) },
  ];

  const runExport = () => {
    setExporting(true);
    setExportStatus("idle");
    try {
      // Let the button paint its loading state before the export starts.
      // The exporter (and xlsx) loads only on demand, not with this page.
      setTimeout(() => {
        void (async () => {
          try {
            const { exportDatabaseToExcel } = await import("@/lib/exportExcel");
            await exportDatabaseToExcel();
            setExportStatus("done");
          } catch {
            setExportStatus("failed");
          } finally {
            setExporting(false);
          }
        })();
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

      <Box className="dash-card">
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
            <Bilingual label={ui.settings.alerts} />
          </Text>
          <Text size="xs" c="dimmed">
            <Bilingual label={ui.settings.alertsNote} />
          </Text>
          {alertRows.map((row) => (
            <Group key={row.key} justify="space-between" wrap="nowrap">
              <Text size="sm">{row.label}</Text>
              <ToggleSwitch
                checked={alerts[row.key]}
                onChange={(value) => setAlert(row.key, value)}
                ariaLabel={row.label}
              />
            </Group>
          ))}
        </Stack>
      </div>

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

      {canExportExcel ? (
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
      ) : null}
    </Stack>
  );
}
