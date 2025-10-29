import React from "react";

// Helper to format date as YYYY-MM-DD in local timezone
const getLocalDateId = (date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

// Helper function to generate current week days (Monday to Sunday)
const generateWeekDays = (currentDateId) => {
	const today = new Date();
	const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

	// Calculate days to subtract to get to Monday
	// If today is Sunday (0), go back 6 days; otherwise go back (dayOfWeek - 1) days
	const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

	const startOfWeek = new Date(today);
	startOfWeek.setDate(today.getDate() - daysToMonday);

	const weekDays = [{ id: "meta", label: "Employees (65)", meta: true }];

	for (let i = 0; i < 7; i++) {
		// Create a new date for each day by adding milliseconds
		const currentDay = new Date(startOfWeek.getTime() + (i * 24 * 60 * 60 * 1000));
		const id = getLocalDateId(currentDay);
		const day = currentDay.toLocaleDateString("en-US", { weekday: "long" });
		const date = currentDay.getDate();

		weekDays.push({
			id,
			day,
			date,
			active: id === currentDateId,
		});
	}

	return weekDays;
};

// Helper function to generate current month days
const generateMonthDays = (currentDateId) => {
	const today = new Date();
	const year = today.getFullYear();
	const month = today.getMonth();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	return Array.from({ length: daysInMonth }, (_, index) => {
		const dateObj = new Date(year, month, index + 1);
		const id = getLocalDateId(dateObj);
		const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });
		return {
			id,
			day: weekday,
			date: index + 1,
			active: id === currentDateId,
		};
	});
};

const EMPLOYEES = [
	{ id: "emp-1", name: "Abernathy, Rex", title: "Account Manager", badgeClass: "bg-emerald-200 text-emerald-800", initials: "AR" },
	{ id: "emp-2", name: "Bhattacharya, Neha", title: "Payroll Specialist", badgeClass: "bg-sky-200 text-sky-800", initials: "BN" },
	{ id: "emp-3", name: "Chen, Lian", title: "HR Business Partner", badgeClass: "bg-amber-200 text-amber-800", initials: "CL" },
	{ id: "emp-4", name: "Diaz, Mateo", title: "Operations Lead", badgeClass: "bg-purple-200 text-purple-800", initials: "DM" },
	{ id: "emp-5", name: "Elahi, Farah", title: "Finance Analyst", badgeClass: "bg-rose-200 text-rose-800", initials: "EF" },
	{ id: "emp-6", name: "Garcia, Sofia", title: "Onboarding Coach", badgeClass: "bg-blue-200 text-blue-800", initials: "GS" },
	{ id: "emp-7", name: "Hughes, Aaron", title: "Benefits Coordinator", badgeClass: "bg-teal-200 text-teal-800", initials: "HA" },
	{ id: "emp-8", name: "Iyer, Kavya", title: "Compliance Advisor", badgeClass: "bg-slate-200 text-slate-800", initials: "KI" },
	{ id: "emp-1", name: "Abernathy, Rex", title: "Account Manager", badgeClass: "bg-emerald-200 text-emerald-800", initials: "AR" },
	{ id: "emp-2", name: "Bhattacharya, Neha", title: "Payroll Specialist", badgeClass: "bg-sky-200 text-sky-800", initials: "BN" },
	{ id: "emp-3", name: "Chen, Lian", title: "HR Business Partner", badgeClass: "bg-amber-200 text-amber-800", initials: "CL" },
	{ id: "emp-4", name: "Diaz, Mateo", title: "Operations Lead", badgeClass: "bg-purple-200 text-purple-800", initials: "DM" },
	{ id: "emp-5", name: "Elahi, Farah", title: "Finance Analyst", badgeClass: "bg-rose-200 text-rose-800", initials: "EF" },
	{ id: "emp-6", name: "Garcia, Sofia", title: "Onboarding Coach", badgeClass: "bg-blue-200 text-blue-800", initials: "GS" },
	{ id: "emp-7", name: "Hughes, Aaron", title: "Benefits Coordinator", badgeClass: "bg-teal-200 text-teal-800", initials: "HA" },
	{ id: "emp-8", name: "Iyer, Kavya", title: "Compliance Advisor", badgeClass: "bg-slate-200 text-slate-800", initials: "KI" },

];

