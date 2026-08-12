import { useMemo } from "react";
import { PieChart as PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Skeleton } from "@/components/ui/skeleton";
import { computeAdvanceAdoptionStats } from "@/features/employer-panel/model/advanceAdoption";
import { useEmployerCompanyAdvances } from "@/features/employer-panel/model/useEmployerAuditData";
import { cn } from "@/lib/utils";

const CHART_COLORS = {
  adopted: "url(#employer-advance-adoption-fill)",
  remaining: "hsl(var(--secondary))",
} as const;

type EmployerAdvanceAdoptionCardProps = {
  /** Total de empleados en nómina (desde métricas). */
  totalNomina: number;
  isLoadingMetricas?: boolean;
  hasMetricasError?: boolean;
  className?: string;
};

export function EmployerAdvanceAdoptionCard({
  totalNomina,
  isLoadingMetricas = false,
  hasMetricasError = false,
  className,
}: EmployerAdvanceAdoptionCardProps) {
  const advancesQuery = useEmployerCompanyAdvances();

  const stats = useMemo(() => {
    const empleados = advancesQuery.data?.empleados ?? [];
    const activeIds = new Set(
      empleados
        .filter((empleado) => empleado.estado !== "inactivo")
        .map((empleado) => empleado.id),
    );
    const ids = (advancesQuery.data?.advances ?? [])
      .map((advance) => advance.employeeId)
      .filter((id) => activeIds.size === 0 || activeIds.has(id));
    return computeAdvanceAdoptionStats(totalNomina, ids);
  }, [advancesQuery.data?.advances, advancesQuery.data?.empleados, totalNomina]);

  const chartData = useMemo(() => {
    if (stats.totalNomina <= 0) {
      return [{ name: "Sin datos", value: 1, key: "empty" as const }];
    }
    if (stats.conAdelanto <= 0) {
      return [{ name: "Sin adelanto", value: 1, key: "remaining" as const }];
    }
    if (stats.sinAdelanto <= 0) {
      return [{ name: "Con adelanto", value: 1, key: "adopted" as const }];
    }
    return [
      { name: "Con adelanto", value: stats.conAdelanto, key: "adopted" as const },
      {
        name: "Sin adelanto",
        value: stats.sinAdelanto,
        key: "remaining" as const,
      },
    ];
  }, [stats]);

  const isLoading = isLoadingMetricas || advancesQuery.isLoading;
  const hasError = hasMetricasError || advancesQuery.isError;

  return (
    <div className={cn("glass-card glow-border flex h-full flex-col rounded-xl p-5", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          Empleados con adelanto
        </p>
        <PieChartIcon className="h-4 w-4 text-primary" strokeWidth={2.25} />
      </div>

      {isLoading ? (
        <div className="flex items-center gap-4">
          <Skeleton className="h-[108px] w-[108px] shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
        </div>
      ) : hasError ? (
        <p className="text-sm text-muted-foreground">
          No pudimos calcular la adopción de adelantos por ahora.
        </p>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative h-[108px] w-[108px] shrink-0">
            <div
              className="pointer-events-none absolute inset-3 rounded-full bg-primary/10 blur-md"
              aria-hidden
            />
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient
                    id="employer-advance-adoption-fill"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop
                      offset="100%"
                      stopColor="hsl(260 70% 55%)"
                    />
                  </linearGradient>
                </defs>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={50}
                  paddingAngle={stats.conAdelanto > 0 && stats.sinAdelanto > 0 ? 4 : 0}
                  stroke="none"
                  cornerRadius={6}
                  isAnimationActive
                  animationDuration={900}
                  animationBegin={120}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={
                        entry.key === "adopted"
                          ? CHART_COLORS.adopted
                          : entry.key === "remaining"
                            ? CHART_COLORS.remaining
                            : "hsl(var(--muted))"
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <AnimatedNumber
                value={stats.porcentaje}
                suffix="%"
                className="font-display text-xl font-bold leading-none text-foreground"
              />
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-xs leading-snug text-muted-foreground">
              <span className="font-semibold text-foreground">
                <AnimatedNumber value={stats.conAdelanto} className="inline" />
                {" de "}
                <AnimatedNumber value={stats.totalNomina} className="inline" />
              </span>{" "}
              en nómina ya solicitaron
            </p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-gradient-primary"
                  aria-hidden
                />
                Con solicitud
              </li>
              <li className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-secondary ring-1 ring-border"
                  aria-hidden
                />
                Sin solicitud
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
