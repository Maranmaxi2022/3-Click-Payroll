// src/features/auth/CreateAdmin.tsx
import type { FormEvent } from "react";
import { useState } from "react";
import { useAuth } from "../../state/AuthContext";
import styles from "./Auth.module.css";

export default function CreateAdmin() {
  const { registerAdmin } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const emailOk = /\S+@\S+\.\S+/.test(email);
  const passOk = password.length >= 8;
  const matchOk = password === confirm;
  const nameOk = name.trim().length >= 2;
  const canSubmit = emailOk && passOk && matchOk && nameOk;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setMsg(null);
    setBusy(true);
    try {
      await registerAdmin({ name: name.trim(), email: email.trim(), password });
      setMsg({ type: "success", text: "Admin created. You can sign in now." });
      // Optional: clear form
      setPassword("");
      setConfirm("");
    } catch (err) {
      setMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Create admin failed",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create admin account</h1>
        <p className={styles.muted}>Creates the first admin for your organization.</p>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="name" className={styles.label}>Full name</label>
            <input
              id="name"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.row}>
            <div style={{ flex: 1 }}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                id="password"
                className={styles.input}
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="confirm" className={styles.label}>Confirm</label>
              <input
                id="confirm"
                className={styles.input}
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
                required
              />
            </div>
          </div>

          {!passOk && password.length > 0 && (
            <div className={styles.muted}>Password must be at least 8 characters.</div>
          )}
          {!matchOk && confirm.length > 0 && (
            <div className={styles.muted}>Passwords do not match.</div>
          )}

          {msg && (
            <div role="alert" className={msg.type === "error" ? styles.error : styles.success}>
              {msg.text}
            </div>
          )}

          <div className={styles.actions}>
            <button className={styles.btn} type="submit" disabled={busy || !canSubmit}>
              {busy ? "Creating…" : "Create admin"}
            </button>
            <a className={styles.link} href="#/auth/sign-in">Back to sign-in</a>
          </div>
        </form>
      </div>
    </div>
  );
}
