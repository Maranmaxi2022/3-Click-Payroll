import React from "react";

import { BRANDING_DEFAULT, getAccentPreset } from "../utils/branding";

const cls = (...parts) => parts.filter(Boolean).join(" ");

export default function SidebarLink({
  icon: Icon,
  label,
  active = false,
  onClick,
  appearance = BRANDING_DEFAULT.appearance,
  accent = BRANDING_DEFAULT.accent,
}) {
  const accentPreset = getAccentPreset(accent);
  const isLight = appearance === "light";

  const baseButton = "w-full text-left group flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] font-medium transition-all";
  const inactive = isLight
    ? "text-slate-700 hover:bg-slate-100"
    : "text-slate-200 hover:bg-white/5 hover:text-white";
  const activeClasses = cls(
    accentPreset.activeClass,
    "text-white border border-transparent",
    isLight ? cls("ring-2", accentPreset.ringClass, "shadow-[0_12px_24px_-18px_rgba(15,23,42,0.6)]") : ""
  );

  const iconWrap = cls(
    "grid place-items-center h-6 w-6 rounded-full",
    active
      ? isLight
        ? "bg-white/20 text-white"
        : "bg-white/20 text-white ring-1 ring-white/30"
      : isLight
      ? "text-slate-500"
      : "text-slate-200/80"
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(baseButton, active ? activeClasses : inactive)}
    >
      <span className={iconWrap}>
        <Icon className="h-4 w-4" />
      </span>
      <span>{label}</span>
    </button>
  );
}
