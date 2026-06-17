import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyAdvanceChartPoint } from "@/features/advance/utils/aggregateAdvanceHistoryByMonth";

const CHART_COLORS = {
  primary: "hsl(220, 90%, 55%)",
  accent: "hsl(260, 70%, 55%)",
  barMuted: "hsl(220, 14%, 88%)",
  ghost: "hsl(220, 14%, 94%)",
} as const;

const formatCOP = (value: number) => `$${value.toLocaleString("es-CO")}`;

type AdvanceMonthlyChartProps = {
  data: MonthlyAdvanceChartPoint[];
  title?: string;
  hint?: string;
  className?: string;
};

export function AdvanceMonthlyChart({
  data,
  title = "Adelantos por mes",
  hint = "Barras apiladas: adelantado vs límite mensual",
  className,
}: AdvanceMonthlyChartProps) {
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  const chartData = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        utilizacion: Math.round((point.adelantos / point.limite) * 100),
      })),
    [data],
  );

  if (chartData.length === 0) {
    return (
      <div className={`glass-card p-5 text-center ${className ?? ""}`}>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          No hay adelantos aprobados para mostrar en el gráfico.
        </p>
      </div>
    );
  }

  return (
    <div className={`glass-card p-5 ${className ?? ""}`}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>

      <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-none bg-gradient-to-b from-[hsl(220,90%,55%)] to-[hsl(260,70%,55%)]"
            aria-hidden
          />
          Adelantado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-none bg-[hsl(220,14%,94%)]"
            aria-hidden
          />
          Disponible del límite
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barCategoryGap="22%"
            margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
            onMouseLeave={() => setActiveBarIndex(null)}
          >
            <defs>
              <linearGradient id="advanceMonthBarActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.primary} />
                <stop offset="100%" stopColor={CHART_COLORS.accent} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 6"
              vertical={false}
              stroke="hsl(220, 14%, 92%)"
            />
            <XAxis
              dataKey="name"
              stroke="hsl(220, 10%, 70%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(220, 10%, 70%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1_000_000).toFixed(1)}M`}
            />
            <Tooltip
              cursor={false}
              contentStyle={{
                background: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(220, 14%, 90%)",
                borderRadius: "12px",
                color: "hsl(220, 20%, 12%)",
                fontSize: "12px",
                boxShadow: "0 8px 28px hsl(220 40% 50% / 0.12)",
              }}
              itemStyle={{ color: "hsl(220, 20%, 12%)" }}
              labelStyle={{ color: "hsl(220, 20%, 12%)", fontWeight: 600 }}
              formatter={(value: number, key) => {
                if (key === "adelantos") return [formatCOP(value), "Adelantado"];
                if (key === "disponible") return [formatCOP(value), "Disponible"];
                return [formatCOP(value), key];
              }}
              labelFormatter={(label, payload) => {
                const point = payload?.[0]?.payload as
                  | (MonthlyAdvanceChartPoint & { utilizacion: number })
                  | undefined;
                if (!point) return label;
                return `${label} · ${point.utilizacion}% del límite · ${point.count} ${point.count === 1 ? "adelanto" : "adelantos"}`;
              }}
            />
            <Bar
              dataKey="adelantos"
              stackId="month"
              radius={[0, 0, 4, 4]}
              maxBarSize={52}
              isAnimationActive
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.sortKey}
                  fill={
                    activeBarIndex === index
                      ? "url(#advanceMonthBarActive)"
                      : CHART_COLORS.barMuted
                  }
                  className="cursor-pointer transition-[fill] duration-300 ease-out"
                  onMouseEnter={() => setActiveBarIndex(index)}
                />
              ))}
            </Bar>
            <Bar
              dataKey="disponible"
              stackId="month"
              radius={[10, 10, 0, 0]}
              fill={CHART_COLORS.ghost}
              maxBarSize={52}
              isAnimationActive
              animationDuration={900}
              animationBegin={100}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`${entry.sortKey}-disponible`}
                  fill={CHART_COLORS.ghost}
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveBarIndex(index)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
