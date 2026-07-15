import { Navigate } from "react-router-dom";
import {
  ForcePasswordChangeForm,
  useAuthAccess,
} from "@/features/auth";
import {
  AuthBrandPanel,
  AuthDefaultHeadline,
} from "@/features/auth/ui/AuthBrandPanel";
import { AuthPageShell } from "@/features/auth/ui/AuthPageShell";
import { AuthLoadingFallback } from "@/app/router/components/AuthLoadingFallback";
import { mustChangePassword } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";

export default function EmployerForcePasswordChangePage() {
  const { session, isInitializing } = useAuthAccess();

  if (isInitializing) {
    return <AuthLoadingFallback />;
  }

  if (!mustChangePassword(session)) {
    return <Navigate to={ROUTES.employer.panel} replace />;
  }

  return (
    <AuthPageShell
      brandPanel={
        <AuthBrandPanel
          title={<AuthDefaultHeadline />}
          description={
            <>
              Protege el acceso de tu organización actualizando la contraseña
              temporal asignada a tu cuenta.
            </>
          }
        />
      }
    >
      <ForcePasswordChangeForm />
    </AuthPageShell>
  );
}
