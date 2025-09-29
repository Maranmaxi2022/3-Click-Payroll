// src/pages/EmployeeWizard.jsx
import React, { useMemo, useState } from "react";
import SuccessArt from "../assets/Pay Roll_03.svg"; // completion SVG

const cx = (...xs) => xs.filter(Boolean).join(" ");

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

export default function EmployeeWizard({ onCancel, onFinish }) {
  // steps: 1..4 = forms, 5 = success
  const [step, setStep] = useState(1);

  /* ---------- Step 1 (basic) ---------- */
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    employeeId: "",
    doj: "",
    workEmail: "",
    mobile: "",
    gender: "",
    location: "Head Office",
    designation: "",
    department: "Engineering",
    enablePortal: false,
    professionalTax: true,
  });
  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]:
        e.target?.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  /* ---------- Step 2 (salary) ---------- */
  const [annualCTC, setAnnualCTC] = useState(0);
  const [basicPct, setBasicPct] = useState(50);
  const [hraPctOfBasic, setHraPctOfBasic] = useState(50);
  const [convMonthly, setConvMonthly] = useState(0);

  const salary = useMemo(() => {
    const toNum = (v) => (isNaN(+v) ? 0 : +v);
    const ctcYear = Math.max(0, toNum(annualCTC));
    const ctcMonth = ctcYear / 12;
    const basicM = ctcMonth * (toNum(basicPct) / 100);
    const hraM = basicM * (toNum(hraPctOfBasic) / 100);
    const convM = Math.max(0, toNum(convMonthly));
    const fixedM = Math.max(0, ctcMonth - (basicM + hraM + convM));
    const r2 = (n) => Math.round(n * 100) / 100;
    return {
      ctcMonth: r2(ctcMonth),
      ctcYear: r2(ctcYear),
      basic: { m: r2(basicM), y: r2(basicM * 12) },
      hra: { m: r2(hraM), y: r2(hraM * 12) },
      conv: { m: r2(convM), y: r2(convM * 12) },
      fixed: { m: r2(fixedM), y: r2(fixedM * 12) },
      totals: {
        m: r2(basicM + hraM + convM + fixedM),
        y: r2((basicM + hraM + convM + fixedM) * 12),
      },
    };
  }, [annualCTC, basicPct, hraPctOfBasic, convMonthly]);

  /* ---------- Step 3 (personal) ---------- */
  const [personal, setPersonal] = useState({
    dob: "",
    fatherName: "",
    pan: "",
    diffAbled: "None",
    personalEmail: "",
    addr1: "",
    addr2: "",
    city: "",
    state: "",
    pin: "",
  });
  const setP = (k) => (e) => setPersonal((p) => ({ ...p, [k]: e.target.value }));

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

  /* ---------- Step 4 (payment information) ---------- */
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [payError, setPayError] = useState(false);

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

  const finishWizard = () => setStep(5);

  const saveAndContinue = () => {
    if (step === 4) {
      if (!paymentMethod) {
        setPayError(true);
        return;
      }
      if (paymentMethod === "bank") {
        const required = [
          bank.holder,
          bank.bankName,
          bank.acc,
          bank.acc2,
          bank.ifsc,
          bank.type,
        ];
        if (required.some((v) => !String(v).trim()) || bank.acc !== bank.acc2) {
          setPayError(true);
          return;
        }
      }
      return finishWizard();
    }
    if (step < 4) next();
  };

  /* ---------- UI ---------- */
  return (
    <div className="py-4">
      {/* Heading + stepper */}
      <div className="mb-2 flex justify-center">
        <h1 className="text-[18px] font-semibold text-slate-800 text-center">
          {step === 5 ? "Priya's Profile" : "Add Employee"}
        </h1>
      </div>
      <div className="mb-4 flex justify-center">
        <div className="flex items-center gap-4">
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
                {i < steps.length - 1 && (
                  <div className="h-px w-8 bg-slate-200" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

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
                      location: "Head Office",
                      designation: "",
                      department: "Engineering",
                      enablePortal: false,
                      professionalTax: true,
                    });
                    setAnnualCTC(0);
                    setBasicPct(50);
                    setHraPctOfBasic(50);
                    setConvMonthly(0);
                    setPersonal({
                      dob: "",
                      fatherName: "",
                      pan: "",
                      diffAbled: "None",
                      personalEmail: "",
                      addr1: "",
                      addr2: "",
                      city: "",
                      state: "",
                      pin: "",
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
                      salarySettings: {
                        annualCTC,
                        basicPct,
                        hraPctOfBasic,
                        convMonthly,
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
            {/* STEP 1 */}
            {step === 1 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm text-slate-600">
                    Employee Name *
                  </label>
                  <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      className="input"
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
                      className="input"
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
                    className="input mt-1"
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
                    type="date"
                    className="input mt-1"
                    value={form.doj}
                    onChange={set("doj")}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    className="input mt-1"
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
                    value={form.mobile}
                    onChange={set("mobile")}
                    placeholder="+94 7X XXX XXXX"
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm text-slate-600">
                      Gender *
                    </label>
                    <select
                      className="input mt-1"
                      value={form.gender}
                      onChange={set("gender")}
                    >
                      <option value="">Select</option>
                      <option>Female</option>
                      <option>Male</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600">
                      Work Location *
                    </label>
                    <input
                      className="input mt-1"
                      value={form.location}
                      onChange={set("location")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600">
                      Designation *
                    </label>
                    <input
                      className="input mt-1"
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
                      className="input mt-1"
                      value={form.department}
                      onChange={set("department")}
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

                  <div className="border-t border-slate-200 pt-3 md:col-span-2">
                    <div className="text-sm font-medium text-slate-800">
                      Statutory Components
                    </div>
                    <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.professionalTax}
                        onChange={set("professionalTax")}
                      />
                      Professional Tax
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200">
                  <div className="grid items-center gap-3 p-4 sm:grid-cols-[1fr_auto_auto_1fr]">
                    <label className="text-sm text-slate-700">
                      Annual CTC *
                    </label>
                    <div className="grid grid-cols-[40px_1fr] gap-2">
                      <span className="grid place-items-center rounded-md border border-slate-200 bg-slate-50 text-slate-600">
                        ₹
                      </span>
                      <input
                        className="input"
                        inputMode="numeric"
                        value={annualCTC}
                        onChange={(e) => setAnnualCTC(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-slate-600 text-center">
                      per year
                    </span>
                  </div>
                  <div className="h-px w-full bg-slate-200" />
                  <div className="grid grid-cols-[2fr_1fr_1fr_80px] gap-3 px-4 py-2 text-xs font-medium text-slate-600">
                    <div>SALARY COMPONENTS</div>
                    <div>CALCULATION TYPE</div>
                    <div>MONTHLY AMOUNT</div>
                    <div className="text-right pr-2">ANNUAL</div>
                  </div>
                  <div className="px-4 pb-4">
                    <div className="py-2 text-sm font-semibold text-slate-800">
                      Earnings
                    </div>
                    <div className="grid grid-cols-[2fr_1fr_1fr_80px] gap-3 items-center py-2">
                      <div className="text-slate-700">Basic</div>
                      <div className="flex gap-2">
                        <input
                          className="input w-24"
                          inputMode="decimal"
                          value={basicPct}
                          onChange={(e) => setBasicPct(e.target.value)}
                          placeholder="50.00"
                        />
                        <span className="grid place-items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-sm text-slate-700">
                          % of CTC
                        </span>
                      </div>
                      <div className="text-slate-700">{salary.basic.m}</div>
                      <div className="text-right pr-2 text-slate-700">
                        {salary.basic.y}
                      </div>
                    </div>
                    <div className="grid grid-cols-[2fr_1fr_1fr_80px] gap-3 items-center py-2">
                      <div className="text-slate-700">House Rent Allowance</div>
                      <div className="flex gap-2">
                        <input
                          className="input w-24"
                          inputMode="decimal"
                          value={hraPctOfBasic}
                          onChange={(e) => setHraPctOfBasic(e.target.value)}
                          placeholder="50.00"
                        />
                        <span className="grid place-items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-sm text-slate-700">
                          % of Basic
                        </span>
                      </div>
                      <div className="text-slate-700">{salary.hra.m}</div>
                      <div className="text-right pr-2 text-slate-700">
                        {salary.hra.y}
                      </div>
                    </div>
                    <div className="grid grid-cols-[2fr_1fr_1fr_80px] gap-3 items-center py-2">
                      <div className="text-slate-700">Conveyance Allowance</div>
                      <div className="text-slate-600">Fixed amount</div>
                      <div>
                        <input
                          className="input"
                          inputMode="decimal"
                          value={convMonthly}
                          onChange={(e) => setConvMonthly(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="text-right pr-2 text-slate-700">
                        {salary.conv.y}
                      </div>
                    </div>
                    <div className="grid grid-cols-[2fr_1fr_1fr_80px] gap-3 items-center py-2">
                      <div className="text-slate-700">
                        Fixed Allowance{" "}
                        <span
                          className="text-slate-400"
                          title="Monthly CTC - sum of all other components"
                        >
                          ⓘ
                        </span>
                      </div>
                      <div className="text-slate-600">Fixed amount</div>
                      <div className="text-slate-700">{salary.fixed.m}</div>
                      <div className="text-right pr-2 text-slate-700">
                        {salary.fixed.y}
                      </div>
                    </div>
                    <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 flex items-center justify-between">
                      <span>Cost to Company</span>
                      <span>
                        ₹{salary.totals.m}{" "}
                        <span className="text-slate-500">/ month</span>
                        <span className="mx-2 text-slate-400">•</span>
                        ₹{salary.totals.y}{" "}
                        <span className="text-slate-500">/ year</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm text-slate-700">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      className="input mt-1"
                      value={personal.dob}
                      onChange={setP("dob")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700">Age</label>
                    <input
                      className="input mt-1 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                      value={age}
                      disabled
                      placeholder="—"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700">
                      Father&apos;s Name *
                    </label>
                    <input
                      className="input mt-1"
                      value={personal.fatherName}
                      onChange={setP("fatherName")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700">PAN</label>
                    <input
                      className="input mt-1"
                      placeholder="AAAAA0000A"
                      value={personal.pan}
                      onChange={setP("pan")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700">
                      Differently Abled Type
                    </label>
                    <select
                      className="input mt-1"
                      value={personal.diffAbled}
                      onChange={setP("diffAbled")}
                    >
                      <option>None</option>
                      <option>Blindness</option>
                      <option>Low vision</option>
                      <option>Hearing impairment</option>
                      <option>Loco-motor disability</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700">
                      Personal Email Address
                    </label>
                    <input
                      className="input mt-1"
                      placeholder="abc@xyz.com"
                      value={personal.personalEmail}
                      onChange={setP("personalEmail")}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-700">
                      Residential Address
                    </label>
                    <input
                      className="input mt-1"
                      placeholder="Address Line 1"
                      value={personal.addr1}
                      onChange={setP("addr1")}
                    />
                    <input
                      className="input mt-2"
                      placeholder="Address Line 2"
                      value={personal.addr2}
                      onChange={setP("addr2")}
                    />
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <input
                        className="input"
                        placeholder="City"
                        value={personal.city}
                        onChange={setP("city")}
                      />
                      <select
                        className="input"
                        value={personal.state}
                        onChange={setP("state")}
                      >
                        <option value="">State</option>
                        <option>Tamil Nadu</option>
                        <option>Karnataka</option>
                        <option>Maharashtra</option>
                        <option>Delhi</option>
                        <option>Kerala</option>
                        <option>Telangana</option>
                      </select>
                      <input
                        className="input"
                        placeholder="PIN Code"
                        inputMode="numeric"
                        value={personal.pin}
                        onChange={setP("pin")}
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
                                  className="input mt-1"
                                  value={bank.holder}
                                  onChange={setBankField("holder")}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-slate-700">
                                  Bank Name<span className="text-red-500">*</span>
                                </label>
                                <input
                                  className="input mt-1"
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
                                  className="input mt-1"
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
                                    bank.acc2 &&
                                      bank.acc !== bank.acc2 &&
                                      "border-red-300 focus:ring-red-200 focus:border-red-400"
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
                                  className="input mt-1"
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
                    <button className="btn-primary" onClick={saveAndContinue}>
                      Save and Continue
                    </button>
                    <button className="btn-ghost" onClick={finishWizard}>
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
.btn-primary{ @apply h-9 rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700; }
.btn-secondary{ @apply h-9 rounded-md border border-slate-200 bg-white px-3 text-sm hover:bg-slate-50; }
.btn-ghost{ @apply h-9 rounded-md px-3 text-sm text-slate-700 hover:bg-slate-100; }
.btn-outline{ @apply h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 hover:bg-slate-50; }
`;
if (typeof document !== "undefined" && !document.getElementById("emp-wiz-css")) {
  const tag = document.createElement("style");
  tag.id = "emp-wiz-css";
  tag.innerHTML = css;
  document.head.appendChild(tag);
}
