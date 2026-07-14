import { Building2, Percent, UserPlus, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth";
import {
  EmployerPanelUnavailableNotice,
  useEmpleadosMetricas,
  useEmployerConfig,
} from "@/features/employer-panel";
import { isSystemUserSession } from "@/shared/api";
import { useTimeBasedGreeting } from "@/hooks/useTimeBasedGreeting";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { formatCOP } from "@/shared/lib";
import { cn } from "@/lib/utils";

export default function EmployerPanelPage() {
  const { session } = useAuth();
  const {
    data: metricas,
    isLoading: isLoadingMetricas,
    isError: isMetricasError,
  } = useEmpleadosMetricas();
  const {
    data: adelantoConfig,
    isLoading: isLoadingConfig,
    isError: isConfigError,
  } = useEmployerConfig();

  const stats = [
    {
      label: "Empleados activos",
      value: metricas?.activos ?? 0,
      icon: Users,
      accent: "text-primary",
      isLoading: isLoadingMetricas,
      hasError: isMetricasError,
    },
    {
      label: "Usuarios pendientes por activarse",
      value: metricas?.pre_registrados ?? 0,
      icon: UserPlus,
      accent: "text-primary",
      isLoading: isLoadingMetricas,
      hasError: isMetricasError,
    },
  ] as const;

  const displayName =
    session && isSystemUserSession(session)
      ? session.user.full_name
      : "Administrador";
  const greeting = useTimeBasedGreeting(displayName);

  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
      <PageHeader
        icon={Building2}
        title={greeting.title}
        description="Gestiona adelantos, empleados y solicitudes de tu empresa"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass-card glow-border rounded-xl p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <stat.icon className={cn("h-4 w-4", stat.accent)} strokeWidth={2.25} />
            </div>
            {stat.isLoading ? (
              <Skeleton className="h-9 w-16 rounded-lg" />
            ) : stat.hasError ? (
              <p className="font-display text-3xl font-bold text-muted-foreground">
                —
              </p>
            ) : (
              <AnimatedNumber
                value={stat.value}
                className="font-display text-3xl font-bold text-foreground"
              />
            )}
          </div>
        ))}

        <div className="glass-card glow-border rounded-xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Reglas de adelanto
            </p>
            <Percent className="h-4 w-4 text-primary" strokeWidth={2.25} />
          </div>
          {isLoadingConfig ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-4 w-52 rounded-md" />
            </div>
          ) : isConfigError || !adelantoConfig ? (
            <p className="text-sm text-muted-foreground">
              Configuración global no disponible temporalmente.
            </p>
          ) : (
            <ul className="space-y-1.5 text-sm text-foreground">
              <li>
                Tope:{" "}
                <span className="font-semibold">
                  {adelantoConfig.porcentajeMaximoAdelanto}%
                </span>{" "}
                del salario
              </li>
              <li>
                Cuotas máximas:{" "}
                <span className="font-semibold">
                  {adelantoConfig.numeroMaximoCuotas}
                </span>
              </li>
              <li>
                Tarifa por cuota:{" "}
                <span className="font-semibold">
                  {formatCOP(adelantoConfig.tarifaFijaPorCuota)}
                </span>
              </li>
              <li>
                Plazo máximo:{" "}
                <span className="font-semibold">
                  {adelantoConfig.plazoMaximoDias} días
                </span>
              </li>
            </ul>
          )}
        </div>
      </div>

      {isMetricasError ? (
        <EmployerPanelUnavailableNotice
          layout="inline"
          message="Información de empleados no disponible temporalmente."
          description="Algunos indicadores del panel pueden mostrarse incompletos. Intenta de nuevo más tarde."
        />
      ) : null}

      <div className="glass-card glow-border rounded-xl p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Resumen operativo
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Bienvenido al panel de empresa. Desde aquí puedes auditar adelantos,
          supervisar cuotas de préstamos, consultar el libro contable y generar
          los reportes de retención para nómina. El monitoreo usa el historial
          oficial de solicitudes de plantilla.
        </p>
      </div>
    </div>
  );
}
