"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import {
  ActionIcon,
  AppShell,
  Box,
  Button,
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
  LogOut,
  Plus,
  Search,
  Settings,
  ShoppingBasket,
  PhoneCall,
  UserRound,
  Wallet,
} from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobileSearchOverlay } from "@/components/MobileSearchOverlay";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ShellSearch } from "@/components/ShellSearch";
import { ThemeControl } from "@/components/ThemeControl";
import { EventFormModal } from "@/components/events/EventFormModal";
import { preferredText, ui, type Label } from "@/lib/i18n";
import { useAuthStore } from "@/store/auth";
import { useSettingsStore } from "@/store/settings";

type NavItem = {
  label: Label;
  href: string;
  icon: ComponentType<{ size?: number | string }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: ui.nav.dashboard, href: "/", icon: LayoutDashboard },
  { label: ui.nav.events, href: "/events", icon: CalendarDays },
  { label: ui.dashboard.customerFollowUp, href: "/follow-ups", icon: PhoneCall },
  { label: ui.nav.templates, href: "/templates", icon: ClipboardList },
  { label: ui.nav.ingredients, href: "/inventory", icon: ShoppingBasket },
  { label: ui.nav.employees, href: "/employees", icon: UserRound },
  { label: ui.nav.rental, href: "/utensils", icon: CookingPot },
  { label: ui.nav.calculator, href: "/calculator", icon: Calculator },
  { label: ui.nav.finance, href: "/finance", icon: Wallet },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [opened, setOpened] = useState(false);
  const [searchOpened, setSearchOpened] = useState(false);
  const [newEventOpened, setNewEventOpened] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <Group h="100%" px="md" wrap="nowrap" gap="xs" style={{ alignItems: "center" }}>
          <Text fw={700} size="lg" truncate style={{ flexShrink: 0 }}>
            Catering
          </Text>
          <Box visibleFrom="sm" style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "center" }}>
            <ShellSearch />
          </Box>
          <Group gap="xs" wrap="nowrap" ml="auto" style={{ flexShrink: 0 }}>
            <ActionIcon
              hiddenFrom="sm"
              variant="subtle"
              size="lg"
              onClick={() => setSearchOpened(true)}
              aria-label={preferredText(ui.search.placeholder, uiLanguage)}
              style={{ width: 40, height: 40, color: "var(--ink-muted)" }}
            >
              <Search size={20} aria-hidden />
            </ActionIcon>
            <NotificationCenter />
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
          <Button
            fullWidth
            leftSection={<Plus size={18} aria-hidden />}
            onClick={() => setNewEventOpened(true)}
          >
            <Bilingual label={ui.events.addEvent} />
          </Button>
          <Box visibleFrom="sm">
            <ThemeControl />
          </Box>
          <Link
            href="/settings"
            onClick={() => setOpened(false)}
            className={`app-nav-item${isActive(pathname, "/settings") ? " app-nav-item--active" : ""}`}
            aria-current={isActive(pathname, "/settings") ? "page" : undefined}
          >
            <Settings size={18} aria-hidden />
            <span className="app-nav-item__label">
              <Bilingual label={ui.nav.settings} />
            </span>
          </Link>
          <button
            type="button"
            className="app-nav-item"
            style={{ width: "100%", cursor: "pointer", background: "none", border: "none" }}
            onClick={() => {
              setOpened(false);
              logout();
            }}
          >
            <LogOut size={18} aria-hidden />
            <span className="app-nav-item__label">
              <Bilingual label={ui.auth.logout} />
            </span>
          </button>
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
      <MobileBottomNav onAddEvent={() => setNewEventOpened(true)} />
      <MobileSearchOverlay opened={searchOpened} onClose={() => setSearchOpened(false)} />
      <EventFormModal opened={newEventOpened} event={null} onClose={() => setNewEventOpened(false)} />
    </AppShell>
  );
}