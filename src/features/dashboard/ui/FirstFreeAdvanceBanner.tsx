import { ArrowRight, Info, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { primaryActionButtonClassName } from "@/components/ui/primary-action-button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/shared/config/routes";
import { WelcomeGift3D } from "./WelcomeGift3D";

type FirstFreeAdvanceBannerProps = {
  className?: string;
};

/**
 * Aviso para empleados nuevos con beneficio de primera cuota sin comisión.
 * Tipografía alineada al panel empresa (PageHeader + PrimaryActionButton).
 */
export function FirstFreeAdvanceBanner({
  className,
}: FirstFreeAdvanceBannerProps) {
  return (
    <aside
      className={cn(
        "welcome-reward-banner relative overflow-hidden rounded-xl",
        "border border-primary/10",
        "bg-[linear-gradient(118deg,hsl(190_55%_96%)_0%,hsl(220_60%_97%)_42%,hsl(40_40%_99%)_100%)]",
        "shadow-[0_10px_32px_-8px_rgba(37,99,235,0.14),0_2px_8px_-2px_rgba(15,23,42,0.06)]",
        "animate-fade-in",
        className,
      )}
      aria-label="Recompensa de bienvenida: adelanto sin comisión"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 p-5 lg:flex-row lg:items-center lg:gap-10 lg:px-6 lg:py-5">
        <div className="flex min-w-0 flex-1 items-start gap-4 sm:items-center sm:gap-5">
          <WelcomeGift3D className="mx-auto shrink-0 sm:mx-0" />

          <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
              <Sparkles className="h-3 w-3 text-amber-500" strokeWidth={2.25} />
              Recompensa de bienvenida
            </span>

            <div className="space-y-1.5">
              <h2 className="font-display text-2xl font-bold leading-tight text-foreground">
                ¡Tu primer adelanto va por nuestra cuenta!
              </h2>
              <p className="text-sm text-muted-foreground">
                Recibe el{" "}
                <span className="font-semibold text-foreground">
                  100% de tu dinero
                </span>{" "}
                hoy. Tu primera cuota es totalmente libre de comisiones.
                <span
                  className="ml-1.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground align-text-bottom"
                  title="En 1 cuota no hay comisión. Con 2 o más, solo la primera es gratis; las siguientes sí aplican la comisión configurada."
                >
                  <Info className="h-2.5 w-2.5" strokeWidth={2.5} />
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-5 border-t border-primary/10 pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:w-auto lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <Link
            to={`${ROUTES.employee.logros}#logro-primera_vez`}
            className="flex min-w-0 items-center gap-3.5 transition-opacity hover:opacity-90"
            title="Ver logro Primera vez en Logros"
          >
            <div className="relative shrink-0">
              <img
                src="/images/badge-copa.svg"
                alt=""
                className="h-12 w-12 object-contain drop-shadow-[0_4px_10px_rgba(75,111,255,0.35)] sm:h-[3.25rem] sm:w-[3.25rem]"
                draggable={false}
              />
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[hsl(220_25%_22%)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                Nivel 1
              </span>
            </div>

            <div className="min-w-[11rem] flex-1 space-y-1.5 text-left">
              <p className="text-sm font-medium text-foreground">
                Nivel 1: Nuevo usuario{" "}
                <span className="text-muted-foreground">(0/1 adelantos)</span>
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-[8%] rounded-full bg-gradient-primary" />
              </div>
            </div>
          </Link>

          <div className="flex shrink-0 flex-col items-center gap-1.5 sm:items-end">
            <Link
              to={ROUTES.employee.adelanto}
              className={cn(
                primaryActionButtonClassName,
                "h-11 w-full px-4 text-sm sm:w-auto",
              )}
            >
              Reclamar mi adelanto gratis
              <ArrowRight className="btn-arrow h-4 w-4 shrink-0" />
            </Link>
            <p className="text-xs text-muted-foreground">
              Solo en tu primer adelanto · insignia en Logros
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
