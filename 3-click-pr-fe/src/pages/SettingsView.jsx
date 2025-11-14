// src/pages/SettingsView.jsx
import React, { useMemo, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { MoreHorizontal, Pencil, Plus, Users, Info, Check } from "lucide-react";
import SalaryComponents from "./SalaryComponents";
import PaySchedule from "./PaySchedule";
import SearchSelect from "../components/SearchSelect";
import Modal from "../components/Modal";
import { loadPayrollSettings, savePayrollSettings } from "../utils/payrollStore";
import { workLocationAPI, departmentAPI, designationAPI } from "../utils/api";

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

/* ---------- MAIN VIEW ---------- */
export default function SettingsView({
  branding = BRANDING_DEFAULT,
  onUpdateBranding,
  active: controlledActive,
  onSelect,
  onSetTitle,
}) {
  // Active leaf item (controlled/uncontrolled)
  const [uncontrolledActive, setUncontrolledActive] = useState("org.profile");
  const active = controlledActive ?? uncontrolledActive;
  const setActive = onSelect ?? setUncontrolledActive;

  // Which groups are expanded
  const [open, setOpen] = useState({
    org: true,
    taxes: false,
    setup: false,
    custom: false,
    automations: false,
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
    if (active === "org.locations" || active === "org.locations.new")
      return (
        <WorkLocationsView
          onSetTitle={onSetTitle}
          navigate={setActive}
          initialOpen={active === "org.locations.new"}
        />
      );
    if (active === "org.departments") return <DepartmentsView />;
    if (active === "org.designations") return <DesignationsView />;
    if (active === "setup.schedule") return <PaySchedule />;
    if (active === "setup.statutory") return <StatutoryComponentsView />;
    if (active === "setup.salaryComponents") return <SalaryComponents />;
    if (active === "taxes.details") return <TaxDetailsView />;
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
        This is a placeholder for <span className="font-medium">{active}</span>.
      </div>
    );
  };

  return (
    <div className="pb-6">

      <div className="mt-2 flex flex-col gap-6 md:flex-row md:gap-10">
        {/* LEFT SIDEBAR (hidden on desktop because main app sidebar shows it) */}
        <aside className="block md:hidden md:w-[260px] shrink-0 rounded-2xl border border-[#E2E6F4] bg-[#F6F8FF] px-4 py-6 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.35)]">
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
        <section className="min-h-[60vh] flex-1">
          <Right />
        </section>
      </div>
    </div>
  );
}

/* ---- Org Profile and other sections ---- */

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
      <div className="space-y-8">
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
          {/* Note removed per request */}
        </section>
      </div>
    </div>
  );
}

