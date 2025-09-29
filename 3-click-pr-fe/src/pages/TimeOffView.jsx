// /src/pages/TimeOffView.jsx
import React, { useMemo, useRef, useState } from "react";

/** ---- Tunables ---- */
const DAY_WIDTH = 44;    // px per day
const ROW_HEIGHT = 64;   // px per employee row
const LEFT_COL_W = 280;  // px fixed employee column
const HEADER_H = 64;     // px sticky headers

/** Palette to match the screenshots */
const COLORS = {
  grid: "#e6eef6",            // very thin grid lines
  gridStronger: "#cfd9e6",
  weekendFill: "rgba(15, 23, 42, 0.025)",
  todayFill: "rgba(37, 99, 235, 0.10)",
  todayCap: "#1e40af",
  name: "#0f172a",
  role: "#6b7280",
  headerDow: "#6b7280",
  headerDay: "#0f172a",
};

const TYPES = [
  { id: "pto",        label: "Paid time off",  cls: "bg-[#dcfce7] text-[#14532d] ring-[#bbf7d0]" },
  { id: "sick",       label: "Sick leave",     cls: "bg-[#e5e7eb] text-[#374151] ring-[#d1d5db]" },
  { id: "unpaid",     label: "Unpaid leave",   cls: "bg-[#eef2ff] text-[#3730a3] ring-[#e0e7ff]" },
  { id: "sabbatical", label: "Sabbatical",     cls: "bg-[#fde68a] text-[#78350f] ring-[#fcd34d]" },
];

/* ---- date helpers ---- */
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth   = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const daysInMonth  = (d) => endOfMonth(d).getDate();
const diffDays     = (a, b) => Math.ceil((b - a) / (1000 * 60 * 60 * 24)); // b exclusive
const clamp        = (n, min, max) => Math.max(min, Math.min(max, n));
const parseISO     = (iso) => { const [y,m,dd] = iso.split("-").map(Number); return new Date(y, m-1, dd); };

function layoutEventInMonth({ startISO, endISO }, monthDate) {
  const mStart = startOfMonth(monthDate);
  const mEnd   = endOfMonth(monthDate);

  const start  = parseISO(startISO);
  const end    = parseISO(endISO); // exclusive

  const visibleStart = new Date(clamp(start.getTime(), mStart.getTime(), mEnd.getTime() + 1));
  const visibleEnd   = new Date(clamp(end.getTime(),   mStart.getTime(), mEnd.getTime() + 1));
  if (visibleEnd <= mStart || visibleStart > mEnd) return { hidden: true, leftPx: 0, widthPx: 0 };

  const leftDays  = diffDays(mStart, visibleStart);
  const widthDays = Math.max(1, diffDays(visibleStart, visibleEnd));
  return { hidden: false, leftPx: leftDays * DAY_WIDTH, widthPx: widthDays * DAY_WIDTH };
}

const isWeekend = (date) => {
  const d = date.getDay();
  return d === 0 || d === 6;
};

/* ---- demo data ---- */
const EMPLOYEES = [
  { id: "1097517", name: "Adams, Okey",      role: "Senior Account Executive" },
  { id: "1097496", name: "Bojovic, Nick",    role: "Revenue Operations Manager" },
  { id: "1097497", name: "Dare, Jessica",    role: "Sales Development Representative" },
  { id: "1097498", name: "Howe, Cristina",   role: "Sales Development Manager" },
  { id: "1097525", name: "Kreiger, Ashley",  role: "Enterprise Account Executive" },
  { id: "1097491", name: "Marquardt, Loren", role: "Sales Development Representative" },
  { id: "1097550", name: "Murazik, Aleen",   role: "VP of Customer Services" },
  { id: "1097500", name: "Murazik, Kelly",   role: "Sales Development Representative" },
  { id: "1097515", name: "Pollich, Sam",     role: "Sales Manager" },
  { id: "1097557", name: "Trantow, Pietro",  role: "VP of Sales" },
  { id: "1097537", name: "Von, Marian",      role: "Account Executive" },
  { id: "1097541", name: "Walter, Therese",  role: "Account Executive" },
];

