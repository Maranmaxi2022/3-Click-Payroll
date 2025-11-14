import React, { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar } from "recharts";
import { getAccentPreset, loadBrandingPreferences } from "../utils/branding";
import { dashboardAPI } from "../utils/api";

// Simple building blocks for cards and stats
const cx = (...xs) => xs.filter(Boolean).join(" ");

function Card({ className = "", children, title, headerRight }) {
  return (
    <section
      className={cx("rounded-xl border border-slate-200 bg-white md:rounded-2xl", className)}
    >
      {(title || headerRight) && (
        <header className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5 md:py-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 md:text-[13px]">
            {title}
          </h3>
          {headerRight}
        </header>
      )}
      <div className="p-4 md:p-5">{children}</div>
    </section>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div>
      <div className="text-[12px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
      {hint ? (
        <div className="mt-1 text-[12px] text-slate-500">{hint}</div>
      ) : null}
    </div>
  );
}

function Dot({ className = "bg-slate-400" }) {
  return (
    <span className={cx("inline-block h-2.5 w-2.5 rounded-full", className)} />
  );
}

function BarRow({ label, value, amount, color = "bg-red-500", max = 100 }) {
  const width = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-[13px] text-slate-600">{label}</div>
      <div className="flex-1">
        <div className="h-3 rounded-full bg-slate-100">
          <div
            className={cx("h-3 rounded-full", color)}
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
      <div className="w-28 text-right text-[13px] font-medium text-slate-700">
        {amount}
      </div>
    </div>
  );
}

// CAD formatting and chart helpers (for Canadian payroll)
const toCAD = (n) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);

const formatShort = (n) => {
  const abs = Math.abs(n || 0);
  if (abs >= 1e9) {
    const v = n / 1e9;
    const d = Number.isInteger(v) ? 0 : 1;
    return `${v.toFixed(d)} B`;
  }
  if (abs >= 1e6) {
    const v = n / 1e6;
    const d = Number.isInteger(v) ? 0 : 1;
    return `${v.toFixed(d)} M`;
  }
  if (abs >= 1e3) return `${(n / 1e3).toFixed(0)} K`;
  return `${n || 0}`;
};

// Produce "nice" axis ticks for a given range
function niceNum(x, round) {
  if (!isFinite(x) || x <= 0) return 1;
  const exp = Math.floor(Math.log10(x));
  const f = x / Math.pow(10, exp);
  let nf;
  if (round) {
    if (f < 1.5) nf = 1;
    else if (f < 3) nf = 2;
    else if (f < 3.5) nf = 2.5;
    else if (f < 7) nf = 5;
    else nf = 10;
  } else {
    if (f <= 1) nf = 1;
    else if (f <= 2) nf = 2;
    else if (f <= 2.5) nf = 2.5;
    else if (f <= 5) nf = 5;
    else nf = 10;
  }
  return nf * Math.pow(10, exp);
}

