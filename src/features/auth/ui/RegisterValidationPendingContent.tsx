import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegisterCard } from "@/features/auth/ui/RegisterCard";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/lib/utils";

export function RegisterValidationPendingContent() {
  const navigate = useNavigate();

  return (
    <div className="animate-scale-in w-full max-w-[480px] lg:mx-auto">
      <RegisterCard>
        <div
          className={cn(
            "animate-stagger-up stagger-1 relative overflow-hidden rounded-xl",
            "border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 px-4 py-4",
          )}
        >
          <div
            className="absolute inset-x-0 top-0 h-0.5 overflow-hidden"
            aria-hidden="true"
          >
            <div className="animate-shimmer h-full w-full opacity-80" />
          </div>

          <div
            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/15 blur-2xl animate-pulse-glow"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-accent/10 blur-xl animate-blob"
            aria-hidden="true"
          />

          <div className="relative flex items-center gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                "bg-primary/15 ring-2 ring-primary/20 shadow-sm",
                "animate-scale-in animate-pulse-glow",
              )}
            >
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Registro completado con éxito
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Hemos recibido tu información y la estamos procesando de forma
                segura.
              </p>
            </div>
          </div>
        </div>

        <div className="animate-stagger-up stagger-2 mt-8 space-y-6 text-left">
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-primary sm:text-[1.65rem]">
            Validación de identidad en proceso
          </h2>

          <div className="animate-stagger-up stagger-3 space-y-2">
            <h3 className="font-display text-base font-bold text-primary">
              Próximos pasos
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Te notificaremos el resultado en un plazo máximo de{" "}
              <span className="font-medium text-foreground">24 horas hábiles</span>
              . Si completas el registro durante el fin de semana, recibirás la
              respuesta el siguiente día hábil.
            </p>
          </div>

          <div className="animate-stagger-up stagger-4 space-y-2">
            <h3 className="font-display text-base font-bold text-primary">
              Información importante
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Una vez aprobada tu identidad, podrás acceder a la plataforma y
              solicitar tu cupo de crédito conforme a las condiciones
              disponibles para tu perfil.
            </p>
          </div>
        </div>

        <div className="animate-stagger-up stagger-5 mt-8">
          <Button
            type="button"
            onClick={() => navigate(ROUTES.login, { replace: true })}
            className="btn-login h-11 w-full rounded-xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-md transition-transform duration-300 hover:scale-[1.01]"
          >
            Ir al inicio de sesión
          </Button>
        </div>
      </RegisterCard>
    </div>
  );
}
