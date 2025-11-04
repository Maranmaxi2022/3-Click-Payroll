import React from "react";

import { BRANDING_DEFAULT } from "../utils/branding";

const cls = (...parts) => parts.filter(Boolean).join(" ");

export default function SidebarLink({
  icon: Icon,
  label,
  active = false,
  onClick,
  appearance = BRANDING_DEFAULT.appearance,
}) {
  const isLight = appearance === "light";

  const baseButton = "w-full text-left group flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition-all";
  const inactive = isLight
    ? "text-slate-700 hover:bg-slate-100"
    : "text-slate-200 hover:bg-white/5 hover:text-white";
  const activeClasses = isLight
    ? "bg-indigo-50 text-indigo-600"
    : "bg-cyan-500/10 text-cyan-400";

  const iconWrap = cls(
    "grid place-items-center",
    active
      ? isLight
        ? "text-indigo-600"
        : "text-cyan-400"
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
