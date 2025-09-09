// src/features/auth/ForgotPassword.tsx
import type { FormEvent } from "react";
import { useState } from "react";
import { useAuth } from "../../state/AuthContext";
import styles from "./Auth.module.css";

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const isValid = /\S+@\S+\.\S+/.test(email);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid || busy) return;
    setMsg(null);
    setBusy(true);
    try {
      await requestPasswordReset(email.trim());
      setMsg({ type: "success", text: "If that email exists, a reset link has been sent." });
    } catch (err) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Request failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Forgot password</h1>
        <p className={styles.muted}>We’ll email you a reset link.</p>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {msg && (
            <div role="alert" className={msg.type === "error" ? styles.error : styles.success}>
              {msg.text}
            </div>
          )}

          <div className={styles.actions}>
            <button className={styles.btn} type="submit" disabled={busy || !isValid}>
              {busy ? "Sending…" : "Send reset link"}
            </button>
            <a className={styles.link} href="#/auth/sign-in">Back to sign-in</a>
          </div>
        </form>
      </div>
    </div>
  );
}
