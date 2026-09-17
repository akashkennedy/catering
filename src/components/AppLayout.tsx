"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import {
  AppShell,
  Box,
  Burger,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Calculator,
  ClipboardList,
  CookingPot,
  LayoutDashboard,
  Settings,
  ShoppingBasket,
  UserRound,
  Wallet,
} from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { LanguageIndicator } from "@/components/LanguageIndicator";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ShellSearch } from "@/components/ShellSearch";
import { ThemeControl } from "@/components/ThemeControl";
import { ui, type Label } from "@/lib/i18n";

type NavItem = {
  label: Label;
  href: string;
  icon: ComponentType<{ size?: number | string }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: ui.nav.dashboard, href: "/", icon: LayoutDashboard },
  { label: ui.nav.events, href: "/events", icon: CalendarDays },
  { label: ui.nav.templates, href: "/templates", icon: ClipboardList },
  { label: ui.nav.ingredients, href: "/ingredients", icon: ShoppingBasket },
  { label: ui.nav.employees, href: "/employees", icon: UserRound },
  { label: ui.nav.rental, href: "/utensils", icon: CookingPot },
  { label: ui.nav.calculator, href: "/calculator", icon: Calculator },
  { label: ui.nav.finance, href: "/finance", icon: Wallet },
  { label: ui.nav.settings, href: "/settings", icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [opened, setOpened] = useState(false);
  const pathname = usePathname();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <Group h="100%" px="md" wrap="nowrap" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center" }}>
          <Group gap="md" wrap="nowrap" justify="flex-start">
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              hiddenFrom="sm"
              size="sm"
            />
            <Text fw={700} size="lg" truncate>
              <Bilingual label={ui.appName} />
            </Text>
          </Group>
          <Box visibleFrom="sm">
            <ShellSearch />
          </Box>
          <Group justify="flex-end" wrap="nowrap">
            <LanguageIndicator />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar
        p="md"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <Stack justify="space-between" gap="md" style={{ flex: 1, minHeight: 0 }}>
          <Stack gap="sm" style={{ flex: 1, minHeight: 0 }}>
            <Stack gap={4} style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpened(false)}
                    className={`app-nav-item${active ? " app-nav-item--active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={18} aria-hidden />
                    <span className="app-nav-item__label">
                      <Bilingual label={item.label} />
                    </span>
                  </Link>
                );
              })}
            </Stack>
          </Stack>
          <ThemeControl />
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
      <MobileBottomNav />
    </AppShell>
  );
}