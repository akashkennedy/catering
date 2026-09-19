"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";

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
      <div className="dash-card" style={{ width: "100%", maxWidth: 400 }}>
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
              label={<Bilingual label={ui.auth.username} />}
              placeholder="admin"
              autoComplete="username"
              error={errors.username ? preferredText(ui.auth.username, uiLanguage) : undefined}
              {...register("username")}
            />
            <PasswordInput
              label={<Bilingual label={ui.auth.password} />}
              placeholder="admin"
              autoComplete="current-password"
              error={errors.password ? preferredText(ui.auth.password, uiLanguage) : undefined}
              {...register("password")}
            />
            {invalid ? (
              <Text size="sm" style={{ color: "var(--accent-kumkum)" }}>
                <Bilingual label={ui.auth.invalidCredentials} />
              </Text>
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