function OrgProfile() {
  // Local UI state for selects (purely presentational)
  const [businessLocation, setBusinessLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [dateFormat, setDateFormat] = useState("");
  const [fieldSep, setFieldSep] = useState("");
  const [stateName, setStateName] = useState("");

  // Filing address modal state
  const [isFilingModalOpen, setIsFilingModalOpen] = useState(false);
  const [workLocations, setWorkLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [selectedFilingLocation, setSelectedFilingLocation] = useState(null);
  const [filingLocationId, setFilingLocationId] = useState("");

  // Fetch work locations when modal opens
  React.useEffect(() => {
    if (isFilingModalOpen) {
      fetchWorkLocations();
    }
  }, [isFilingModalOpen]);

  const fetchWorkLocations = async () => {
    try {
      setLoadingLocations(true);
      const data = await workLocationAPI.getAll({ is_active: true });
      setWorkLocations(data);
    } catch (err) {
      console.error("Error fetching work locations:", err);
      alert("Failed to load work locations: " + (err.message || "Unknown error"));
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleFilingSave = () => {
    const selected = workLocations.find(loc => loc.id === filingLocationId);
    setSelectedFilingLocation(selected);
    setIsFilingModalOpen(false);
    // TODO: Save to backend/organization settings
  };

  const BUSINESS_LOCATIONS = [
    { value: "chennai", label: "Head Office – Chennai", icon: "🏢" },
    { value: "blr", label: "Bengaluru", icon: "🏙️" },
    { value: "remote", label: "Remote", icon: "🌐" },
  ];

  const INDUSTRIES = [
    { value: "it", label: "IT Services", icon: "💻" },
    { value: "eng", label: "Engineering", icon: "🛠️" },
    { value: "edu", label: "Education", icon: "🎓" },
    { value: "health", label: "Health", icon: "🏥" },
  ];

  // Build Date Format options with a live preview that respects the selected
  // field separator as the date delimiter. Falls back to the format's default
  // delimiter if none selected.
  const DATE_FORMATS = React.useMemo(() => {
    const sep = fieldSep || "/";
    const pad = (n) => String(n).padStart(2, "0");
    const sample = new Date(2025, 8, 28); // 28 Sep 2025
    const parts = {
      dd: pad(sample.getDate()),
      MM: pad(sample.getMonth() + 1),
      yyyy: String(sample.getFullYear()),
    };

    const build = (tokens, defaultSep) => {
      const useSep = fieldSep || defaultSep || "/";
      const fmt = tokens.join(useSep);
      const preview = tokens
        .map((t) => parts[t] ?? t)
        .join(useSep);
      return `${fmt} [ ${preview} ]`;
    };

    return [
      {
        value: "ddmmyyyy",
        label: build(["dd", "MM", "yyyy"], "/"),
      },
      {
        value: "mmddyyyy",
        label: build(["MM", "dd", "yyyy"], "/"),
      },
      {
        value: "iso",
        label: build(["yyyy", "MM", "dd"], "-"),
      },
    ];
  }, [fieldSep]);

  const FIELD_SEPARATORS = [
    { value: "/", label: "/", icon: "➗" },
    { value: "-", label: "-", icon: "➖" },
    { value: ".", label: ".", icon: "·" },
  ];

  const CANADIAN_PROVINCES = [
    { value: "AB", label: "Alberta", icon: "🗺️" },
    { value: "BC", label: "British Columbia", icon: "🗺️" },
    { value: "MB", label: "Manitoba", icon: "🗺️" },
    { value: "NB", label: "New Brunswick", icon: "🗺️" },
    { value: "NL", label: "Newfoundland and Labrador", icon: "🗺️" },
    { value: "NS", label: "Nova Scotia", icon: "🗺️" },
    { value: "NT", label: "Northwest Territories", icon: "🗺️" },
    { value: "NU", label: "Nunavut", icon: "🗺️" },
    { value: "ON", label: "Ontario", icon: "🗺️" },
    { value: "PE", label: "Prince Edward Island", icon: "🗺️" },
    { value: "QC", label: "Quebec", icon: "🗺️" },
    { value: "SK", label: "Saskatchewan", icon: "🗺️" },
    { value: "YT", label: "Yukon", icon: "🗺️" },
  ];

  return (
    <div className="space-y-6">
      {/* Section heading (mobile only; desktop title is in the fixed subheader) */}
      <div className="flex items-center lg:hidden">
        <h2 className="text-lg font-semibold text-slate-900">Organisation Profile</h2>
      </div>
      {/* No outer card: layout flows directly on the page */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,calc(var(--sidebar-w)*2.8))_minmax(0,calc(var(--sidebar-w)*2.2))]">
        {/* FORM COLUMN */}
        <div className="grid grid-cols-1 gap-5">
          {/* Logo block with upload + description */}
          <section>
            <div className="text-sm font-medium text-slate-700">Organisation Logo</div>
            <div className="mt-2 grid grid-cols-[180px_1fr] gap-4">
              <div className="grid h-[120px] w-[180px] place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500">
                UPLOAD LOGO
              </div>
              <div className="text-[13px] text-slate-600">
                <p>
                  This logo will be displayed on documents such as Payslip and TDS Worksheet.
                </p>
                <p className="mt-1">
                  Preferred Image Size: 240 × 240 pixels @ 72 DPI, Maximum size of 1MB. Accepted File Formats: PNG, JPG, and JPEG
                </p>
              </div>
            </div>
          </section>

          <div>
            <label className="block text-sm text-slate-700">Organisation Name<span className="text-red-500">*</span></label>
            <div className="text-[13px] text-slate-500 mt-1">
              This is your registered business name which will appear in all the forms and payslips.
            </div>
            <input className="input mt-2" placeholder="Enter organisation name" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-700">Business Location<span className="text-red-500">*</span></label>
              <SearchSelect
                className="mt-1"
                value={businessLocation}
                onChange={(opt) => setBusinessLocation(opt?.value || "")}
                placeholder="Select business location"
                options={BUSINESS_LOCATIONS}
                floatingLabel={false}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700">Industry<span className="text-red-500">*</span></label>
              <SearchSelect
                className="mt-1"
                value={industry}
                onChange={(opt) => setIndustry(opt?.value || "")}
                placeholder="Select industry"
                options={INDUSTRIES}
                floatingLabel={false}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-700">Date Format<span className="text-red-500">*</span></label>
              <SearchSelect
                className="mt-1"
                value={dateFormat}
                onChange={(opt) => setDateFormat(opt?.value || "")}
                placeholder="Select date format"
                options={DATE_FORMATS}
                floatingLabel={false}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700">Field Separator</label>
              <SearchSelect
                className="mt-1"
                value={fieldSep}
                onChange={(opt) => setFieldSep(opt?.value || "")}
                placeholder="Select separator"
                options={FIELD_SEPARATORS}
                floatingLabel={false}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label className="block text-sm font-medium text-slate-800">Organisation Address<span className="text-red-500">*</span></label>
            <div className="text-[13px] text-slate-500">
              This will be considered as the address of your primary work location.
            </div>
            <input className="input" placeholder="Address Line 1" />
            <input className="input" placeholder="Address Line 2" />
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <SearchSelect
                value={stateName}
                onChange={(opt) => setStateName(opt?.value || "")}
                placeholder="Select Province/Territory"
                options={CANADIAN_PROVINCES}
                searchInMenu={true}
                searchPlaceholder="Search province/territory"
                floatingLabel={false}
              />
              <input className="input" placeholder="City" />
              <input className="input" placeholder="Postal Code" />
            </div>

            <div className="mt-2">
              <div className="text-sm font-semibold text-slate-900">Filing Address</div>
              <div className="text-[13px] text-slate-500 mt-1">
                This registered address will be used across all Forms and Payslips.
              </div>
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                {selectedFilingLocation ? (
                  <>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-900">
                        {selectedFilingLocation.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsFilingModalOpen(true)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Change
                      </button>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      {selectedFilingLocation.street && (
                        <p>{selectedFilingLocation.street}</p>
                      )}
                      <p>
                        {[
                          selectedFilingLocation.city,
                          selectedFilingLocation.province,
                          selectedFilingLocation.postal_code
                        ].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-1 flex items-center justify-between text-sm font-semibold text-slate-800">
                      <span className="text-slate-600">No filing address selected</span>
                      <button
                        type="button"
                        onClick={() => setIsFilingModalOpen(true)}
                        className="text-blue-600 hover:underline"
                      >
                        Set
                      </button>
                    </div>
                    <div className="text-sm text-slate-500">
                      Select a work location to set filing address.
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between pt-2">
            <button
              className="h-9 rounded-md px-3 text-sm font-medium text-white hover:opacity-90"
              style={{ backgroundColor: '#408dfb' }}
            >
              Save
            </button>
            <div className="text-xs font-medium text-red-500">* indicates mandatory fields</div>
          </div>
        </div>

        {/* Right empty space (desktop only) */}
        <div className="hidden lg:block" aria-hidden />
      </div>

      {/* Filing Address Modal */}
      <Modal
        isOpen={isFilingModalOpen}
        onClose={() => {
          setIsFilingModalOpen(false);
          setFilingLocationId("");
        }}
        title="Update Filing Address"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Filing Address<span className="text-red-500">*</span>
            </label>
            {loadingLocations ? (
              <div className="w-full h-12 px-4 flex items-center rounded-lg border-2 border-slate-300 bg-slate-50 text-slate-400">
                Loading locations...
              </div>
            ) : (
              <SearchSelect
                value={filingLocationId}
                onChange={(opt) => setFilingLocationId(opt?.value || "")}
                placeholder="Select"
                options={workLocations.map(loc => ({
                  value: loc.id,
                  label: loc.name
                }))}
                floatingLabel={false}
                inputClassName="h-12 border-2 border-blue-500 text-base"
              />
            )}
          </div>

          {/* Display selected location details */}
          {filingLocationId && workLocations.find(loc => loc.id === filingLocationId) && (
            <div className="rounded-xl bg-slate-50 p-6 border border-slate-200">
              {(() => {
                const location = workLocations.find(loc => loc.id === filingLocationId);
                return (
                  <>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      {location.name}
                    </h3>
                    <div className="space-y-1 text-sm text-slate-700">
                      {location.street && <p>{location.street}</p>}
                      <p>
                        {[location.city, location.province, location.postal_code]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Note */}
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Note:</span> Your filing address can only be one of your work locations.
              To set a new address as your filing address, add that address as a work location in{" "}
              <a href="#settings" className="text-blue-600 hover:underline font-medium">
                Settings &gt; Work Locations
              </a>.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleFilingSave}
              disabled={!filingLocationId}
              className="inline-flex h-10 items-center rounded-lg px-6 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#408dfb' }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFilingModalOpen(false);
                setFilingLocationId("");
              }}
              className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function WorkLocationsView({ onSetTitle, navigate, initialOpen = false }) {
  const [isFormOpen, setIsFormOpen] = useState(initialOpen);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  React.useEffect(() => {
    // keep state in sync if route-driven open state changes
    setIsFormOpen(initialOpen);
  }, [initialOpen]);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (openMenuId && !e.target.closest('.location-menu-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const CANADIAN_PROVINCES = [
    { value: "AB", label: "Alberta", icon: "🗺️" },
    { value: "BC", label: "British Columbia", icon: "🗺️" },
    { value: "MB", label: "Manitoba", icon: "🗺️" },
    { value: "NB", label: "New Brunswick", icon: "🗺️" },
    { value: "NL", label: "Newfoundland and Labrador", icon: "🗺️" },
    { value: "NS", label: "Nova Scotia", icon: "🗺️" },
    { value: "NT", label: "Northwest Territories", icon: "🗺️" },
    { value: "NU", label: "Nunavut", icon: "🗺️" },
    { value: "ON", label: "Ontario", icon: "🗺️" },
    { value: "PE", label: "Prince Edward Island", icon: "🗺️" },
    { value: "QC", label: "Quebec", icon: "🗺️" },
    { value: "SK", label: "Saskatchewan", icon: "🗺️" },
    { value: "YT", label: "Yukon", icon: "🗺️" },
  ];

  // Fetch work locations on mount
  React.useEffect(() => {
    fetchWorkLocations();
  }, []);

  const fetchWorkLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workLocationAPI.getAll();
      setLocations(data);
    } catch (err) {
      console.error("Error fetching work locations:", err);
      setError(err.message || "Failed to load work locations");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setAddressLine1("");
    setAddressLine2("");
    setProvince("");
    setCity("");
    setPostalCode("");
  };

  const handleMarkAsInactive = async (locationId) => {
    try {
      // Update the location's status to inactive
      await workLocationAPI.update(locationId, { is_active: false });

      // Update local state to reflect the change
      setLocations(prevLocations =>
        prevLocations.map(loc =>
          loc.id === locationId ? { ...loc, is_active: false } : loc
        )
      );

      setOpenMenuId(null);
    } catch (err) {
      console.error('Error marking location as inactive:', err);
      alert('Failed to mark location as inactive. Please try again.');
    }
  };

  const handleMarkAsActive = async (locationId) => {
    try {
      // Update the location's status to active
      await workLocationAPI.update(locationId, { is_active: true });

      // Update local state to reflect the change
      setLocations(prevLocations =>
        prevLocations.map(loc =>
          loc.id === locationId ? { ...loc, is_active: true } : loc
        )
      );

      setOpenMenuId(null);
    } catch (err) {
      console.error('Error marking location as active:', err);
      alert('Failed to mark location as active. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      alert("Please enter a work location name");
      return;
    }

    if (!addressLine1.trim()) {
      alert("Please enter address line 1");
      return;
    }

    if (!province) {
      alert("Please select a province/territory");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const locationData = {
        name: name.trim(),
        street: addressLine1.trim() + (addressLine2.trim() ? "\n" + addressLine2.trim() : ""),
        city: city.trim() || null,
        province: province,
        postal_code: postalCode.trim() || null,
        country: "Canada",
      };

      await workLocationAPI.create(locationData);

      // Reset form and close
      resetForm();
      setIsFormOpen(false);

      // Refresh locations list
      await fetchWorkLocations();

      // Navigate back to locations list
      if (typeof navigate === "function") {
        navigate("org.locations");
      }
    } catch (err) {
      console.error("Error creating work location:", err);
      setError(err.message || "Failed to save work location");
      alert("Failed to save work location: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  // Update the main header title when the inline form is open
  React.useEffect(() => {
    if (typeof onSetTitle === "function") {
      if (isFormOpen) onSetTitle("New Work Location");
      else onSetTitle(""); // fall back to default section title
    }
    return () => {
      if (typeof onSetTitle === "function") onSetTitle("");
    };
  }, [isFormOpen, onSetTitle]);

  return (
    <>
      {/* Header actions moved to the fixed subheader (top-right). */}

      {isFormOpen ? (
        <div>
          <form className="max-w-[720px] space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Work Location Name<span className="text-red-500">*</span>
              </label>
              <input
                className="input"
                placeholder=""
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Address<span className="text-red-500">*</span>
              </label>
              <input
                className="input"
                placeholder="Address Line 1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
              />
              <input
                className="input"
                placeholder="Address Line 2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_1fr_1fr]">
                <SearchSelect
                  value={province}
                  onChange={(opt) => setProvince(opt?.value || "")}
                  placeholder="Select Province/Territory"
                  options={CANADIAN_PROVINCES}
                  searchInMenu={true}
                  searchPlaceholder="Search province/territory"
                  floatingLabel={false}
                />
                <input
                  className="input"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Postal Code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#408dfb' }}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setIsFormOpen(false);
                      if (typeof navigate === "function") navigate("org.locations");
                    }}
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
      ) : (
        <div>
          {loading && (
            <div className="text-center py-8 text-slate-500">Loading work locations...</div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500">Error: {error}</div>
          )}

          {!loading && !error && locations.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No work locations yet. Click "Add Work Location" to create one.
            </div>
          )}

          {!loading && !error && locations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {locations.map((location) => {
                // Format address lines
                const addressLines = [];
                if (location.street) {
                  addressLines.push(location.street);
                }
                const cityProvince = [location.city, location.province].filter(Boolean).join(", ");
                if (cityProvince) {
                  addressLines.push(cityProvince + (location.postal_code ? " " + location.postal_code : ""));
                }

                const isInactive = location.is_active === false;

                return (
                  <article
                    key={location.id}
                    className="relative rounded-2xl border border-slate-200 bg-white p-6"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 space-y-3">
                        <header>
                          <h3 className="text-base font-semibold text-slate-900">
                            {location.name}
                          </h3>
                        </header>
                        <div className="space-y-1 text-sm text-slate-600">
                          {addressLines.map((line, idx) => (
                            <p key={idx}>{line}</p>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                          <span>{location.employee_count || 0} Employees</span>
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
                        <div className="relative location-menu-container">
                          <button
                            type="button"
                            className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100"
                            aria-label="More actions"
                            onClick={() => setOpenMenuId(openMenuId === location.id ? null : location.id)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {openMenuId === location.id && (
                            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl bg-white p-2.5 shadow-2xl ring-1 ring-black/5">
                              <button
                                type="button"
                                className="flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: '#408dfb' }}
                                onClick={() => {
                                  console.log('Delete location:', location.id);
                                  setOpenMenuId(null);
                                }}
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                className="mt-1 flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
                                onClick={() => isInactive ? handleMarkAsActive(location.id) : handleMarkAsInactive(location.id)}
                              >
                                {isInactive ? 'Mark as Active' : 'Mark as Inactive'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inactive badge positioned absolutely in bottom-right corner */}
                    {isInactive && (
                      <div className="absolute bottom-0 right-0 rounded-tl-2xl rounded-br-2xl bg-slate-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                        Inactive
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Removed modal WorkLocationDialog. Form now renders inline in WorkLocationsView.

function DepartmentsView() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Open from header action (subheader button dispatches this event)
  React.useEffect(() => {
    const open = () => setIsFormOpen(true);
    window.addEventListener("department:new", open);
    return () => window.removeEventListener("department:new", open);
  }, []);

  // Fetch departments on mount
  React.useEffect(() => {
    fetchDepartments();
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await departmentAPI.getAll();
      setDepartments(data);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError(err.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dept) => {
    setEditingDepartment(dept);
    setIsFormOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (dept) => {
    if (!confirm(`Are you sure you want to delete "${dept.name}"?`)) {
      return;
    }

    try {
      await departmentAPI.delete(dept.id);
      await fetchDepartments();
    } catch (err) {
      console.error("Error deleting department:", err);
      alert("Failed to delete department: " + (err.message || "Unknown error"));
    }
    setOpenMenuId(null);
  };

  const toggleMenu = (e, deptId) => {
    e.stopPropagation();

    if (openMenuId === deptId) {
      setOpenMenuId(null);
    } else {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();

      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 176 // 176px = width of dropdown (w-44 = 11rem = 176px)
      });
      setOpenMenuId(deptId);
    }
  };

  return (
    <>
      {/* Title and actions are shown in the fixed subheader; no in-body header here. */}

      {loading && (
        <div className="text-center py-8 text-slate-500">Loading departments...</div>
      )}

      {error && (
        <div className="text-center py-8 text-red-500">Error: {error}</div>
      )}

      {!loading && !error && departments.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No departments yet. Click "New Department" to create one.
        </div>
      )}

      {!loading && !error && departments.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 sticky top-0 z-10">
              <tr>
                <th className="pl-0 pr-6 py-3 text-left bg-slate-50">Department Name</th>
                <th className="px-6 py-3 text-left bg-slate-50">Department Code</th>
                <th className="px-6 py-3 text-left bg-slate-50">Description</th>
                <th className="px-6 py-3 text-right bg-slate-50">Total Employees</th>
                <th className="py-3 pr-0 w-[48px] bg-slate-50" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/80">
                  <td className="pl-0 pr-6 py-3 text-sm font-medium">
                    <a href="#" className="text-blue-600 hover:underline">
                      {dept.name}
                    </a>
                  </td>
                  <td className="px-6 py-3 text-sm">{dept.code || "-"}</td>
                  <td className="px-6 py-3 text-sm text-slate-500">{dept.description || "-"}</td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-slate-800">
                    {dept.total_employees}
                  </td>
                  <td className="py-4 pr-0 text-right w-[48px]">
                    <button
                      type="button"
                      onClick={(e) => toggleMenu(e, dept.id)}
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
      )}

      {openMenuId && ReactDOM.createPortal(
        <div
          className="fixed w-44 rounded-lg border border-slate-200 bg-white shadow-[0_8px_24px_-8px_rgba(15,23,42,0.15)] z-50 overflow-hidden"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`
          }}
        >
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                const dept = departments.find(d => d.id === openMenuId);
                if (dept) handleEdit(dept);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Pencil className="h-4 w-4 text-slate-500" />
              <span className="font-medium">Edit</span>
            </button>
            <div className="border-t border-slate-100"></div>
            <button
              type="button"
              onClick={() => {
                const dept = departments.find(d => d.id === openMenuId);
                if (dept) handleDelete(dept);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="font-medium">Delete</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {isFormOpen && (
        <DepartmentDialog
          department={editingDepartment}
          onClose={() => {
            setIsFormOpen(false);
            setEditingDepartment(null);
          }}
          onSuccess={fetchDepartments}
        />
      )}
    </>
  );
}

function DepartmentDialog({ department, onClose, onSuccess }) {
  const isEditing = !!department;
  const [name, setName] = useState(department?.name || "");
  const [code, setCode] = useState(department?.code || "");
  const [description, setDescription] = useState(department?.description || "");
  const [saving, setSaving] = useState(false);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation
    if (!name.trim()) {
      alert("Please enter a department name");
      return;
    }

    try {
      setSaving(true);

      const departmentData = {
        name: name.trim(),
        code: code.trim() || null,
        description: description.trim() || null,
      };

      if (isEditing) {
        await departmentAPI.update(department.id, departmentData);
      } else {
        await departmentAPI.create(departmentData);
      }

      // Refresh departments list
      if (typeof onSuccess === "function") {
        await onSuccess();
      }

      onClose();
    } catch (err) {
      console.error(`Error ${isEditing ? "updating" : "creating"} department:`, err);
      alert(`Failed to ${isEditing ? "update" : "save"} department: ` + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
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
          <h2 className="text-xl font-semibold text-slate-900">
            {isEditing ? "Edit Department" : "New Department"}
          </h2>
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
              <input
                className="input"
                placeholder="e.g., Engineering"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Department Code
              </label>
              <input
                className="input"
                placeholder="Optional"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Max 250 characters"
              maxLength={250}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#408dfb' }}
              >
                {saving ? "Saving..." : "Save"}
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

function DesignationsView() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Allow opening the dialog from the fixed subheader action
  React.useEffect(() => {
    const open = () => setIsFormOpen(true);
    window.addEventListener("designation:new", open);
    return () => window.removeEventListener("designation:new", open);
  }, []);

  React.useEffect(() => {
    fetchDesignations();
  }, []);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await designationAPI.getAll();
      setDesignations(data);
    } catch (err) {
      console.error("Error fetching designations:", err);
      setError(err.message || "Failed to load designations");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (desig) => {
    setEditingDesignation(desig);
    setIsFormOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (desig) => {
    if (!confirm(`Are you sure you want to delete "${desig.title}"?`)) {
      return;
    }
    try {
      await designationAPI.delete(desig.id);
      await fetchDesignations();
    } catch (err) {
      console.error("Error deleting designation:", err);
      alert("Failed to delete designation: " + (err.message || "Unknown error"));
    }
    setOpenMenuId(null);
  };

  const toggleMenu = (e, desigId) => {
    e.stopPropagation();
    if (openMenuId === desigId) {
      setOpenMenuId(null);
    } else {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 176
      });
      setOpenMenuId(desigId);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingDesignation(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Loading designations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      {!loading && !error && designations.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No designations yet. Click "New Designation" to create one.
        </div>
      )}

      {!loading && !error && designations.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 sticky top-0 z-10">
              <tr>
                <th className="pl-0 pr-6 py-3 text-left bg-slate-50">Designation Name</th>
                <th className="px-6 py-3 text-right bg-slate-50">Total Employees</th>
                <th className="py-3 pr-0 w-[48px] bg-slate-50" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {designations.map((desig) => (
                <tr key={desig.id} className="hover:bg-slate-50/80">
                  <td className="pl-0 pr-6 py-3 text-sm font-medium">
                    <span className="text-blue-600">{desig.title}</span>
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-slate-800">
                    {desig.total_employees}
                  </td>
                  <td className="py-4 pr-0 text-right w-[48px]">
                    <button
                      type="button"
                      onClick={(e) => toggleMenu(e, desig.id)}
                      aria-label="Designation actions"
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
      )}

      {/* Dropdown menu using Portal */}
      {openMenuId && ReactDOM.createPortal(
        <div
          className="fixed w-44 rounded-lg border border-slate-200 bg-white shadow-[0_8px_24px_-8px_rgba(15,23,42,0.15)] z-50 overflow-hidden"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`
          }}
        >
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                const desig = designations.find(d => d.id === openMenuId);
                if (desig) handleEdit(desig);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Pencil className="h-4 w-4 text-slate-500" />
              <span className="font-medium">Edit</span>
            </button>
            <div className="border-t border-slate-100"></div>
            <button
              type="button"
              onClick={() => {
                const desig = designations.find(d => d.id === openMenuId);
                if (desig) handleDelete(desig);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="font-medium">Delete</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {isFormOpen && (
        <DesignationDialog
          onClose={handleFormClose}
          onSave={fetchDesignations}
          designation={editingDesignation}
        />
      )}
    </>
  );
}

function DesignationDialog({ onClose, onSave, designation }) {
  const [title, setTitle] = useState(designation?.title || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Designation name is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const designationData = {
        title: title.trim(),
      };

      if (designation) {
        // Edit mode
        await designationAPI.update(designation.id, designationData);
      } else {
        // Create mode
        await designationAPI.create(designationData);
      }

      await onSave();
      onClose();
    } catch (err) {
      console.error("Error saving designation:", err);
      setError(err.message || "Failed to save designation");
      setSaving(false);
    }
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
        className="w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 pb-3 pt-5">
          <h2 className="text-xl font-semibold text-slate-900">
            {designation ? "Edit Designation" : "New Designation"}
          </h2>
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
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Designation Name<span className="text-red-500">*</span>
            </label>
            <input
              className="input"
              placeholder="e.g., Front End Developer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              disabled={saving}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#408dfb' }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
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

/* ---- Taxes > Tax Details ---- */
function TaxDetailsView() {
  // Searchable dropdown / combobox used across this form
  const SearchSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Select...",
    className = "",
  }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [highlight, setHighlight] = useState(0);
    const ref = React.useRef(null);

    const selected = options.find((o) => o.value === value) || null;

    React.useEffect(() => {
      const close = (e) => {
        if (!ref.current) return;
        if (!ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener("mousedown", close);
      return () => document.removeEventListener("mousedown", close);
    }, []);

    React.useEffect(() => {
      if (!open) setQuery("");
      else setHighlight(0);
    }, [open]);

    const normalized = (s) => (s || "").toString().toLowerCase();
    const filtered = options.filter((o) =>
      normalized(o.label).includes(normalized(query))
    );

    const commit = (opt) => {
      onChange?.(opt.value);
      setOpen(false);
    };

    const handleKey = (e) => {
      if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
        setOpen(true);
        e.preventDefault();
        return;
      }
      if (!open) return;
      if (e.key === "ArrowDown") {
        setHighlight((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        setHighlight((h) => Math.max(h - 1, 0));
        e.preventDefault();
      } else if (e.key === "Enter") {
        const opt = filtered[highlight];
        if (opt) commit(opt);
        e.preventDefault();
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    return (
      <div ref={ref} className={"relative " + className}>
        <div className="relative">
          <input
            className="input pr-9"
            placeholder={placeholder}
            value={open ? query : (selected?.label || "")}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKey}
          />
          <span
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            aria-hidden
          >
            <svg viewBox="0 0 512 512" className="h-4 w-4">
              <path
                fill="#999"
                d="M103.5 165.6c8.8-8.8 22.8-9.9 32.9-2.4l2.8 2.4L256 282.4l116.8-116.8c8.8-8.8 22.8-9.9 32.9-2.4l2.8 2.4c8.8 8.8 9.9 22.8 2.4 32.9l-2.5 2.8L256 353.8 103.5 201.3c-4.7-4.7-7.4-11.2-7.4-17.9 0-6.6 2.7-13.1 7.4-17.8z"
              />
            </svg>
          </span>
        </div>

        {open && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="max-h-64 overflow-auto p-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500">No results</div>
              ) : (
                filtered.map((opt, idx) => {
                  const active = idx === highlight;
                  const isSelected = selected && selected.value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onMouseEnter={() => setHighlight(idx)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => commit(opt)}
                      className={
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm " +
                        (active ? "bg-indigo-50" : "hover:bg-slate-50")
                      }
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  const persisted = loadPayrollSettings();
  const persistedTaxes = persisted.taxes || {};

  // Employer-level state
  const [employer, setEmployer] = useState({
    bn: "",
    rp: "",
    province: "",
    payFreq: "",
    remitter: "",
    usePDOC: false,
    indexationMode: "claim-codes", // 'indexing' | 'claim-codes'
    ...(persistedTaxes.employer || {}),
  });

  // Employee-level state
  const [emp, setEmp] = useState({
    province: "",
    td1Mode: "totals", // 'totals' | 'claim-code'
    tc: "",
    tcp: "",
    claimCode: "",
    autoIndexing: false,
    extraTaxL: "",
    authDedF1: "",
    unionDuesU1: "",
    contribF: "",
    cppqpp: true,
    cpt30: false,
    cpt30Date: "",
    cpp2: true,
    eiInsurable: true,
    commissionTD1X: false,
    commissionI1: "",
    commissionE: "",
    // Mid-year carry-ins
    ytdCpp: "",
    ytdCpp2: "",
    ytdEi: "",
    ytdQpp: "",
    ytdQpp2: "",
    ytdQpip: "",
    ytdTax: "",
    ytdNonPeriodic: "",
    // Registered plans & other credits
    rrspCurrent: "",
    rrspYtd: "",
    rppCurrent: "",
    rppYtd: "",
    alimonyF2: "",
    northernHD: "",
    lcf: "",
    lcp: "",
    ...(persistedTaxes.employee || {}),
  });

  // Persist taxes whenever either object changes
  React.useEffect(() => {
    savePayrollSettings((curr) => ({ ...curr, taxes: { employer, employee: emp } }));
  }, [employer, emp]);

  const setEmployerField = (k) => (e) =>
    setEmployer((p) => ({ ...p, [k]: e?.target?.type === "checkbox" ? e.target.checked : e?.target ? e.target.value : e }));
  const setEmpField = (k) => (e) =>
    setEmp((p) => ({ ...p, [k]: e?.target?.type === "checkbox" ? e.target.checked : e?.target ? e.target.value : e }));

  const PROVINCES = [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Northwest Territories",
    "Nova Scotia",
    "Nunavut",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Yukon",
  ];
  const PAY_FREQS = ["Weekly", "Biweekly", "Semi-monthly", "Monthly", "Other"];
  const REMITTERS = [
    "Per pay run",
    "Twice-monthly",
    "Monthly",
    "Quarterly",
    "Custom/Other",
  ];
  const currentYear = new Date().getFullYear();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,60%)_minmax(0,40%)]">
      {/* Left: 60% form column */}
      <div className="grid grid-cols-1 gap-8">
        {/* Employer setup */}
        <section>
          <h3 className="text-base font-semibold text-slate-900">Employer (Payroll Account) Setup - Canada</h3>
          <p className="mt-1 text-[13px] text-slate-500">Configure how deductions are computed and remitted.</p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-700">Business Number (BN)</label>
              <input className="input mt-1" placeholder="9-digit BN" value={employer.bn} onChange={setEmployerField("bn")} />
            </div>
            <div>
              <label className="block text-sm text-slate-700">Payroll program account (RP)</label>
              <input className="input mt-1" placeholder="e.g., RP0001" value={employer.rp} onChange={setEmployerField("rp")} />
            </div>

            <div>
              <label className="block text-sm text-slate-700">Province/territory of employment (default)</label>
              <SearchSelect
                className="mt-1"
                value={employer.province}
                onChange={setEmployerField("province")}
                placeholder="Select province"
                options={PROVINCES.map((p) => ({ value: p, label: p }))}
                floatingLabel={false}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700">Pay period frequency</label>
              <SearchSelect
                className="mt-1"
                value={employer.payFreq}
                onChange={setEmployerField("payFreq")}
                placeholder="Select frequency"
                options={PAY_FREQS.map((f) => ({ value: f, label: f }))}
                floatingLabel={false}
              />
              <div className="mt-1 text-[12px] text-slate-500">Used as factor P in CRA formulas.</div>
            </div>

            <div>
              <label className="block text-sm text-slate-700">Remitter cadence</label>
              <SearchSelect
                className="mt-1"
                value={employer.remitter}
                onChange={setEmployerField("remitter")}
                placeholder="Select cadence"
                options={REMITTERS.map((r) => ({ value: r, label: r }))}
                floatingLabel={false}
              />
              <div className="mt-1 text-[12px] text-slate-500">For your workflow; CRA remittance thresholds handled outside.</div>
            </div>
            <div>
              <label className="block text-sm text-slate-700">Use PDOC check</label>
              <div className="mt-2 flex items-center gap-3 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={employer.usePDOC} onChange={setEmployerField("usePDOC")} />
                  <span>Enable PDOC cross‑verification</span>
                </label>
                <a className="text-blue-600 hover:underline" href="https://apps.cra-arc.gc.ca/ebci/rhpd/start?request_locale=en" target="_blank" rel="noreferrer">PDOC</a>
              </div>
            </div>
          </div>

          {/* Indexation mode */}
          <div className="mt-4">
            <div className="text-sm text-slate-700">Indexation mode (for employee totals)</div>
            <div className="mt-2 flex items-center gap-6 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="indexationMode"
                  checked={employer.indexationMode === "indexing"}
                  onChange={() => setEmployerField("indexationMode")({ target: { value: "indexing" } })}
                />
                <span>Indexing</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="indexationMode"
                  checked={employer.indexationMode === "claim-codes"}
                  onChange={() => setEmployerField("indexationMode")({ target: { value: "claim-codes" } })}
                />
                <span>Claim Codes</span>
              </label>
            </div>
          </div>
        </section>

        {/* Employee Tax Details (TD1) */}
        <section>
          <h3 className="text-base font-semibold text-slate-900">Employee Tax Details (TD1-driven)</h3>

          {/* A. Residency & province */}
          <div className="mt-4">
            <div className="text-sm font-medium text-slate-800">A. Residency & province of employment</div>
            <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-slate-700">Province/territory for this employee</label>
                <SearchSelect
                  className="mt-1"
                  value={emp.province}
                  onChange={setEmpField("province")}
                  placeholder="Select province"
                  options={PROVINCES.map((p) => ({ value: p, label: p }))}
                  floatingLabel={false}
                />
                <div className="mt-1 text-[12px] text-slate-500">Quebec income tax uses Revenu Québec tables; CRA T4127 covers non‑Quebec.</div>
              </div>
            </div>
          </div>

          {/* B. TD1 Personal Amounts */}
          <div className="mt-6">
            <div className="text-sm font-medium text-slate-800">B. TD1 Personal Amounts</div>
            <div className="mt-2 flex items-center gap-6 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="td1mode"
                  checked={emp.td1Mode === "totals"}
                  onChange={() => setEmpField("td1Mode")({ target: { value: "totals" } })}
                />
                <span>Use TD1 totals (TC/TCP)</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="td1mode"
                  checked={emp.td1Mode === "claim-code"}
                  onChange={() => setEmpField("td1Mode")({ target: { value: "claim-code" } })}
                />
                <span>Use claim code (0–10)</span>
              </label>
            </div>

            {emp.td1Mode === "totals" ? (
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm text-slate-700">TD1 Federal total (TC)</label>
                  <input className="input mt-1" inputMode="decimal" placeholder="0.00" value={emp.tc} onChange={setEmpField("tc")} />
                </div>
                <div>
                  <label className="block text-sm text-slate-700">TD1 Provincial/Territorial total (TCP)</label>
                  <input className="input mt-1" inputMode="decimal" placeholder="0.00" value={emp.tcp} onChange={setEmpField("tcp")} />
                </div>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700">Claim code</label>
                  <SearchSelect
                    className="mt-1"
                    value={emp.claimCode}
                    onChange={setEmpField("claimCode")}
                    placeholder="Select code (0–10)"
                    options={Array.from({ length: 11 }, (_, i) => ({ value: String(i), label: String(i) }))}
                    floatingLabel={false}
                  />
              </div>
            </div>
            )}

            <label className="mt-3 inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={emp.autoIndexing} onChange={setEmpField("autoIndexing")} />
              <span>Apply indexing when no TD1 on file (NS/MB/YT rules)</span>
            </label>
          </div>

          {/* C. Extra withholding & authorized deductions */}
          <div className="mt-6">
            <div className="text-sm font-medium text-slate-800">C. Extra withholding & authorized deductions</div>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-slate-700">Additional tax requested (L)</label>
                <input className="input mt-1" inputMode="decimal" placeholder="0.00" value={emp.extraTaxL} onChange={setEmpField("extraTaxL")} />
              </div>
              <div>
                <label className="block text-sm text-slate-700">Authorized annual deductions (F1)</label>
                <input className="input mt-1" inputMode="decimal" placeholder="0.00" value={emp.authDedF1} onChange={setEmpField("authDedF1")} />
              </div>
              <div>
                <label className="block text-sm text-slate-700">Union dues (U1)</label>
                <input className="input mt-1" inputMode="decimal" placeholder="0.00" value={emp.unionDuesU1} onChange={setEmpField("unionDuesU1")} />
              </div>
            </div>
          </div>

          {/* D. Mid-year YTD carry-ins */}
          <div className="mt-6">
            <div className="text-sm font-medium text-slate-800">D. Mid‑year YTD carry‑ins</div>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3 field-grid-3">
              {emp.province === "Quebec" ? (
                <>
                  <div className="field-float">
                    <label className="floating-label">QPP YTD (employee)</label>
                    <input className="input" inputMode="decimal" placeholder="0.00" value={emp.ytdQpp} onChange={setEmpField("ytdQpp")} />
                  </div>
                  <div className="field-float">
                    <label className="floating-label">QPP2 YTD (employee)</label>
                    <input className="input" inputMode="decimal" placeholder="0.00" value={emp.ytdQpp2} onChange={setEmpField("ytdQpp2")} />
                  </div>
                  <div className="field-float">
                    <label className="floating-label">QPIP YTD (employee)</label>
                    <input className="input" inputMode="decimal" placeholder="0.00" value={emp.ytdQpip} onChange={setEmpField("ytdQpip")} />
                  </div>
                </>
              ) : (
                <>
                  <div className="field-float">
                    <label className="floating-label">CPP YTD (employee)</label>
                    <input className="input" inputMode="decimal" placeholder="0.00" value={emp.ytdCpp} onChange={setEmpField("ytdCpp")} />
                  </div>
                  <div className="field-float">
                    <label className="floating-label">CPP2 YTD (employee)</label>
                    <input className="input" inputMode="decimal" placeholder="0.00" value={emp.ytdCpp2} onChange={setEmpField("ytdCpp2")} />
                  </div>
                  <div className="field-float">
                    <label className="floating-label">EI YTD (employee)</label>
                    <input className="input" inputMode="decimal" placeholder="0.00" value={emp.ytdEi} onChange={setEmpField("ytdEi")} />
                  </div>
                </>
              )}
              <div className="field-float">
                <label className="floating-label">Tax YTD (federal + provincial)</label>
                <input className="input" inputMode="decimal" placeholder="0.00" value={emp.ytdTax} onChange={setEmpField("ytdTax")} />
              </div>
              <div className="field-float md:col-span-2">
                <label className="floating-label">Non‑periodic YTD (bonus method)</label>
                <input className="input" inputMode="decimal" placeholder="0.00" value={emp.ytdNonPeriodic} onChange={setEmpField("ytdNonPeriodic")} />
              </div>
            </div>
          </div>

          {/* E. Registered plans & other credits */}
          <div className="mt-6">
            <div className="text-sm font-medium text-slate-800">E. Pre‑tax deductions & other credits</div>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-6">
              <div className="field-float md:col-span-2">
                <label className="floating-label">RRSP employee (this pay)</label>
                <input className="input" inputMode="decimal" placeholder="0.00" value={emp.rrspCurrent} onChange={setEmpField("rrspCurrent")} />
              </div>
              <div className="field-float md:col-span-2">
                <label className="floating-label">RRSP YTD</label>
                <input className="input" inputMode="decimal" placeholder="0.00" value={emp.rrspYtd} onChange={setEmpField("rrspYtd")} />
              </div>
              <div className="field-float md:col-span-2">
                <label className="floating-label">RPP employee (this pay)</label>
                <input className="input" inputMode="decimal" placeholder="0.00" value={emp.rppCurrent} onChange={setEmpField("rppCurrent")} />
              </div>
              <div className="field-float md:col-span-2">
                <label className="floating-label">RPP YTD</label>
                <input className="input" inputMode="decimal" placeholder="0.00" value={emp.rppYtd} onChange={setEmpField("rppYtd")} />
              </div>
              <div className="field-float md:col-span-4">
                <label className="floating-label">Court‑ordered support/alimony (F2)</label>
                <input className="input" inputMode="decimal" placeholder="0.00" value={emp.alimonyF2} onChange={setEmpField("alimonyF2")} />
              </div>
              <div className="field-float md:col-span-3">
                <label className="floating-label">Northern residents deduction (HD)</label>
                <input className="input" inputMode="decimal" placeholder="0.00" value={emp.northernHD} onChange={setEmpField("northernHD")} />
              </div>
              <div className="field-float md:col-span-3">
                <label className="floating-label">Labour‑sponsored capital (Federal LCF)</label>
                <input className="input" inputMode="decimal" placeholder="0.00" value={emp.lcf} onChange={setEmpField("lcf")} />
              </div>
              <div className="field-float md:col-span-6">
                <label className="floating-label">Labour‑sponsored capital (Provincial LCP)</label>
                <input className="input" inputMode="decimal" placeholder="0.00" value={emp.lcp} onChange={setEmpField("lcp")} />
              </div>
            </div>
          </div>

          {/* Removed social programs from Taxes; they live in Statutory Components */}
          <div className="mt-6 text-xs italic text-slate-500">CPP/QPP/CPP2, EI/QPIP and commission settings live in <span className="font-medium not-italic">Statutory Components</span>.</div>

          {/* Actions */}
          <div className="mt-6 border-t border-slate-200 pt-4 flex items-center justify-between">
            <button
              className="h-9 rounded-md px-4 text-sm font-medium text-white hover:opacity-90"
              style={{ backgroundColor: '#408dfb' }}
            >
              Save
            </button>
            <div className="text-xs font-medium text-red-500">* indicates mandatory fields</div>
          </div>
        </section>
      </div>

      {/* Right spacer to keep 60/40 layout */}
      <div className="hidden lg:block" aria-hidden />
    </div>
  );
}

/* ---- Setup & Configurations > Statutory Components ---- */
function StatutoryComponentsView() {
  const currentYear = new Date().getFullYear();
  const persisted = loadPayrollSettings();
  const [state, setState] = useState({
    cppqpp: true,
    cpt30: false,
    cpt30Date: "",
    cpp2: true,
    eiInsurable: true,
    td1x: false,
    commissionI1: "",
    commissionE: "",
    treatBonusAsNonPeriodic: false,
    useSupplemental: false,
    contribF: "",
    ...(persisted.statutory || {}),
  });
  const setField = (k) => (e) =>
    setState((p) => ({ ...p, [k]: e?.target?.type === "checkbox" ? e.target.checked : e?.target ? e.target.value : e }));

  // Engine-provided caps (placeholder wiring for now)
  const [capsLoading, setCapsLoading] = useState(false);
  const [caps] = useState({ YMPE: "", YAMPE: "", EI_MAX: "" });

  const CapChip = ({ label, value, loading, disabled }) => (
    <div
      className={
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs " +
        (disabled ? "opacity-60" : "bg-slate-50")
      }
      aria-disabled={disabled}
    >
      <span className="text-slate-500">{label} {currentYear}</span>
      {loading ? (
        <span className="inline-block h-3.5 w-16 animate-pulse rounded bg-slate-200" />
      ) : (
        <span className="font-semibold text-slate-800">{value || "—"}</span>
      )}
    </div>
  );

  // Persist statutory switches whenever they change
  React.useEffect(() => {
    savePayrollSettings((curr) => ({ ...curr, statutory: state }));
  }, [state]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,60%)_minmax(0,40%)]">
      <div className="grid grid-cols-1 gap-8">
      {/* CPP/QPP & CPP2 */}
      <section>
        <h3 className="text-base font-semibold text-slate-900">CPP/QPP & CPP2</h3>
        <div className="mt-3 space-y-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={state.cppqpp} onChange={setField("cppqpp")} />
            <span>Contribute to CPP/QPP</span>
          </label>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={state.cpt30} onChange={setField("cpt30")} disabled={!state.cppqpp} />
              <span>CPT30 exemption filed</span>
            </label>
            {state.cpt30 && (
              <div className="flex items-center gap-2">
                <span className="text-slate-700">Effective date</span>
                <input type="date" className="input w-[200px]" value={state.cpt30Date} onChange={setField("cpt30Date")} disabled={!state.cppqpp} />
              </div>
            )}
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={state.cpp2} onChange={setField("cpp2")} disabled={!state.cppqpp} />
            <span>Track CPP2 (earnings between YMPE and YAMPE)</span>
          </label>
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-[12px] text-slate-600">
            <div className="mb-2">Reference caps</div>
            <div className="flex flex-wrap gap-2">
              <CapChip label="YMPE" value={caps.YMPE} loading={capsLoading} disabled={!state.cppqpp} />
              <CapChip label="YAMPE" value={caps.YAMPE} loading={capsLoading} disabled={!state.cppqpp} />
            </div>
          </div>
        </div>
      </section>

      {/* Employment Insurance */}
      <section>
        <h3 className="text-base font-semibold text-slate-900">Employment Insurance (EI)</h3>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={state.eiInsurable} onChange={setField("eiInsurable")} />
            <span>EI insurable</span>
          </label>
          <CapChip label="EI Max" value={caps.EI_MAX} loading={capsLoading} disabled={!state.eiInsurable} />
        </div>
      </section>

      {/* Commission & Non-periodic Pay */}
      <section>
        <h3 className="text-base font-semibold text-slate-900">Commission & Non-periodic Pay</h3>
        <div className="mt-3 space-y-4 text-sm">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={state.td1x} onChange={setField("td1x")} />
            <span>TD1X present</span>
          </label>
          {state.td1x && (
            <div className="grid max-w-[520px] grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm text-slate-700">TD1X I1 (Annual expenses)</label>
                <input className="input mt-1" inputMode="decimal" placeholder="0.00" value={state.commissionI1} onChange={setField("commissionI1")} />
              </div>
              <div>
                <label className="block text-sm text-slate-700">TD1X E (Commissions/expenses ratio)</label>
                <input className="input mt-1" inputMode="decimal" placeholder="0.00" value={state.commissionE} onChange={setField("commissionE")} />
              </div>
            </div>
          )}
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={state.treatBonusAsNonPeriodic} onChange={setField("treatBonusAsNonPeriodic")} />
            <span>Treat bonuses as non‑periodic</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={state.useSupplemental} onChange={setField("useSupplemental")} />
            <span>Use supplemental method for retro/bonus</span>
          </label>
        </div>
      </section>

      {/* Quebec parental insurance */}
      <section>
        <h3 className="text-base font-semibold text-slate-900">Quebec Parental Insurance (QPIP)</h3>
        <div className="mt-2 text-sm text-slate-600">
          QPIP applies only when the province of employment is Quebec. Rates and caps are handled by the engine. EI does not apply in Quebec.
        </div>
      </section>

      {/* Registered plans at source (Factor F) */}
      <section>
        <h3 className="text-base font-semibold text-slate-900">Registered plans at source (F)</h3>
        <div className="mt-2 grid max-w-[380px] grid-cols-1 gap-3">
          <div>
            <label className="block text-sm text-slate-700">RPP/RRSP/PRPP contributions (per year)</label>
            <input className="input mt-1 w-[140px] sm:w-[160px]" type="number" min={0} step={1} inputMode="numeric" placeholder="0" value={state.contribF} onChange={setField("contribF")} />
          </div>
        </div>
      </section>
      </div>
      {/* Right spacer for 60/40 layout */}
      <div className="hidden lg:block" aria-hidden />
    </div>
  );
}
