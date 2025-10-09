// src/pages/SettingsView.jsx
import React, { useMemo, useState } from "react";
import { MapPin, MoreHorizontal, Pencil, Plus, Upload, Users } from "lucide-react";

import {
  ACCENT_LIST,
  BRANDING_DEFAULT,
  getAccentPreset,
  persistBrandingPreferences,
} from "../utils/branding";

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
export default function SettingsView({
  branding = BRANDING_DEFAULT,
  onUpdateBranding,
}) {
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
  const handleBrandingChange = (partial) => {
    if (typeof onUpdateBranding === "function") {
      onUpdateBranding(partial);
      return;
    }
    persistBrandingPreferences(partial);
  };

  const Right = () => {
    if (active === "org.profile") return <OrgProfile />;
    if (active === "org.branding")
      return (
        <OrgBranding
          branding={branding}
          onUpdateBranding={handleBrandingChange}
        />
      );
    if (active === "org.locations") return <WorkLocationsView />;
    if (active === "org.departments") return <DepartmentsView />;
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

function OrgBranding({ branding, onUpdateBranding }) {
  const appearance = branding?.appearance ?? BRANDING_DEFAULT.appearance;
  const accent = branding?.accent ?? BRANDING_DEFAULT.accent;
  const activeAccent = getAccentPreset(accent);

  const handleAppearance = (id) => {
    if (id === appearance) return;
    onUpdateBranding?.({ appearance: id });
  };

  const handleAccent = (id) => {
    if (id === accent) return;
    onUpdateBranding?.({ accent: id });
  };

  const appearanceOptions = [
    {
      id: "dark",
      title: "Dark Pane",
      description: "Sidebar stays dark with your accent on highlights.",
    },
    {
      id: "light",
      title: "Light Pane",
      description: "Sidebar switches to a light theme with accents.",
    },
  ];

  const preview = (variant) => {
    const navBg = variant === "dark" ? "bg-slate-900" : "bg-white";
    const navBorder = variant === "dark" ? "border-white/10" : "border-slate-200";
    const lineMuted = variant === "dark" ? "bg-white/20" : "bg-slate-300";
    const lineSoft = variant === "dark" ? "bg-white/10" : "bg-slate-200";
    const mainBg = variant === "dark" ? "bg-slate-800/60" : "bg-white";

    return (
      <div
        className={cx(
          "flex h-[88px] w-[148px] items-stretch gap-2 rounded-2xl border p-2 shadow-sm",
          variant === "dark"
            ? "border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800"
            : "border-slate-200 bg-slate-50"
        )}
      >
        <div className={cx("flex w-[46%] flex-col gap-1 rounded-xl border p-2", navBg, navBorder)}>
          <div className={cx("h-2 rounded-full", activeAccent.activeClass)} />
          <div className={cx("h-1.5 rounded-full", lineMuted)} />
          <div className={cx("h-1.5 rounded-full", lineSoft)} />
          <div className={cx("h-1.5 rounded-full", lineSoft)} />
        </div>
        <div className={cx("flex flex-1 flex-col gap-2 rounded-xl border", mainBg, navBorder)}>
          <div className="mt-2 mx-3 h-2 rounded-full bg-slate-300/60" />
          <div className="mx-3 h-2 rounded-full bg-slate-300/40" />
          <div className="mx-3 mb-2 h-2 rounded-full bg-slate-300/20" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Branding</h2>

      <div className="space-y-8 rounded-xl border border-slate-200 bg-white p-6">
        <section>
          <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Appearance</div>
          <div className="mt-4 flex flex-wrap gap-4">
            {appearanceOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleAppearance(option.id)}
                className={cx(
                  "flex w-full max-w-[320px] items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all",
                  appearance === option.id
                    ? cx(
                        "shadow-[0_12px_24px_-18px_rgba(15,23,42,0.4)] ring-2",
                        activeAccent.borderClass,
                        activeAccent.softClass,
                        activeAccent.textClass,
                        activeAccent.ringClass
                      )
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                {preview(option.id)}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {option.title}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Accent Color</div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {ACCENT_LIST.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleAccent(preset.id)}
                className={cx(
                  "flex min-w-[72px] flex-col items-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition",
                  accent === preset.id
                    ? cx(
                        "ring-2",
                        preset.borderClass,
                        preset.softClass,
                        preset.textClass,
                        preset.ringClass
                      )
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                )}
              >
                <span
                  className={cx("h-8 w-12 rounded-md", preset.swatchClass)}
                />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Note: These preferences will be applied across Zoho Finance apps.
          </p>
        </section>
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

function WorkLocationsView() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const locations = [
    {
      id: "head-office",
      name: "Head Office",
      addressLines: [
        "No. 15, 2nd Cross Street, Raja Annamalaipuram (RA Puram)",
        "Chennai, Tamil Nadu 600028",
      ],
      employees: 2,
      tag: "Filing Address",
    },
  ];

  return (
    <>
      <div className="space-y-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Work Locations</h2>
            <p className="text-sm text-slate-500">
              Maintain addresses that appear on filings and employee documents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            onClick={() => setIsFormOpen(true)}
          >
            Add Work Location
          </button>
          <button
            type="button"
            aria-label="Pin on map"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100"
          >
            <MapPin className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {locations.map((location) => (
          <article
            key={location.id}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <header>
                  <h3 className="text-base font-semibold text-slate-900">
                    {location.name}
                  </h3>
                </header>
                <div className="space-y-1 text-sm text-slate-600">
                  {location.addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Users className="h-4 w-4" />
                  <span>{location.employees} Employees</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start">
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100"
                  aria-label="Edit work location"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {location.tag && (
              <span className="absolute bottom-0 right-0 rounded-tl-lg bg-emerald-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                {location.tag}
              </span>
            )}
          </article>
        ))}
      </div>
      </div>

      {isFormOpen && (
        <WorkLocationDialog onClose={() => setIsFormOpen(false)} />
      )}
    </>
  );
}

function WorkLocationDialog({ onClose }) {
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 py-10 sm:px-6"
      onClick={handleOverlayClick}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[560px] rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-slate-200 px-6 pb-4 pt-5">
          <h2 className="text-xl font-semibold text-slate-900">New Work Location</h2>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Work Location Name<span className="text-red-500">*</span>
            </label>
            <input className="input" placeholder="e.g., Head Office" autoFocus />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Address<span className="text-red-500">*</span>
            </label>
            <input className="input" placeholder="Address Line 1" />
            <input className="input" placeholder="Address Line 2" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_1fr_1fr]">
              <select className="input">
                <option>Select a state</option>
                <option>Tamil Nadu</option>
                <option>Karnataka</option>
              </select>
              <input className="input" placeholder="City" />
              <input className="input" placeholder="PIN Code" />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
            <span className="text-xs font-medium text-red-500">
              * indicates mandatory fields
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

function DepartmentsView() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const departments = [
    {
      id: "dept-eng",
      name: "Engineering",
      code: "001",
      description: "-",
      employees: 2,
      link: "#",
    },
  ];

  return (
    <>
      <div className="space-y-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Departments</h2>

          <div className="flex items-center gap-2">
            <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Department
          </button>
          <button
            type="button"
            aria-label="Export departments"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100"
          >
            <Upload className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left">Department Name</th>
              <th className="px-6 py-3 text-left">Department Code</th>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-right">Total Employees</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {departments.map((dept) => (
              <tr key={dept.id} className="hover:bg-slate-50/80">
                <td className="px-6 py-4 text-sm font-medium">
                  <a href={dept.link} className="text-blue-600 hover:underline">
                    {dept.name}
                  </a>
                </td>
                <td className="px-6 py-4 text-sm">{dept.code}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{dept.description}</td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-800">
                  {dept.employees}
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    aria-label="Department actions"
                    className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {isFormOpen && <DepartmentDialog onClose={() => setIsFormOpen(false)} />}
    </>
  );
}

function DepartmentDialog({ onClose }) {
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 py-10 sm:px-6"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[540px] overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 pb-4 pt-5">
          <h2 className="text-xl font-semibold text-slate-900">New Department</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-blue-600 transition-colors hover:text-blue-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.5fr_1fr]">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Department Name<span className="text-red-500">*</span>
              </label>
              <input className="input" placeholder="e.g., Engineering" autoFocus />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Department Code
              </label>
              <input className="input" placeholder="Optional" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Max 250 characters"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
            <span className="text-xs font-medium text-red-500">
              * indicates mandatory fields
            </span>
          </div>
        </div>
      </form>
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
