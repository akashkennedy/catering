"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";

type CheckRowProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  ariaLabel?: string;
};

/**
 * Checkbox replacement with no native <input> inside — some older Android
 * WebViews ignore `appearance: none` and paint the native tick on top of the
 * custom one (double tick). A plain button + Lucide SVG renders exactly once.
 */
export function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className="toggle-switch"
      data-checked={checked || undefined}
    >
      <span className="toggle-switch__thumb" aria-hidden />
    </button>
  );
}

export function CheckRow({ checked, onChange, label, description, ariaLabel }: CheckRowProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className="check-row"
      data-checked={checked || undefined}
    >
      <span className="check-row__box" aria-hidden>
        {checked && <Check size={14} strokeWidth={3.5} />}
      </span>
      <span className="check-row__text">
        <span className="check-row__label">{label}</span>
        {description ? <span className="check-row__desc">{description}</span> : null}
      </span>
    </button>
  );
}
