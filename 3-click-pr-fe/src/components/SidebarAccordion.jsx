import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

const cls = (...parts) => parts.filter(Boolean).join(" ");

export default function SidebarAccordion({ icon: Icon, label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1">
      <button
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-white"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4" /> {label}
        </span>
        {open ? <ChevronRight className="h-4 w-4 rotate-90" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      <div
        className={cls(
          "ml-2 overflow-hidden pl-4 transition-[max-height] duration-300",
          open ? "max-h-96" : "max-h-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}
