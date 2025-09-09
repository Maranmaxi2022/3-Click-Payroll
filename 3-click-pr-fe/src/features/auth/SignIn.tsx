// src/features/auth/SignIn.tsx
import type { FormEvent } from "react";
import { useState } from "react";
import { useAuth } from "../../state/AuthContext";
import { useHashLocation } from "../../lib/useHashLocation";
import styles from "./Auth.module.css";

export default function SignIn() {
  const { signIn } = useAuth();
  const { navigate } = useHashLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const isValid = email.length > 3 && password.length >= 8;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid || busy) return;
    setMsg(null);
    setBusy(true);
    try {
      await signIn({ email: email.trim(), password });
      navigate("/admin");
    } catch (err) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Login failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Admin Sign-in</h1>
        <p className={styles.muted}>Access your payroll admin dashboard.</p>

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

          <div>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              autoComplete="current-password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {msg && (
            <div role="alert" className={msg.type === "error" ? styles.error : styles.success}>
              {msg.text}
            </div>
          )}

          <div className={styles.actions}>
            <button className={styles.btn} type="submit" disabled={busy || !isValid}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <div className={styles.linkRow}>
              <a className={styles.link} href="#/auth/forgot">Forgot password?</a>
              <a className={styles.link} href="#/auth/create-admin">Create admin account</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
