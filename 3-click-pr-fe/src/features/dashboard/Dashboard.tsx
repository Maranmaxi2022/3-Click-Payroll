import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import styles from "./Dashboard.module.css";
import { useAuth } from "../../state/AuthContext";
import { useHashLocation } from "../../lib/useHashLocation";

/** ---- Types ---- */
type WorkerCounts = {
  directEmployees: number;
  contactWorkers: number;
  agentWorkers: number;
};
type TimesheetSummary = {
  direct: { processed: number; total: number };
  contact: { processed: number; total: number };
  agent: { processed: number; total: number };
};
type Compliance = {
  nextRemittanceDue?: string;
  t4Status?: "not_started" | "in_progress" | "ready";
};
type ActivityItem = { id: string; when: string; text: string };

/** ---- Inline SVG icons ---- */
const IconPlay = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path d="M8 5v14l11-7-11-7z" fill="currentColor" />
  </svg>
);
const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z" fill="currentColor" />
  </svg>
);
const IconImport = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path d="M5 20h14v-2H5v2zm7-18-5.5 5.5 1.42 1.42L11 6.83V16h2V6.83l3.08 3.09 1.42-1.42L12 2z" fill="currentColor"/>
  </svg>
);
const IconReceipt = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path d="M21 2H7l-2 2H3v18l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2V2zM9 7h8v2H9V7zm0 4h8v2H9v-2zm0 4h5v2H9v-2z" fill="currentColor"/>
  </svg>
);
const IconTax = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path d="M3 5h18v2H3V5zm0 12h18v2H3v-2zM7 9h2v6H7V9zm4 0h2v6h-2V9zm4 0h2v6h-2V9z" fill="currentColor"/>
  </svg>
);
const IconLogout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path d="M16 13v-2H8V8l-5 4 5 4v-3h8zM20 3h-8v2h8v14h-8v2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" fill="currentColor"/>
  </svg>
);

/** ---- Dashboard ---- */
export default function Dashboard() {
  const { signOut, user } = useAuth();
  const { navigate } = useHashLocation();

  const [workers] = useState<WorkerCounts>({
    directEmployees: 12,
    contactWorkers: 8,
    agentWorkers: 5,
  });

  const [timesheets] = useState<TimesheetSummary>({
    direct: { processed: 10, total: 12 },
    contact: { processed: 5, total: 8 },
    agent: { processed: 3, total: 5 },
  });

  const [compliance] = useState<Compliance>({
    nextRemittanceDue: "2025-09-15",
    t4Status: "not_started",
  });

  const [activities] = useState<ActivityItem[]>([
    { id: "a1", when: "Today 10:12", text: "Imported 8 contact worker timesheets" },
    { id: "a2", when: "Yesterday 18:34", text: "Generated 12 pay slips for Direct Employees" },
    { id: "a3", when: "Yesterday 09:20", text: "Updated CRA remittance report (draft)" },
  ]);

  useEffect(() => {
    // fetch dashboard summary here if needed
  }, []);

  const pendingTimesheets = useMemo(() => {
    const p = (s: { processed: number; total: number }) => Math.max(s.total - s.processed, 0);
    return p(timesheets.direct) + p(timesheets.contact) + p(timesheets.agent);
  }, [timesheets]);

  const nextPayrollDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  }, []);

  function onLogout() {
    signOut();
    navigate("/auth/sign-in", { replace: true });
  }

  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>3-Click Payroll — Dashboard</h1>
          {/* Hidden on mobile by CSS (headerDesc) */}
          <p className={styles.headerDesc}>
            Quick view of workers, timesheets, payroll, and compliance.
          </p>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.primaryBtn} onClick={() => alert("Run Payroll flow")}>
            <IconPlay /> Run Payroll
          </button>
          <button className={styles.secondaryBtn} onClick={onLogout} aria-label="Sign out">
            <IconLogout /> Logout
            {/* Name shown only on desktop/tablet */}
            {firstName && <span className={styles.hideOnMobile}> ({firstName})</span>}
          </button>
        </div>
      </header>

      {/* KPIs */}
      <section className={styles.kpiGrid}>
        <Kpi title="Direct Employees" value={workers.directEmployees.toString()} hint="on payroll" />
        <Kpi title="Contact Workers" value={workers.contactWorkers.toString()} hint="active" />
        <Kpi title="Agent Workers" value={workers.agentWorkers.toString()} hint="active" />
        <Kpi title="Pending Timesheets" value={pendingTimesheets.toString()} hint="need review" />
        <Kpi title="Next Payroll" value={nextPayrollDate} hint="scheduled" />
      </section>

      {/* Quick actions */}
      <section className={styles.quickActions}>
        <Action label="Add Worker" icon={<IconPlus />} onClick={() => alert("Add Worker")} />
        <Action label="Import Timesheets" icon={<IconImport />} onClick={() => alert("Import")} />
        <Action label="Generate Pay Slips" icon={<IconReceipt />} onClick={() => alert("Payslips")} />
        <Action label="Tax Remittance" icon={<IconTax />} onClick={() => alert("CRA Remittance")} />
      </section>

      <div className={styles.mainGrid}>
        <section className={styles.card}>
          <h2>Timesheets by Category</h2>
          <p className={styles.muted}>
            Track automated capture and processing for Direct, Contact, and Agent workers.
          </p>
          <ProgressRow label="Direct Employees" data={timesheets.direct} />
          <ProgressRow label="Contact Workers" data={timesheets.contact} />
          <ProgressRow label="Agent Workers" data={timesheets.agent} />
        </section>

        <section className={styles.card}>
          <h2>Compliance</h2>
          <ul className={styles.list}>
            <li>
              <span>Next CRA remittance</span>
              <strong>{compliance.nextRemittanceDue ?? "—"}</strong>
            </li>
            <li>
              <span>T4 status</span>
              <strong>
                {compliance.t4Status === "not_started"
                  ? "Not started"
                  : compliance.t4Status === "in_progress"
                  ? "In progress"
                  : "Ready"}
              </strong>
            </li>
          </ul>
        </section>

        <section className={styles.card}>
          <h2>Recent Activity</h2>
          <ul className={styles.activity}>
            {activities.map((a) => (
              <li key={a.id}>
                <div className={styles.activityDot} />
                <div>
                  <div className={styles.activityText}>{a.text}</div>
                  <div className={styles.activityWhen}>{a.when}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/** ---- Small presentational bits ---- */
function Kpi({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiTitle}>{title}</div>
      <div className={styles.kpiValue}>{value}</div>
      {hint && <div className={styles.kpiHint}>{hint}</div>}
    </div>
  );
}

function Action({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button className={styles.actionBtn} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ProgressRow({ label, data }: { label: string; data: { processed: number; total: number } }) {
  const pct = data.total ? Math.round((data.processed / data.total) * 100) : 0;
  return (
    <div className={styles.progressRow}>
      <div className={styles.progressLabel}>
        <span>{label}</span>
        <span className={styles.muted}>
          {data.processed}/{data.total}
        </span>
      </div>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
