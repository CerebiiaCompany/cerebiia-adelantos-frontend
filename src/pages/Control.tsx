import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  Banknote,
  ChartPie,
  Lightbulb,
  LineChart,
  Sparkles,
} from "lucide-react";
import {
  AnimatedCurrency,
  AnimatedPercent,
} from "@/components/ui/animated-number";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

const formatCOP = (v: number) => `$${v.toLocaleString("es-CO")}`;

const CHART_COLORS = {
  primary: "hsl(220, 90%, 55%)",
  accent: "hsl(260, 70%, 55%)",
  barMuted: "hsl(220, 14%, 88%)",
} as const;

const monthlyData = [
  { name: "Ene", adelantos: 800000, limite: 2400000 },
  { name: "Feb", adelantos: 1200000, limite: 2400000 },
  { name: "Mar", adelantos: 600000, limite: 2250000 },
  { name: "Abr", adelantos: 500000, limite: 2400000 },
];

const USED_PERCENT = 21;
const USED_AMOUNT = 500000;
const LIMIT_DYNAMIC = 2400000;
const NEXT_PAYMENT = 4300000;

export default function Control() {
  const animatedPercent = useAnimatedNumber(USED_PERCENT, { duration: 1000 });
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl animate-fade-in space-y-6">
      <PageHeader
        icon={LineChart}
        title="Control de uso"
        description="Monitorea tus adelantos y límites"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="group/control-stat glass-card flex flex-col items-center p-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <span className="control-icon-shine mb-3 inline-flex text-primary control-icon-motion-pie">
            <ChartPie className="h-6 w-6" strokeWidth={2.25} />
          </span>
          <div className="relative mb-3 h-24 w-24">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="hsl(220, 14%, 90%)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="url(#controlDonutGradient)"
                strokeWidth="8"
                strokeDasharray={`${animatedPercent * 2.64} 264`}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient
                  id="controlDonutGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={CHART_COLORS.primary} />
                  <stop offset="100%" stopColor={CHART_COLORS.accent} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatedPercent
                value={USED_PERCENT}
                className="font-display text-2xl font-bold text-foreground"
              />
            </div>
          </div>
          <p className="text-sm font-medium text-foreground">
            Utilizado este mes
          </p>
          <p className="text-xs text-muted-foreground">
            <AnimatedCurrency
              value={USED_AMOUNT}
              className="inline font-medium text-foreground"
              duration={800}
            />{" "}
            de{" "}
            <AnimatedCurrency
              value={LIMIT_DYNAMIC}
              className="inline font-medium text-foreground"
              duration={900}
            />
          </p>
        </div>

        <div className="group/control-stat glass-card flex flex-col items-center p-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <span className="control-icon-shine mb-3 inline-flex text-primary control-icon-motion-sparkles">
            <Sparkles className="h-6 w-6" strokeWidth={2.25} />
          </span>
          <AnimatedCurrency
            value={LIMIT_DYNAMIC}
            className="font-display text-2xl font-bold text-gradient"
          />
          <p className="mt-1 text-sm text-muted-foreground">Límite dinámico</p>
          <p className="mt-1 text-xs text-primary">
            +
            <AnimatedCurrency
              value={150000}
              className="inline"
              duration={800}
            />{" "}
            vs mes anterior
          </p>
        </div>

        <div className="group/control-stat glass-card flex flex-col items-center p-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <span className="control-icon-shine mb-3 inline-flex text-[hsl(260_70%_50%)] control-icon-motion-banknote">
            <Banknote className="h-6 w-6" strokeWidth={2.25} />
          </span>
          <AnimatedCurrency
            value={NEXT_PAYMENT}
            className="font-display text-2xl font-bold text-foreground"
          />
          <p className="mt-1 text-sm text-muted-foreground">Próximo pago neto</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Descontando adelantos
          </p>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-display font-semibold text-foreground">
            Historial de adelantos
          </h3>
          <p className="text-xs text-muted-foreground">
            Pasa el cursor sobre una barra para ver el detalle
          </p>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              barGap={4}
              margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
              onMouseLeave={() => setActiveBarIndex(null)}
            >
              <defs>
                <linearGradient id="controlBarActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.primary} />
                  <stop offset="100%" stopColor={CHART_COLORS.accent} />
                </linearGradient>
                <linearGradient id="controlBarGhost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(220, 14%, 94%)" />
                  <stop offset="100%" stopColor="hsl(220, 14%, 88%)" />
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
                tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                cursor={{ fill: "hsl(220, 90%, 55% / 0.06)", radius: 8 }}
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 14%, 90%)",
                  borderRadius: "12px",
                  color: "hsl(220, 20%, 12%)",
                  fontSize: "12px",
                  boxShadow: "0 8px 28px hsl(220 40% 50% / 0.12)",
                }}
                formatter={(value: number) => [formatCOP(value), "Adelantos"]}
              />
              <ReferenceLine
                y={2400000}
                stroke="hsl(260, 70%, 55%)"
                strokeDasharray="6 4"
                strokeOpacity={0.35}
              />
              <Bar
                dataKey="limite"
                fill="url(#controlBarGhost)"
                radius={[10, 10, 4, 4]}
                barSize={44}
                isAnimationActive
                animationDuration={700}
              />
              <Bar
                dataKey="adelantos"
                radius={[10, 10, 4, 4]}
                barSize={30}
                isAnimationActive
                animationDuration={900}
                animationBegin={120}
              >
                {monthlyData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={
                      activeBarIndex === index
                        ? "url(#controlBarActive)"
                        : CHART_COLORS.barMuted
                    }
                    className="cursor-pointer transition-[fill] duration-300 ease-out"
                    onMouseEnter={() => setActiveBarIndex(index)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="group/control-tip glass-card flex items-start gap-3 border-primary/15 p-4 transition-all duration-300 hover:border-primary/25 hover:shadow-md">
        <span className="control-icon-shine inline-flex shrink-0 text-primary control-icon-motion-tip">
          <Lightbulb className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">Consejo financiero</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Estás usando solo el{" "}
            <AnimatedPercent
              value={USED_PERCENT}
              className="inline font-medium text-foreground"
              duration={800}
            />{" "}
            de tu límite este mes. ¡Excelente control financiero! Tu límite puede
            aumentar el próximo mes.
          </p>
        </div>
      </div>
    </div>
  );
}
