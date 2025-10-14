import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Check, MoreHorizontal } from "lucide-react";

const cx = (...xs) => xs.filter(Boolean).join(" ");

const TABS = [
  { id: "earnings", label: "Earnings" },
  { id: "deductions", label: "Deductions" },
  { id: "benefits", label: "Benefits" },
  { id: "reimbursements", label: "Reimbursements" },
];

const EARNING_TYPES = [
  "Basic",
  "House Rent Allowance",
  "Fixed Allowance",
  "Conveyance/Transport",
  "Bonus",
  "Commission",
  "Overtime",
  "Other",
];

const DEDUCTION_TYPES = [
  "Notice Pay",
  "Withheld Salary",
  "Union Dues",
  "Garnishment",
  "Other",
];

const BENEFIT_TYPES = [
  "Employer RRSP/Group RRSP",
  "PRPP",
  "Health Spending Account",
  "Car Allowance (taxable)",
  "Non-cash Gift",
  "Other",
];

const REIMBURSEMENT_TYPES = [
  "Fuel",
  "Vehicle Maintenance",
  "Phone",
  "Internet",
  "Travel/Meal",
  "Other",
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function toCurrency(n) {
  if (n == null || n === "") return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "CAD", maximumFractionDigits: 2 }).format(num);
}

function StatusPill({ active }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function SalaryComponents() {
  const [activeTab, setActiveTab] = useState("earnings");
  const tabRefs = useRef({});

  // Seed data (short lists)
  const [earnings, setEarnings] = useState([
    {
      id: uid(),
      name: "Basic Pay",
      type: "Basic",
      calc: { kind: "flat", value: 4000 },
      includeCPP: true,
      includeEI: true,
      status: "Active",
      description: "Fixed monthly component",
    },
    {
      id: uid(),
      name: "Overtime",
      type: "Overtime",
      calc: { kind: "pct_basic", value: 50 },
      includeCPP: true,
      includeEI: true,
      status: "Inactive",
      description: "Paid at 1.5x basic calculation",
    },
  ]);

  const [deductions, setDeductions] = useState([
    {
      id: uid(),
      name: "Union Dues",
      type: "Union Dues",
      frequency: "Recurring",
      defaultAmount: 35,
      status: "Active",
      description: "Monthly union dues",
    },
    {
      id: uid(),
      name: "Notice Pay Adjustment",
      type: "Notice Pay",
      frequency: "One-time",
      defaultAmount: "",
      status: "Inactive",
      description: "Applied upon termination as required",
    },
  ]);

  const [benefits, setBenefits] = useState([
    {
      id: uid(),
      name: "Employer RRSP",
      type: "Employer RRSP/Group RRSP",
      frequency: "Recurring",
      taxable: false,
      contribution: { kind: "Percent", value: 5 },
      status: "Active",
      description: "Employer match to RRSP",
    },
    {
      id: uid(),
      name: "HSA",
      type: "Health Spending Account",
      frequency: "One-time",
      taxable: false,
      contribution: { kind: "Amount", value: 500 },
      status: "Inactive",
      description: "Annual top-up",
    },
  ]);

  const [reimbursements, setReimbursements] = useState([
    {
      id: uid(),
      name: "Fuel Reimbursement",
      type: "Fuel",
      max: 200,
      period: "per month",
      requiresReceipt: true,
      status: "Active",
      description: "Monthly cap for fuel",
    },
    {
      id: uid(),
      name: "Internet Stipend",
      type: "Internet",
      max: 50,
      period: "per month",
      requiresReceipt: false,
      status: "Inactive",
      description: "Monthly home internet stipend",
    },
  ]);

  // Toasts
  const [toasts, setToasts] = useState([]);
  const pushToast = (msg) => {
    const id = uid();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  };

  // Modal states
  const [modal, setModal] = useState({ open: false, mode: "add", tab: "earnings", initial: null });
  const [confirm, setConfirm] = useState({ open: false, tab: null, id: null, name: "" });

  const listForTab = (tab) => {
    if (tab === "earnings") return [earnings, setEarnings];
    if (tab === "deductions") return [deductions, setDeductions];
    if (tab === "benefits") return [benefits, setBenefits];
    return [reimbursements, setReimbursements];
  };

  const onAdd = () => setModal({ open: true, mode: "add", tab: activeTab, initial: null });
  const onEdit = (tab, item) => setModal({ open: true, mode: "edit", tab, initial: item });
  const onToggle = (tab, id) => {
    const [list, setList] = listForTab(tab);
    setList(list.map((it) => (it.id === id ? { ...it, status: it.status === "Active" ? "Inactive" : "Active" } : it)));
    const after = list.find((it) => it.id === id)?.status === "Active" ? "deactivated" : "activated";
    pushToast(`Component ${after}`);
  };
  const onDelete = (tab, id, name) => setConfirm({ open: true, tab, id, name });
  const doDelete = () => {
    const { tab, id } = confirm;
    const [list, setList] = listForTab(tab);
    setList(list.filter((it) => it.id !== id));
    setConfirm({ open: false, tab: null, id: null, name: "" });
    pushToast("Component deleted");
  };

  const handleSave = (payload) => {
    const { tab, mode, data, originalId } = payload;
    const [list, setList] = listForTab(tab);
    if (mode === "add") {
      setList([{ id: uid(), ...data }, ...list]);
      pushToast("Component added");
    } else {
      setList(list.map((it) => (it.id === originalId ? { ...it, ...data } : it)));
      pushToast("Changes saved");
    }
    setModal({ open: false, mode: "add", tab: activeTab, initial: null });
  };

  const columns = useMemo(() => {
    if (activeTab === "earnings")
      return [
        { key: "name", label: "Name" },
        { key: "type", label: "Earning Type" },
        { key: "calc", label: "Calculation" },
        { key: "cpp", label: "CPP/QPP" },
        { key: "ei", label: "EI" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Actions" },
      ];
    if (activeTab === "deductions")
      return [
        { key: "name", label: "Name" },
        { key: "type", label: "Deduction Type" },
        { key: "frequency", label: "Frequency" },
        { key: "amount", label: "Default Amount" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Actions" },
      ];
    if (activeTab === "benefits")
      return [
        { key: "name", label: "Name" },
        { key: "type", label: "Benefit Type" },
        { key: "frequency", label: "Frequency" },
        { key: "taxable", label: "Taxable?" },
        { key: "contribution", label: "Employer Contribution" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Actions" },
      ];
    return [
      { key: "name", label: "Name" },
      { key: "type", label: "Reimbursement Type" },
      { key: "max", label: "Max / Period" },
      { key: "receipt", label: "Requires Receipt?" },
      { key: "status", label: "Status" },
      { key: "actions", label: "Actions" },
    ];
  }, [activeTab]);

  const renderCell = (tab, item, colKey) => {
    if (colKey === "name") return <div className="font-medium text-slate-900">{item.name}</div>;
    if (tab === "earnings") {
      if (colKey === "type") return item.type;
      if (colKey === "calc") {
        const { kind, value } = item.calc || {};
        if (kind === "flat") return `Flat ${toCurrency(value)}`;
        if (kind === "pct_ctc") return `${value || 0}% of CTC`;
        if (kind === "pct_basic") return `${value || 0}% of Basic`;
        return "—";
      }
      if (colKey === "cpp") return item.includeCPP ? "Yes" : "No";
      if (colKey === "ei") return item.includeEI ? "Yes" : "No";
      if (colKey === "status") return <StatusPill active={item.status === "Active"} />;
    }
    if (tab === "deductions") {
      if (colKey === "type") return item.type;
      if (colKey === "frequency") return item.frequency;
      if (colKey === "amount") return item.defaultAmount ? toCurrency(item.defaultAmount) : "—";
      if (colKey === "status") return <StatusPill active={item.status === "Active"} />;
    }
    if (tab === "benefits") {
      if (colKey === "type") return item.type;
      if (colKey === "frequency") return item.frequency;
      if (colKey === "taxable") return item.taxable ? "Yes" : "No";
      if (colKey === "contribution") {
        const c = item.contribution;
        if (!c || !c.kind || c.value == null || c.value === "") return "—";
        return c.kind === "Percent" ? `${c.value}%` : toCurrency(c.value);
      }
      if (colKey === "status") return <StatusPill active={item.status === "Active"} />;
    }
    if (tab === "reimbursements") {
      if (colKey === "type") return item.type;
      if (colKey === "max") return `${toCurrency(item.max)} ${item.period}`;
      if (colKey === "receipt") return item.requiresReceipt ? "Yes" : "No";
      if (colKey === "status") return <StatusPill active={item.status === "Active"} />;
    }
    if (colKey === "actions") return null;
    return "—";
  };

  const currentList = activeTab === "earnings" ? earnings : activeTab === "deductions" ? deductions : activeTab === "benefits" ? benefits : reimbursements;

  const keyboardTabs = (e) => {
    const idx = TABS.findIndex((t) => t.id === activeTab);
    const move = (n) => {
      const next = (idx + n + TABS.length) % TABS.length;
      tabRefs.current[TABS[next].id]?.focus();
    };
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        move(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        move(-1);
        break;
      case "Home":
        e.preventDefault();
        tabRefs.current[TABS[0].id]?.focus();
        break;
      case "End":
        e.preventDefault();
        tabRefs.current[TABS[TABS.length - 1].id]?.focus();
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center lg:hidden">
        <h2 className="text-lg font-semibold text-slate-900">Salary Components</h2>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Salary component types" className="flex w-full gap-4 overflow-x-auto border-b border-slate-200">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              ref={(el) => (tabRefs.current[tab.id] = el)}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={keyboardTabs}
              onClick={() => setActiveTab(tab.id)}
              className={cx(
                "whitespace-nowrap px-1.5 py-2 text-sm font-medium border-b-2",
                isActive
                  ? "border-blue-600 text-slate-900"
                  : "border-transparent text-slate-600 hover:text-slate-800"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Flat section header + table (no card) */}
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="text-base font-semibold text-slate-900">{TABS.find((t) => t.id === activeTab)?.label}</div>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          Add Component
        </button>
      </div>

      {currentList.length === 0 ? (
        <div className="grid place-items-center rounded-lg border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-2xl border border-dashed border-slate-300 bg-slate-50" />
            <div className="text-sm text-slate-600">
              No components yet for {TABS.find((t) => t.id === activeTab)?.label}.<br />
              Click <span className="font-semibold">Add Component</span> to create one.
            </div>
          </div>
        </div>
      ) : (
        <div className="px-0">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr className="border-y border-slate-200">
                  {columns.map((c) => (
                    <th key={c.key} className="px-3 py-3 text-left first:pl-0 last:pr-0">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {currentList.map((item, idx) => (
                  <tr key={item.id} className={cx("hover:bg-slate-50/80", idx !== 0 ? "border-t border-slate-200" : "") }>
                    {columns.map((c) => (
                        <td key={c.key} className="px-3 py-3 first:pl-0 last:pr-0 align-middle text-slate-700">
                          {c.key === "actions" ? (
                            <RowMenu item={item} tab={activeTab} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />
                          ) : (
                            renderCell(activeTab, item, c.key)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>

          {/* Mobile stacked rows */}
          <div className="sm:hidden space-y-2">
            {currentList.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200">
                <div className="flex items-start justify-between gap-2 px-3 py-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                    <div className="mt-0.5 text-[12px] text-slate-500">{item.description || ""}</div>
                  </div>
                  <StatusPill active={item.status === "Active"} />
                </div>
                <div className="grid grid-cols-2 gap-2 px-3 pb-2 text-[13px] text-slate-700">
                  {activeTab === "earnings" && (
                    <>
                      <DL label="Earning Type" value={item.type} />
                      <DL label="Calculation" value={renderCell("earnings", item, "calc")} />
                      <DL label="CPP/QPP" value={item.includeCPP ? "Yes" : "No"} />
                      <DL label="EI" value={item.includeEI ? "Yes" : "No"} />
                    </>
                  )}
                  {activeTab === "deductions" && (
                    <>
                      <DL label="Deduction Type" value={item.type} />
                      <DL label="Frequency" value={item.frequency} />
                      <DL label="Default Amount" value={item.defaultAmount ? toCurrency(item.defaultAmount) : "—"} />
                    </>
                  )}
                  {activeTab === "benefits" && (
                    <>
                      <DL label="Benefit Type" value={item.type} />
                      <DL label="Frequency" value={item.frequency} />
                      <DL label="Taxable?" value={item.taxable ? "Yes" : "No"} />
                      <DL
                        label="Employer Contribution"
                        value={
                          item.contribution && item.contribution.value !== "" && item.contribution.value != null
                            ? item.contribution.kind === "Percent"
                              ? `${item.contribution.value}%`
                              : toCurrency(item.contribution.value)
                            : "—"
                        }
                      />
                    </>
                  )}
                  {activeTab === "reimbursements" && (
                    <>
                      <DL label="Reimbursement Type" value={item.type} />
                      <DL label="Max / Period" value={`${toCurrency(item.max)} ${item.period}`} />
                      <DL label="Requires Receipt?" value={item.requiresReceipt ? "Yes" : "No"} />
                    </>
                  )}
                </div>
                <div className="flex items-center justify-end border-t border-slate-200 px-3 py-2">
                  <RowMenu item={item} tab={activeTab} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal.open && (
        <AddEditModal
          key={`${modal.mode}-${modal.initial?.id || "new"}`}
          tab={modal.tab}
          mode={modal.mode}
          initial={modal.initial}
          existingNames={currentList.map((x) => x.name)}
          onCancel={() => setModal({ open: false, mode: "add", tab: activeTab, initial: null })}
          onSave={handleSave}
        />
      )}

      {confirm.open && (
        <ConfirmDialog
          title="Delete Component"
          message={`Are you sure you want to delete “${confirm.name}”? This action cannot be undone.`}
          confirmText="Delete"
          onCancel={() => setConfirm({ open: false, tab: null, id: null, name: "" })}
          onConfirm={doDelete}
        />
      )}

      {/* Toasts */}
      <div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 shadow">
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

function DL({ label, value }) {
  return (
    <div className="min-w-0">
      <div className="text-[12px] text-slate-500">{label}</div>
      <div className="truncate text-slate-800">{value}</div>
    </div>
  );
}

function RowMenu({ item, tab, onEdit, onToggle, onDelete }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const isActive = item.status === "Active";

  useEffect(() => {
    const onDoc = (e) => {
      if (!open) return;
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const doEdit = () => { onEdit(tab, item); setOpen(false); };
  const doToggle = () => { onToggle(tab, item.id); setOpen(false); };
  const doDelete = () => { onDelete(tab, item.id, item.name); setOpen(false); };

  // Floating position (portal) to avoid table scroll/reflow
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!open) return;
    const update = () => {
      const btn = btnRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const estW = 176; // ~w-44
      let top = rect.bottom + 8;
      let left = Math.min(window.innerWidth - 8 - estW, Math.max(8, rect.right - estW));
      setPos({ top, left });
      // refine after menu renders
      requestAnimationFrame(() => {
        const m = menuRef.current;
        if (!m) return;
        const mw = m.offsetWidth || estW;
        const mh = m.offsetHeight || 0;
        let t = rect.bottom + 8;
        let l = Math.min(window.innerWidth - 8 - mw, Math.max(8, rect.right - mw));
        if (t + mh > window.innerHeight - 8) t = Math.max(8, rect.top - 8 - mh);
        setPos({ top: t, left: l });
      });
    };
    update();
    const onScroll = () => update();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  const MenuCard = (
    <div
      ref={menuRef}
      role="menu"
      style={{ position: "fixed", top: pos.top, left: pos.left }}
      className="z-[60] w-44 overflow-hidden rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm py-1 text-sm shadow-2xl"
    >
      <button role="menuitem" className="block w-full px-3 py-2 text-left hover:bg-slate-50" onClick={doEdit}>Edit</button>
      <button role="menuitem" className="block w-full px-3 py-2 text-left hover:bg-slate-50" onClick={doToggle}>
        {isActive ? "Deactivate" : "Activate"}
      </button>
      <button role="menuitem" className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50" onClick={doDelete}>Delete</button>
    </div>
  );

  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        ref={btnRef}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Component actions"
        onClick={() => setOpen((o) => !o)}
        className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && createPortal(MenuCard, document.body)}
    </div>
  );
}

function useFocusTrap(open) {
  const containerRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const el = containerRef.current;
    if (!el) return;
    const focusable = () =>
      Array.from(
        el.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((n) => !n.hasAttribute("disabled"));
    const first = () => focusable()[0];
    const last = () => focusable()[focusable().length - 1];
    const onKey = (e) => {
      if (e.key === "Escape") {
        const closeBtn = el.querySelector("[data-modal-close]");
        closeBtn?.click();
      } else if (e.key === "Tab") {
        const f = focusable();
        if (f.length === 0) return;
        if (e.shiftKey && document.activeElement === f[0]) {
          e.preventDefault();
          last()?.focus();
        } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
          e.preventDefault();
          first()?.focus();
        }
      }
    };
    const onOpen = () => {
      setTimeout(() => first()?.focus(), 0);
    };
    onOpen();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return containerRef;
}

function ConfirmDialog({ title, message, confirmText = "Confirm", onCancel, onConfirm }) {
  const ref = useFocusTrap(true);
  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onCancel?.();
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlay}
    >
      <div ref={ref} className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="px-5 py-4">
          <div className="text-base font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-sm text-slate-600">{message}</div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button type="button" className="btn-ghost" data-modal-close onClick={onCancel}>Cancel</button>
          <button type="button" className="btn-primary bg-red-600 hover:bg-red-700" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddEditModal({ tab, mode, initial, onCancel, onSave, existingNames }) {
  const isEdit = mode === "edit";
  const ref = useFocusTrap(true);
  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onCancel?.();
  };

  const base = {
    name: "",
    status: "Active",
    description: "",
  };

  const defaults = {
    earnings: {
      ...base,
      type: EARNING_TYPES[0],
      calc: { kind: "flat", value: "" },
      includeCPP: true,
      includeEI: true,
    },
    deductions: {
      ...base,
      type: DEDUCTION_TYPES[0],
      frequency: "Recurring",
      defaultAmount: "",
    },
    benefits: {
      ...base,
      type: BENEFIT_TYPES[0],
      frequency: "Recurring",
      taxable: false,
      contribution: { kind: "", value: "" },
    },
    reimbursements: {
      ...base,
      type: REIMBURSEMENT_TYPES[0],
      max: "",
      period: "per month",
      requiresReceipt: true,
    },
  };

  const [data, setData] = useState(() => {
    if (isEdit && initial) {
      return JSON.parse(JSON.stringify(initial));
    }
    return JSON.parse(JSON.stringify(defaults[tab]));
  });

  const setField = (k) => (e) => {
    const val = e?.target?.type === "checkbox" ? e.target.checked : e?.target ? e.target.value : e;
    setData((p) => ({ ...p, [k]: val }));
  };

  const setCalc = (partial) => setData((p) => ({ ...p, calc: { ...p.calc, ...partial } }));
  const setContribution = (partial) => setData((p) => ({ ...p, contribution: { ...p.contribution, ...partial } }));

  const nameExists = useMemo(() => {
    const baseline = (existingNames || []).filter((n) => (isEdit ? n.toLowerCase() !== (initial?.name || "").toLowerCase() : true));
    return baseline.map((x) => x.toLowerCase());
  }, [existingNames, isEdit, initial]);

  const isValid = useMemo(() => {
    if (!data.name || nameExists.includes(data.name.trim().toLowerCase())) return false;
    if (tab === "earnings") {
      if (!data.type) return false;
      if (!data.calc?.kind) return false;
      if (["flat", "pct_ctc", "pct_basic"].includes(data.calc.kind)) {
        const v = Number(data.calc.value);
        if (!Number.isFinite(v) || v <= 0) return false;
      }
      return true;
    }
    if (tab === "deductions") {
      if (!data.type || !data.frequency) return false;
      if (data.defaultAmount !== "" && (!Number.isFinite(Number(data.defaultAmount)) || Number(data.defaultAmount) < 0)) return false;
      return true;
    }
    if (tab === "benefits") {
      if (!data.type || !data.frequency || typeof data.taxable !== "boolean") return false;
      if (data.contribution?.kind) {
        const v = Number(data.contribution.value);
        if (!Number.isFinite(v) || v < 0) return false;
      }
      return true;
    }
    if (tab === "reimbursements") {
      if (!data.type || !data.period) return false;
      const v = Number(data.max);
      if (!Number.isFinite(v) || v <= 0) return false;
      return true;
    }
    return false;
  }, [data, tab, nameExists]);

  const submit = (e) => {
    e?.preventDefault?.();
    if (!isValid) return;
    const payload = { tab, mode, originalId: initial?.id, data };
    onSave?.(payload);
  };

  const title = `${isEdit ? "Edit" : "Add"} ${TABS.find((t) => t.id === tab)?.label.slice(0, -1) || "Component"}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleOverlay}
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 py-10 sm:px-6"
    >
      <form ref={ref} onSubmit={submit} className="w-full max-w-[680px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 pb-4 pt-5">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button type="button" aria-label="Close" data-modal-close onClick={onCancel} className="text-blue-600 transition-colors hover:text-blue-700">
            ×
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Shared fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.6fr_1fr]">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name<span className="text-red-500">*</span></label>
              <input className="input mt-1" placeholder="Component name" value={data.name} onChange={setField("name")} autoFocus />
              {data.name && nameExists.includes(data.name.trim().toLowerCase()) && (
                <div className="mt-1 text-[12px] text-red-600">Name must be unique within this tab.</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <SearchSelect
                className="mt-1"
                value={data.status}
                onChange={setField("status")}
                placeholder="Select status"
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea className="input mt-1 h-24 resize-none" placeholder="Optional" value={data.description} onChange={setField("description")} />
          </div>

          {/* Tab-specific fields */}
          {tab === "earnings" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Earning Type<span className="text-red-500">*</span></label>
                  <SearchSelect
                    className="mt-1"
                    value={data.type}
                    onChange={setField("type")}
                    placeholder="Select earning type"
                    options={EARNING_TYPES.map((t) => ({ value: t, label: t }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Calculation Type<span className="text-red-500">*</span></label>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="radio" name="calc" checked={data.calc?.kind === "flat"} onChange={() => setCalc({ kind: "flat" })} />
                      <span>Flat Amount (monthly)</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="radio" name="calc" checked={data.calc?.kind === "pct_ctc"} onChange={() => setCalc({ kind: "pct_ctc" })} />
                      <span>Percentage of CTC</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="radio" name="calc" checked={data.calc?.kind === "pct_basic"} onChange={() => setCalc({ kind: "pct_basic" })} />
                      <span>Percentage of Basic</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Value<span className="text-red-500">*</span></label>
                  <input className="input mt-1" inputMode="decimal" placeholder="0" value={data.calc?.value ?? ""} onChange={(e) => setCalc({ value: e.target.value })} />
                </div>
                <label className="mt-7 inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!data.includeCPP} onChange={setField("includeCPP")} />
                  <span>Include in CPP/QPP</span>
                </label>
                <label className="mt-7 inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!data.includeEI} onChange={setField("includeEI")} />
                  <span>Include in EI</span>
                </label>
              </div>
            </div>
          )}

          {tab === "deductions" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700">Deduction Type<span className="text-red-500">*</span></label>
                <SearchSelect
                  className="mt-1"
                  value={data.type}
                  onChange={setField("type")}
                  placeholder="Select deduction type"
                  options={DEDUCTION_TYPES.map((t) => ({ value: t, label: t }))}
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700">Frequency<span className="text-red-500">*</span></label>
                <SearchSelect
                  className="mt-1"
                  value={data.frequency}
                  onChange={setField("frequency")}
                  placeholder="Select frequency"
                  options={["One-time","Recurring"].map((t) => ({ value: t, label: t }))}
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700">Default Amount</label>
                <input className="input mt-1" inputMode="decimal" placeholder="Optional" value={data.defaultAmount} onChange={setField("defaultAmount")} />
              </div>
            </div>
          )}

          {tab === "benefits" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Benefit Type<span className="text-red-500">*</span></label>
                  <SearchSelect
                    className="mt-1"
                    value={data.type}
                    onChange={setField("type")}
                    placeholder="Select benefit type"
                    options={BENEFIT_TYPES.map((t) => ({ value: t, label: t }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Frequency<span className="text-red-500">*</span></label>
                  <SearchSelect
                    className="mt-1"
                    value={data.frequency}
                    onChange={setField("frequency")}
                    placeholder="Select frequency"
                    options={["Recurring","One-time"].map((t) => ({ value: t, label: t }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Taxable?<span className="text-red-500">*</span></label>
                  <div className="mt-2 flex items-center gap-6 text-sm">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="taxable" checked={!!data.taxable} onChange={() => setField("taxable")({ target: { value: true } })} />
                      <span>Yes</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="taxable" checked={!data.taxable} onChange={() => setField("taxable")({ target: { value: false } })} />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr]">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Employer Contribution</label>
                  <div className="mt-1 grid grid-cols-[1fr_1fr] gap-2">
                    <select className="input" value={data.contribution?.kind || ""} onChange={(e) => setContribution({ kind: e.target.value })}>
                      <option value="">None</option>
                      <option value="Percent">Percent</option>
                      <option value="Amount">Amount</option>
                    </select>
                    <input className="input" inputMode="decimal" placeholder="Value" value={data.contribution?.value ?? ""} onChange={(e) => setContribution({ value: e.target.value })} disabled={!data.contribution?.kind} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "reimbursements" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Reimbursement Type<span className="text-red-500">*</span></label>
                  <SearchSelect
                    className="mt-1"
                    value={data.type}
                    onChange={setField("type")}
                    placeholder="Select reimbursement type"
                    options={REIMBURSEMENT_TYPES.map((t) => ({ value: t, label: t }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Max Reimbursable Amount<span className="text-red-500">*</span></label>
                  <input className="input mt-1" inputMode="decimal" placeholder="0" value={data.max} onChange={setField("max")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Period<span className="text-red-500">*</span></label>
                  <SearchSelect
                    className="mt-1"
                    value={data.period}
                    onChange={setField("period")}
                    placeholder="Select period"
                    options={["per month","quarter","year"].map((t) => ({ value: t, label: t }))}
                  />
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!data.requiresReceipt} onChange={setField("requiresReceipt")} />
                <span>Requires Receipt?</span>
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-6 py-4">
          <div className="text-xs font-medium text-red-500">* indicates mandatory fields</div>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-ghost" data-modal-close onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={!isValid}>{isEdit ? "Save changes" : "Save"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Lightweight searchable select (combobox-like)
function SearchSelect({ options = [], value, onChange, placeholder = "Select...", className = "" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const ref = useRef(null);

  const normalizedOptions = Array.isArray(options)
    ? options.map((o) => (typeof o === "string" ? { value: o, label: o } : o))
    : [];
  const selected = normalizedOptions.find((o) => o.value === value) || null;

  useEffect(() => {
    const close = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
    else setHighlight(0);
  }, [open]);

  const norm = (s) => (s || "").toString().toLowerCase();
  const filtered = normalizedOptions.filter((o) => norm(o.label).includes(norm(query)));

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
          value={open ? query : selected?.label || ""}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" aria-hidden>
          <svg viewBox="0 0 512 512" className="h-4 w-4"><path fill="#999" d="M103.5 165.6c8.8-8.8 22.8-9.9 32.9-2.4l2.8 2.4L256 282.4l116.8-116.8c8.8-8.8 22.8-9.9 32.9-2.4l2.8 2.4c8.8 8.8 9.9 22.8 2.4 32.9l-2.5 2.8L256 353.8 103.5 201.3c-4.7-4.7-7.4-11.2-7.4-17.9 0-6.6 2.7-13.1 7.4-17.8z"/></svg>
        </span>
      </div>

      {open && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
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
}
