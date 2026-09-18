"use client";

import { Moon, Sun } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { useTheme } from "@/hooks/useTheme";
import { ui } from "@/lib/i18n";

export function ThemeControl() {
  const { mode, toggleTheme, resolved } = useTheme();
  const dark = mode === "dark";

  return (
    <div
      className="app-nav-item"
      role="switch"
      aria-checked={dark}
      aria-label="Toggle dark mode"
      tabIndex={resolved ? 0 : -1}
      onClick={resolved ? toggleTheme : undefined}
      onKeyDown={
        resolved
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleTheme();
              }
            }
          : undefined
      }
      style={{ cursor: resolved ? "pointer" : "default" }}
    >
      <Moon size={18} aria-hidden />
      <span className="app-nav-item__label">
        <Bilingual label={ui.settings.dark} />
      </span>
      <span
        aria-hidden
        className={`theme-toggle${dark ? " theme-toggle--dark" : ""}`}
        style={{ marginLeft: "auto", pointerEvents: "none" }}
      >
        <span className="theme-toggle__icon theme-toggle__icon--sun" aria-hidden>
          <Sun size={14} />
        </span>
        <span className="theme-toggle__icon theme-toggle__icon--moon" aria-hidden>
          <Moon size={14} />
        </span>
        <span className="theme-toggle__knob" aria-hidden />
      </span>
    </div>
  );
}
