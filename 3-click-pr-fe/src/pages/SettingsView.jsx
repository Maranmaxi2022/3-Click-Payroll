// src/pages/SettingsView.jsx
import React, { useMemo, useState } from "react";

const cx = (...xs) => xs.filter(Boolean).join(" ");

function Chevron({ open }) {
  return (
    <svg viewBox="0 0 20 20" className={cx("h-4 w-4 transition-transform", open ? "rotate-90" : "")}>
      <path d="M7 5l6 5-6 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function GroupHeader({ title, open, toggle }) {
  return (
    <button
      type="button"
      onClick={toggle}
      className="flex w-full items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-left text-[15px] font-semibold text-slate-900"
    >
      <Chevron open={open} />
      {title}
    </button>
  );
}

function LeftItem({ id, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={cx(
        "w-full rounded-xl px-5 py-2 text-left text-[16px]",
        active ? "bg-blue-600 text-white shadow-[0_1px_0_rgba(0,0,0,0.04)]" : "text-slate-900 hover:bg-slate-100"
      )}
    >
      {label}
    </button>
  );
}

/* ---------- MAIN VIEW ---------- */
export default function SettingsView() {
  // Active leaf item
  const [active, setActive] = useState("org.profile");

  // Which groups are expanded
  const [open, setOpen] = useState({
    org: true,
    users: false,
    taxes: false,
    setup: false,
    custom: false,
    automations: false,
    mod_general: false,
    mod_payments: false,
    mod_custom: false,
    ext: false,
  });

  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  // Sidebar blueprint (matches your screenshots)
  const sections = useMemo(
    () => [
      {
        caption: "ORGANISATION SETTINGS",
        groups: [
          {
            id: "org",
            title: "Organisation",
            items: [
              { id: "org.profile", label: "Profile" },
              { id: "org.branding", label: "Branding" },
              { id: "org.locations", label: "Work Locations" },
              { id: "org.departments", label: "Departments" },
              { id: "org.designations", label: "Designations" },
              { id: "org.subscriptions", label: "Subscriptions" },
            ],
          },
          {
            id: "users",
            title: "Users and Roles",
            items: [
              { id: "users.users", label: "Users" },
              { id: "users.roles", label: "Roles" },
            ],
          },
          {
            id: "taxes",
            title: "Taxes",
            items: [{ id: "taxes.details", label: "Tax Details" }],
          },
          {
            id: "setup",
            title: "Setup & Configurations",
            items: [
              { id: "setup.schedule", label: "Pay Schedule" },
              { id: "setup.statutory", label: "Statutory Components" },
              { id: "setup.salaryComponents", label: "Salary Components" },
              { id: "setup.portal", label: "Employee Portal" },
              { id: "setup.claims", label: "Claims and Declarations" },
            ],
          },
          {
            id: "custom",
            title: "Customisations",
            items: [
              { id: "custom.emailTemplates", label: "Email Templates" },
              { id: "custom.senderPrefs", label: "Sender Email Preferences" },
              { id: "custom.salaryTemplates", label: "Salary Templates" },
              { id: "custom.pdfTemplates", label: "PDF Templates" },
              { id: "custom.reportingTags", label: "Reporting Tags" },
            ],
          },
          {
            id: "automations",
            title: "Automations",
            items: [
              { id: "auto.rules", label: "Workflow Rules" },
              { id: "auto.actions", label: "Actions" },
              { id: "auto.schedules", label: "Schedules" },
              { id: "auto.logs", label: "Workflow Logs" },
            ],
          },
        ],
      },
      {
        caption: "MODULE SETTINGS",
        groups: [
          {
            id: "mod_general",
            title: "General",
            items: [
              { id: "mod.emp", label: "Employees" },
              { id: "mod.payruns", label: "Pay Runs" },
              { id: "mod.revisions", label: "Salary revisions" },
              { id: "mod.leave", label: "Leave" },
              { id: "mod.loans", label: "Loans" },
            ],
          },
          {
            id: "mod_payments",
            title: "Payments",
            items: [{ id: "mod.directDeposits", label: "Direct Deposits" }],
          },
          {
            id: "mod_custom",
            title: "Custom Modules",
            items: [{ id: "mod.custom.overview", label: "Overview" }],
          },
        ],
      },
      {
        caption: "EXTENSIONS & DEVELOPER DATA",
        groups: [
          {
            id: "ext",
            title: "Integrations & Developer Data",
            items: [
              { id: "ext.integrations", label: "Integrations" },
              { id: "ext.dev", label: "Developer Data" },
            ],
          },
        ],
      },
    ],
    []
  );

  /* ---- RIGHT CONTENT (sample) ---- */
  const Right = () => {
    if (active === "org.profile") return <OrgProfile />;
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
        This is a placeholder for <span className="font-medium">{active}</span>.
      </div>
    );
  };

  return (
    <div className="pb-6">
      <Header />

      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
        {/* LEFT SIDEBAR */}
        <aside className="rounded-xl border border-slate-200 bg-white p-3">
          {sections.map((sec) => (
            <div key={sec.caption} className="mb-5 last:mb-0">
              <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {sec.caption}
              </div>

              {sec.groups.map((g) => (
                <div key={g.id} className="mb-3 last:mb-0">
                  <GroupHeader title={g.title} open={open[g.id]} toggle={() => toggle(g.id)} />
                  {open[g.id] && (
                    <div className="mt-1 space-y-1">
                      {g.items.map((it) => (
                        <LeftItem
                          key={it.id}
                          id={it.id}
                          label={it.label}
                          active={active === it.id}
                          onClick={setActive}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </aside>

        {/* RIGHT CONTENT */}
        <section className="min-h-[60vh]">
          <Right />
        </section>
      </div>
    </div>
  );
}

/* ---- The same header and Org Profile from earlier (trimmed for brevity) ---- */
function Header() {
  return (
    <div className="sticky top-[calc(64px)] z-10 -mx-4 border-b border-slate-200 bg-white/80 px-4 pb-3 pt-3 backdrop-blur md:-mx-6 md:px-6">
      <div className="flex items-center justify-between">
        <div className="text-[15px] font-semibold text-slate-900">All Settings</div>
        <div className="hidden md:block w-[420px]">
          <input
            className="h-9 w-full rounded-full border border-slate-200 bg-white px-4 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Search settings ( / )"
          />
        </div>
        <button
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          onClick={() => (window.location.hash = "dashboard")}
        >
          Close Settings ✕
        </button>
      </div>
    </div>
  );
}

function OrgProfile() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Organisation Profile</h2>
        <div className="text-xs text-slate-500">
          Organisation ID: <span className="font-mono">900478380</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
          <div>
            <div className="text-sm font-medium text-slate-700">Organisation Logo</div>
            <div className="mt-2 grid h-[120px] w-[180px] place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500">
              UPLOAD LOGO
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Preferred 240×240 @ 72 DPI, Max 1MB. PNG, JPG, JPEG.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-slate-700">Organisation Name *</label>
              <input className="input mt-1" defaultValue="Qula" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-slate-700">Industry *</label>
                <select className="input mt-1">
                  <option>Engineering</option>
                  <option>IT Services</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-700">Business Location *</label>
                <input className="input mt-1" defaultValue="India" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-slate-700">Date Format *</label>
                <select className="input mt-1" defaultValue="dd/MM/yyyy [ 28/09/2025 ]">
                  <option>dd/MM/yyyy [ 28/09/2025 ]</option>
                  <option>MM/dd/yyyy [ 09/28/2025 ]</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-700">Field Separator</label>
                <select className="input mt-1" defaultValue="/">
                  <option>/</option>
                  <option>-</option>
                  <option>.</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <label className="block text-sm font-medium text-slate-800">Organisation Address *</label>
              <input className="input" defaultValue="No. 15, 2nd Cross Street, Raja Annamalaipuram (RA Puram)" />
              <input className="input" placeholder="Address Line 2" />
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <select className="input">
                  <option>Tamil Nadu</option>
                </select>
                <input className="input" defaultValue="Chennai" />
                <input className="input" defaultValue="600028" />
              </div>

              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="mb-1 flex items-center justify-between text-sm font-semibold text-slate-800">
                  <span>Head Office</span>
                  <a href="#" className="text-blue-600 hover:underline">Change</a>
                </div>
                <div className="text-sm text-slate-700">
                  No. 15, 2nd Cross Street, Raja Annamalaipuram (RA Puram), Chennai, Tamil Nadu 600028
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
              <button className="h-9 rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700">Save</button>
              <div className="text-xs font-medium text-red-500">* indicates mandatory fields</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* small utilities (Tailwind v4) */
const css = `
.input{ @apply h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200; }
`;
if (typeof document !== "undefined" && !document.getElementById("settings-css")) {
  const tag = document.createElement("style");
  tag.id = "settings-css";
  tag.innerHTML = css;
  document.head.appendChild(tag);
}
