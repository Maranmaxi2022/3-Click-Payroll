import React from "react";

// Simple building blocks for cards and stats
const cx = (...xs) => xs.filter(Boolean).join(" ");

function Card({ className = "", children, title, headerRight }) {
  return (
    <section
      className={cx("rounded-2xl border border-slate-200 bg-white", className)}
    >
      {(title || headerRight) && (
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            {title}
          </h3>
          {headerRight}
        </header>
      )}
      <div className="p-5">{children}</div>
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
  // Mock data (replace with real data later)
  const payRun = {
    period: "July 01, 2024 - July 15, 2024",
    status: "Approved",
    netPay: "$19,200.00",
    dateISO: "2024-07-13",
    employees: 30,
  };

  const liabilities = [
    { name: "Federal Tax", outstanding: "$5,521.21", funded: "$621.00" },
    { name: "State Tax", outstanding: "$1,176.46", funded: "$430.00" },
  ];

  const costSummary = [
    { label: "Net Pay", amount: "$56,816.36", value: 90, color: "bg-rose-700" },
    { label: "Taxes", amount: "$78,026.52", value: 100, color: "bg-red-500" },
    { label: "Benefits", amount: "$800.00", value: 10, color: "bg-amber-400" },
    {
      label: "Deductions",
      amount: "$9,000.00",
      value: 25,
      color: "bg-orange-300",
    },
  ];

  return (
    <div className="pb-8">
      {/* Welcome + Quick overview */}
      <div className="mb-4 text-[22px] font-semibold tracking-[-0.01em] text-slate-900">
        Welcome Maran!
      </div>

      {/* Main dashboard layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-2 rounded-l-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300">
              <div className="absolute inset-y-1 right-0 w-[1px] rounded-full bg-white/60" />
            </div>
            <div className="pl-6 sm:pl-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-[13px] font-medium text-slate-600">
                  Process Pay Run for{" "}
                  <span className="font-semibold text-slate-900">
                    {payRun.period}
                  </span>
                </div>
                <span className="inline-flex h-7 items-center rounded-full bg-emerald-50 px-3 text-[12px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
                  {payRun.status}
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-3 sm:divide-x sm:divide-slate-200 md:mr-6">
                  <div className="sm:px-6">
                    <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                      Employees' Net Pay
                    </div>
                    <div className="mt-1 text-base font-semibold text-slate-900">
                      {payRun.netPay}
                    </div>
                  </div>
                  <div className="sm:px-6">
                    <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                      Payment Date
                    </div>
                    <div className="mt-1 text-base font-semibold text-slate-900">
                      {formatLong(payRun.dateISO)}
                    </div>
                  </div>
                  <div className="sm:px-6">
                    <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                      No. of Employees
                    </div>
                    <div className="mt-1 text-base font-semibold text-slate-900">
                      {payRun.employees}
                    </div>
                  </div>
                </div>

                <div className="self-start md:self-center">
                  <button
                    type="button"
                    className="btn-ghost h-9 rounded-xl bg-black px-4 text-white hover:bg-black"
                  >
                    View Details
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-[auto_1fr] items-center gap-2 text-[13px] text-slate-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4"
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2" title="Summary of Liabilities">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {liabilities.map((li) => (
                  <section
                    key={li.name}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-slate-500"
                      >
                        <path
                          d="M12 1l9 4v6c0 6-4 10-9 12-5-2-9-6-9-12V5l9-4z"
                          fill="currentColor"
                        />
                      </svg>
                      {li.name}
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="h-16 w-[3px] rounded-full bg-orange-600" />
                      <div className="space-y-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Total Outstanding
                        </div>
                        <div className="text-[26px] font-semibold text-slate-700">
                          {li.outstanding}
                        </div>
                        <div className="text-[12px] text-slate-500">
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

            <Card>
              <div className="flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-8 sm:flex-1">
                  <div className="space-y-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                      Employee Summary
                    </div>
                    <div className="space-y-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Active Employees
                      </div>
                      <div className="text-[42px] font-semibold leading-none text-slate-700">
                        30
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex w-fit text-sm font-semibold text-blue-600 transition hover:text-blue-700 focus-visible:underline focus-visible:outline-none"
                  >
                    View Employees
                  </button>
                </div>
                <div className="flex w-full justify-between gap-8 border-t border-slate-200 pt-8 sm:w-auto sm:border-l sm:border-t-0 sm:pl-12 sm:pt-0">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-24 w-9 rounded-sm bg-amber-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Hourly
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-32 w-9 rounded-sm bg-orange-700" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Salaried
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card
            className="rounded-2xl"
            title="Payroll Cost Summary"
            headerRight={
              <div className="text-[13px] text-slate-500">This year ▾</div>
            }
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_240px]">
              <div className="space-y-3">
                {costSummary.map((row) => (
                  <BarRow
                    key={row.label}
                    label={row.label}
                    amount={row.amount}
                    value={row.value}
                    color={row.color}
                    max={100}
                  />
                ))}
              </div>
              <div className="space-y-2">
                {costSummary.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between text-[13px] text-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <Dot className={row.color} />
                      <span>{row.label}</span>
                    </div>
                    <div className="font-medium">{row.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <Card className="rounded-2xl lg:self-start" title="To Do Tasks">
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-slate-700">
                You have 4 pending tax payments.
              </div>
              <button
                type="button"
                className={cx(cardActionButton, "shrink-0")}
              >
                View Details
              </button>
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-slate-700">
                W-2 forms have been generated for all employees.
              </div>
              <button
                type="button"
                className={cx(cardActionButton, "shrink-0")}
              >
                Review and Send
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
