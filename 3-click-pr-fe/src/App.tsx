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

  useEffect(() => {
    if (path === "/") {
      navigate(user ? "/admin" : "/auth/sign-in");
      return;
    }
    if (path.startsWith("/admin") && !user) {
      navigate("/auth/sign-in");
    }
  }, [path, user, navigate]);

  function renderRoute() {
    switch (path) {
      case "/auth/sign-in":
        return <SignIn />;
      case "/auth/forgot":
        return <ForgotPassword />;
      case "/auth/create-admin":
        return <CreateAdmin />;
      case "/admin":
        return <Dashboard />;
      default:
        return user ? <Dashboard /> : <SignIn />;
    }
  }

  return <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>{renderRoute()}</Suspense>;
}