// src/features/dashboard/Dashboard.tsx
import { useMemo, useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import AddWorker from "../workers/AddWorker";
import { useAuth } from "../../state/AuthContext";
import { useHashLocation } from "../../lib/useHashLocation";

type InternalTab = "overview" | "add-worker" | "timeoff" | "payslips" | "tax";
type AddSubTab = "menu" | "employee";

export type DashboardProps = {
  initialTab?: "overview" | "add" | "add-worker" | "import" | "timeoff" | "payslips" | "tax";
};

function normalizeInitialTab(t?: DashboardProps["initialTab"]): InternalTab {
  switch (t) {
    case "add":
    case "add-worker":
      return "add-worker";
    case "import":
    case "timeoff":
      return "timeoff";
    case "payslips":
      return "payslips";
    case "tax":
      return "tax";
    case "overview":
    default:
      return "overview";
  }
}

/** Small icon */
const IconPlay = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path d="M8 5v14l11-7-11-7z" fill="currentColor" />
  </svg>
);

export default function Dashboard({ initialTab }: DashboardProps) {
  const { signOut, user } = useAuth();
  const { navigate, path } = useHashLocation();

  // ---- Main tabs ----
  const [tab, setTab] = useState<InternalTab>(normalizeInitialTab(initialTab));

  // ---- Sub-tab for Add Worker ----
  const [addSubTab, setAddSubTab] = useState<AddSubTab>("menu");

  // Keep Add-subtab in sync with hash path
  useEffect(() => {
    if (tab !== "add-worker") return;
    if (path === "/admin/workers/new") setAddSubTab("employee");
    else setAddSubTab("menu");
  }, [path, tab]);

  function openAddWorker() {
    setTab("add-worker");
    if (path !== "/admin") navigate("/admin", { replace: true });
  }

  function onLogout() {
    signOut();
    navigate("/auth/sign-in", { replace: true });
  }

  // ----- Demo data -----
  const [workers] = useState({ directEmployees: 12, contactWorkers: 8, agentWorkers: 5 });
  const [timesheets] = useState({
    direct: { processed: 10, total: 12 },
    contact: { processed: 5, total: 8 },
    agent: { processed: 3, total: 5 },
  });
  const [activities] = useState([
    { id: "a1", when: "Today 10:12", text: "Imported 8 contact worker timesheets" },
    { id: "a2", when: "Yesterday 18:34", text: "Generated 12 pay slips for Direct Employees" },
    { id: "a3", when: "Yesterday 09:20", text: "Updated CRA remittance report (draft)" },
  ]);
  const [compliance] = useState({ nextRemittanceDue: "2025-09-15", t4Status: "not_started" as const });

  const pendingTimesheets = useMemo(() => {
    const p = (s: { processed: number; total: number }) => Math.max(s.total - s.processed, 0);
    return p(timesheets.direct) + p(timesheets.contact) + p(timesheets.agent);
  }, [timesheets]);

  const nextPayrollDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  }, []);

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>3-Click Payroll</h1>
          {/* <p className={styles.headerDesc}>Quick view of workers, timesheets, payroll, and compliance.</p> */}
        </div>

        <div className={styles.headerRight}>
          {tab === "overview" && (
            <button className={styles.primaryBtn} onClick={() => alert("Run Payroll flow")}>
              <IconPlay /> Run Payroll
            </button>
          )}
          <button className={styles.secondaryBtn} onClick={onLogout}>
            ⤆ <span className={styles.hideOnMobile}>Logout ({user?.name ?? "Admin"})</span>
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${styles.sidebarSticky}`}>
          <nav className={styles.nav}>
            <button
              className={`${styles.navItem} ${tab === "overview" ? styles.active : ""}`}
              onClick={() => setTab("overview")}
            >
              <span>▦</span><span>Overview</span>
            </button>

            <button
              className={`${styles.navItem} ${tab === "add-worker" ? styles.active : ""}`}
              onClick={openAddWorker}
            >
              <span>＋</span><span>Add Worker</span>
            </button>

            <button
              className={`${styles.navItem} ${tab === "timeoff" ? styles.active : ""}`}
              onClick={() => setTab("timeoff")}
            >
              <span>⇧</span><span>Time Off</span>
            </button>

            <button
              className={`${styles.navItem} ${tab === "payslips" ? styles.active : ""}`}
              onClick={() => setTab("payslips")}
            >
              <span>🧾</span><span>Generate Pay Slips</span>
            </button>

            <button
              className={`${styles.navItem} ${tab === "tax" ? styles.active : ""}`}
              onClick={() => setTab("tax")}
            >
              <span>▤</span><span>Tax Remittance</span>
            </button>
          </nav>
        </aside>

        {/* Content */}
        <main className={styles.content}>
          <div className={styles.contentInner}>
            {tab === "overview" && (
              <>
                <section className={styles.kpiGrid}>
                  <Kpi title="Direct Employees" value={String(workers.directEmployees)} hint="on payroll" />
                  <Kpi title="Contact Workers" value={String(workers.contactWorkers)} hint="active" />
                  <Kpi title="Agent Workers" value={String(workers.agentWorkers)} hint="active" />
                  <Kpi title="Pending Timesheets" value={String(pendingTimesheets)} hint="need review" />
                  <Kpi title="Next Payroll" value={nextPayrollDate} hint="scheduled" />
                </section>

                <div className={styles.mainGrid}>
                  <section className={styles.card}>
                    <h2>Timesheets by Category</h2>
                    <p className={styles.muted}>Track automated capture and processing for Direct, Contact, and Agent workers.</p>
                    <ProgressRow label="Direct Employees" data={timesheets.direct} />
                    <ProgressRow label="Contact Workers" data={timesheets.contact} />
                    <ProgressRow label="Agent Workers" data={timesheets.agent} />
                  </section>

                  <section className={styles.card}>
                    <h2>Compliance</h2>
                    <ul className={styles.list}>
                      <li><span>Next CRA remittance</span><strong>{compliance.nextRemittanceDue}</strong></li>
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

                  <section className={styles.card} style={{ gridColumn: "1 / -1" }}>
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
              </>
            )}

            {tab === "add-worker" && (
              <section className={styles.addTwoCol}>
                {/* LEFT mini menu */}
                <div className={styles.addLeft}>
                  <button
                    className={`${styles.subNavItem} ${addSubTab === "menu" ? styles.subActive : ""}`}
                    onClick={() => { setAddSubTab("menu"); navigate("/admin", { replace: true }); }}
                  >
                    Employee Details
                  </button>
                  <button
                    className={`${styles.subNavItem} ${addSubTab === "employee" ? styles.subActive : ""}`}
                    onClick={() => { setAddSubTab("employee"); navigate("/admin/workers/new"); }}
                  >
                    Add Employee
                  </button>
                </div>

                {/* RIGHT content */}
                <div className={styles.addRight}>
                  {addSubTab === "menu" && (
                    <div className={styles.card}>
                      <h2>Add Worker</h2>
                      <p className={styles.muted}>
                        Choose an action on the left. Select <strong>Add Employee</strong> to create a new worker.
                      </p>
                    </div>
                  )}

                  {addSubTab === "employee" && (
                    <div className={styles.formFull}>
                      <AddWorker embedded />
                    </div>
                  )}
                </div>
              </section>
            )}

            {tab === "timeoff" && (
              <section className={styles.card}>
                <h2>Time Off</h2>
                <p className={styles.muted}>(Coming soon)</p>
              </section>
            )}

            {tab === "payslips" && (
              <section className={styles.card}>
                <h2>Generate Pay Slips</h2>
                <p className={styles.muted}>(Coming soon)</p>
              </section>
            )}

            {tab === "tax" && (
              <section className={styles.card}>
                <h2>Tax Remittance</h2>
                <p className={styles.muted}>(Coming soon)</p>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Kpi({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiTitle}>{title}</div>
      <div className={styles.kpiValue}>{value}</div>
      {hint && <div className={styles.kpiHint}>{hint}</div>}
    </div>
  );
}

function ProgressRow({ label, data }: { label: string; data: { processed: number; total: number } }) {
  const pct = data.total ? Math.round((data.processed / data.total) * 100) : 0;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
        <span>{label}</span>
        <span className={styles.muted}>{data.processed}/{data.total}</span>
      </div>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
