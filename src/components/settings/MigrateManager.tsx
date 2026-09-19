"use client";

import { useState } from "react";
import { Button, Group, Stack, Table, Text, Title } from "@mantine/core";
import Link from "next/link";

import { Bilingual } from "@/components/Bilingual";
import {
  migrateLocalToServer,
  type MigrationEntityReport,
} from "@/lib/localMigration";

export function MigrateManager() {
  const [running, setRunning] = useState(false);
  const [reports, setReports] = useState<MigrationEntityReport[] | null>(null);

  const run = async () => {
    setRunning(true);
    try {
      setReports(await migrateLocalToServer());
    } finally {
      setRunning(false);
    }
  };

  return (
    <Stack gap="md">
      <Title order={2}>
        <Bilingual
          label={{ en: "Move data to database", ta: "தரவை தரவுத்தளத்திற்கு மாற்று" }}
        />
      </Title>
      <Text size="sm" c="dimmed">
        <Bilingual
          label={{
            en: "Copies everything saved on this device into the shared database. Safe to run more than once — existing records are skipped, never duplicated.",
            ta: "இந்த சாதனத்தில் சேமித்த அனைத்தையும் பகிரப்பட்ட தரவுத்தளத்திற்கு நகலெடுக்கும். பலமுறை இயக்குவது பாதுகாப்பானது.",
          }}
        />
      </Text>
      <Group>
        <Button onClick={run} loading={running}>
          <Bilingual label={{ en: "Start migration", ta: "மாற்றத்தைத் தொடங்கு" }} />
        </Button>
        <Button component={Link} href="/settings" variant="default">
          <Bilingual label={{ en: "Back to settings", ta: "அமைப்புகளுக்குத் திரும்பு" }} />
        </Button>
      </Group>
      {reports && (
        <div className="dash-card">
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Bilingual label={{ en: "Data", ta: "தரவு" }} />
                </Table.Th>
                <Table.Th>
                  <Bilingual label={{ en: "Moved", ta: "மாற்றப்பட்டது" }} />
                </Table.Th>
                <Table.Th>
                  <Bilingual label={{ en: "Failed", ta: "தோல்வி" }} />
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {reports.map((report) => (
                <Table.Tr key={report.entity}>
                  <Table.Td>{report.entity}</Table.Td>
                  <Table.Td>
                    {report.sent} / {report.total}
                  </Table.Td>
                  <Table.Td>{report.failed}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}
    </Stack>
  );
}