function WorkCalendarPrimaryControls({ viewMode, onChangeViewMode }) {
	const isWeek = viewMode === "week";

	// Calculate current date range
	const getDateRange = () => {
		const today = new Date();
		const formatDate = (date) => {
			return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
		};

		if (isWeek) {
			// Get the week starting from Monday
			const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
			const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

			const startOfWeek = new Date(today);
			startOfWeek.setDate(today.getDate() - daysToMonday);

			const endOfWeek = new Date(startOfWeek);
			endOfWeek.setDate(startOfWeek.getDate() + 6);

			return `${formatDate(startOfWeek)} – ${formatDate(endOfWeek)}`;
		} else {
			// For month view, show the full month
			const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
			const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

			return `${formatDate(startOfMonth)} – ${formatDate(endOfMonth)}`;
		}
	};

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
				<div className="min-w-[160px] text-sm font-semibold text-slate-700">{getDateRange()}</div>
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
	const [currentDateId, setCurrentDateId] = React.useState(() => getLocalDateId(new Date()));

	const isMonthView = viewMode === "month";

	// Generate date items dynamically based on current date
	const weekDays = React.useMemo(() => generateWeekDays(currentDateId), [currentDateId]);
	const monthDays = React.useMemo(() => generateMonthDays(currentDateId), [currentDateId]);
	const dateItems = React.useMemo(() => weekDays.filter((item) => !item.meta), [weekDays]);
	const periodItems = isMonthView ? monthDays : dateItems;

	// Update current date at midnight
	React.useEffect(() => {
		const updateDate = () => {
			const newDateId = getLocalDateId(new Date());
			setCurrentDateId(newDateId);
		};

		// Calculate time until next midnight
		const now = new Date();
		const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
		const timeUntilMidnight = tomorrow.getTime() - now.getTime();

		// Set timeout to update at midnight
		const midnightTimeout = setTimeout(() => {
			updateDate();
			// Then set up interval to check every minute after midnight
			const interval = setInterval(updateDate, 60000);
			return () => clearInterval(interval);
		}, timeUntilMidnight);

		return () => clearTimeout(midnightTimeout);
	}, []);
	// Mirror the Tailwind row heights (week: h-[104px], month: h-14) so scroll window aligns with cells.
	const rowHeight = isMonthView ? 56 : 104;
	const visibleRowLimit = isMonthView ? 10 : 5;
	const totalEmployees = EMPLOYEES.length;
	const visibleRowCount = Math.min(totalEmployees, visibleRowLimit);
	// Tailwind sets box-sizing to border-box, so divider borders do not change total row height.
	const bodyMaxHeight = visibleRowCount > 0 ? visibleRowCount * rowHeight : null;

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
			const spacing = 16; // reduced spacing for tighter fit
			const available = viewportHeight - rect.top - spacing;

			if (!Number.isFinite(available)) {
				return;
			}

			const nextHeight = Math.max(400, Math.floor(available));
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
			className="hide-scrollbar overflow-y-auto border border-slate-200 bg-white"
			style={{ maxHeight }}
		>
			<div className="bg-white">
				<div className="sticky top-0 z-30 bg-white shadow-sm">
					<div className="flex items-stretch border-b border-slate-200">
						<div
							className={
								"flex w-[276px] shrink-0 items-center bg-slate-50 px-3 text-sm font-semibold text-slate-600 " +
								(isMonthView ? "h-14" : "h-[68px]")
							}
							style={{ borderRight: "3px double rgb(226, 232, 240)" }}
						>
							Employees (65)
						</div>
						<div ref={headerScrollRef} className="flex-1 min-w-0 overflow-x-auto hide-scrollbar">
							<div className="min-w-max bg-white">
								<div className="flex items-stretch">
									{periodItems.map((item, itemIndex) => (
										<button
											key={item.id}
											type="button"
											className={
												(isMonthView
													? "relative flex h-14 w-[39px] flex-col items-center justify-center px-1 text-[11px] font-semibold transition "
													: "relative flex min-w-[120px] flex-col items-center px-3 pb-4 pt-2 text-sm font-medium transition ") +
												(itemIndex < periodItems.length - 1 ? "border-r border-slate-200 " : "") +
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
				<div className="overflow-y-auto hide-scrollbar" style={bodyMaxHeight ? { height: `${bodyMaxHeight}px`, maxHeight: `${bodyMaxHeight}px` } : undefined}>
					<div className="flex items-stretch">
						<div className="w-[276px] shrink-0" style={{ borderRight: "3px double rgb(226, 232, 240)" }}>
							<div className="flex flex-col divide-y divide-slate-200">
								{EMPLOYEES.map((emp) => (
									<div
										key={emp.id}
										className={
											"flex w-full items-center gap-3 px-3 text-left text-sm text-slate-600 transition hover:bg-slate-50 " +
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
						<div ref={gridScrollRef} className="flex-1 min-w-0 overflow-x-auto hide-scrollbar">
							<div className="flex min-w-max">
								{periodItems.map((item, itemIndex) => (
									<div
										key={item.id}
										className={
											(isMonthView ? "w-[39px]" : "min-w-[120px]") +
											" flex flex-col"
										}
									>
										{EMPLOYEES.map((emp, empIndex) => (
											<div
												key={`${item.id}-${emp.id}`}
												className={
													"flex items-center justify-center w-full bg-white text-xs font-medium text-slate-400 transition hover:bg-slate-50 cursor-pointer " +
													(empIndex < EMPLOYEES.length - 1 ? "border-b " : "") +
													(itemIndex < periodItems.length - 1 ? "border-r " : "") +
													"border-slate-200 " +
													(isMonthView ? "h-14" : "h-[104px]")
												}
											>
												<span className="sr-only">Schedule slot for {emp.name} on {item.day}</span>
											</div>
										))}
									</div>
								))}
							</div>
						</div>
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
		<div className="space-y-4">
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
		<div className="lg:hidden sticky top-16 z-40 border-b border-slate-200 bg-slate-50 px-4 py-4">
			<div className="rounded-2xl bg-white p-4 space-y-4">
				<WorkCalendarPrimaryControls viewMode={mode} onChangeViewMode={handleChange} />
				<WorkCalendarNavBar viewMode={mode} />
			</div>
		</div>
	);
}
