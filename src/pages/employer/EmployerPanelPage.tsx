import { Building2, ClipboardList, Percent, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth";
import {
  EmployerAdvanceAdoptionCard,
  EmployerMetricStatCard,
  EmployerNominaDescuentosPanel,
  EmployerPanelUnavailableNotice,
  useEmpleadosMetricas,
  useEmployerConfig,
} from "@/features/employer-panel";
import { isSystemUserSession } from "@/shared/api";
import { useTimeBasedGreeting } from "@/hooks/useTimeBasedGreeting";
import { formatCOP } from "@/shared/lib";

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

  const total = metricas?.total ?? 0;
  const activos = metricas?.activos ?? 0;
  const preRegistrados = metricas?.pre_registrados ?? 0;
  const inactivos = metricas?.inactivos ?? 0;
  const activosPct =
    total > 0 ? Math.round((activos / total) * 100) : 0;

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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:items-stretch">
        <EmployerMetricStatCard
          label="Empleados en nómina"
          value={total}
          icon={ClipboardList}
          isLoading={isLoadingMetricas}
          hasError={isMetricasError}
          hint="Planta completa registrada"
          segments={[
            { value: activos, tone: "primary" },
            { value: preRegistrados, tone: "warning" },
            { value: inactivos, tone: "muted" },
          ]}
          chips={[
            { label: "activos", value: activos, tone: "primary" },
            { label: "pendientes", value: preRegistrados, tone: "warning" },
            { label: "inactivos", value: inactivos, tone: "muted" },
          ]}
        />

        <EmployerMetricStatCard
          label="Empleados activos"
          value={activos}
          icon={Users}
          isLoading={isLoadingMetricas}
          hasError={isMetricasError}
          hint={
            total > 0
              ? `${activosPct}% de la nómina ya puede operar`
              : "Sin empleados en nómina"
          }
          segments={[
            { value: activos, tone: "primary" },
            { value: Math.max(0, total - activos), tone: "muted" },
          ]}
          chips={[
            {
              label: "por activar",
              value: preRegistrados,
              tone: "warning",
            },
            { label: "inactivos", value: inactivos, tone: "muted" },
          ]}
        />

        <EmployerAdvanceAdoptionCard
          totalNomina={total}
          isLoadingMetricas={isLoadingMetricas}
          hasMetricasError={isMetricasError}
        />

        <div className="glass-card glow-border flex h-full flex-col rounded-xl p-5">
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
            <ul className="mt-auto space-y-1.5 text-sm text-foreground">
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

      <EmployerNominaDescuentosPanel />
    </div>
  );
}