const EVENTS = [
  { id: "e1", employeeId: "1097517", start: "2025-09-27", end: "2025-09-30", title: "Paid time off", type: "pto", status: "approved" },
  { id: "e2", employeeId: "1097496", start: "2025-09-24", end: "2025-09-25", title: "Sick leave",    type: "sick", status: "pending"  },
  { id: "e3", employeeId: "1097497", start: "2025-09-17", end: "2025-09-18", title: "Sick leave",    type: "sick", status: "approved" },
  { id: "e4", employeeId: "1097497", start: "2025-09-21", end: "2025-09-28", title: "Paid time off", type: "pto",  status: "approved" },
  { id: "e5", employeeId: "1097498", start: "2025-09-23", end: "2025-09-25", title: "",              type: "sick", status: "approved" },
  { id: "e6", employeeId: "1097525", start: "2025-09-26", end: "2025-09-27", title: "Sick leave",    type: "sick", status: "approved" },
  { id: "e7", employeeId: "1097525", start: "2025-09-28", end: "2025-09-30", title: "Paid time off", type: "pto",  status: "approved" },
  { id: "e8", employeeId: "1097491", start: "2025-09-22", end: "2025-09-30", title: "Sabbatical",    type: "sabbatical", status: "pending" },
];

export default function TimeOffView() {
  const [month, setMonth] = useState(new Date());
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const nDays      = daysInMonth(month);
  const monthLabel = month.toLocaleString(undefined, { month: "long", year: "numeric" });
  const widthPx    = nDays * DAY_WIDTH;

  const today = new Date();
  const showToday = today.getFullYear() === month.getFullYear() && today.getMonth() === month.getMonth();
  const todayLeft = showToday ? (today.getDate() - 1) * DAY_WIDTH : null;

  const filteredEmployees = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return EMPLOYEES;
    return EMPLOYEES.filter(e => e.name.toLowerCase().includes(t) || e.role.toLowerCase().includes(t));
  }, [q]);

  const filteredEvents = useMemo(
    () => EVENTS.filter(ev => (typeFilter === "all" ? true : ev.type === typeFilter)),
    [typeFilter]
  );

  // --- Scroll syncing refs ---
  const leftBodyRef  = useRef(null);  // names column vertical scroller
  const rightBodyRef = useRef(null);  // calendar body scroller (x & y)
  const headerXRef   = useRef(null);  // date header horizontal scroller

  // prevent feedback loops
  const syncLock = useRef({ from: "" });

  const syncVertical = (from) => {
    const left  = leftBodyRef.current;
    const right = rightBodyRef.current;
    if (!left || !right) return;

    if (from === "left") {
      if (syncLock.current.from === "right") return;
      syncLock.current.from = "left";
      right.scrollTop = left.scrollTop;
      syncLock.current.from = "";
    } else {
      if (syncLock.current.from === "left") return;
      syncLock.current.from = "right";
      left.scrollTop = right.scrollTop;
      syncLock.current.from = "";
    }
  };

  const syncHorizontalHeader = () => {
    const right = rightBodyRef.current;
    const head  = headerXRef.current;
    if (!right || !head) return;
    head.scrollLeft = right.scrollLeft;
  };

  return (
    <div className="py-4">
      {/* Controls */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm hover:bg-slate-50"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          >◀</button>
          <button
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm hover:bg-slate-50"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          >▶</button>
          <h1 className="ml-2 text-[18px] font-semibold text-slate-800">{monthLabel}</h1>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <input
              className="h-9 w-72 rounded-md border border-slate-200 bg-white pl-8 pr-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Search employees, roles, depts"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <svg viewBox="0 0 24 24" className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400">
              <path d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          <select
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All time-off types</option>
            {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Card (reduced radius) */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02)]">
        {/* Sticky headers row */}
        <div className="grid" style={{ gridTemplateColumns: `${LEFT_COL_W}px 1fr` }}>
          {/* Left sticky header */}
          <div
            className="sticky top-0 z-30 bg-white"
            style={{ height: HEADER_H, borderBottom: `1px solid ${COLORS.gridStronger}` }}
          >
            <div className="flex h-full items-center px-5">
              <div className="text-[18px] font-semibold" style={{ color: COLORS.name }}>
                Employees ({filteredEmployees.length})
              </div>
            </div>
          </div>

          {/* Right sticky date header (horizontal scroller) */}
          <div
            className="sticky top-0 z-20 bg-white overflow-x-auto"
            ref={headerXRef}
            style={{ height: HEADER_H, borderBottom: `1px solid ${COLORS.gridStronger}` }}
          >
            <div style={{ width: nDays * DAY_WIDTH }}>
              <div className="relative flex select-none h-full">
                {Array.from({ length: nDays }, (_, i) => {
                  const d = new Date(month.getFullYear(), month.getMonth(), i + 1);
                  const weekend = isWeekend(d);
                  const dow = d.toLocaleString(undefined, { weekday: "short" });
                  const day = i + 1;
                  return (
                    <div
                      key={i}
                      className="shrink-0 border-l first:border-l-0"
                      style={{ width: DAY_WIDTH, borderColor: COLORS.grid }}
                    >
                      {weekend && (
                        <div
                          className="absolute inset-y-0"
                          style={{ left: i * DAY_WIDTH, width: DAY_WIDTH, backgroundColor: COLORS.weekendFill }}
                        />
                      )}
                      <div className="h-7 grid place-items-center text-[12px]" style={{ color: COLORS.headerDow }}>
                        {dow}
                      </div>
                      <div className="h-[calc(64px-28px)] grid place-items-center text-[15px] font-semibold" style={{ color: COLORS.headerDay }}>
                        {day}
                      </div>
                    </div>
                  );
                })}
                {showToday && (
                  <>
                    <div className="absolute top-0" style={{ left: todayLeft, width: DAY_WIDTH, height: "100%", backgroundColor: COLORS.todayFill }} />
                    <div className="absolute" style={{ left: todayLeft, width: DAY_WIDTH, height: 6, top: HEADER_H - 6, backgroundColor: COLORS.todayCap, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bodies: two SIDE-BY-SIDE vertical scrollers kept in sync */}
        <div className="grid" style={{ gridTemplateColumns: `${LEFT_COL_W}px 1fr` }}>
          {/* LEFT names body (vertical scroll ONLY) */}
          <div
            ref={leftBodyRef}
            className="overflow-y-auto overflow-x-hidden"
            style={{ maxHeight: "70vh" }}
            onScroll={() => syncVertical("left")}
          >
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="px-5"
                style={{
                  height: ROW_HEIGHT,
                  borderBottom: `1px solid ${COLORS.grid}`,
                }}
              >
                <div className="flex h-full items-center">
                  <div className="min-w-0">
                    <div className="truncate text-[17px] font-semibold" style={{ color: COLORS.name }}>
                      {emp.name}
                    </div>
                    <div className="truncate text-[14px]" style={{ color: COLORS.role }}>
                      {emp.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT calendar body (both scrolls). Horizontal moves header; vertical syncs with left. */}
          <div
            ref={rightBodyRef}
            className="overflow-auto"
            style={{ maxHeight: "70vh" }}
            onScroll={() => { syncVertical("right"); syncHorizontalHeader(); }}
          >
            <div style={{ width: widthPx }}>
              {filteredEmployees.map((emp) => {
                const empEvents = filteredEvents.filter((e) => e.employeeId === emp.id);
                return (
                  <div key={emp.id} className="relative" style={{ height: ROW_HEIGHT, borderBottom: `1px solid ${COLORS.grid}` }}>
                    {/* vertical day lines + weekend tint + Monday hatch */}
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: nDays }, (_, i) => {
                        const d = new Date(month.getFullYear(), month.getMonth(), i + 1);
                        const weekend = isWeekend(d);
                        const left = i * DAY_WIDTH;
                        return (
                          <div key={i} className="absolute top-0 bottom-0" style={{ left, width: DAY_WIDTH }}>
                            <div className="absolute top-0 bottom-0 left-0" style={{ width: 1, backgroundColor: COLORS.grid }} />
                            {weekend && <div className="absolute inset-0" style={{ backgroundColor: COLORS.weekendFill }} />}
                            {d.getDay() === 1 && (
                              <div
                                className="absolute inset-0 opacity-40"
                                style={{
                                  backgroundImage:
                                    "repeating-linear-gradient(135deg, rgba(226, 232, 240, 0.8) 0px, rgba(226, 232, 240, 0.8) 6px, transparent 6px, transparent 12px)",
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Today band inside rows */}
                    {showToday && (
                      <div className="absolute top-0 bottom-0" style={{ left: todayLeft, width: DAY_WIDTH, backgroundColor: COLORS.todayFill }} />
                    )}

                    {/* Events */}
                    <div className="relative h-full">
                      {empEvents.map((ev) => {
                        const pos = layoutEventInMonth({ startISO: ev.start, endISO: ev.end }, month);
                        if (pos.hidden) return null;
                        const meta = TYPES.find((t) => t.id === ev.type);
                        const base = meta?.cls ?? "bg-slate-100 text-slate-700 ring-slate-200";
                        const isPending = ev.status === "pending";
                        return (
                          <div
                            key={ev.id}
                            className={`absolute top-2 h-9 px-3 flex items-center gap-2 text-sm font-medium rounded-md ring-1 ${base}`}
                            style={{
                              left: pos.leftPx + 6,
                              width: Math.max(28, pos.widthPx - 12),
                              borderStyle: isPending ? "dashed" : "solid",
                            }}
                            title={`${ev.title || meta?.label || ""} • ${ev.start} → ${ev.end}${isPending ? " (pending)" : ""}`}
                          >
                            <span className="truncate">{ev.title || meta?.label || ""}</span>
                            {/* no orange pending dot */}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tip: change DAY_WIDTH for density */}
    </div>
  );
}
