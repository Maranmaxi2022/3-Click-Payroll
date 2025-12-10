// src/pages/PaySchedule.jsx
import React from "react";
import SearchSelect from "../components/SearchSelect";

const cx = (...xs) => xs.filter(Boolean).join(" ");

// Utilities
function getDaysInMonth(year, month /* 0-11 */) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonthDOW(year, month) {
  return new Date(year, month, 1).getDay(); // 0 = Sun .. 6 = Sat
}

function isWorkingDay(date, workWeek) {
  // workWeek: array[7] of booleans, 0=Sun..6=Sat
  const dow = date.getDay();
  return !!workWeek[dow];
}

function lastWorkingDayOfMonth(year, month, workWeek) {
  const last = getDaysInMonth(year, month);
  for (let d = last; d >= 1; d--) {
    const dt = new Date(year, month, d);
    if (isWorkingDay(dt, workWeek)) return dt;
  }
  return new Date(year, month, last);
}

function adjustToPrevWorkingDay(date, workWeek) {
  let d = new Date(date);
  while (!isWorkingDay(d, workWeek)) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}

function formatDDMMYYYY(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function PaySchedule() {
  // State
  const [now, setNow] = React.useState(() => new Date());
  const [payFrequency, setPayFrequency] = React.useState("monthly"); // 'weekly' | 'biweekly' | 'monthly'
  const [workWeek, setWorkWeek] = React.useState([true, true, true, true, true, true, false]);
  const [basis, setBasis] = React.useState("actual"); // 'actual' | 'org'
  const [orgDaysPerMonth, setOrgDaysPerMonth] = React.useState(26);
  const [payOn, setPayOn] = React.useState("day"); // 'lastWorking' | 'day'
  const [payDayOfMonth, setPayDayOfMonth] = React.useState(1);
  const [firstMonth, setFirstMonth] = React.useState(() => {
    // Default to current month
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Keep monthOptions rolling to always show next 12 months.
  React.useEffect(() => {
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
    const ms = nextMonthStart.getTime() - Date.now();
    const id = setTimeout(() => setNow(new Date()), Math.max(1000, ms));
    return () => clearTimeout(id);
  }, [now]);

  // Derived: first payroll month info
  const yyyy = firstMonth.getFullYear();
  const mm = firstMonth.getMonth();

  // Compute default pay date for first payroll
  const computedPayDate = React.useMemo(() => {
    if (payOn === "lastWorking") {
      return lastWorkingDayOfMonth(yyyy, mm, workWeek);
    }
    const last = getDaysInMonth(yyyy, mm);
    const day = Math.min(Math.max(1, Number(payDayOfMonth) || 1), last);
    const dt = new Date(yyyy, mm, day);
    return adjustToPrevWorkingDay(dt, workWeek);
  }, [payOn, yyyy, mm, workWeek, payDayOfMonth]);

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const toggleDOW = (i) => setWorkWeek((wk) => {
    const next = wk.slice();
    next[i] = !next[i];
    return next;
  });

  const monthOptions = React.useMemo(() => {
    // Rolling next 12 months starting from current month
    const arr = [];
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    for (let i = 0; i < 12; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      arr.push(d);
    }
    return arr;
  }, [now]);

  const handleSave = () => {
    const payload = {
      payFrequency,
      workWeek,
      basis,
      orgDaysPerMonth,
      payRule: payOn === "lastWorking" ? { type: "lastWorking" } : { type: "day", day: Number(payDayOfMonth) || 1 },
      firstPayrollMonth: { year: yyyy, month: mm + 1 },
      firstPayDate: computedPayDate.toISOString(),
    };
    // For now, just log it. Wire to backend later.
    console.log("Pay Schedule saved:", payload);
    alert("Saved Pay Schedule (console)\n" + JSON.stringify(payload, null, 2));
  };

  // Calendar grid for the selected month
  const Calendar = () => {
    const firstDow = firstDayOfMonthDOW(yyyy, mm);
    const days = getDaysInMonth(yyyy, mm);
    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(yyyy, mm, d));

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 w-[280px]">
        <div className="text-center text-sm font-semibold text-slate-700 mb-2">
          {new Date(yyyy, mm, 1).toLocaleString(undefined, { month: "long", year: "numeric" })}
        </div>
        <div className="grid grid-cols-7 gap-1 text-[11px] text-slate-500 mb-1">
          {daysOfWeek.map((d) => (
            <div key={d} className="text-center">{d.substring(0,3)}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, idx) => {
            if (!d) return <div key={idx} className="h-8" />;
            const isSelected = d.toDateString() === computedPayDate.toDateString();
            const isWork = isWorkingDay(d, workWeek);
            return (
              <div
                key={idx}
                className={cx(
                  "h-8 grid place-items-center rounded-xl text-[12px]",
                  isSelected
                    ? "bg-blue-600 text-white"
                    : isWork
                    ? "bg-slate-50 text-slate-700"
                    : "bg-white text-slate-400"
                )}
              >
                {d.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 md:w-[60%]">
      {/* Section heading (mobile only; desktop title is in the fixed subheader) */}
      <div className="flex items-center lg:hidden">
        <h2 className="text-lg font-semibold text-slate-900">Pay Schedule</h2>
      </div>

      {/* Pay Frequency */}
      <section>
          <div className="text-sm font-semibold text-slate-900">Pay frequency</div>
          <div className="text-[13px] text-slate-500">How often employees will receive their payslips</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPayFrequency("weekly")}
              className={cx(
                "h-9 min-w-[120px] rounded-xl border px-4 text-sm font-medium transition-colors",
                payFrequency === "weekly"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setPayFrequency("biweekly")}
              className={cx(
                "h-9 min-w-[120px] rounded-xl border px-4 text-sm font-medium transition-colors",
                payFrequency === "biweekly"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              Every 2 Weeks
            </button>
            <button
              type="button"
              onClick={() => setPayFrequency("monthly")}
              className={cx(
                "h-9 min-w-[120px] rounded-xl border px-4 text-sm font-medium transition-colors",
                payFrequency === "monthly"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              Monthly
            </button>
          </div>
      </section>

      {/* Work week */}
      <section>
          <div className="text-sm font-semibold text-slate-900">Select your work week</div>
          <div className="text-[13px] text-slate-500">The days worked in a calendar week</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {daysOfWeek.map((d, i) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDOW(i)}
                className={cx(
                  "h-8 min-w-[54px] rounded-xl border px-3 text-sm",
                  workWeek[i]
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {d.substring(0,3)}
              </button>
            ))}
          </div>
      </section>

      {/* Salary basis - Only show for monthly */}
      {payFrequency === "monthly" && (
        <section>
            <div className="text-sm font-semibold text-slate-900">Calculate monthly salary based on</div>
            <div className="mt-2 space-y-2 text-sm text-slate-700">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="basis"
                  value="actual"
                  checked={basis === "actual"}
                  onChange={() => setBasis("actual")}
                />
                <span>Actual days in a month</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="basis"
                  value="org"
                  checked={basis === "org"}
                  onChange={() => setBasis("org")}
                />
                <span className="flex items-center gap-2">
                  Organisation working days -
                  <input
                    type="number"
                    min={1}
                    max={31}
                    className="h-8 w-20 rounded-xl border border-slate-200 px-2 text-sm"
                    value={orgDaysPerMonth}
                    onChange={(e) => setOrgDaysPerMonth(Number(e.target.value) || 26)}
                    disabled={basis !== "org"}
                  />
                  <span>days per month</span>
                </span>
              </label>
            </div>
        </section>
      )}

      {/* Pay on - Different options based on frequency */}
      <section>
          <div className="text-sm font-semibold text-slate-900">Pay on</div>
          <div className="mt-2 space-y-3 text-sm text-slate-700">
            {payFrequency === "monthly" && (
              <>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payon"
                    value="lastWorking"
                    checked={payOn === "lastWorking"}
                    onChange={() => setPayOn("lastWorking")}
                  />
                  <span>the last working day of every month</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payon"
                    value="day"
                    checked={payOn === "day"}
                    onChange={() => setPayOn("day")}
                  />
                  <span className="flex items-center gap-2">
                    day
                    <div className={cx(payOn !== "day" ? "pointer-events-none opacity-60" : "")}>
                      <SearchSelect
                        className="w-[96px]"
                        inputClassName="rounded-xl px-3 py-1.5 pr-8 text-left"
                        menuSearchClassName="rounded-xl"
                        options={Array.from({ length: 31 }, (_, i) => i + 1).map((n) => ({ value: n, label: String(n) }))}
                        value={payDayOfMonth}
                        onChange={(opt) => setPayDayOfMonth(Number(opt.value))}
                        placeholder=""
                        searchInMenu
                      />
                    </div>
                    of every month
                  </span>
                </label>
              </>
            )}
            {(payFrequency === "weekly" || payFrequency === "biweekly") && (
              <div className="flex items-center gap-2">
                <span>Every</span>
                <SearchSelect
                  className="w-[120px]"
                  inputClassName="rounded-xl px-3 py-1.5 pr-8 text-left"
                  menuSearchClassName="rounded-xl"
                  options={daysOfWeek.map((d, i) => ({ value: i, label: d }))}
                  value={payDayOfMonth}
                  onChange={(opt) => setPayDayOfMonth(Number(opt.value))}
                  placeholder=""
                  searchInMenu
                />
              </div>
            )}
            <div className="text-[12px] text-slate-500">
              Note: When payday falls on a non-working day or a holiday, employees will get paid on the previous working day.
            </div>
          </div>
      </section>

      {/* First payroll */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,400px)_auto]">
          <div>
            <div className="text-sm font-semibold text-slate-900">Start your first payroll from</div>
            <div className="mt-2 max-w-xs">
              <SearchSelect
                inputClassName="rounded-xl px-3 py-2 pr-8"
                menuSearchClassName="rounded-xl"
                options={monthOptions.map((d) => ({
                  value: `${d.getFullYear()}-${d.getMonth()}`,
                  label: `${d.toLocaleString(undefined, { month: "long" })}-${d.getFullYear()}`,
                }))}
                value={`${yyyy}-${mm}`}
                onChange={(opt) => {
                  const [y, m] = String(opt.value).split("-").map(Number);
                  setFirstMonth(new Date(y, m, 1));
                }}
                placeholder=""
                searchInMenu
              />
            </div>

            <div className="mt-4">
              <div className="text-sm font-semibold text-slate-900">Select a pay date for your first payroll</div>
              <div className="text-[13px] text-slate-500">Pay Period: {new Date(yyyy, mm, 1).toLocaleString(undefined, { month: "long", year: "numeric" })}</div>
              <div className="mt-2 max-w-xs">
                <SearchSelect
                  inputClassName="rounded-xl px-3 py-2 pr-8"
                  options={[{ value: formatDDMMYYYY(computedPayDate), label: formatDDMMYYYY(computedPayDate), icon: "✅" }]}
                  value={formatDDMMYYYY(computedPayDate)}
                  onChange={() => {}}
                  placeholder=""
                />
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <Calendar />
          </div>
      </section>

      <div className="mt-2 flex items-center gap-3">
          <button type="button" className="btn-primary" onClick={handleSave}>Save</button>
          <button type="button" className="btn-ghost">Cancel</button>
      </div>
    </div>
  );
}