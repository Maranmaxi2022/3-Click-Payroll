// src/features/workers/AddWorker.tsx
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useAuth } from "../../state/AuthContext";
import { useHashLocation } from "../../lib/useHashLocation";
import form from "../auth/Auth.module.css"; // reuse existing form styles

type WorkerType = "direct" | "contract" | "agent";
type EmploymentType = "full_time" | "part_time" | "contract";
type PayUnit = "hourly" | "salary" | "flat";

export default function AddWorker() {
  const { token } = useAuth();
  const { navigate } = useHashLocation();
  const API = import.meta.env.VITE_API_BASE_URL || "";

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [workerType, setWorkerType] = useState<WorkerType>("direct");
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [sin, setSin] = useState("");

  const [jobTitle, setJob] = useState("");
  const [department, setDept] = useState("");
  const [employmentType, setEmpType] = useState<EmploymentType>("full_time");
  const [payRate, setPayRate] = useState<string>(""); // store as string, parse on submit
  const [payUnit, setPayUnit] = useState<PayUnit>("hourly");

  // type-specific
  const [companyName, setCompanyName] = useState(""); // for contract/agent
  const [project, setProject] = useState("");
  const [agencyFee, setAgencyFee] = useState<string>("");

  const emailOk = email.length === 0 || /\S+@\S+\.\S+/.test(email);
  const requiredOk = firstName.trim().length > 0 && lastName.trim().length > 0;
  const payOk = payRate === "" || !isNaN(Number(payRate));
  const agencyFeeOk = agencyFee === "" || !isNaN(Number(agencyFee));
  const canSubmit = requiredOk && emailOk && payOk && agencyFeeOk;

  const title = useMemo(() => {
    if (workerType === "direct") return "Add Direct Employee";
    if (workerType === "contract") return "Add Contract Worker";
    return "Add Agent Worker";
  }, [workerType]);

  function prune<T extends Record<string, any>>(obj: T) {
    const out: Record<string, any> = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v === "" || v === undefined || v === null) return;
      out[k] = v;
    });
    return out;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || !canSubmit || busy) return;

    setMsg(null);
    setBusy(true);
    try {
      const body = prune({
        workerType,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        sin: sin.trim(),
        jobTitle: jobTitle.trim(),
        department: department.trim(),
        employmentType,
        payRate: payRate === "" ? undefined : Number(payRate),
        payUnit,
        companyName: companyName.trim(),
        project: project.trim(),
        agencyFee: agencyFee === "" ? undefined : Number(agencyFee),
      });

      const res = await fetch(`${API}/workers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Create worker failed (${res.status})`);
      setMsg({ type: "success", text: "Worker created." });
      // back to dashboard
      navigate("/admin", { replace: true });
    } catch (err) {
      setMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Create worker failed",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={form.page}>
      <div className={form.card}>
        <h1 className={form.title}>{title}</h1>
        <p className={form.muted}>Fill the details below.</p>

        <form className={form.form} onSubmit={onSubmit} noValidate>
          {/* Worker type */}
          <div className={form.row}>
            <div style={{ flex: 1 }}>
              <label className={form.label}>Worker Type</label>
              <select className={form.input} value={workerType} onChange={(e) => setWorkerType(e.target.value as WorkerType)}>
                <option value="direct">Direct employee</option>
                <option value="contract">Contract worker</option>
                <option value="agent">Agent worker</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className={form.label}>Employment Type</label>
              <select className={form.input} value={employmentType} onChange={(e) => setEmpType(e.target.value as EmploymentType)}>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          {/* Personal */}
          <div className={form.row}>
            <div style={{ flex: 1 }}>
              <label className={form.label}>First name*</label>
              <input className={form.input} value={firstName} onChange={(e) => setFirst(e.target.value)} required />
            </div>
            <div style={{ flex: 1 }}>
              <label className={form.label}>Last name*</label>
              <input className={form.input} value={lastName} onChange={(e) => setLast(e.target.value)} required />
            </div>
          </div>

          <div className={form.row}>
            <div style={{ flex: 1 }}>
              <label className={form.label}>Email</label>
              <input className={form.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              {!emailOk && <div className={form.muted}>Enter a valid email.</div>}
            </div>
            <div style={{ flex: 1 }}>
              <label className={form.label}>Phone</label>
              <input className={form.input} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={form.label}>Address</label>
            <input className={form.input} value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div>
            <label className={form.label}>SIN (optional)</label>
            <input className={form.input} value={sin} onChange={(e) => setSin(e.target.value)} />
          </div>

          {/* Employment */}
          <div className={form.row}>
            <div style={{ flex: 1 }}>
              <label className={form.label}>Job title</label>
              <input className={form.input} value={jobTitle} onChange={(e) => setJob(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label className={form.label}>Department</label>
              <input className={form.input} value={department} onChange={(e) => setDept(e.target.value)} />
            </div>
          </div>

          <div className={form.row}>
            <div style={{ flex: 1 }}>
              <label className={form.label}>Pay rate (CAD)</label>
              <input className={form.input} value={payRate} onChange={(e) => setPayRate(e.target.value)} inputMode="decimal" />
              {!payOk && <div className={form.muted}>Enter a number</div>}
            </div>
            <div style={{ flex: 1 }}>
              <label className={form.label}>Pay unit</label>
              <select className={form.input} value={payUnit} onChange={(e) => setPayUnit(e.target.value as PayUnit)}>
                <option value="hourly">Hourly</option>
                <option value="salary">Salary</option>
                <option value="flat">Flat</option>
              </select>
            </div>
          </div>

          {/* Type-specific */}
          {(workerType === "contract" || workerType === "agent") && (
            <div>
              <label className={form.label}>{workerType === "agent" ? "Agency / Company name" : "Company (optional)"}</label>
              <input className={form.input} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
          )}

          {workerType !== "direct" && (
            <div>
              <label className={form.label}>Project (optional)</label>
              <input className={form.input} value={project} onChange={(e) => setProject(e.target.value)} />
            </div>
          )}

          {workerType === "agent" && (
            <div>
              <label className={form.label}>Agency fee % (optional)</label>
              <input className={form.input} value={agencyFee} onChange={(e) => setAgencyFee(e.target.value)} inputMode="decimal" />
              {!agencyFeeOk && <div className={form.muted}>Enter a number</div>}
            </div>
          )}

          {msg && (
            <div role="alert" className={msg.type === "error" ? form.error : form.success}>
              {msg.text}
            </div>
          )}

          <div className={form.actions}>
            <button className={form.btn} type="submit" disabled={!token || busy || !canSubmit}>
              {busy ? "Saving…" : "Save Worker"}
            </button>
            <button className={`${form.btn} ${form.secondary}`} type="button" onClick={() => navigate("/admin", { replace: true })}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
