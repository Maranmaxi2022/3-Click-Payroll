// src/pages/EmployeeWizard.jsx
import React, { useEffect, useMemo, useState } from "react";
import SearchSelect from "../components/SearchSelect";
import SuccessArt from "../assets/Pay Roll_03.svg"; // completion SVG
import { loadPayrollSettings, subscribePayrollSettings } from "../utils/payrollStore";
import { employeeAPI, APIError } from "../utils/api";
import { mapWizardDataToTwoStepPayload } from "../utils/employeeMapper";

const cx = (...xs) => xs.filter(Boolean).join(" ");

// CAD currency formatting helper
const toCAD = (n) => {
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "CAD", maximumFractionDigits: 2 }).format(num);
};

/* Zoho-style step item */
const StepItem = ({ index, label, state }) => {
  const isActive = state === "active";
  const isDone = state === "done";
  return (
    <div className="flex items-center gap-2">
      <div
        className={cx(
          "grid h-5 w-5 place-items-center rounded-full border text-[11px] font-semibold",
          isDone && "border-emerald-500 text-emerald-600 bg-white",
          isActive && "border-blue-300 text-blue-700 bg-blue-50",
          !isDone && !isActive && "border-slate-300 text-slate-600 bg-white"
        )}
        aria-current={isActive ? "step" : undefined}
      >
        {isDone ? "✓" : index}
      </div>
      <div
        className={cx(
          "text-[13px]",
          isActive
            ? "px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium"
            : "text-slate-600"
        )}
      >
        {label}
      </div>
    </div>
  );
};

// Province/Territory options (Canada)
const PROVINCES = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Québec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "YT", label: "Yukon" },
];

function ProvinceSelect({ value, onChange, offsetForLabel = false }) {
  return (
    <SearchSelect
      options={PROVINCES}
      value={value}
      onChange={onChange}
      placeholder="Select Province/Territory"
      searchInMenu
      searchPlaceholder="Search province/territory"
      inputClassName="h-9 rounded-md px-3"
      offsetForExternalLabel={offsetForLabel}
      floatingLabel={false}
    />
  );
}

