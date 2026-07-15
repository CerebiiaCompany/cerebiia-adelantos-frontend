import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChangePasswordForm } from "@/components/header/profile/ChangePasswordForm";
import { ProfileLogoutButton } from "@/components/header/profile/ProfileLogoutButton";
import { ROUTES } from "@/shared/config/routes";

export function ForcePasswordChangeForm() {
  const navigate = useNavigate();

  return (
    <div className="glass-card glow-border w-full max-w-[420px] overflow-hidden rounded-xl lg:mx-auto">
      <div className="space-y-4 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className="font-display text-xl font-bold text-foreground">
              Actualiza tu contraseña
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Por seguridad, en tu primer inicio de sesión debes cambiar la
              contraseña por defecto de la cuenta de empresa antes de continuar.
            </p>
          </div>
        </div>

        <ChangePasswordForm
          onSuccess={() => {
            navigate(ROUTES.employer.panel, { replace: true });
          }}
        />

        <ProfileLogoutButton className="-mx-6 mt-1 border-t border-border/60 sm:-mx-8" />

      </div>
    </div>
  );
}
