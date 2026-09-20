"use client";

import { useState } from "react";
import {
  Drawer,
  Stack,
} from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  Plus,
  MoreHorizontal,
  ClipboardList,
  ShoppingBasket,
  LogOut,
  UserRound,
  Wallet,
  Globe,
  Settings,
  PhoneCall,
} from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { preferredText, ui, type Label } from "@/lib/i18n";
import { useAuthStore } from "@/store/auth";
import { useSettingsStore } from "@/store/settings";

type MobileNavItem = {
  label: Label;
  href: string;
  icon: React.ComponentType<{ size?: number | string }>;
};

const PRIMARY_TABS: MobileNavItem[] = [
  { label: ui.nav.dashboard, href: "/", icon: LayoutDashboard },
  { label: ui.nav.events, href: "/events", icon: CalendarDays },
  { label: ui.nav.ingredients, href: "/ingredients", icon: ShoppingBasket },
];

const MORE_ITEMS: MobileNavItem[] = [
  { label: ui.nav.templates, href: "/templates", icon: ClipboardList },
  { label: ui.nav.employees, href: "/employees", icon: UserRound },
  { label: ui.dashboard.customerFollowUp, href: "/follow-ups", icon: PhoneCall },
  { label: ui.nav.website, href: "/site-manager", icon: Globe },
  { label: ui.nav.finance, href: "/finance", icon: Wallet },
  { label: ui.nav.settings, href: "/settings", icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav({ onAddEvent }: { onAddEvent: () => void }) {
  const pathname = usePathname();
  const [moreOpened, setMoreOpened] = useState(false);
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const moreLabel = preferredText(ui.nav.more, uiLanguage);
  const logout = useAuthStore((state) => state.logout);
  const addEventLabel = preferredText(ui.events.addEvent, uiLanguage);

  const permissions = useAuthStore((state) => state.permissions);
  const visibleMoreItems = MORE_ITEMS.filter((item) => {
    if (item.href === "/finance" && !permissions.canViewFinance) return false;
    if (item.href === "/employees" && !permissions.canViewEmployees) return false;
    if (item.href === "/site-manager" && !permissions.canViewWebsite) return false;
    return true;
  });
  const moreActive = visibleMoreItems.some((item) => isActive(pathname, item.href));

  return (
    <>
      <nav className="mobile-bottom-nav">
        {PRIMARY_TABS.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-bottom-nav__item${active ? " mobile-bottom-nav__item--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} />
              <span className="mobile-bottom-nav__label">
                <Bilingual label={item.label} />
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          className="mobile-bottom-nav__plus-wrap"
          onClick={onAddEvent}
          aria-label={addEventLabel}
        >
          <span className="mobile-bottom-nav__plus" aria-hidden>
            <Plus size={24} />
          </span>
        </button>
        {PRIMARY_TABS.slice(2).map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-bottom-nav__item${active ? " mobile-bottom-nav__item--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} />
              <span className="mobile-bottom-nav__label">
                <Bilingual label={item.label} />
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          className={`mobile-bottom-nav__item${moreActive ? " mobile-bottom-nav__item--active" : ""}`}
          onClick={() => setMoreOpened(true)}
          aria-label={moreLabel}
        >
          <MoreHorizontal size={20} />
          <span className="mobile-bottom-nav__label">{moreLabel}</span>
        </button>
      </nav>

      <Drawer
        opened={moreOpened}
        onClose={() => setMoreOpened(false)}
        position="right"
        size={300}
        title={moreLabel}
        classNames={{ content: "mobile-more-drawer" }}
        styles={{
          header: { borderBottom: "1px solid var(--border)" },
        }}
      >
        <Stack gap={0}>
          {visibleMoreItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpened(false)}
                className={`mobile-more-item${active ? " mobile-more-item--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={20} />
                <span>
                  <Bilingual label={item.label} />
                </span>
              </Link>
            );
          })}
          <button
            type="button"
            className="mobile-more-item"
            style={{ width: "100%", background: "none", border: "none", cursor: "pointer" }}
            onClick={() => {
              setMoreOpened(false);
              void logout();
            }}
          >
            <LogOut size={20} aria-hidden />
            <span>
              <Bilingual label={ui.auth.logout} />
            </span>
          </button>
        </Stack>
      </Drawer>
    </>
  );
}