// /src/pages/PayrollDashboard.jsx
import React, { useCallback, useEffect, useState } from "react";
import { Home, Users, Wallet, Settings, Clock, Upload, Plus } from "lucide-react";

import HeaderBar from "../components/HeaderBar";
import SidebarLink from "../components/SidebarLink";
import SettingsSidebar, { SETTINGS_SECTIONS } from "../components/SettingsSidebar";
import {
  BRANDING_DEFAULT,
  BRANDING_STORAGE_KEY,
  getAccentPreset,
  loadBrandingPreferences,
  persistBrandingPreferences,
} from "../utils/branding";

import DashboardHome from "./DashboardHome";
import EmployeesView from "./EmployeesView";
import WorkCalendarView, { WorkCalendarHeaderBar } from "./WorkCalendarView";
import PayRunsView from "./PayRunsView";
import SettingsView from "./SettingsView";
import EmployeeWizard from "./EmployeeWizard";

const BRAND = {
  name: "3-Click Payroll",
  logo:
    "https://static.zohocdn.com/zpayroll/zpayroll//assets/images/payroll-icon-white-94b10269fc15cf51f66a53b0332ea544.svg",
};

const cls = (...parts) => parts.filter(Boolean).join(" ");

const stepData = [
  { id: 1, state: "completed" },
  { id: 2, state: "cta" },
  { id: 3, state: "cta" },
  { id: 4, state: "open" },
  { id: 5, state: "cta" },
  { id: 6, state: "completed" },
  { id: 7, state: "completed" },
];

