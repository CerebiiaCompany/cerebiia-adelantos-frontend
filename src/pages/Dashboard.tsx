import type { ReactNode } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Zap,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  AnimatedCurrency,
  AnimatedNumber,
} from "@/components/ui/animated-number";

const chartData = [
  { name: "Ene", ingresos: 4200000, adelantos: 800000 },
  { name: "Feb", ingresos: 4200000, adelantos: 1200000 },
  { name: "Mar", ingresos: 4500000, adelantos: 600000 },
  { name: "Abr", ingresos: 4500000, adelantos: 900000 },
  { name: "May", ingresos: 4800000, adelantos: 400000 },
  { name: "Jun", ingresos: 4800000, adelantos: 700000 },
];

const recentActivity = [
  {
    type: "adelanto",
    amount: -500000,
    date: "Hoy, 14:30",
    desc: "Adelanto rápido",
  },
  { type: "ingreso", amount: 4800000, date: "1 Abr", desc: "Nómina mensual" },
  {
    type: "adelanto",
    amount: -300000,
    date: "28 Mar",
    desc: "Adelanto parcial",
  },
  { type: "ingreso", amount: 4500000, date: "1 Mar", desc: "Nómina mensual" },
];

const formatCOP = (v: number) => `$${v.toLocaleString("es-CO")}`;

const ACTIVITY_STAGGER_MS = 120;
const ACTIVITY_COUNT_DURATION_MS = 650;
const ACTIVITY_COUNT_DELAY_OFFSET_MS = 100;

export default function Dashboard() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Hola, Erick 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu resumen financiero de hoy
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Disponible para adelanto"
          value={
            <AnimatedCurrency
              value={2400000}
              className="font-display text-2xl font-bold text-gradient"
            />
          }
          sub={
            <>
              de{" "}
              <AnimatedCurrency
                value={4800000}
                className="inline font-medium text-foreground"
                duration={700}
              />
            </>
          }
          icon={<Zap className="h-4 w-4" />}
          accent
        />
        <StatCard
          label="Ingresos acumulados"
          value={
            <AnimatedCurrency
              value={3200000}
              className="font-display text-2xl font-bold text-foreground"
            />
          }
          sub={
            <>
              +
              <AnimatedCurrency
                value={160000}
                className="inline font-medium text-primary"
                duration={700}
              />{" "}
              hoy
            </>
          }
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
        />
        <StatCard
          label="Total adelantado"
          value={
            <AnimatedCurrency
              value={500000}
              className="font-display text-2xl font-bold text-foreground"
            />
          }
          sub="este mes"
          icon={<ArrowDownRight className="h-4 w-4" />}
          trend="neutral"
        />
        <StatCard
          label="Próximo pago"
          value="15 Abr"
          sub={
            <>
              en <AnimatedNumber value={10} className="inline font-semibold" />{" "}
              días
            </>
          }
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="mb-4 font-display font-semibold text-foreground">
            Ingresos vs Adelantos
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(220, 90%, 55%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(220, 90%, 55%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorAdelantos" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(260, 70%, 55%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(260, 70%, 55%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
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
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 14%, 90%)",
                    borderRadius: "8px",
                    color: "hsl(220, 20%, 12%)",
                    fontSize: "12px",
                    boxShadow: "0 4px 24px hsl(220 40% 50% / 0.08)",
                  }}
                  formatter={(value: number) => [formatCOP(value), undefined]}
                />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke="hsl(220, 90%, 55%)"
                  fill="url(#colorIngresos)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="adelantos"
                  stroke="hsl(260, 70%, 55%)"
                  fill="url(#colorAdelantos)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="mb-4 font-display font-semibold text-foreground">
            Actividad reciente
          </h3>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div
                key={item.desc + item.date}
                className="animate-activity-item-enter flex items-center gap-3"
                style={{ animationDelay: `${i * ACTIVITY_STAGGER_MS}ms` }}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    item.type === "ingreso"
                      ? "bg-primary/10 text-primary"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {item.type === "ingreso" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.desc}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <AnimatedCurrency
                  value={Math.abs(item.amount)}
                  sign={item.amount > 0 ? "+" : "-"}
                  className={`text-sm font-semibold ${
                    item.amount > 0 ? "text-primary" : "text-foreground"
                  }`}
                  duration={ACTIVITY_COUNT_DURATION_MS}
                  delay={i * ACTIVITY_STAGGER_MS + ACTIVITY_COUNT_DELAY_OFFSET_MS}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card glow-border flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 animate-pulse-glow items-center justify-center rounded-xl bg-gradient-primary">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">
              ¿Necesitas dinero ahora?
            </h3>
            <p className="text-sm text-muted-foreground">
              Solicita un adelanto en segundos
            </p>
          </div>
        </div>
        <a
          href="/adelanto"
          className="rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Solicitar adelanto →
        </a>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
  trend,
}: {
  label: string;
  value: ReactNode;
  sub: ReactNode;
  icon: ReactNode;
  accent?: boolean;
  trend?: "up" | "neutral";
}) {
  return (
    <div className={`glass-card p-4 ${accent ? "glow-border" : ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            accent
              ? "bg-primary/15 text-primary"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {icon}
        </div>
      </div>
      <div
        className={`font-display text-2xl font-bold ${
          accent ? "text-gradient" : "text-foreground"
        } ${trend === "up" ? "text-primary" : ""}`}
      >
        {value}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
