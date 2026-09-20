"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Plus, Trash } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Bilingual } from "@/components/Bilingual";
import { CheckRow } from "@/components/CheckRow";
import { preferredText, ui } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { useMobileSheet } from "@/hooks/useMobileSheet";
import { useEmployeesStore } from "@/store/employees";
import { USERNAME_PATTERN } from "@/lib/username";
import type { SessionPermissions } from "@/store/auth";

type AccountUser = {
  id: string;
  username: string;
  isAdmin: boolean;
  employeeId: string | null;
  employeeName: string | null;
  permissions: SessionPermissions;
};

const createSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username is required")
    .max(30)
    .regex(USERNAME_PATTERN, "3-30 chars: letters, digits, . _ -"),
  password: z.string().min(8, "Minimum 8 characters"),
  employeeId: z.string().nullable(),
});

type CreateValues = z.infer<typeof createSchema>;

const PERMISSION_ROWS: {
  key: keyof SessionPermissions;
  label: typeof ui.employees.permViewFinance;
}[] = [
  { key: "canViewFinance", label: ui.employees.permViewFinance },
  { key: "canViewOtherEmployeeRates", label: ui.employees.permViewRates },
  { key: "canManageEmployees", label: ui.employees.permManageEmployees },
  { key: "canManageSettings", label: ui.employees.permManageSettings },
];

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", ...init });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || "Request failed.");
  }
  return (await response.json()) as T;
}

function CreateLoginModal({
  opened,
  onClose,
  onCreated,
}: {
  opened: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("sheet");
  const employees = useEmployeesStore((state) => state.employees);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { username: "", password: "", employeeId: null },
  });

  useEffect(() => {
    if (!opened) return;
    reset({ username: "", password: "", employeeId: null });
  }, [opened, reset]);

  const close = () => {
    setServerError("");
    onClose();
  };

  const onSubmit = async (values: CreateValues) => {
    setServerError("");
    try {
      await apiJson("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      onCreated();
      close();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Request failed.");
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={ui.employees.createLogin} />}
      {...sheet}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="sm">
          <TextInput
            label={<Bilingual label={ui.employees.loginUsername} />}
            placeholder="e.g. ravi.cook"
            withAsterisk
            {...register("username")}
            error={errors.username?.message}
          />
          <PasswordInput
            label={<Bilingual label={ui.employees.tempPassword} />}
            withAsterisk
            {...register("password")}
            error={errors.password?.message}
          />
          <Controller
            name="employeeId"
            control={control}
            render={({ field }) => (
              <Select
                label={<Bilingual label={ui.employees.linkEmployee} />}
                placeholder={preferredText(ui.employees.noEmployeeLink, uiLanguage)}
                data={employees.map((employee) => ({
                  value: employee.id,
                  label: `${employee.name} · ${employee.phone}`,
                }))}
                searchable
                clearable
                {...field}
                value={field.value ?? null}
                onChange={(value) => field.onChange(value ?? null)}
              />
            )}
          />
          {serverError && (
            <Text size="sm" c="red">
              {serverError}
            </Text>
          )}
          <Group justify="flex-end" className="form-actions">
            <Button variant="default" onClick={close}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button type="submit" loading={isSubmitting}>
              <Bilingual label={ui.common.add} />
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

async function fetchUsers(): Promise<AccountUser[]> {
  const body = await apiJson<{ users: AccountUser[] }>("/api/users");
  return body.users;
}

export function AccountsManager() {
  const [users, setUsers] = useState<AccountUser[]>([]);
  const [createOpened, setCreateOpened] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchUsers()
      .then((loaded) => {
        if (cancelled) return;
        setUsers(loaded);
        setError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Request failed.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const reload = () => {
    fetchUsers()
      .then((loaded) => {
        setUsers(loaded);
        setError("");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Request failed.");
      });
  };

  const togglePermission = async (user: AccountUser, key: keyof SessionPermissions, next: boolean) => {
    const previous = user.permissions;
    setUsers((current) =>
      current.map((item) =>
        item.id === user.id
          ? { ...item, permissions: { ...item.permissions, [key]: next } }
          : item
      )
    );
    try {
      await apiJson(`/api/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...previous, [key]: next }),
      });
    } catch {
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? { ...item, permissions: previous } : item))
      );
    }
  };

  const removeLogin = async (id: string) => {
    try {
      await apiJson(`/api/users/${encodeURIComponent(id)}`, { method: "DELETE" });
      setUsers((current) => current.filter((item) => item.id !== id));
    } catch {
      // Keep the row; server guards admin/self deletion.
    }
  };

  return (
    <div className="dash-card">
      <Group justify="space-between" mb="sm">
        <Title order={3}>
          <Bilingual label={ui.employees.accounts} />
        </Title>
        <Button leftSection={<Plus size={16} />} onClick={() => setCreateOpened(true)}>
          <Bilingual label={ui.common.add} />
        </Button>
      </Group>
      {error && (
        <Text size="sm" c="red" mb="sm">
          {error}
        </Text>
      )}
      {users.length === 0 ? (
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.employees.noLogins} />
        </Text>
      ) : (
        <Stack gap="sm">
          {users.map((user) => (
            <Card key={user.id} withBorder padding="sm">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={2} style={{ minWidth: 0 }}>
                  <Group gap="xs">
                    <Text size="sm" fw={600} truncate>
                      {user.username}
                    </Text>
                    {user.isAdmin && (
                      <Badge size="xs">
                        <Bilingual label={ui.employees.adminBadge} />
                      </Badge>
                    )}
                  </Group>
                  {user.employeeName && (
                    <Text size="xs" c="dimmed">
                      {user.employeeName}
                    </Text>
                  )}
                </Stack>
                {!user.isAdmin && (
                  <ActionIcon
                    variant="subtle"
                    color="kumkum"
                    aria-label={`${preferredText(ui.employees.removeLogin, "en")} ${user.username}`}
                    onClick={() => void removeLogin(user.id)}
                  >
                    <Trash size={16} />
                  </ActionIcon>
                )}
              </Group>
              {!user.isAdmin && (
                <Stack gap={4} mt="xs">
                  {PERMISSION_ROWS.map((row) => (
                    <CheckRow
                      key={row.key}
                      checked={user.permissions[row.key]}
                      onChange={(next) => void togglePermission(user, row.key, next)}
                      label={<Bilingual label={row.label} />}
                    />
                  ))}
                </Stack>
              )}
            </Card>
          ))}
        </Stack>
      )}
      <CreateLoginModal
        opened={createOpened}
        onClose={() => setCreateOpened(false)}
        onCreated={reload}
      />
    </div>
  );
}