function niceScale(min, max, desiredTicks = 7) {
  const range = niceNum(max - min, false);
  const step = niceNum(range / (desiredTicks - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = niceMin; v <= niceMax + step / 2; v += step) ticks.push(v);
  return { niceMin, niceMax, step, ticks };
}

function LegendRow({ color, label, value }) {
  return (
    <div className="flex items-center justify-between text-xs text-slate-700 md:text-[13px]">
      <div className="flex items-center gap-2">
        <Dot className={color} />
        <span>{label}</span>
      </div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

// Polished dropdown used in Box 01 (header)
function DropdownFilter({ value, onChange, accent }) {
  const options = [
    { id: "year", label: "This Year" },
    { id: "quarter", label: "This Quarter" },
    { id: "month", label: "This Month" },
    { id: "custom", label: "Custom Range" },
  ];
  const [open, setOpen] = React.useState(false);
  const [hover, setHover] = React.useState(() => options.findIndex((o) => o.id === value));
  const ref = React.useRef(null);

  React.useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const select = (id) => {
    onChange?.(id);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHover((h) => (h + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHover((h) => (h - 1 + options.length) % options.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[hover] || options[0];
      select(opt.id);
    }
  };

  const label = options.find((o) => o.id === value)?.label ?? "This Year";

  return (
    <div className="relative w-full sm:w-auto" ref={ref}>
      <button
        type="button"
        className={`inline-flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current focus:border-current md:h-9 md:w-auto md:justify-start md:px-3 ${accent ? `focus:${accent.textClass}` : "focus:text-blue-600"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
      >
        {label}
        <svg width="16" height="16" viewBox="0 0 20 20" className="text-slate-500"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-slate-100 sm:w-48 md:rounded-2xl"
        >
          {options.map((opt, i) => {
            const active = opt.id === value;
            const hovered = i === hover;
            return (
              <div
                key={opt.id}
                role="option"
                aria-selected={active}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-3.5 py-2.5 text-sm md:rounded-xl md:px-3 md:py-2 ${hovered ? "bg-slate-50" : ""}`}
                onMouseEnter={() => setHover(i)}
                onClick={() => select(opt.id)}
              >
                <span className={`truncate ${active ? "font-semibold text-slate-800" : "text-slate-700"}`}>{opt.label}</span>
                {active ? (
                  <svg width="16" height="16" viewBox="0 0 20 20" className={`${accent?.textClass || "text-blue-600"}`}><path d="M7.5 11.5l2 2 4-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Stacked monthly bar chart (Recharts)
function StackedBarChartCA({ data = [] }) {
  const COLORS = {
    net: "bg-emerald-500",
    taxes: "bg-amber-400",
    statutory: "bg-blue-500",
    deductions: "bg-rose-500",
  };
  const HEX = {
    net: "#10b981",
    taxes: "#fbbf24",
    statutory: "#3b82f6",
    deductions: "#f43f5e",
  };

  const MonthYearTick = ({ x, y, payload }) => {
    const row = payload?.payload;
    const isMobile = window.innerWidth < 768;
    return (
      <g transform={`translate(${x},${y})`}>
        <text dy={14} textAnchor="middle" fill="#475569" fontSize={isMobile ? "10" : "12"}>
          {payload.value}
        </text>
        {!isMobile && (
          <text dy={28} textAnchor="middle" fill="#94a3b8" fontSize="11">
            {row?.y}
          </text>
        )}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload || {};
    return (
      <div className="rounded-lg bg-white p-3 text-[13px] shadow-lg ring-1 ring-slate-200">
        <div className="space-y-1">
          <LegendRow color={COLORS.net} label="Net Pay" value={toCAD(d.net)} />
          <LegendRow color={COLORS.taxes} label="Taxes" value={toCAD(d.taxes)} />
          <LegendRow color={COLORS.statutory} label="Statutories" value={toCAD(d.statutory)} />
          <LegendRow color={COLORS.deductions} label="Deductions" value={toCAD(d.deductions)} />
        </div>
      </div>
    );
  };

  const YTick = ({ x, y, payload }) => (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        textAnchor="end"
        dominantBaseline="central"
        fill="#94a3b8"
        fontSize="11"
      >
        {formatShort(payload.value)}
      </text>
    </g>
  );

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="relative h-56 md:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: isMobile ? 4 : 8, left: isMobile ? 4 : 8, bottom: isMobile ? 24 : 34 }}
          barCategoryGap={isMobile ? 12 : 24}
        >
          <CartesianGrid vertical={false} stroke="rgba(203,213,225,0.35)" />
          <XAxis
            dataKey="m"
            interval={0}
            tickLine={false}
            axisLine={false}
            tick={<MonthYearTick />}
            tickMargin={8}
          />
          <YAxis
            width={isMobile ? 44 : 56}
            tick={<YTick />}
            tickLine={false}
            axisLine={false}
            padding={{ top: 8, bottom: 8 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
          <Bar dataKey="net" stackId="a" fill={HEX.net} barSize={isMobile ? 10 : 14} />
          <Bar dataKey="taxes" stackId="a" fill={HEX.taxes} barSize={isMobile ? 10 : 14} />
          <Bar dataKey="statutory" stackId="a" fill={HEX.statutory} barSize={isMobile ? 10 : 14} />
          <Bar dataKey="deductions" stackId="a" fill={HEX.deductions} barSize={isMobile ? 10 : 14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const formatLong = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
const formatDDMMYYYY = (iso) => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
};

const cardActionButton =
  "inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-blue-600 transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500";

export default function DashboardHome() {
  // State for dashboard data
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats on mount
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const stats = await dashboardAPI.getStats();
        setActiveEmployees(stats.active_employees || 0);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Mock data (replace with real data later)
  const payRun = {
    period: "July 01, 2024 - July 15, 2024",
    status: "Approved",
    netPay: "$19,200.00",
    dateISO: "2024-07-13",
    employees: activeEmployees,
  };

  const liabilities = [
    { name: "Federal Tax", outstanding: "$5,521.21", funded: "$621.00" },
    { name: "State Tax", outstanding: "$1,176.46", funded: "$430.00" },
  ];

  // Employee distribution counts (removed bars; keep if needed later)

  // Filtered period for chart
  const [period, setPeriod] = React.useState("year"); // 'year' | 'quarter' | 'month' | 'custom'

  // Accented input styles
  const accent = getAccentPreset(loadBrandingPreferences().accent);
  const accentFocus = `${accent.textClass} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current focus:border-current`;

  // Generate synthetic monthly data for the selected period (replace with real aggregates)
  const buildMonthly = React.useCallback((count) => {
    const now = new Date();
    return Array.from({ length: count }).map((_, idxFromEnd) => {
      const d = new Date(
        now.getFullYear(),
        now.getMonth() - (count - 1 - idxFromEnd),
        1
      );
      const y = d.getFullYear();
      const m = d.toLocaleString(undefined, { month: "short" });
      const base = 90000 + (idxFromEnd % 3) * 6000;
      const net = base * 10.5;
      const taxes = base * 5.8;
      const statutory = base * 0.35;
      const deductions = base * 0.05;
      return { key: `${y}-${m}`, y, m, net, taxes, statutory, deductions };
    });
  }, []);

  const monthlyCA = React.useMemo(() => {
    switch (period) {
      case "quarter":
        return buildMonthly(3);
      case "month":
        return buildMonthly(1);
      case "custom":
        return buildMonthly(6);
      case "year":
      default:
        return buildMonthly(10);
    }
  }, [period, buildMonthly]);

  return (
    <div className="pb-6 md:pb-8">
      {/* Mobile-only welcome (desktop uses fixed subheader) */}
      <div className="mb-4 text-xl font-semibold tracking-[-0.01em] text-slate-900 md:text-[22px] lg:hidden">
        Welcome Maran!
      </div>

      {/* Main dashboard layout */}
      <div className="space-y-4 md:space-y-6">
          <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 md:rounded-2xl md:p-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-2 rounded-l-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300 md:block">
              <div className="absolute inset-y-1 right-0 w-[1px] rounded-full bg-white/60" />
            </div>
            <div className="md:pl-8">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between md:gap-3">
                <div className="text-xs font-medium text-slate-600 md:text-[13px]">
                  Process Pay Run for{" "}
                  <span className="font-semibold text-slate-900">
                    {payRun.period}
                  </span>
                </div>
                <span className="inline-flex h-6 w-fit items-center rounded-full bg-emerald-50 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200 md:h-7 md:px-3 md:text-[12px]">
                  {payRun.status}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-3 md:mt-5 md:flex-row md:items-center md:justify-between md:gap-4">
                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3 sm:divide-x sm:divide-slate-200 md:mr-6 md:gap-6">
                  <div className="sm:px-6 sm:first:pl-0">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:text-[12px]">
                      Employees' Net Pay
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900 md:text-base">
                      {payRun.netPay}
                    </div>
                  </div>
                  <div className="sm:px-6">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:text-[12px]">
                      Payment Date
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900 md:text-base">
                      {formatLong(payRun.dateISO)}
                    </div>
                  </div>
                  <div className="sm:px-6">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:text-[12px]">
                      No. of Employees
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900 md:text-base">
                      {payRun.employees}
                    </div>
                  </div>
                </div>

                <div className="self-start md:self-center">
                  <button
                    type="button"
                    className="btn-ghost h-11 w-full rounded-xl bg-black px-5 text-sm font-medium text-white hover:bg-black md:h-9 md:w-auto md:px-4"
                  >
                    View Details
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-[auto_1fr] items-start gap-2 text-xs text-slate-500 md:mt-5 md:items-center md:text-[13px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4 flex-shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>

                <span>
                  Pay your employees on {formatDDMMYYYY(payRun.dateISO)}. Record
                  it here once you made the payment.
                </span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2" title="Summary of Liabilities">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {liabilities.map((li) => (
                  <section
                    key={li.name}
                    className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-3.5 md:gap-3 md:rounded-2xl md:p-4"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 md:text-sm">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5 text-slate-500 md:h-4 md:w-4"
                      >
                        <path
                          d="M12 1l9 4v6c0 6-4 10-9 12-5-2-9-6-9-12V5l9-4z"
                          fill="currentColor"
                        />
                      </svg>
                      {li.name}
                    </div>
                    <div className="flex items-start gap-2.5 md:gap-3">
                      <span className="h-10 w-[3px] rounded-full bg-orange-600 md:h-12" />
                      <div className="space-y-2 md:space-y-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 md:text-[11px]">
                          Total Outstanding
                        </div>
                        <div className="text-xl font-semibold text-slate-700 md:text-[22px]">
                          {li.outstanding}
                        </div>
                        <div className="text-[11px] text-slate-500 md:text-[12px]">
                          Funded Amount:{" "}
                          <span className="font-semibold text-slate-600">
                            {li.funded}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            </Card>

            <Card title="Employee Summary">
              <div className="flex flex-col">
                <div className="space-y-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Active Employees
                  </div>
                  {loading ? (
                    <div className="text-[42px] font-semibold leading-none text-slate-400">
                      ...
                    </div>
                  ) : (
                    <div className="text-[42px] font-semibold leading-none text-slate-700">
                      {activeEmployees}
                    </div>
                  )}
                  <button
                    type="button"
                    className="inline-flex w-fit text-sm font-semibold text-blue-600 transition hover:text-blue-700 focus-visible:underline focus-visible:outline-none"
                    onClick={() => (window.location.hash = "employees")}
                  >
                    View Employees
                  </button>
                </div>
              </div>
            </Card>
          </div>

          <Card
            title="Payroll Cost Summary"
            headerRight={<DropdownFilter value={period} onChange={setPeriod} accent={accent} />}
          >
            {/* Box 02 — content area */}
            <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-[1fr_260px]">
              <StackedBarChartCA data={monthlyCA} />
              {/* Legend panel (right on large, stacked on mobile) */}
              <div className="space-y-2 md:space-y-2.5">
                <LegendRow label="Net Pay" color="bg-emerald-500" value={toCAD(monthlyCA.reduce((s, d) => s + (d.net || 0), 0))} />
                <LegendRow label="Taxes" color="bg-amber-400" value={toCAD(monthlyCA.reduce((s, d) => s + (d.taxes || 0), 0))} />
                <LegendRow label="Statutories" color="bg-blue-500" value={toCAD(monthlyCA.reduce((s, d) => s + (d.statutory || 0), 0))} />
                <LegendRow label="Deductions" color="bg-rose-500" value={toCAD(monthlyCA.reduce((s, d) => s + (d.deductions || 0), 0))} />
              </div>
            </div>
          </Card>
      </div>
    </div>
  );
}
