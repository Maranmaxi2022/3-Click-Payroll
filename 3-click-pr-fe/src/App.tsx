// src/App.tsx
import { Suspense, lazy, useEffect } from "react";
import { useHashLocation } from "./lib/useHashLocation";
import { useAuth } from "./state/AuthContext";

const Dashboard = lazy(() => import("./features/dashboard/Dashboard"));
const SignIn = lazy(() => import("./features/auth/SignIn"));
const ForgotPassword = lazy(() => import("./features/auth/ForgotPassword"));
const CreateAdmin = lazy(() => import("./features/auth/CreateAdmin"));

export default function App() {
  const { path, navigate } = useHashLocation();
  const { user } = useAuth();

  const safeNav = (to: string, opts?: { replace?: boolean }) => {
    if (path !== to) navigate(to, opts);
  };

  useEffect(() => {
    if (path === "/") {
      safeNav(user ? "/admin" : "/auth/sign-in", { replace: true });
      return;
    }
    if (path.startsWith("/admin") && !user) {
      safeNav("/auth/sign-in", { replace: true });
      return;
    }
    if (path.startsWith("/auth") && user) {
      safeNav("/admin", { replace: true });
      return;
    }
  }, [path, user]);

  function renderRoute() {
    switch (path) {
      case "/auth/sign-in":
        return <SignIn />;
      case "/auth/forgot":
        return <ForgotPassword />;
      case "/auth/create-admin":
        return <CreateAdmin />;
      case "/admin":
        return <Dashboard initialTab="overview" />;
      case "/admin/workers/new":
        return <Dashboard initialTab="add" />;
      case "/admin/import":
        return <Dashboard initialTab="import" />;
      case "/admin/payslips":
        return <Dashboard initialTab="payslips" />;
      case "/admin/tax":
        return <Dashboard initialTab="tax" />;

      default:
        return user ? <Dashboard initialTab="overview" /> : <SignIn />;
    }
  }

  return <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>{renderRoute()}</Suspense>;
}
