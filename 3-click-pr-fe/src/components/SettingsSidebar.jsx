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
      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-slate-500 transition-colors hover:bg-white/60"
    >
      <span className="flex items-center gap-2">
        <Chevron open={open} />
        {title}
      </span>
    </button>
  );
}

function LeftItem({ id, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={cx(
        "w-full rounded-lg px-4 py-2 text-left text-[14px] font-medium",
        active
          ? "text-white shadow-[0_12px_24px_-18px_rgba(15,23,42,0.4)]"
          : "text-slate-700 hover:bg-white"
      )}
      style={active ? { backgroundColor: '#408dfb' } : undefined}
    >
      {label}
    </button>
  );
}

export const SETTINGS_SECTIONS = [
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
          // Removed per request: Employee Portal, Claims and Declarations
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
];

export default function SettingsSidebar({ active, onSelect }) {
  // which groups are open by default
  const [open, setOpen] = useState({
    org: true,
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

  // sections are static, but memo to avoid re-renders
  const sections = useMemo(() => SETTINGS_SECTIONS, []);

  return (
    <div className="pr-1">
      {sections.map((sec) => (
        <div key={sec.caption} className="mb-6 last:mb-0">
          <div className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
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
                      onClick={onSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
