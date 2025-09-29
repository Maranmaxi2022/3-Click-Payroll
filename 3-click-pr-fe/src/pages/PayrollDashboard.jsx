// /src/pages/PayrollDashboard.jsx
import React, { useEffect, useState } from "react";
import { Home, Users, Wallet, Settings, Clock } from "lucide-react";

import HeaderBar from "../components/HeaderBar";
import SidebarLink from "../components/SidebarLink";

import DashboardHome from "./DashboardHome";
import EmployeesView from "./EmployeesView";
import TimeOffView from "./TimeOffView";
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
  const [tab, setTab] = useState("dashboard"); // 'dashboard' | 'employees' | 'timeoff' | 'payruns' | 'settings'
  const [subroute, setSubroute] = useState(""); // e.g., 'employees/new'

  const TABS = ["dashboard", "employees", "timeoff", "payruns", "settings"];

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

  // Keep hash in sync when tab changes (if a subroute isn't already set)
  useEffect(() => {
    if (!subroute || !subroute.startsWith(tab)) {
      window.location.hash = tab;
      setSubroute(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const go = (t) => () => setTab(t);
  const goMobile = (t) => () => {
    setTab(t);
    setSidebarOpen(false);
  };

  const completed = stepData.filter((s) => s.state === "completed").length;

  return (
    // pt-16 makes room for the fixed header (h-16)
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-16">
      <HeaderBar brand={BRAND} q={q} setQ={setQ} onOpenSidebar={() => setSidebarOpen(true)} />

      {/* Sidebar (desktop) fixed on the left, below the header */}
      <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-[240px] bg-slate-900">
        <nav className="h-full overflow-y-auto bg-slate-900 p-3 text-sm text-slate-200">
          <div className="space-y-1">
            <SidebarLink icon={Home} label="Dashboard"  active={tab === "dashboard"} onClick={go("dashboard")} />
            <SidebarLink icon={Users} label="Employees"  active={tab === "employees"} onClick={go("employees")} />
            <SidebarLink icon={Clock} label="Time Off"   active={tab === "timeoff"}    onClick={go("timeoff")} />
            <div className="my-1 h-px bg-white/10" />
            <SidebarLink icon={Wallet} label="Pay Runs"  active={tab === "payruns"}    onClick={go("payruns")} />
            <div className="my-1 h-px bg-white/10" />
            <SidebarLink icon={Settings} label="Settings" active={tab === "settings"} onClick={go("settings")} />
          </div>
        </nav>
      </aside>

      {/* Main content gets a left margin equal to the sidebar width on desktop */}
      <main className="px-4 md:px-6 md:ml-[240px]">
        <div className="mx-auto max-w-[1400px]">
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

          {tab === "timeoff" && <TimeOffView />}
          {tab === "payruns" && <PayRunsView />}
          {tab === "settings" && <SettingsView />}
        </div>
      </main>

      {/* Mobile full-screen sidebar (over the header) */}
      <div className={cls("fixed inset-0 z-[60] md:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
        <aside className="absolute inset-0 bg-slate-900 text-slate-200 p-3 shadow-xl overflow-y-auto" role="dialog" aria-modal="true">
          <div className="mb-2 mt-1 flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-xl bg-slate-800 px-2 py-1 text-white">
              <img src={BRAND.logo} alt="Logo" className="h-4 w-4" />
              <span className="text-sm font-semibold">{BRAND.name}</span>
            </div>
            <button className="rounded-lg p-2 hover:bg-white/10" aria-label="Close menu" onClick={() => setSidebarOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="mt-2 space-y-1">
            {/* quick “Getting Started” card */}
            <div className="mb-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-3 ring-1 ring-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-300" fill="currentColor">
                    <path d="M12 2a1 1 0 01.894.553l2.382 4.764 5.257.764a1 1 0 01.554 1.705l-3.8 3.704.897 5.228a1 1 0 01-1.451 1.054L12 18.347l-4.683 2.465a1 1 0 01-1.451-1.054l.897-5.228-3.8-3.704a1 1 0 01.554-1.705l5.257-.764L11.106 2.553A1 1 0 0112 2z" />
                  </svg>
                  <span className="font-semibold text-white">Getting Started</span>
                </div>
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
                <div className="h-1.5 rounded-full bg-amber-400" style={{ width: "60%" }} />
              </div>
            </div>

            {/* nav items */}
            <SidebarLink icon={Home}  label="Dashboard" active={tab==="dashboard"} onClick={goMobile("dashboard")} />
            <SidebarLink icon={Users} label="Employees" active={tab==="employees"} onClick={goMobile("employees")} />
            <SidebarLink icon={Clock} label="Time Off"  active={tab==="timeoff"}   onClick={goMobile("timeoff")} />
            <div className="my-1 h-px bg-white/10" />
            <SidebarLink icon={Wallet} label="Pay Runs" active={tab==="payruns"} onClick={goMobile("payruns")} />
            <div className="my-1 h-px bg-white/10" />
            <SidebarLink icon={Settings} label="Settings" active={tab==="settings"} onClick={goMobile("settings")} />

            <div className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-300">
              <a href="#" className="rounded-md px-2 py-1 hover:bg-white/5">Contact Support</a>
            </div>
          </nav>
        </aside>
      </div>
    </div>
  );
}
