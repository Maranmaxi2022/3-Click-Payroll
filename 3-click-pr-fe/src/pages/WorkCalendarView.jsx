import React from "react";

const WEEK_DAYS = [
  { id: "meta", label: "Employees (65)", meta: true },
  { id: "2024-10-20", day: "Monday", date: 20 },
  { id: "2024-10-21", day: "Tuesday", date: 21 },
  { id: "2024-10-22", day: "Wednesday", date: 22 },
  { id: "2024-10-23", day: "Thursday", date: 23, active: true },
  { id: "2024-10-24", day: "Friday", date: 24 },
  { id: "2024-10-25", day: "Saturday", date: 25 },
  { id: "2024-10-26", day: "Sunday", date: 26 },
];

const EMPLOYEES = [
  { id: "emp-1", name: "Abernathy, Rex", title: "Account Manager", badgeClass: "bg-emerald-200 text-emerald-800", initials: "AR" },
  { id: "emp-2", name: "Bhattacharya, Neha", title: "Payroll Specialist", badgeClass: "bg-sky-200 text-sky-800", initials: "BN" },
  { id: "emp-3", name: "Chen, Lian", title: "HR Business Partner", badgeClass: "bg-amber-200 text-amber-800", initials: "CL" },
  { id: "emp-4", name: "Diaz, Mateo", title: "Operations Lead", badgeClass: "bg-purple-200 text-purple-800", initials: "DM" },
  { id: "emp-5", name: "Elahi, Farah", title: "Finance Analyst", badgeClass: "bg-rose-200 text-rose-800", initials: "EF" },
  { id: "emp-6", name: "Garcia, Sofia", title: "Onboarding Coach", badgeClass: "bg-blue-200 text-blue-800", initials: "GS" },
  { id: "emp-7", name: "Hughes, Aaron", title: "Benefits Coordinator", badgeClass: "bg-teal-200 text-teal-800", initials: "HA" },
  { id: "emp-8", name: "Iyer, Kavya", title: "Compliance Advisor", badgeClass: "bg-slate-200 text-slate-800", initials: "KI" },
];

const dateItems = WEEK_DAYS.filter((item) => !item.meta);

const ACTIVE_DAY_ID = "2024-10-23";

const MONTH_DAYS = Array.from({ length: 31 }, (_, index) => {
  const dateObj = new Date(2024, 9, index + 1);
  const id = dateObj.toISOString().slice(0, 10);
  const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  return {
    id,
    day: weekday,
    date: index + 1,
    active: id === ACTIVE_DAY_ID,
  };
});

function WorkCalendarPrimaryControls({ viewMode, onChangeViewMode }) {
  const isWeek = viewMode === "week";
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-500"
        >
          Today
        </button>
        <button
          type="button"
          aria-label="Previous period"
          className="rounded-full border border-transparent p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="min-w-[160px] text-sm font-semibold text-slate-700">Oct 20 – Oct 26</div>
        <button
          type="button"
          aria-label="Next period"
          className="rounded-full border border-transparent p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="ml-2 inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChangeViewMode("week")}
            className={
              "inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold transition " +
              (isWeek ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-100")
            }
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode("month")}
            className={
              "inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold transition " +
              (!isWeek ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-100")
            }
          >
            Month
          </button>
        </div>
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-slate-500">
        <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
          <span className="absolute left-1 h-4 w-4 rounded-full bg-white shadow transition" />
        </span>
        Show time-off only
      </label>
    </div>
  );
}

