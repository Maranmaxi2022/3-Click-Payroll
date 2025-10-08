import React from "react";
import { Bell, Settings } from "lucide-react";

import { BRANDING_DEFAULT, getAccentPreset } from "../utils/branding";

const cls = (...parts) => parts.filter(Boolean).join(" ");

export default function HeaderBar({
  brand,
  q,
  setQ,
  onOpenSidebar,
  appearance = BRANDING_DEFAULT.appearance,
  accent = BRANDING_DEFAULT.accent,
}) {
  const isLightSidebar = appearance === "light";
  const accentPreset = getAccentPreset(accent);
  const brandPaneClass = "hidden md:flex h-16 w-[240px] shrink-0 items-center gap-3 bg-[#141D33] text-white px-3";
  const brandIconClass = "grid h-9 w-9 place-items-center rounded-xl bg-[#1B2644] text-white";
  const brandDotClass = cls("h-2.5 w-2.5 rounded-full", accentPreset.activeClass);
  const brandNameClass = "text-[13px] font-semibold tracking-[-0.01em]";
  const brandSubClass = "text-[11px] font-medium text-slate-300";

  return (
    // Fixed to the viewport (no movement on vertical or horizontal scroll)
    <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 pl-0 pr-4">
        {/* Mobile menu */}
        <button
          className="md:hidden rounded-lg p-2 hover:bg-slate-100"
          aria-label="Open menu"
          onClick={onOpenSidebar}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Brand block (matches sidebar width on desktop) */}
        <div className={brandPaneClass}>
          <div className={brandIconClass}>
            <img src={brand.logo} alt="Logo" className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={brandDotClass} />
              <span className={brandNameClass}>Payroll</span>
            </div>
            <span className={brandSubClass}>Organisation Settings</span>
          </div>
        </div>

        {/* Search */}
        <div className="ml-3 w-full md:w-[560px] lg:w-[620px] shrink-0">
          <div className="group flex h-9 w-full items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50/80 shadow-[0_1px_0_0_rgba(0,0,0,0.02)] backdrop-blur-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
            <button type="button" aria-label="Advanced Search" className="flex items-center gap-1 pl-2.5 pr-2 py-1.5 text-slate-600 hover:bg-slate-100">
              <svg viewBox="0 0 512 512" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M505.2 475.8l-87.3-87.3C453.6 346.1 473 293 473 237c0-63-24.5-122.3-69.1-166.9C359.3 25.5 300 1 237 1S114.7 25.5 70.1 70.1C25.5 114.7 1 174 1 237s24.5 122.3 69.1 166.9C114.7 448.5 174 473 237 473c55.9 0 108.9-19.3 151.2-54.8l87.3 87.3c4.1 4.1 9.5 6.2 14.8 6.2s10.7-2 14.8-6.2c8.3-8.2 8.3-21.5.1-29.7zM43 237c0-107 87-194 194-194s194 87 194 194-87 194-194 194S43 344 43 237z" />
              </svg>
              <svg viewBox="0 0 16 16" className="h-3 w-3 text-slate-500" aria-hidden="true">
                <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <input
              placeholder="Search in Employee"
              className="flex-1 bg-transparent px-2.5 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search in Employee"
            />
            <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="mx-1 rounded-md p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100">
              <svg viewBox="0 0 512 512" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M308.4 256L500.6 63.8c14.5-14.5 14.5-37.9 0-52.4s-37.9-14.5-52.4 0L256 203.6 63.8 11.4c-14.5-14.5-37.9-14.5-52.4 0s-14.5 37.9 0 52.4L203.6 256 11.4 448.2c-14.5 14.5-14.5 37.9 0 52.4 7.2 7.2 16.7 10.9 26.2 10.9s19-3.6 26.2-10.9L256 308.4l192.2 192.2c7.2 7.2 16.7 10.9 26.2 10.9s19-3.6 26.2-10.9c14.5-14.5 14.5-37.9 0-52.4L308.4 256z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right actions */}
        <div className="hidden flex-1 md:block" />
        <div className="hidden items-center gap-2 md:flex ml-auto">
          <button className="rounded-lg p-2 hover:bg-slate-100" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 hover:bg-slate-100" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </button>
          <button className="overflow-hidden rounded-full ring-2 ring-slate-200" aria-label="Account">
            <img
              alt="User"
              className="h-8 w-8 object-cover"
              src="https://contacts.zoho.com/file?t=user&ID=900477284&fs=thumb&nps=400"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
