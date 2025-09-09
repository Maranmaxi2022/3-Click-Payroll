import { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { id: string; email: string; name?: string; role?: "admin" | "user" };
type AuthState = { user: User | null; token: string | null };
type SignInInput = { email: string; password: string };
type RegisterInput = { name: string; email: string; password: string };
type AuthContextValue = AuthState & {
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  registerAdmin: (input: RegisterInput) => Promise<void>;
};

const AuthCtx = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Load session
  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    const u = localStorage.getItem(USER_KEY);
    if (t) setToken(t);
    if (u) setUser(JSON.parse(u));
  }, []);

  const API = import.meta.env.VITE_API_BASE_URL || "";

  async function signIn({ email, password }: SignInInput) {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(`Login failed (${res.status})`);
    const data = await res.json(); // expected: { token: string, user: User }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  function signOut() {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async function requestPasswordReset(email: string) {
    const res = await fetch(`${API}/auth/request-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error(`Reset request failed (${res.status})`);
  }

  async function registerAdmin(input: RegisterInput) {
    const res = await fetch(`${API}/auth/admin/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`Register failed (${res.status})`);
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, signIn, signOut, requestPasswordReset, registerAdmin }),
    [user, token]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