function StatutoryToggle({ label, subLabel, checked, onChange, reason, onReason }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={checked} onChange={(e) => onChange?.(e.target.checked)} />
        <span className="font-medium text-slate-800">{label}</span>
      </label>
      {subLabel && <div className="ml-6 text-xs text-slate-500">{subLabel}</div>}
      {!checked && (
        <div className="ml-6 mt-1">
          <input
            className="input h-8"
            placeholder="Exempt with reason (e.g., CPT30)"
            value={reason || ""}
            onChange={(e) => onReason?.(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

export default function EmployeeWizard({ onCancel, onFinish, mode = "create", employeeId = null }) {
  // steps: 1..4 = forms, 5 = success
  const [step, setStep] = useState(1);
  // Shrinking sticky header on scroll
  const [compactHeader, setCompactHeader] = useState(false);
  // Smooth progress value (0 at top, 1 after a threshold of scroll)
  const [scrollY, setScrollY] = useState(0);
  // API states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [createdEmployeeId, setCreatedEmployeeId] = useState(null);
  // Edit mode states
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(mode === "edit");
  const [loadError, setLoadError] = useState(null);
  useEffect(() => {
    const onScroll = () => {
      if (typeof window === "undefined") return;
      const y = window.scrollY || 0;
      setScrollY(y);
      setCompactHeader(y > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Map scroll to header height and typography
  const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
  const lerp = (a, b, t) => a + (b - a) * t;
  // After ~200px of scroll, treat as fully compact
  const progress = clamp01((scrollY || 0) / 200);
  const HEADER_MAX = 150; // px when at top
  const HEADER_MIN = 100; // px when compact
  const headerHeight = Math.round(lerp(HEADER_MAX, HEADER_MIN, progress));
  // Title scales with header height
  const TITLE_MAX = 20; // px
  const TITLE_MIN = 16; // px
  const titleSize = lerp(TITLE_MAX, TITLE_MIN, progress);
  // Stepper slightly scales as well
  const stepScale = lerp(1, 0.96, progress);

  /* ---------- Step 1 (basic) ---------- */
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    employeeId: "",
    doj: "",
    startDate: "", // Actual work start date
    workEmail: "",
    mobile: "",
    gender: "",
    // Canada – employment province + Quebec flag
    provinceEmployment: "",
    quebecEmployee: false,
    // Work location details
    locationCity: "",
    locationProvince: "",
    locationPostal: "",
    // legacy text field replaced by city/province/postal
    location: "Head Office",
    designation: "",
    department: "",
    division: "",
    employmentType: "", // Full-time, Part-time, Contract, etc.
    employmentStatus: "Active", // Active, Inactive, On Leave, Terminated
    manager: "", // Reporting manager
    probationEndDate: "", // Probation period end date
    contractEndDate: "", // Contract expiry date (if applicable)
    jobLevel: "", // Junior, Senior, Manager, etc.
    workSchedule: "", // Standard hours, Shift work, Flexible
    workplace: "", // Office, Remote, Hybrid
    jobNote: "", // Additional notes
    enablePortal: false,
    // Canada – statutory programs
    cppEnabled: true,
    cpp2Enabled: true,
    eiEnabled: true,
    qpipEnabled: false, // Quebec only
    exemptions: { cpp: "", cpp2: "", ei: "", qpip: "" },
  });
  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]:
        e.target?.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  // For Date of Joining placeholder consistency
  const [dojInputType, setDojInputType] = useState("text");

  /* ---------- Step 2 (salary) ---------- */
  // Use existing variable name for annual gross to minimize churn across file
  const [annualCTC, setAnnualCTC] = useState(0); // Annual gross salary (CAD)
  const [payFrequency, setPayFrequency] = useState("monthly"); // weekly|biweekly|semimonthly|monthly
  const PERIODS = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 };

  // Canada earnings buckets (amounts entered per pay unless noted)
  const [earnings, setEarnings] = useState({
    overtime: 0,
    vacation: 0,
    bonus: 0,
    commissions: 0,
    taxableBenefits: 0,
    benefitPensionable: true,
    benefitInsurable: true,
  });
  const setE = (k) => (e) =>
    setEarnings((s) => ({
      ...s,
      [k]: e?.target?.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  // TD1 and tax inputs
  const [td1FedMode, setTd1FedMode] = useState("total"); // total|code
  const [td1FedTotal, setTd1FedTotal] = useState(0);
  const [td1FedCode, setTd1FedCode] = useState(1);
  const [td1UseIndexing, setTd1UseIndexing] = useState(true);

  const [td1ProvMode, setTd1ProvMode] = useState("total");
  const [td1ProvTotal, setTd1ProvTotal] = useState(0);
  const [td1ProvCode, setTd1ProvCode] = useState(1);

  const [additionalTaxPerPay, setAdditionalTaxPerPay] = useState(0);

  // YTD carry-ins for mid‑year hires
  const [ytd, setYtd] = useState({ cpp: 0, cpp2: 0, qpp: 0, qpp2: 0, ei: 0, qpip: 0, tax: 0, nonPeriodic: 0 });
  const setY = (k) => (e) => setYtd((s) => ({ ...s, [k]: e.target.value }));

  // Registered plans and other credits
  const [credits, setCredits] = useState({ rrsp: 0, rrspYtd: 0, rpp: 0, rppYtd: 0, unionDues: 0, alimony: 0, northernDeduction: 0, lcf: 0, lcp: 0, commissionEmployee: false });
  const setC = (k) => (e) => setCredits((s) => ({ ...s, [k]: e?.target?.type === "checkbox" ? e.target.checked : e.target.value }));

  // Load salary components from shared store
  const [settingsAll, setSettingsAll] = useState(() => loadPayrollSettings());
  useEffect(() => subscribePayrollSettings((next) => setSettingsAll(next)), []);

  // Fetch employee data in edit mode
  useEffect(() => {
    if (mode === "edit" && employeeId) {
      const fetchEmployeeData = async () => {
        try {
          setIsLoadingEmployee(true);
          setLoadError(null);
          const data = await employeeAPI.getById(employeeId);

          // Populate form with existing employee data
          setForm({
            firstName: data.first_name || "",
            middleName: data.middle_name || "",
            lastName: data.last_name || "",
            employeeId: data.employee_number || "",
            doj: data.hire_date || "",
            startDate: data.start_date || "",
            workEmail: data.email || "",
            mobile: data.phone || "",
            gender: data.gender || "",
            provinceEmployment: data.province_of_employment || "",
            quebecEmployee: data.is_quebec_employee || false,
            locationCity: data.city || "",
            locationProvince: data.province || "",
            locationPostal: data.postal_code || "",
            location: data.work_location_name || "Head Office",
            designation: data.job_title || "",
            department: data.department_name || "",
            division: data.division || "",
            employmentType: data.employment_type || "",
            employmentStatus: data.status || "Active",
            manager: data.manager_name || "",
            probationEndDate: data.probation_end_date || "",
            contractEndDate: data.contract_end_date || "",
            jobLevel: data.job_level || "",
            workSchedule: data.work_schedule || "",
            workplace: data.workplace || "",
            jobNote: data.notes || "",
            enablePortal: data.portal_access_enabled || false,
            cppEnabled: data.cpp_enabled !== false,
            cpp2Enabled: data.cpp2_enabled !== false,
            eiEnabled: data.ei_enabled !== false,
            qpipEnabled: data.qpip_enabled || false,
            exemptions: {
              cpp: data.cpp_exemption_code || "",
              cpp2: data.cpp2_exemption_code || "",
              ei: data.ei_exemption_code || "",
              qpip: data.qpip_exemption_code || "",
            },
          });

          // Populate compensation data if available
          if (data.annual_salary) setAnnualCTC(data.annual_salary);
          if (data.pay_frequency) setPayFrequency(data.pay_frequency);

          setIsLoadingEmployee(false);
        } catch (err) {
          console.error("Error fetching employee:", err);
          setLoadError(err.message || "Failed to load employee data");
          setIsLoadingEmployee(false);
        }
      };

      fetchEmployeeData();
    }
  }, [mode, employeeId]);

  // Map of per-pay amounts for earnings components (by id)
  const [compAmounts, setCompAmounts] = useState({});
  const setCompAmt = (id) => (e) => setCompAmounts((m) => ({ ...m, [id]: e.target.value }));

  // Derived compensation figures for display
  const caComp = useMemo(() => {
    const toNum = (v) => (isNaN(+v) ? 0 : +v);
    const grossY = Math.max(0, toNum(annualCTC));
    const P = PERIODS[payFrequency] || 12;
    const regularPerPay = grossY / P;
    // Compute active earnings from Settings
    const activeEarnings = Array.isArray(settingsAll.salaryComponents?.earnings)
      ? settingsAll.salaryComponents.earnings.filter((e) => e?.status === "Active")
      : [];
    const perPayFromComponents = activeEarnings.reduce((sum, c) => {
      // Skip a row named 'Regular Wages' because it’s represented by derived regularPerPay
      if ((c.type || c.name) === "Regular Wages") return sum;
      const kind = c?.calc?.kind;
      const val = Number(c?.calc?.value) || 0;
      let defAmount = 0;
      if (kind === "flat") defAmount = val;
      else if (kind === "pct_ctc") defAmount = regularPerPay * (val / 100);
      else if (kind === "pct_basic") defAmount = regularPerPay * (val / 100);
      const override = Number(compAmounts[c.id]);
      return sum + (Number.isFinite(override) && override > 0 ? override : defAmount);
    }, 0);

    const thisPayTotal = regularPerPay + perPayFromComponents;
    const r2 = (n) => Math.round(n * 100) / 100;
    return { P, grossY: r2(grossY), regularPerPay: r2(regularPerPay), thisPayTotal: r2(thisPayTotal), activeEarnings };
  }, [annualCTC, payFrequency, settingsAll, compAmounts]);

  /* ---------- Step 3 (personal) ---------- */
  const [personal, setPersonal] = useState({
    dob: "",
    // Canada: SIN capture (store only hash + last3 for display)
    sinDigits: "", // transient 0-9 digits
    sinLast3: "", // for masked display
    sinHash: "", // salted SHA-256 of digits
    sinMasked: false, // mask on blur
    preferredName: "", // optional middle/preferred name
    personalEmail: "",
    addr1: "",
    addr2: "",
    city: "",
    province: "",
    postal: "",
    country: "Canada",
    langPref: "English", // English | French
    consentEslips: false, // consent to electronic T4/RL-1
  });
  const setP = (k) => (e) => setPersonal((p) => ({ ...p, [k]: e.target?.type === "checkbox" ? e.target.checked : e.target.value }));

  const age = useMemo(() => {
    if (!personal.dob) return "";
    const dob = new Date(personal.dob);
    if (isNaN(dob.getTime())) return "";
    const t = new Date();
    let a = t.getFullYear() - dob.getFullYear();
    const m = t.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < dob.getDate())) a--;
    return a >= 0 ? String(a) : "";
  }, [personal.dob]);

  // Helpers: SIN formatting + hashing
  const formatSin = (digits) => {
    const d = (digits || "").replace(/\D+/g, "").slice(0, 9);
    const a = d.slice(0, 3);
    const b = d.slice(3, 6);
    const c = d.slice(6, 9);
    return [a, b, c].filter(Boolean).join(" ");
  };
  const maskSin = (digits) => {
    const d = (digits || "").replace(/\D+/g, "").slice(0, 9);
    if (!d) return "";
    const last3 = d.slice(-3);
    return `XXX XXX ${last3}`;
  };
  const isObviousInvalidSIN = (digits) => {
    const d = (digits || "").replace(/\D+/g, "");
    if (d.length !== 9) return true;
    if (/^(\d)\1{8}$/.test(d)) return true; // all same digit
    return false;
  };
  // Luhn (Mod 10) check for SIN
  const luhnCheck = (digits) => {
    const d = (digits || "").replace(/\D+/g, "");
    if (d.length !== 9) return false;
    let sum = 0;
    for (let i = 0; i < d.length; i++) {
      let n = Number(d[i]);
      if (i % 2 === 1) { // even position (0-based) -> double
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
    }
    return sum % 10 === 0;
  };
  // Salted hash using Web Crypto; fallback to simple hash if unavailable
  async function hashSIN(digits) {
    const enc = new TextEncoder();
    const salt = new Uint8Array(12);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(salt);
    const payload = new Uint8Array([...salt, ...enc.encode(String(digits || ""))]);
    let digestHex = "";
    try {
      if (crypto?.subtle?.digest) {
        const buf = await crypto.subtle.digest("SHA-256", payload);
        const bytes = new Uint8Array(buf);
        digestHex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
      } else {
        // very small fallback
        let h = 0;
        for (let i = 0; i < payload.length; i++) h = (h * 31 + payload[i]) >>> 0;
        digestHex = h.toString(16);
      }
    } catch (e) {
      digestHex = "";
    }
    const saltHex = Array.from(salt, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${saltHex}$${digestHex}`;
  }

  /* ---------- Step 4 (payment information) ---------- */
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [payError, setPayError] = useState(false);

  /* ---------- Validation errors ---------- */
  const [validationErrors, setValidationErrors] = useState({});

  const [bank, setBank] = useState({
    holder: "Priya Raman",
    bankName: "",
    acc: "",
    acc2: "",
    ifsc: "",
    type: "savings", // "current" | "savings"
  });
  const setBankField = (k) => (e) =>
    setBank((b) => ({ ...b, [k]: e.target.value }));

  const paymentOptions = [
    {
      id: "bank",
      title: "Bank Transfer (Manual Process)",
      desc: "Download Bank Advice and process the payment through your bank's website",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <path
            d="M3 10h18M5 10V8l7-4 7 4v2M5 10v7m14-7v7M3 17h18M3 20h18"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: "cheque",
      title: "Cheque",
      desc: "",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <rect
            x="3"
            y="6"
            width="18"
            height="12"
            rx="2"
            ry="2"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
          />
          <path
            d="M7 12h10M7 9h4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: "cash",
      title: "Cash",
      desc: "",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <rect
            x="3"
            y="6"
            width="18"
            height="12"
            rx="2"
            ry="2"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
          />
          <circle
            cx="12"
            cy="12"
            r="2.5"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
          />
        </svg>
      ),
    },
  ];

  /* ---------- Stepper + nav ---------- */
  const steps = useMemo(
    () => [
      { id: 1, label: "Basic Details" },
      { id: 2, label: "Salary Details" },
      { id: 3, label: "Personal Details" },
      { id: 4, label: "Payment Information" },
    ],
    []
  );

  const next = () => setStep((s) => Math.min(5, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  /* ---------- Validation functions ---------- */
  const validateStep1 = () => {
    const errors = {};

    // Required fields
    if (!form.firstName?.trim()) errors.firstName = "First name is required";
    if (!form.lastName?.trim()) errors.lastName = "Last name is required";
    if (!form.employeeId?.trim()) errors.employeeId = "Employee ID is required";
    if (!form.doj?.trim()) errors.doj = "Date of joining is required";
    if (!form.workEmail?.trim()) errors.workEmail = "Work email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.workEmail)) errors.workEmail = "Invalid email format";
    if (!form.gender?.trim()) errors.gender = "Gender is required";
    if (!form.provinceEmployment?.trim()) errors.provinceEmployment = "Province/Territory of employment is required";
    if (!form.designation?.trim()) errors.designation = "Designation is required";
    if (!form.department?.trim()) errors.department = "Department is required";

    // Work location
    if (!form.locationCity?.trim()) errors.locationCity = "City is required";
    if (!form.locationProvince?.trim()) errors.locationProvince = "Province is required";
    if (!form.locationPostal?.trim()) errors.locationPostal = "Postal code is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};

    // Annual gross salary
    const grossAmount = Number(annualCTC);
    if (!annualCTC || isNaN(grossAmount) || grossAmount <= 0) {
      errors.annualCTC = "Annual gross salary is required and must be greater than 0";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors = {};

    // Date of birth
    if (!personal.dob?.trim()) errors.dob = "Date of birth is required";

    // SIN validation (if provided)
    if (personal.sinDigits) {
      if (isObviousInvalidSIN(personal.sinDigits)) {
        errors.sin = "Please enter a valid 9-digit SIN";
      } else if (!luhnCheck(personal.sinDigits)) {
        errors.sin = "Invalid SIN - checksum verification failed";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep4 = () => {
    const errors = {};

    if (!paymentMethod) {
      errors.paymentMethod = "Please select a payment method";
      setPayError(true);
    } else if (paymentMethod === "bank") {
      const required = [
        { field: "holder", value: bank.holder, label: "Account holder name" },
        { field: "bankName", value: bank.bankName, label: "Bank name" },
        { field: "acc", value: bank.acc, label: "Account number" },
        { field: "acc2", value: bank.acc2, label: "Re-enter account number" },
        { field: "ifsc", value: bank.ifsc, label: "IFSC" },
      ];

      required.forEach(({ field, value, label }) => {
        if (!String(value).trim()) {
          errors[`bank.${field}`] = `${label} is required`;
        }
      });

      if (bank.acc && bank.acc2 && bank.acc !== bank.acc2) {
        errors["bank.acc2"] = "Account numbers do not match";
      }

      if (Object.keys(errors).length > 0) {
        setPayError(true);
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const finishWizard = async () => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      // Prepare the complete wizard data
      const wizardData = {
        form,
        compensation: {
          annualGross: annualCTC,
          payFrequency,
          periodsPerYear: caComp.P,
          earnings,
          td1: {
            federal: { mode: td1FedMode, total: td1FedTotal, code: td1FedCode, indexing: td1UseIndexing },
            provincial: { mode: td1ProvMode, total: td1ProvTotal, code: td1ProvCode },
            additionalTaxPerPay,
          },
          ytd,
          credits,
        },
        personal,
        paymentMethod,
        bank: paymentMethod === "bank" ? bank : undefined,
      };

      // Map to backend payload
      const { createPayload, updatePayload } = mapWizardDataToTwoStepPayload(wizardData);

      if (mode === "edit" && employeeId) {
        // Edit mode: Update existing employee
        await employeeAPI.update(employeeId, { ...createPayload, ...updatePayload });

        // Call the onFinish callback if provided (for parent component)
        onFinish?.(wizardData);

        // Redirect back to employee detail view
        window.location.hash = `employees/${employeeId}`;
      } else {
        // Create mode: Create new employee
        // Step 1: Create the employee with basic info
        const createdEmployee = await employeeAPI.create(createPayload);
        setCreatedEmployeeId(createdEmployee.id);

        // Step 2: Update with full details (personal, payment, etc.)
        await employeeAPI.update(createdEmployee.id, updatePayload);

        // Call the onFinish callback if provided (for parent component)
        onFinish?.(wizardData);

        // Move to success screen
        setStep(5);
      }
    } catch (error) {
      console.error(`Failed to ${mode === "edit" ? "update" : "create"} employee:`, error);
      if (error instanceof APIError) {
        setApiError(error.data?.detail || error.message || `Failed to ${mode === "edit" ? "update" : "create"} employee`);
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveAndContinue = () => {
    // Clear previous errors
    setValidationErrors({});
    setPayError(false);

    // Validate current step
    let isValid = false;
    switch (step) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        if (isValid) {
          return finishWizard();
        }
        return;
      default:
        isValid = true;
    }

    // Only proceed to next step if validation passed
    if (isValid && step < 4) {
      next();
    } else if (!isValid) {
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* ---------- UI ---------- */

  // Show loading state while fetching employee data in edit mode
  if (isLoadingEmployee) {
    return (
      <div className="py-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
            <p className="mt-4 text-slate-600">Loading employee data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if failed to load employee data
  if (loadError) {
    return (
      <div className="py-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Employee</h3>
            <p className="text-slate-600 mb-4">{loadError}</p>
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Fixed Add Employee header below the global navbar, offset by sidebar on desktop */}
      <div
        className={cx(
          // Fixed bar aligned with content area (to the right of the sidebar on md+)
          "fixed top-16 left-0 right-0 md:left-[var(--sidebar-w)] z-[45] bg-white/90 backdrop-blur border-t border-b border-slate-200",
          // Smooth shadow on scroll
          "transition-[box-shadow] duration-200",
          compactHeader ? "shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : ""
        )}
        style={{ height: `${headerHeight}px` }}
      >
        {/* Centered inner content to match form width */}
        <div className="mx-auto flex h-full w-full max-w-[980px] flex-col items-center justify-center px-4">
          <div className="flex justify-center">
            <h1
              className={cx("font-semibold text-slate-800 text-center")}
              style={{ fontSize: `${titleSize}px` }}
            >
              {step === 5 ? "Priya's Profile" : (mode === "edit" ? "Edit Employee" : "Add Employee")}
            </h1>
          </div>
          <div className="mt-2 flex justify-center">
            <div className={cx("flex items-center gap-4")}
                 style={{ transform: `scale(${stepScale})`, transition: "transform 150ms ease" }}>
              {steps.map((s, i) => {
                const state =
                  step === 5
                    ? "done"
                    : s.id < step
                    ? "done"
                    : s.id === step
                    ? "active"
                    : "todo";
                return (
                  <React.Fragment key={s.id}>
                    <StepItem index={s.id} label={s.label} state={state} />
                    {i < steps.length - 1 && <div className="h-px w-8 bg-slate-200" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to keep form content below the fixed Add Employee header */}
      <div className="w-full" style={{ height: `${headerHeight}px` }} />

      <div className="mx-auto w-full max-w-[980px]">
        {/* Success screen */}
        {step === 5 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col items-center text-center">
              <img
                src={SuccessArt}
                alt="Success"
                className="h-[220px] w-auto select-none"
                draggable="false"
              />
              <h2 className="mt-4 text-xl font-semibold text-slate-800">
                You&apos;ve successfully added Priya Raman to Qula
              </h2>
              <p className="mt-2 text-slate-600">
                You can edit your employees&apos; information anytime from the
                employee details page.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  className="btn-primary px-4"
                  onClick={() => {
                    // reset and start again
                    setForm({
                      firstName: "",
                      middleName: "",
                      lastName: "",
                      employeeId: "",
                      doj: "",
                      workEmail: "",
                      mobile: "",
                      gender: "",
                      provinceEmployment: "",
                      quebecEmployee: false,
                      locationCity: "",
                      locationProvince: "",
                      locationPostal: "",
                      location: "Head Office",
                      designation: "",
                      department: "",
                      enablePortal: false,
                      cppEnabled: true,
                      cpp2Enabled: true,
                      eiEnabled: true,
                      qpipEnabled: false,
                      exemptions: { cpp: "", cpp2: "", ei: "", qpip: "" },
                    });
                    setAnnualCTC(0);
                    setPayFrequency("monthly");
                    setEarnings({ overtime: 0, vacation: 0, bonus: 0, commissions: 0, taxableBenefits: 0, benefitPensionable: true, benefitInsurable: true });
                    setTd1FedMode("total");
                    setTd1FedTotal(0);
                    setTd1FedCode(1);
                    setTd1ProvMode("total");
                    setTd1ProvTotal(0);
                    setTd1ProvCode(1);
                    setTd1UseIndexing(true);
                    setAdditionalTaxPerPay(0);
                    setYtd({ cpp: 0, cpp2: 0, qpp: 0, qpp2: 0, ei: 0, qpip: 0, tax: 0, nonPeriodic: 0 });
                    setCredits({ rrsp: 0, rrspYtd: 0, rpp: 0, rppYtd: 0, unionDues: 0, alimony: 0, northernDeduction: 0, lcf: 0, lcp: 0, commissionEmployee: false });
                    setPersonal({
                      dob: "",
                      sinDigits: "",
                      sinLast3: "",
                      sinHash: "",
                      sinMasked: false,
                      preferredName: "",
                      personalEmail: "",
                      addr1: "",
                      addr2: "",
                      city: "",
                      province: "",
                      postal: "",
                      country: "Canada",
                      langPref: "English",
                      consentEslips: false,
                    });
                    setPaymentMethod("bank");
                    setBank({
                      holder: "Priya Raman",
                      bankName: "",
                      acc: "",
                      acc2: "",
                      ifsc: "",
                      type: "savings",
                    });
                    setStep(1);
                  }}
                >
                  Add Another Employee
                </button>

                {/* Now a real button as requested */}
                <button
                  className="btn-secondary px-4"
                  onClick={() => {
                    onFinish?.({
                      form,
                      compensation: {
                        annualGross: annualCTC,
                        payFrequency,
                        periodsPerYear: caComp.P,
                        earnings,
                        td1: {
                          federal: { mode: td1FedMode, total: td1FedTotal, code: td1FedCode, indexing: td1UseIndexing },
                          provincial: { mode: td1ProvMode, total: td1ProvTotal, code: td1ProvCode },
                          additionalTaxPerPay,
                        },
                        ytd,
                        credits,
                      },
                      personal,
                      paymentMethod,
                      bank: paymentMethod === "bank" ? bank : undefined,
                    });
                    if (!onFinish) window.location.hash = "employees";
                  }}
                >
                  Go to Employee Details
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Steps 1–4 */
          <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6">
            {/* Validation Error Summary */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="text-red-600">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                    <ul className="mt-2 list-disc list-inside text-sm text-red-700 space-y-1">
                      {Object.values(validationErrors).map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => setValidationErrors({})}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm text-slate-600">
                    Employee Name *
                  </label>
                  <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      className={cx("input", validationErrors.firstName && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                      placeholder="First Name"
                      value={form.firstName}
                      onChange={set("firstName")}
                    />
                    <input
                      className="input"
                      placeholder="Middle Name"
                      value={form.middleName}
                      onChange={set("middleName")}
                    />
                    <input
                      className={cx("input", validationErrors.lastName && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={set("lastName")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-600">
                    Employee ID *
                  </label>
                  <input
                    className={cx("input mt-1", validationErrors.employeeId && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                    value={form.employeeId}
                    onChange={set("employeeId")}
                    placeholder="e.g. EMP-001"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600">
                    Date of Joining *
                  </label>
                  <input
                    type={dojInputType}
                    className={cx("input mt-1", validationErrors.doj && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                    value={form.doj}
                    onChange={set("doj")}
                    placeholder="yyyy-mm-dd"
                    onFocus={() => setDojInputType("date")}
                    onBlur={(e) => {
                      if (!e.target.value) setDojInputType("text");
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    className={cx("input mt-1", validationErrors.workEmail && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                    value={form.workEmail}
                    onChange={set("workEmail")}
                    placeholder="abc@xyz.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600">
                    Mobile Number
                  </label>
                  <input
                    className="input mt-1"
                    inputMode="tel"
                    value={form.mobile}
                    onChange={(e) => {
                      const raw = String(e.target.value || "");
                      const digits = raw.replace(/\D+/g, "");
                      // Normalize to North American format +1 (###) ###-####
                      let d = digits;
                      if (d.startsWith("1")) d = d.slice(1);
                      d = d.slice(0, 10);
                      const p1 = d.slice(0, 3);
                      const p2 = d.slice(3, 6);
                      const p3 = d.slice(6, 10);
                      let fmt = "";
                      if (p1) {
                        fmt = "+1 (" + p1 + (p1.length === 3 ? ")" : "");
                        if (p2) fmt += " " + p2;
                        if (p3) fmt += "-" + p3;
                      }
                      setForm((f) => ({ ...f, mobile: fmt }));
                    }}
                    placeholder="e.g., +1 (416) 555-1234"
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm text-slate-600">Gender *</label>
                    <SearchSelect
                      options={[
                        { value: "Female", label: "Female" },
                        { value: "Male", label: "Male" },
                        { value: "Non-binary", label: "Non-binary" },
                        { value: "Prefer not to say", label: "Prefer not to say" },
                      ]}
                      value={form.gender}
                      onChange={(opt) => setForm((f) => ({ ...f, gender: opt?.value || "" }))}
                      placeholder="Select"
                      inputClassName={cx("h-9 rounded-md px-3", validationErrors.gender && "border-red-300")}
                      menuClassName="rounded-md"
                      floatingLabel={false}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600">
                      Province/Territory of Employment <span className="text-red-500">*</span>
                    </label>
                    <ProvinceSelect
                      value={form.provinceEmployment}
                      offsetForLabel
                      onChange={(opt) =>
                        setForm((f) => ({
                          ...f,
                          provinceEmployment: opt?.value || "",
                          // if selecting QC, default Quebec employee toggle on; otherwise keep user's choice
                          quebecEmployee: opt?.value === "QC" ? true : f.quebecEmployee,
                          // if moving away from QC, hide QPIP
                          qpipEnabled: opt?.value === "QC" ? f.qpipEnabled : false,
                        }))
                      }
                    />
                    <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.quebecEmployee}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            quebecEmployee: e.target.checked,
                            qpipEnabled: e.target.checked ? f.qpipEnabled : false,
                          }))
                        }
                      />
                      Québec employee
                    </label>
                    <div className="text-xs text-slate-500 mt-1">
                      If Quebec is selected, QPP/QPIP and Revenu Québec tax apply later.
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600">
                      Designation *
                    </label>
                    <input
                      className={cx("input mt-1", validationErrors.designation && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                      value={form.designation}
                      onChange={set("designation")}
                      placeholder="e.g. Frontend Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600">
                      Department *
                    </label>
                    <input
                      className={cx("input mt-1", validationErrors.department && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                      value={form.department}
                      onChange={set("department")}
                      placeholder="Department"
                    />
                  </div>

                  <label className="mt-2 flex items-start gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={form.enablePortal}
                      onChange={set("enablePortal")}
                    />
                    <span>
                      Enable Portal Access
                      <div className="text-slate-500 text-xs">
                        Allow the employee to view payslips and submit
                        declarations.
                      </div>
                    </span>
                  </label>

                  {/* Work Location */}
                  <div className="md:col-span-2">
                    <div className="text-sm font-medium text-slate-800">Work Location *</div>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <input
                        className={cx("input", validationErrors.locationCity && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                        placeholder="City"
                        value={form.locationCity}
                        onChange={set("locationCity")}
                      />
                      <ProvinceSelect
                        value={form.locationProvince}
                        onChange={(opt) =>
                          setForm((f) => ({
                            ...f,
                            locationProvince: opt?.value || "",
                            // default Province of Employment to work location province if empty
                            provinceEmployment: f.provinceEmployment || opt?.value || "",
                            quebecEmployee:
                              (f.provinceEmployment || opt?.value) === "QC" ? true : f.quebecEmployee,
                            qpipEnabled:
                              (f.provinceEmployment || opt?.value) === "QC" ? f.qpipEnabled : false,
                          }))
                        }
                      />
                      <input
                        className={cx("input", validationErrors.locationPostal && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                        placeholder="Postal Code (A1A 1A1)"
                        value={form.locationPostal}
                        onChange={(e) => {
                          const v = e.target.value.toUpperCase();
                          // Keep letters/numbers/space and format as A1A 1A1 progressively
                          const clean = v.replace(/[^A-Z0-9]/g, "").slice(0, 6);
                          const a = clean.slice(0, 3);
                          const b = clean.slice(3, 6);
                          const pc = b ? `${a} ${b}` : a;
                          setForm((f) => ({ ...f, locationPostal: pc }));
                        }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Province selected here defaults the Province of Employment.
                    </div>
                  </div>

                  {/* Statutory Components – Canada */}
                  <div className="border-t border-slate-200 pt-3 md:col-span-2">
                    <div className="text-sm font-medium text-slate-800">Statutory Components</div>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      <StatutoryToggle
                        label={form.quebecEmployee ? "QPP (instead of CPP)" : "CPP"}
                        checked={form.cppEnabled}
                        onChange={(checked) =>
                          setForm((f) => ({
                            ...f,
                            cppEnabled: checked,
                          }))
                        }
                        reason={form.exemptions.cpp}
                        onReason={(val) => setForm((f) => ({ ...f, exemptions: { ...f.exemptions, cpp: val } }))}
                      />
                      <StatutoryToggle
                        label="CPP2 (second additional CPP)"
                        subLabel="Auto-applies based on earnings"
                        checked={form.cpp2Enabled}
                        onChange={(checked) => setForm((f) => ({ ...f, cpp2Enabled: checked }))}
                        reason={form.exemptions.cpp2}
                        onReason={(val) => setForm((f) => ({ ...f, exemptions: { ...f.exemptions, cpp2: val } }))}
                      />
                      <StatutoryToggle
                        label={form.quebecEmployee ? "EI (federal employment insurance)" : "EI"}
                        checked={form.eiEnabled}
                        onChange={(checked) => setForm((f) => ({ ...f, eiEnabled: checked }))}
                        reason={form.exemptions.ei}
                        onReason={(val) => setForm((f) => ({ ...f, exemptions: { ...f.exemptions, ei: val } }))}
                      />
                      {form.quebecEmployee && (
                        <StatutoryToggle
                          label="QPIP (Québec only)"
                          checked={form.qpipEnabled}
                          onChange={(checked) => setForm((f) => ({ ...f, qpipEnabled: checked }))}
                          reason={form.exemptions.qpip}
                          onReason={(val) => setForm((f) => ({ ...f, exemptions: { ...f.exemptions, qpip: val } }))}
                        />
                      )}
                      <div className="text-xs text-slate-500 mt-1">
                        Uncheck to mark as exempt and provide a reason (e.g., CPT30 for CPP, clergy EI exemption).
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 – Canada salary + tax inputs */}
            {step === 2 && (
              <div className="space-y-4">
                <div className={cx("rounded-lg border", validationErrors.annualCTC ? "border-red-300" : "border-slate-200")}>
                  <div className="grid items-center gap-3 p-4 sm:grid-cols-[1fr_auto_auto_1fr]">
                    <label className="text-sm text-slate-700">Annual gross salary <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-[40px_1fr] gap-2">
                      <span className="grid place-items-center rounded-md border border-slate-200 bg-slate-50 text-slate-600">$</span>
                      <input
                        className={cx("input", validationErrors.annualCTC && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                        inputMode="numeric"
                        value={annualCTC}
                        onChange={(e) => setAnnualCTC(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-slate-600 text-center">per year (CAD)</span>
                  </div>
                  <div className="px-4 pb-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm text-slate-700">Pay frequency</label>
                        <SearchSelect
                          className="mt-1"
                          value={payFrequency}
                          onChange={(opt) => setPayFrequency(opt?.value || payFrequency)}
                          placeholder="Select pay frequency"
                          inputClassName="h-11 rounded-md px-3"
                          floatingLabel={false}
                          options={[
                            { value: "weekly", label: "Weekly (52)" },
                            { value: "biweekly", label: "Biweekly (26)" },
                            { value: "semimonthly", label: "Semimonthly (24)" },
                            { value: "monthly", label: "Monthly (12)" },
                          ]}
                        />
                      </div>
                      <div className="text-sm text-slate-600 grid content-end">Periods per year: <span className="font-medium text-slate-800">{caComp.P}</span></div>
                    </div>
                  </div>
                  <div className="h-px w-full bg-slate-200" />
                  <div className="grid grid-cols-[2fr_1fr_1fr_120px] gap-3 px-4 py-2 text-xs font-medium text-slate-600">
                    <div>EARNINGS</div>
                    <div>CALCULATION</div>
                    <div>PER PAY</div>
                    <div className="text-right pr-2">ANNUAL</div>
                  </div>
                  <div className="px-4 pb-4">
                    {/* Regular wages row derived from Annual Gross */}
                    <div className="grid grid-cols-[2fr_1fr_1fr_120px] gap-3 items-center py-2">
                      <div className="text-slate-700">Regular salary/wages</div>
                      <div className="text-slate-600">Derived</div>
                      <div className="text-slate-700">{toCAD(caComp.regularPerPay)}</div>
                      <div className="text-right pr-2 text-slate-700">{toCAD(caComp.grossY)}</div>
                    </div>
                    {/* Dynamic earnings from Settings (Active) */}
                    {caComp.activeEarnings.filter((c) => (c.type || c.name) !== "Regular Wages").map((c) => {
                      const kind = c?.calc?.kind;
                      const val = Number(c?.calc?.value) || 0;
                      let calcLabel = "—";
                      if (kind === "flat") calcLabel = "Per pay";
                      else if (kind === "pct_ctc") calcLabel = `${val}% of Gross`;
                      else if (kind === "pct_basic") calcLabel = `${val}% of Regular`;
                      const override = compAmounts[c.id];
                      const P = caComp.P || 12;
                      // Default amount from calculation for initial hint
                      let defAmount = 0;
                      if (kind === "flat") defAmount = val; else if (kind === "pct_ctc" || kind === "pct_basic") defAmount = (Number(annualCTC || 0) / P) * (val / 100);
                      const perPay = override !== undefined && override !== "" ? Number(override) : defAmount;
                      return (
                        <div key={c.id} className="grid grid-cols-[2fr_1fr_1fr_120px] gap-3 items-center py-2">
                          <div className="text-slate-700">{c.name}</div>
                          <div className="text-slate-600">{calcLabel}</div>
                          <div>
                            <input className="input" inputMode="decimal" value={override ?? (defAmount ? String(defAmount) : "")} onChange={setCompAmt(c.id)} placeholder={defAmount ? String(defAmount) : "0"} />
                          </div>
                          <div className="text-right pr-2 text-slate-700">{perPay ? toCAD(perPay * P) : <span className="text-slate-400">—</span>}</div>
                        </div>
                      );
                    })}

                    <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 flex items-center justify-between">
                      <span>Total earnings (this pay)</span>
                      <span>{toCAD(caComp.thisPayTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Taxes are configured in Settings → Tax Details & Statutory Components. */}
                <div className="rounded-lg border border-slate-200 p-4 text-[13px] text-slate-600">
                  <div className="font-medium text-slate-800 mb-1">Taxes & statutory (from Settings)</div>
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    <div>
                      <div>TD1 mode: <span className="font-medium text-slate-800">{settingsAll?.taxes?.employee?.td1Mode || "—"}</span></div>
                      {settingsAll?.taxes?.employee?.td1Mode === "totals" ? (
                        <div className="text-slate-600">TC {settingsAll?.taxes?.employee?.tc || "—"}; TCP {settingsAll?.taxes?.employee?.tcp || "—"}</div>
                      ) : (
                        <div className="text-slate-600">Claim code {settingsAll?.taxes?.employee?.claimCode || "—"}</div>
                      )}
                      <div className="text-slate-600">Additional tax (L): {settingsAll?.taxes?.employee?.extraTaxL || "—"}</div>
                    </div>
                    <div>
                      <div>CPP/QPP: <span className="font-medium text-slate-800">{settingsAll?.statutory?.cppqpp ? "On" : "Off"}</span>; CPP2: <span className="font-medium text-slate-800">{settingsAll?.statutory?.cpp2 ? "On" : "Off"}</span></div>
                      <div>EI insurable: <span className="font-medium text-slate-800">{settingsAll?.statutory?.eiInsurable ? "Yes" : "No"}</span>{form.quebecEmployee ? " (Use QPIP)" : ""}</div>
                      <div>TD1X: <span className="font-medium text-slate-800">{settingsAll?.statutory?.td1x ? "Present" : "No"}</span></div>
                    </div>
                  </div>
                  <div className="mt-2">Edit in Settings → Tax Details and Statutory Components.</div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm text-slate-700">Date of Birth *</label>
                    <input
                      type="date"
                      className={cx("input mt-1", validationErrors.dob && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                      value={personal.dob}
                      onChange={setP("dob")}
                    />
                    <div className="mt-1 text-xs text-slate-500">
                      {(() => {
                        if (!personal.dob) return null;
                        const a = Number(age || 0);
                        if (a < 18) return "CPP not deducted until month after 18th birthday.";
                        if (a >= 70) return "CPP stops this month.";
                        return null;
                      })()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700">Age</label>
                    <input className="input mt-1 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed" value={age} disabled placeholder="—" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-700">SIN (Social Insurance Number)</label>
                    <input
                      className={cx(
                        "input mt-1",
                        (validationErrors.sin || (personal.sinDigits && (isObviousInvalidSIN(personal.sinDigits) || !luhnCheck(personal.sinDigits)))) && "border-red-300 focus:border-red-500 focus:ring-red-200"
                      )}
                      inputMode="numeric"
                      placeholder="### ### ###"
                      value={personal.sinMasked ? maskSin(personal.sinDigits) : formatSin(personal.sinDigits)}
                      onChange={(e) => {
                        const raw = (e.target.value || "").replace(/\D+/g, "").slice(0, 9);
                        setPersonal((p) => ({ ...p, sinDigits: raw }));
                      }}
                      onFocus={() => setPersonal((p) => ({ ...p, sinMasked: false }))}
                      onBlur={async () => {
                        setPersonal((p) => ({ ...p, sinMasked: true }));
                        const d = personal.sinDigits;
                        if (!d || isObviousInvalidSIN(d)) return;
                        const sinHash = await hashSIN(d);
                        setPersonal((p) => ({ ...p, sinHash, sinLast3: d.slice(-3) }));
                      }}
                    />
                    <div className="mt-1 text-xs text-slate-500">Digits only; formats to 123 456 789. Stored encrypted; only last 3 digits are shown after entry.</div>
                    {(personal.sinDigits && isObviousInvalidSIN(personal.sinDigits)) && (
                      <div className="text-xs text-red-600 mt-1">Please enter a 9-digit SIN that isn't a repeated digit.</div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-700">Middle name / Preferred name (optional)</label>
                    <input className="input mt-1" value={personal.preferredName} onChange={setP("preferredName")} />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700">Personal Email Address</label>
                    <input className="input mt-1" placeholder="abc@xyz.com" value={personal.personalEmail} onChange={setP("personalEmail")} />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700">Language preference</label>
                    <SearchSelect
                      options={[{ value: "English", label: "English" }, { value: "French", label: "Français" }]}
                      value={personal.langPref}
                      onChange={(opt) => setPersonal((p) => ({ ...p, langPref: opt?.value || p.langPref }))}
                      placeholder="Select"
                      inputClassName="h-9 rounded-md px-3"
                      floatingLabel={false}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={personal.consentEslips} onChange={setP("consentEslips")} />
                      Consent to electronic T4 / RL-1
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-700">Residential Address</label>
                    <input className="input mt-1" placeholder="Address Line 1" value={personal.addr1} onChange={setP("addr1")} />
                    <input className="input mt-2" placeholder="Address Line 2" value={personal.addr2} onChange={setP("addr2")} />
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-4">
                      <input className="input" placeholder="City" value={personal.city} onChange={setP("city")} />
                      <ProvinceSelect value={personal.province} onChange={(opt) => setPersonal((p) => ({ ...p, province: opt?.value || "" }))} />
                      <input
                        className="input"
                        placeholder="Postal Code (A1A 1A1)"
                        value={personal.postal}
                        onChange={(e) => {
                          const v = (e.target.value || "").toUpperCase();
                          const clean = v.replace(/[^A-Z0-9]/g, "").slice(0, 6);
                          const a = clean.slice(0, 3);
                          const b = clean.slice(3, 6);
                          const pc = b ? `${a} ${b}` : a;
                          setPersonal((p) => ({ ...p, postal: pc }));
                        }}
                      />
                      <SearchSelect
                        options={[{ value: "Canada", label: "Canada" }, { value: "United States", label: "United States" }, { value: "Other", label: "Other" }]}
                        value={personal.country}
                        onChange={(opt) => setPersonal((p) => ({ ...p, country: opt?.value || "Canada" }))}
                        placeholder="Country"
                        inputClassName="h-9 rounded-md px-3"
                        floatingLabel={false}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                  <div className="flex gap-2">
                    <button className="btn-primary" onClick={saveAndContinue}>
                      Save and Continue
                    </button>
                    <button className="btn-ghost" onClick={next}>
                      Skip
                    </button>
                  </div>
                  <div className="text-xs font-medium text-red-500">
                    * indicates mandatory fields
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 – Payment Information */}
            {step === 4 && (
              <div>
                {/* Error message display */}
                {apiError && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-red-600">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-800">Error creating employee</h3>
                        <p className="mt-1 text-sm text-red-700">{apiError}</p>
                      </div>
                      <button
                        onClick={() => setApiError(null)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-3 text-lg font-semibold text-slate-800">
                  How would you like to pay this employee?{" "}
                  <span className="text-red-500">*</span>
                </div>

                <div
                  className={cx(
                    "rounded-md border",
                    payError ? "border-red-300" : "border-slate-200"
                  )}
                >
                  {paymentOptions.map((opt, idx) => {
                    const selected = paymentMethod === opt.id;
                    const showBankForm = opt.id === "bank" && selected;
                    return (
                      <div
                        key={opt.id}
                        className={cx(
                          idx !== paymentOptions.length - 1 &&
                            !showBankForm &&
                            "border-b border-slate-200"
                        )}
                      >
                        {/* option header */}
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentMethod(opt.id);
                            setPayError(false);
                          }}
                          className="flex w-full cursor-pointer items-center gap-4 px-4 py-4 text-left hover:bg-slate-50"
                          aria-pressed={selected}
                        >
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 bg-white">
                            {opt.icon}
                          </span>
                          <span className="min-w-0 flex-1">
                            <div className="font-medium text-slate-900">
                              {opt.title}
                            </div>
                            {opt.desc && (
                              <div className="text-sm text-slate-500">
                                {opt.desc}
                              </div>
                            )}
                          </span>
                          <span
                            className={cx(
                              "grid h-8 w-8 place-items-center rounded-full border text-slate-400",
                              selected
                                ? "border-blue-600 text-blue-600"
                                : "border-slate-300"
                            )}
                          >
                            ✓
                          </span>
                        </button>

                        {/* Expanded Bank Transfer form */}
                        {showBankForm && (
                          <div
                            className={cx(
                              "px-4 pb-4 pt-2",
                              idx !== paymentOptions.length - 1 &&
                                "border-b border-slate-200"
                            )}
                          >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div>
                                <label className="block text-sm text-slate-700">
                                  Account Holder Name
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  className={cx("input mt-1", validationErrors["bank.holder"] && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                                  value={bank.holder}
                                  onChange={setBankField("holder")}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-slate-700">
                                  Bank Name<span className="text-red-500">*</span>
                                </label>
                                <input
                                  className={cx("input mt-1", validationErrors["bank.bankName"] && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                                  value={bank.bankName}
                                  onChange={setBankField("bankName")}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-slate-700">
                                  Account Number
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  className={cx("input mt-1", validationErrors["bank.acc"] && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                                  inputMode="numeric"
                                  value={bank.acc}
                                  onChange={setBankField("acc")}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-slate-700">
                                  Re-enter Account Number
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  className={cx(
                                    "input mt-1",
                                    (validationErrors["bank.acc2"] || (bank.acc2 && bank.acc !== bank.acc2)) &&
                                      "border-red-300 focus:ring-red-200 focus:border-red-500"
                                  )}
                                  inputMode="numeric"
                                  value={bank.acc2}
                                  onChange={setBankField("acc2")}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-slate-700">
                                  IFSC<span className="text-red-500">*</span>
                                </label>
                                <input
                                  className={cx("input mt-1", validationErrors["bank.ifsc"] && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                                  placeholder="AAAA0000000"
                                  value={bank.ifsc}
                                  onChange={setBankField("ifsc")}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-slate-700">
                                  Account Type
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2 flex items-center gap-6">
                                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="acctType"
                                      checked={bank.type === "current"}
                                      onChange={() =>
                                        setBank((b) => ({
                                          ...b,
                                          type: "current",
                                        }))
                                      }
                                    />
                                    Current
                                  </label>
                                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="acctType"
                                      checked={bank.type === "savings"}
                                      onChange={() =>
                                        setBank((b) => ({
                                          ...b,
                                          type: "savings",
                                        }))
                                      }
                                    />
                                    Savings
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                  <div className="flex gap-2">
                    <button
                      className="btn-primary flex items-center gap-2"
                      onClick={saveAndContinue}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isSubmitting ? "Creating Employee..." : "Save and Continue"}
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={finishWizard}
                      disabled={isSubmitting}
                    >
                      Skip
                    </button>
                  </div>
                  <div className="text-xs font-medium text-red-500">
                    * indicates mandatory fields
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer for steps 1–2 only */}
        {step <= 2 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {step > 1 && (
              <button className="btn-secondary" onClick={prev}>
                Back
              </button>
            )}
            <button className="btn-primary" onClick={saveAndContinue}>
              Save and Continue
            </button>
            <button className="btn-ghost" onClick={onCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Tiny utility styles (Tailwind v4) */
const css = `
.input{ @apply h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200; }
.btn-primary{ @apply h-9 rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600; }
.btn-secondary{ @apply h-9 rounded-md border border-slate-200 bg-white px-3 text-sm hover:bg-slate-50; }
.btn-ghost{ @apply h-9 rounded-md px-3 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent; }
.btn-outline{ @apply h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 hover:bg-slate-50; }
`;
if (typeof document !== "undefined" && !document.getElementById("emp-wiz-css")) {
  const tag = document.createElement("style");
  tag.id = "emp-wiz-css";
  tag.innerHTML = css;
  document.head.appendChild(tag);
}
