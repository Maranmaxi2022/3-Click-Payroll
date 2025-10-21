// src/utils/payrollStore.js
// Lightweight localStorage-backed store to share Settings across views

export const PAYROLL_SETTINGS_KEY = "PAYROLL_SETTINGS_V1";

const defaultState = {
  salaryComponents: {
    earnings: [],
    deductions: [],
    benefits: [],
    reimbursements: [],
  },
  taxes: {},
  statutory: {},
};

export function loadPayrollSettings() {
  if (typeof window === "undefined") return { ...defaultState };
  try {
    const raw = window.localStorage.getItem(PAYROLL_SETTINGS_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed, salaryComponents: { ...defaultState.salaryComponents, ...(parsed.salaryComponents || {}) } };
  } catch (err) {
    console.warn("Failed to parse payroll settings", err);
    return { ...defaultState };
  }
}

export function savePayrollSettings(partialOrUpdater) {
  if (typeof window === "undefined") return;
  const current = loadPayrollSettings();
  const next = typeof partialOrUpdater === "function" ? partialOrUpdater(current) : { ...current, ...partialOrUpdater };
  try {
    window.localStorage.setItem(PAYROLL_SETTINGS_KEY, JSON.stringify(next));
    const ev = new CustomEvent("payroll:settingsUpdate", { detail: next });
    window.dispatchEvent(ev);
  } catch (err) {
    console.warn("Failed to persist payroll settings", err);
  }
}

export function subscribePayrollSettings(handler) {
  if (typeof window === "undefined") return () => {};
  const onUpdate = (e) => handler(e.detail || loadPayrollSettings());
  const onStorage = (e) => {
    if (e.key === PAYROLL_SETTINGS_KEY) handler(loadPayrollSettings());
  };
  window.addEventListener("payroll:settingsUpdate", onUpdate);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("payroll:settingsUpdate", onUpdate);
    window.removeEventListener("storage", onStorage);
  };
}

