import { useNavigate } from "react-router-dom";
import { Bell, CalendarClock, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegisterCard } from "@/features/auth/ui/RegisterCard";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/lib/utils";

const NEXT_STEPS = [
  {
    icon: Bell,
    title: "Te notificaremos el resultado",
    description: (
      <>
        Recibirás una respuesta en un plazo máximo de{" "}
        <span className="font-medium text-foreground">24 horas hábiles</span>{" "}
        por los canales de contacto que registraste.
      </>
    ),
  },
  {
    icon: CalendarClock,
    title: "Registros en fin de semana",
    description: (
      <>
        Si completas el registro durante el fin de semana, te contactaremos el{" "}
        <span className="font-medium text-foreground">siguiente día hábil</span>
        .
      </>
    ),
  },
  {
    icon: Sparkles,
    title: "Accede a tu cupo de crédito",
    description:
      "Una vez aprobada tu identidad, podrás ingresar a la plataforma y solicitar tu cupo conforme a las condiciones disponibles para tu perfil.",
  },
] as const;

const NEXT_STEP_DELAYS = [
  "next-step-delay-0",
  "next-step-delay-1",
  "next-step-delay-2",
] as const;

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

          <div className="animate-stagger-up stagger-3 space-y-4">
            <h3 className="font-display text-base font-bold text-primary">
              Próximos pasos
            </h3>

            <ol className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-muted/20 via-background to-primary/[0.04] p-4 sm:p-5">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.08),transparent_55%)]"
                aria-hidden="true"
              />

              <div
                className="pointer-events-none absolute left-[1.6875rem] top-[1.375rem] bottom-[1.375rem] w-1.5 overflow-hidden rounded-full bg-primary/10 sm:left-[1.8125rem]"
                aria-hidden="true"
              >
                <div className="animate-next-step-timeline relative h-full w-full rounded-full bg-gradient-to-b from-primary via-accent to-primary shadow-[0_0_12px_hsl(var(--primary)/0.25)]" />
                <div className="animate-next-step-timeline-glow absolute inset-x-0 top-0 h-1/3 rounded-full bg-gradient-to-b from-white/50 to-transparent" />
              </div>

              {NEXT_STEPS.map(({ icon: Icon, title, description }, index) => (
                <li
                  key={title}
                  className={cn(
                    "animate-next-step-reveal relative flex gap-3 sm:gap-4",
                    NEXT_STEP_DELAYS[index],
                    index < NEXT_STEPS.length - 1 && "pb-4 sm:pb-5",
                  )}
                >
                  <div
                    className={cn(
                      "animate-next-step-node relative z-[1] flex shrink-0 flex-col items-center",
                      NEXT_STEP_DELAYS[index],
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full",
                        "border-2 border-primary/30 bg-background",
                        "text-sm font-bold text-primary",
                        "shadow-[0_4px_14px_hsl(var(--primary)/0.18)]",
                        "ring-4 ring-primary/10",
                      )}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                  </div>

                  <div
                    className={cn(
                      "min-w-0 flex-1 rounded-xl border border-border/60",
                      "bg-background/80 p-3.5 shadow-sm backdrop-blur-[1px]",
                      "transition-all duration-300 hover:border-primary/25 hover:shadow-md",
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/15">
                        <Icon
                          className="h-4 w-4 text-primary"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-snug text-foreground">
                          {title}
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {description}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="animate-stagger-up stagger-6 mt-8">
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
