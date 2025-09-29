import React from "react";

const cls = (...parts) => parts.filter(Boolean).join(" ");

export default function SidebarLink({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        "w-full text-left group flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] font-medium transition-colors",
        active ? "bg-blue-600 text-white" : "text-slate-200 hover:bg-white/5 hover:text-white"
      )}
    >
      <span
        className={cls(
          "grid place-items-center h-6 w-6 rounded-full",
          active ? "bg-blue-500/40 ring-1 ring-white/20" : ""
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span>{label}</span>
    </button>
  );
}
