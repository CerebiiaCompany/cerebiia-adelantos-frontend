import { RegisterValidationPendingContent } from "@/features/auth/ui/RegisterValidationPendingContent";
import { AuthBrandPanel } from "@/features/auth/ui/AuthBrandPanel";
import { AuthPageShell } from "@/features/auth/ui/AuthPageShell";

export default function RegisterValidationPendingPage() {
  return (
    <AuthPageShell
      brandPanel={
        <AuthBrandPanel
          title={
            <>
              Tu registro
              <br />
              está en revisión.
            </>
          }
          description={
            <>
              Validaremos tu información para habilitar tu acceso y tu cupo de
              crédito con total seguridad.
            </>
          }
        />
      }
    >
      <RegisterValidationPendingContent />
    </AuthPageShell>
  );
}
