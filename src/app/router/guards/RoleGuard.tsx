import { Navigate, Outlet } from "react-router-dom";

type Role = "employee" | "employer" | "admin";

interface RoleGuardProps {
  allowed: Role[];
}

// Placeholder — replace with real auth state from features/auth
export function RoleGuard({ allowed }: RoleGuardProps) {
  const currentRole: Role | null = null; // TODO: get from auth store

  if (!currentRole || !allowed.includes(currentRole)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
