"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  CookingPot,
  Handshake,
  LayoutDashboard,
  Settings,
  ShoppingBasket,
  UserRound,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number | string }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Events", href: "/events", icon: CalendarDays },
  { label: "Templates", href: "/templates", icon: ClipboardList },
  { label: "Ingredients", href: "/ingredients", icon: ShoppingBasket },
  { label: "Employees", href: "/employees", icon: UserRound },
  { label: "Vendors", href: "/vendors", icon: Handshake },
  { label: "Utensils", href: "/utensils", icon: CookingPot },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [opened, setOpened] = useState(false);
  const pathname = usePathname();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={opened}
            onClick={() => setOpened((o) => !o)}
            hiddenFrom="sm"
            size="sm"
          />
          <Title order={3}>Catering CRM</Title>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              component={Link}
              href={item.href}
              label={item.label}
              leftSection={<Icon size={18} />}
              active={pathname === item.href}
              onClick={() => setOpened(false)}
            />
          );
        })}
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}