export default function PayrollDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("dashboard"); // 'dashboard' | 'employees' | 'work-calendar' | 'payruns' | 'settings'
  const [subroute, setSubroute] = useState(""); // e.g., 'employees/new'
  const [settingsActive, setSettingsActive] = useState("org.profile");
  const [branding, setBranding] = useState(() => {
    if (typeof window === "undefined") return { ...BRANDING_DEFAULT };
    return loadBrandingPreferences();
  });
  const [settingsTitleOverride, setSettingsTitleOverride] = useState("");
  const [calendarViewMode, setCalendarViewMode] = useState("week");

  const TABS = ["dashboard", "employees", "work-calendar", "payruns", "settings"];

  // Read current hash on load + on change
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      setSubroute(hash);
      const [maybeTab] = hash.split("/");
      if (TABS.includes(maybeTab)) setTab(maybeTab);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleUpdate = (event) => {
      if (!event?.detail) return;
      setBranding((prev) => {
        const detail = event.detail;
        if (
          prev.appearance === detail.appearance &&
          prev.accent === detail.accent
        ) {
          return prev;
        }
        return detail;
      });
    };

    window.addEventListener("branding:update", handleUpdate);
    return () => window.removeEventListener("branding:update", handleUpdate);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleStorage = (event) => {
      if (event.key === BRANDING_STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          setBranding((prev) => {
            const next = { ...BRANDING_DEFAULT, ...parsed };
            if (
              prev.appearance === next.appearance &&
              prev.accent === next.accent
            ) {
              return prev;
            }
            return next;
          });
        } catch (err) {
          console.warn("Failed to parse stored branding", err);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Keep hash in sync when tab changes (if a subroute isn't already set)
  useEffect(() => {
    if (!subroute || !subroute.startsWith(tab)) {
      window.location.hash = tab;
      setSubroute(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const applyBranding = useCallback(
    (partial) => {
      setBranding((prev) => persistBrandingPreferences(partial, prev));
    },
    [persistBrandingPreferences]
  );

  const go = (t) => () => setTab(t);
  const goMobile = (t) => () => {
    setTab(t);
    setSidebarOpen(false);
  };

  const completed = stepData.filter((s) => s.state === "completed").length;
  const isLightPane = branding.appearance === "light";
  const accentPreset = getAccentPreset(branding.accent);
  const dividerClass = isLightPane ? "bg-slate-200" : "bg-white/10";
  const desktopSidebarClass = cls(
    "hidden md:block fixed left-0 top-16 bottom-0",
    isLightPane
      ? "bg-[#F5F7FF] text-slate-800 shadow-[inset_-0.5px_0_0_rgba(15,23,42,0.16)]"
      : "bg-slate-900 text-slate-200"
  );
  const desktopNavClass = cls(
    "h-full overflow-y-auto p-4 text-sm",
    isLightPane ? "bg-transparent text-slate-700" : "bg-slate-900 text-slate-200"
  );
  const mobileAsideClass = cls(
    "absolute inset-0 p-3 shadow-xl overflow-y-auto",
    isLightPane ? "bg-white text-slate-800" : "bg-slate-900 text-slate-200"
  );
  const mobileBrandHeading = cls(
    "flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold",
    isLightPane ? "bg-white text-slate-800" : "bg-slate-800 text-white"
  );
  const supportLinkHover = isLightPane ? "hover:bg-slate-100" : "hover:bg-white/5";
  const gettingStartedCard = isLightPane
    ? "mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 p-3 text-white shadow-lg ring-1 ring-blue-300/60"
    : "mb-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-3 ring-1 ring-white/10";
  const progressTrack = isLightPane ? "bg-white/40" : "bg-white/10";
  const progressFill = isLightPane ? accentPreset.activeClass : "bg-amber-400";

  // Clear any title override when leaving Settings entirely
  useEffect(() => {
    if (tab !== "settings") setSettingsTitleOverride("");
  }, [tab]);

  const settingsTitle = (() => {
    try {
      for (const sec of SETTINGS_SECTIONS) {
        for (const group of sec.groups) {
          for (const item of group.items) {
            if (
              item.id === settingsActive ||
              (typeof settingsActive === "string" && settingsActive.startsWith(item.id + "."))
            )
              return item.label;
          }
        }
      }
    } catch (_) {}
    return "Settings";
  })();
  const effectiveSettingsTitle = settingsTitleOverride || settingsTitle;

  return (
    // pt-16 makes room for the fixed header (h-16)
    <div className="min-h-screen bg-white text-slate-900 pt-16">
      <HeaderBar
        brand={BRAND}
        q={q}
        setQ={setQ}
        onOpenSidebar={() => setSidebarOpen(true)}
        appearance={branding.appearance}
        accent={branding.accent}
        subHeader={
          tab === "settings" ? (
            <div className="flex items-center justify-between">
              <div className="text-[22px] font-semibold tracking-[-0.01em] text-slate-900">{effectiveSettingsTitle}</div>
              {settingsActive && settingsActive.startsWith("org.locations") && settingsActive !== "org.locations.new" ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                    onClick={() => setSettingsActive("org.locations.new")}
                  >
                    Add Work Location
                  </button>
                  <button
                    type="button"
                    aria-label="Export locations"
                    className="grid h-9 w-9 place-items-center rounded-lg border border-[#DDE3F3] bg-white text-slate-500 transition-colors hover:bg-slate-100"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
              ) : settingsActive && settingsActive.startsWith("org.departments") ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                    onClick={() => {
                      try {
                        window.dispatchEvent(new CustomEvent("department:new"));
                      } catch (_) {}
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    New Department
                  </button>
                  <button
                    type="button"
                    aria-label="Export departments"
                    className="grid h-10 w-10 place-items-center rounded-lg border border-[#DDE3F3] bg-white text-slate-500 transition-colors hover:bg-slate-100"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
              ) : settingsActive && settingsActive.startsWith("org.designations") ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                    onClick={() => {
                      try {
                        window.dispatchEvent(new CustomEvent("designation:new"));
                      } catch (_) {}
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    New Designation
                  </button>
                  <button
                    type="button"
                    aria-label="Export designations"
                    className="grid h-10 w-10 place-items-center rounded-lg border border-[#DDE3F3] bg-white text-slate-500 transition-colors hover:bg-slate-100"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          ) : tab === "dashboard" ? (
            <div className="text-[22px] font-semibold tracking-[-0.01em] text-slate-900">Welcome Maran!</div>
          ) : tab === "work-calendar" ? (
            <WorkCalendarHeaderBar viewMode={calendarViewMode} onChangeViewMode={setCalendarViewMode} />
          ) : null
        }
        inSettings={tab === "settings"}
        onCloseSettings={() => {
          window.location.hash = "dashboard";
        }}
      />

      {/* Sidebar (desktop) fixed on the left, below the header */}
      <aside className={desktopSidebarClass} style={{ width: "var(--sidebar-w)" }}>
        <nav className={desktopNavClass}>
          {tab !== "settings" ? (
            <div className="space-y-1">
              <SidebarLink
                icon={Home}
                label="Dashboard"
                active={tab === "dashboard"}
                onClick={go("dashboard")}
                appearance={branding.appearance}
                accent={branding.accent}
              />
              <SidebarLink
                icon={Users}
                label="Employees"
                active={tab === "employees"}
                onClick={go("employees")}
                appearance={branding.appearance}
                accent={branding.accent}
              />
              <SidebarLink
                icon={Clock}
                label="Work Calendar"
                active={tab === "work-calendar"}
                onClick={go("work-calendar")}
                appearance={branding.appearance}
                accent={branding.accent}
              />
              <SidebarLink
                icon={Wallet}
                label="Pay Runs"
                active={tab === "payruns"}
                onClick={go("payruns")}
                appearance={branding.appearance}
                accent={branding.accent}
              />
              <SidebarLink
                icon={Settings}
                label="Settings"
                active={tab === "settings"}
                onClick={go("settings")}
                appearance={branding.appearance}
                accent={branding.accent}
              />
            </div>
          ) : (
            <SettingsSidebar
              active={settingsActive}
              onSelect={setSettingsActive}
            />
          )}
        </nav>
      </aside>

      {/* Main content gets a left margin equal to the sidebar width on desktop */}
      <main className={cls(
        "px-4 md:px-8 lg:px-12 xl:px-16 md:ml-[var(--sidebar-w)]",
        tab === "settings" || tab === "dashboard" ? "lg:pt-[84px]" : "",
        tab === "work-calendar" ? "lg:pt-[420px]" : ""
      )}>
        <div className="mx-auto max-w-none">
          {tab === "dashboard" && <DashboardHome />}

          {tab === "employees" && (
            subroute === "employees/new"
              ? (
                <EmployeeWizard
                  onCancel={() => (window.location.hash = "employees")}
                  // IMPORTANT: no onFinish redirect here, so the success screen in the wizard can show.
                />
              )
              : <EmployeesView />
          )}

          {tab === "work-calendar" && (
            <WorkCalendarView viewMode={calendarViewMode} onChangeViewMode={setCalendarViewMode} />
          )}
          {tab === "payruns" && <PayRunsView />}
          {tab === "settings" && (
            <SettingsView
              branding={branding}
              onUpdateBranding={applyBranding}
              active={settingsActive}
              onSelect={setSettingsActive}
              onSetTitle={setSettingsTitleOverride}
            />
          )}
        </div>
      </main>

      {/* Mobile full-screen sidebar (over the header) */}
      <div className={cls("fixed inset-0 z-[60] md:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
        <aside className={mobileAsideClass} role="dialog" aria-modal="true">
          <div className="mb-2 mt-1 flex items-center justify-between">
            <div className={mobileBrandHeading}>
              <img src={BRAND.logo} alt="Logo" className="h-5 w-5" />
              <span>{BRAND.name}</span>
            </div>
            <button
              className={cls(
                "rounded-lg p-2",
                isLightPane ? "hover:bg-slate-100 text-slate-500" : "hover:bg-white/10"
              )}
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="mt-2 space-y-1">
            {/* quick “Getting Started” card */}
            <div className={gettingStartedCard}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    className={cls(
                      "h-5 w-5",
                      isLightPane ? "text-white" : "text-amber-300"
                    )}
                    fill="currentColor"
                  >
                    <path d="M12 2a1 1 0 01.894.553l2.382 4.764 5.257.764a1 1 0 01.554 1.705l-3.8 3.704.897 5.228a1 1 0 01-1.451 1.054L12 18.347l-4.683 2.465a1 1 0 01-1.451-1.054l.897-5.228-3.8-3.704a1 1 0 01.554-1.705l5.257-.764L11.106 2.553A1 1 0 0112 2z" />
                  </svg>
                  <span className="font-semibold">Getting Started</span>
                </div>
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/80"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div className={cls("mt-3 h-1.5 w-full rounded-full", progressTrack)}>
                <div className={cls("h-1.5 rounded-full", progressFill)} style={{ width: "60%" }} />
              </div>
            </div>

            {/* nav items */}
            <SidebarLink
              icon={Home}
              label="Dashboard"
              active={tab === "dashboard"}
              onClick={goMobile("dashboard")}
              appearance={branding.appearance}
              accent={branding.accent}
            />
            <SidebarLink
              icon={Users}
              label="Employees"
              active={tab === "employees"}
              onClick={goMobile("employees")}
              appearance={branding.appearance}
              accent={branding.accent}
            />
            <SidebarLink
              icon={Clock}
              label="Work Calendar"
              active={tab === "work-calendar"}
              onClick={goMobile("work-calendar")}
              appearance={branding.appearance}
              accent={branding.accent}
            />
            <div className={cls("my-1 h-px", dividerClass)} />
            <SidebarLink
              icon={Wallet}
              label="Pay Runs"
              active={tab === "payruns"}
              onClick={goMobile("payruns")}
              appearance={branding.appearance}
              accent={branding.accent}
            />
            <div className={cls("my-1 h-px", dividerClass)} />
            <SidebarLink
              icon={Settings}
              label="Settings"
              active={tab === "settings"}
              onClick={goMobile("settings")}
              appearance={branding.appearance}
              accent={branding.accent}
            />

            <div
              className={cls(
                "mt-4 border-t pt-3 text-xs",
                isLightPane ? "border-slate-200 text-slate-500" : "border-white/10 text-slate-300"
              )}
            >
              <a
                href="#"
                className={cls("rounded-md px-2 py-1", supportLinkHover)}
              >
                Contact Support
              </a>
            </div>
          </nav>
        </aside>
      </div>
    </div>
  );
}