export function WorkCalendarNavBar({ viewMode }) {
  const headerScrollRef = React.useRef(null);
  const gridScrollRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [maxHeight, setMaxHeight] = React.useState(520);
  const isMonthView = viewMode === "month";
  const periodItems = isMonthView ? MONTH_DAYS : dateItems;

  React.useEffect(() => {
    const headerEl = headerScrollRef.current;
    const gridEl = gridScrollRef.current;

    if (!headerEl || !gridEl) {
      return;
    }

    let syncingFromHeader = false;
    let syncingFromGrid = false;

    const handleHeaderScroll = () => {
      if (syncingFromHeader) {
        syncingFromHeader = false;
        return;
      }
      syncingFromGrid = true;
      gridEl.scrollLeft = headerEl.scrollLeft;
    };

    const handleGridScroll = () => {
      if (syncingFromGrid) {
        syncingFromGrid = false;
        return;
      }
      syncingFromHeader = true;
      headerEl.scrollLeft = gridEl.scrollLeft;
    };

    headerEl.addEventListener("scroll", handleHeaderScroll, { passive: true });
    gridEl.addEventListener("scroll", handleGridScroll, { passive: true });

    return () => {
      headerEl.removeEventListener("scroll", handleHeaderScroll);
      gridEl.removeEventListener("scroll", handleGridScroll);
    };
  }, []);

  React.useLayoutEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) {
      return;
    }

    const calculateHeight = () => {
      const rect = containerEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spacing = 32; // leave a bit of breathing room at the bottom
      const available = viewportHeight - rect.top - spacing;

      if (!Number.isFinite(available)) {
        return;
      }

      const nextHeight = Math.max(320, Math.floor(available));
      setMaxHeight((prev) => (prev !== nextHeight ? nextHeight : prev));
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    window.addEventListener("orientationchange", calculateHeight);
    window.addEventListener("scroll", calculateHeight, { passive: true });

    return () => {
      window.removeEventListener("resize", calculateHeight);
      window.removeEventListener("orientationchange", calculateHeight);
      window.removeEventListener("scroll", calculateHeight);
    };
  }, [isMonthView]);

  return (
    <div
      ref={containerRef}
      className="hide-scrollbar overflow-y-auto"
      style={{ height: maxHeight, maxHeight }}
    >
      <div className="sticky top-0 z-30 bg-white pb-2">
        <div className={`flex items-stretch ${isMonthView ? "gap-2" : "gap-4"}`}>
          <div
            className={
              "flex w-[278px] shrink-0 items-center rounded-lg bg-slate-50 px-4 text-sm font-semibold text-slate-600 " +
              (isMonthView ? "h-14" : "h-[68px]")
            }
          >
            {WEEK_DAYS[0].label}
          </div>
          <div ref={headerScrollRef} className="flex-1 min-w-0 overflow-x-auto hide-scrollbar">
            <div className="min-w-max">
              <div className={`flex items-stretch ${isMonthView ? "gap-2" : "gap-4"}`}>
                {periodItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      (isMonthView
                        ? "relative flex h-14 min-w-[39px] flex-col items-center justify-center rounded-lg px-1 text-[11px] font-semibold transition "
                        : "relative flex min-w-[120px] flex-col items-center rounded-lg px-3 pb-4 pt-2 text-sm font-medium transition ") +
                      (item.active ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-100")
                    }
                  >
                    <div className={isMonthView ? "text-sm font-semibold leading-tight" : "text-lg font-semibold"}>
                      {item.date}
                    </div>
                    <div className={isMonthView ? "text-[10px] font-medium uppercase text-slate-400" : "text-xs text-inherit"}>
                      {isMonthView ? item.day.slice(0, 3) : item.day}
                    </div>
                    {item.active ? (
                      <span
                        className={
                          "absolute bottom-1 h-1 rounded-full bg-blue-600 " +
                          (isMonthView ? "left-1 right-1" : "inset-x-8")
                        }
                      />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`flex items-stretch pb-1 ${isMonthView ? "gap-2" : "gap-4"}`}>
        <div className="flex w-[278px] shrink-0 flex-col">
          <div className={(isMonthView ? "rounded-lg bg-white" : "mt-3 rounded-lg bg-white")}>
            <div className="py-1">
              {EMPLOYEES.map((emp) => (
                <div
                  key={emp.id}
                  className={
                    "flex w-[278px] shrink-0 items-center gap-3 px-3 text-left text-sm text-slate-600 transition hover:bg-slate-50 " +
                    (isMonthView ? "h-14" : "h-[104px]")
                  }
                >
                  <div className={`grid h-9 w-9 place-items-center rounded-full text-[13px] font-semibold ${emp.badgeClass}`}>
                    {emp.initials}
                  </div>
                  <div>
                    <div className="cursor-pointer text-sm font-semibold text-slate-700 hover:text-blue-600 hover:underline">
                      {emp.name}
                    </div>
                    <div className="text-xs text-slate-500">{emp.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div ref={gridScrollRef} className="flex-1 min-w-0 overflow-x-auto hide-scrollbar">
          <div className={`flex items-stretch min-w-max ${isMonthView ? "gap-2" : "gap-4"} ${isMonthView ? "pt-0" : "pt-3"}`}>
            {periodItems.map((item) => (
              <div key={item.id} className={`flex flex-col ${isMonthView ? "min-w-[39px]" : "min-w-[120px]"}`}>
                <div className={(isMonthView ? "rounded-lg bg-white" : "rounded-lg bg-white")}>
                  <div className="py-1">
                    {EMPLOYEES.map((emp) => (
                      <div
                        key={`${item.id}-${emp.id}`}
                        className={
                          "flex items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-400 " +
                          (isMonthView ? "h-14 w-[39px]" : "h-[104px] w-full")
                        }
                      >
                        <span className="sr-only">Schedule slot for {emp.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorkCalendarHeaderBar({ viewMode, onChangeViewMode }) {
  const [internalViewMode, setInternalViewMode] = React.useState("week");
  const mode = viewMode ?? internalViewMode;
  const handleChange = onChangeViewMode ?? setInternalViewMode;

  return (
    <div className="rounded-2xl bg-white p-4 space-y-4">
      <WorkCalendarPrimaryControls viewMode={mode} onChangeViewMode={handleChange} />
      <WorkCalendarNavBar viewMode={mode} />
    </div>
  );
}

export default function WorkCalendarView({ viewMode, onChangeViewMode }) {
  const [internalViewMode, setInternalViewMode] = React.useState("week");
  const mode = viewMode ?? internalViewMode;
  const handleChange = onChangeViewMode ?? setInternalViewMode;

  return (
    <div className="space-y-6">
      <div className="lg:hidden sticky top-16 z-40 border-b border-slate-200 bg-white px-4 py-4">
        <div className="rounded-2xl bg-white p-4 space-y-4">
          <WorkCalendarPrimaryControls viewMode={mode} onChangeViewMode={handleChange} />
          <WorkCalendarNavBar viewMode={mode} />
        </div>
      </div>
    </div>
  );
}
