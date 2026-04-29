import { Navigate } from "react-router-dom";

/**
 * Simple client-side auth guard. Redirects unauthenticated visitors
 * back to the login screen. Replace with real session check when
 * wiring to a backend.
 */
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const user = typeof window !== "undefined" ? localStorage.getItem("shadowtrace_user") : null;
  if (!user) return <Navigate to="/" replace />;
  return children;
};

export default RequireAuth;
