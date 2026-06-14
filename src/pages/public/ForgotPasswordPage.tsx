import { ForgotPasswordForm } from "@/features/auth/ui/ForgotPasswordForm";
import { AuthBrandPanel } from "@/features/auth/ui/AuthBrandPanel";
import { AuthPageShell } from "@/features/auth/ui/AuthPageShell";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      brandPanel={
        <AuthBrandPanel
          title={
            <>
              Recupera tu
              <br />
              acceso seguro.
            </>
          }
          description={
            <>
              Te ayudamos a restablecer tu contraseña con un proceso verificado,
              rápido y protegido para tu tranquilidad.
            </>
          }
        />
      }
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
