import { Navigate, Outlet } from "react-router-dom";
import { useAuthAccess } from "@/features/auth";
import { mustChangePassword } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { AuthLoadingFallback } from "@/app/router/components/AuthLoadingFallback";

/**
 * Bloquea el panel de empleador mientras la empresa deba cambiar
 * la contraseña por defecto (primer inicio de sesión).
 */
export function PasswordChangeRequiredGuard() {
  const { session, isInitializing } = useAuthAccess();

  if (isInitializing) {
    return <AuthLoadingFallback />;
  }

  if (mustChangePassword(session)) {
    return (
      <Navigate to={ROUTES.employer.changePasswordRequired} replace />
    );
  }

  return <Outlet />;
}
