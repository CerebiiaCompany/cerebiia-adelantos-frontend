import { useMemo, useState } from "react";
import { Building2, Calendar, ClipboardList, Percent, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/features/auth";
import {
  EmployerAdvanceAdoptionCard,
  EmployerMetricStatCard,
  EmployerNominaDescuentosPanel,
  EmployerPanelUnavailableNotice,
  useEmpleadosMetricas,
  useEmployerCompanyAdvances,
  useEmployerConfig,
} from "@/features/employer-panel";
import { isSystemUserSession } from "@/shared/api";
import { useTimeBasedGreeting } from "@/hooks/useTimeBasedGreeting";
import { formatCOP } from "@/shared/lib";

function currentPeriodKey(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

function formatPeriodOptionLabel(periodKey: string): string {
  const [year, month] = periodKey.split("-").map(Number);
  if (!year || !month) return periodKey;
  const date = new Date(year, month - 1, 1);
  const label = date.toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function EmployerPanelPage() {
  const { session } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriodKey);

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
  const { data: advancesData } = useEmployerCompanyAdvances();

  const periodOptions = useMemo(() => {
    const months = new Set<string>();
    months.add(currentPeriodKey());

    (advancesData?.advances ?? []).forEach((adv) => {
      const startKey = adv.requestedAt?.slice(0, 7);
      if (startKey) months.add(startKey);

      if (Array.isArray(adv.cuotas)) {
        adv.cuotas.forEach((c) => {
          const cutKey = c.fecha_corte?.slice(0, 7);
          if (cutKey) months.add(cutKey);
        });
      }
    });

    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [advancesData?.advances]);

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
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          icon={Building2}
          title={greeting.title}
          description="Gestiona adelantos, empleados y solicitudes de tu empresa"
        />

        <div className="w-full shrink-0 sm:w-60">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="h-11 rounded-xl border-border/80 bg-background/80 shadow-sm">
              <div className="flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4 shrink-0 text-primary" />
                <SelectValue placeholder="Seleccionar periodo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((period) => (
                <SelectItem key={period} value={period}>
                  {formatPeriodOptionLabel(period)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:items-stretch">
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
          selectedPeriod={selectedPeriod}
          isLoadingMetricas={isLoadingMetricas}
          hasMetricasError={isMetricasError}
        />

        <div className="glass-card glow-border relative overflow-hidden flex h-full flex-col rounded-xl p-5 md:p-6">
          <Percent
            className="pointer-events-none absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-3 h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 text-primary/[0.04] dark:text-primary/[0.06]"
            strokeWidth={1.25}
            aria-hidden
          />

          <div className="relative mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reglas de adelanto
            </p>
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/5">
              <Percent className="h-4 w-4 text-primary" strokeWidth={2.25} />
            </span>
          </div>
          {isLoadingConfig ? (
            <div className="mt-auto space-y-2.5 py-1">
              <Skeleton className="h-4 w-44 rounded-md" />
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>
          ) : isConfigError || !adelantoConfig ? (
            <p className="text-xs sm:text-sm text-muted-foreground">
              Configuración global no disponible temporalmente.
            </p>
          ) : (
            <ul className="relative mt-auto space-y-1 sm:space-y-1.5 text-[11px] sm:text-sm text-foreground">
              <li>
                Tope:{" "}
                <span className="font-semibold">
                  {adelantoConfig.porcentajeMaximoAdelanto}%
                </span>{" "}
                salario
              </li>
              <li>
                Cuotas máx:{" "}
                <span className="font-semibold">
                  {adelantoConfig.numeroMaximoCuotas}
                </span>
              </li>
              <li>
                Tarifa/cuota:{" "}
                <span className="font-semibold">
                  {formatCOP(adelantoConfig.tarifaFijaPorCuota)}
                </span>
              </li>
              <li>
                Plazo máx:{" "}
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

      <EmployerNominaDescuentosPanel
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />
    </div>
  );
}

