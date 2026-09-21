"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, Button, Group, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { TriangleAlert, CircleX } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { preferredText, ui } from "@/lib/i18n";
import { useAuthStore } from "@/store/auth";
import { useSettingsStore } from "@/store/settings";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const login = useAuthStore((state) => state.login);
  const [invalid, setInvalid] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const handleCapsLock = (e: React.KeyboardEvent) => {
    const on = typeof e.getModifierState === "function" && e.getModifierState("CapsLock");
    setCapsLockOn(on);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    const ok = await login(values.username, values.password);
    setInvalid(!ok);
  };

  return (
    <Stack align="center" justify="center" mih="100dvh" p="md">
      <Stack align="center" gap="xs">
        {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
        <img src="/logo.png" alt="MampalliCRM logo" width={72} height={72} style={{ borderRadius: 12 }} />
        <Title order={1} size="h2">
          MampalliCRM
        </Title>
      </Stack>
      <div className="dash-card login-card" style={{ width: "100%", maxWidth: 400 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <Stack gap={4}>
              <Title order={2}>
                <Bilingual label={ui.auth.title} />
              </Title>
              <Text size="sm" c="dimmed">
                <Bilingual label={ui.auth.subtitle} />
              </Text>
            </Stack>
            <TextInput
              placeholder={preferredText(ui.auth.username, uiLanguage)}
              aria-label={preferredText(ui.auth.username, uiLanguage)}
              autoComplete="username"
              aria-invalid={invalid}
              error={
                errors.username
                  ? preferredText(ui.auth.username, uiLanguage)
                  : invalid
                    ? " "
                    : undefined
              }
              {...register("username", { onChange: () => setInvalid(false) })}
            />
            <PasswordInput
              placeholder={preferredText(ui.auth.password, uiLanguage)}
              aria-label={preferredText(ui.auth.password, uiLanguage)}
              autoComplete="current-password"
              aria-invalid={invalid}
              onKeyDown={handleCapsLock}
              onKeyUp={handleCapsLock}
              error={
                errors.password
                  ? preferredText(ui.auth.password, uiLanguage)
                  : invalid
                    ? " "
                    : undefined
              }
              {...register("password", {
                onChange: () => setInvalid(false),
                onBlur: () => setCapsLockOn(false),
              })}
            />
            {capsLockOn ? (
              <Group gap={6} wrap="nowrap" align="center" role="status">
                <TriangleAlert size={14} style={{ flexShrink: 0 }} color="var(--mantine-color-orange-6)" />
                <Text size="sm" c="orange">
                  <Bilingual label={ui.auth.capsLockOn} />
                </Text>
              </Group>
            ) : null}
            {invalid ? (
              <Alert color="red" icon={<CircleX size={16} />} role="alert">
                <Bilingual label={ui.auth.invalidCredentials} />
              </Alert>
            ) : null}
            <Button type="submit" fullWidth loading={isSubmitting}>
              <Bilingual label={ui.auth.signIn} />
            </Button>
          </Stack>
        </form>
      </div>
    </Stack>
  );
}
