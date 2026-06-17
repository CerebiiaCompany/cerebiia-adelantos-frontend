import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { PageHeader } from "@/components/layout/PageHeader";
import { PayrollCalendarDialog } from "@/features/dashboard/ui/PayrollCalendarDialog";
import { PayrollCalendarFab } from "@/features/dashboard/ui/PayrollCalendarFab";
import { useTimeBasedGreeting } from "@/hooks/useTimeBasedGreeting";
import { DEMO_EMPLOYEE_PROFILE } from "@/shared/config/demoEmployeeProfile";
import {
  getDaysUntilPayment,
  getNextPaymentDate,
} from "@/shared/config/payrollCalendar";
import { ROUTES } from "@/shared/config/routes";
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

const CHART_COLORS = {
  ingresos: "hsl(220, 90%, 55%)",
  adelantos: "hsl(260, 70%, 55%)",
} as const;

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
  const navigate = useNavigate();
  const greeting = useTimeBasedGreeting(DEMO_EMPLOYEE_PROFILE.fullName);
  const [payrollCalendarOpen, setPayrollCalendarOpen] = useState(false);

  const nextPayment = useMemo(() => getNextPaymentDate(), []);
  const daysUntilPayment = useMemo(() => getDaysUntilPayment(), []);
  const nextPaymentLabel = useMemo(
    () =>
      nextPayment.toLocaleDateString("es-CO", {
        day: "numeric",
        month: "short",
      }),
    [nextPayment],
  );

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        icon={greeting.icon}
        title={greeting.title}
        description={greeting.description}
        iconContainerClassName={greeting.iconContainerClassName}
        iconClassName={greeting.iconClassName}
        iconAnimationClassName={greeting.iconAnimationClassName}
      />

      <PayrollCalendarFab
        onClick={() => setPayrollCalendarOpen(true)}
        daysUntilPayment={daysUntilPayment}
      />

      <PayrollCalendarDialog
        open={payrollCalendarOpen}
        onOpenChange={setPayrollCalendarOpen}
      />

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
          icon={<Zap className="h-5 w-5" strokeWidth={2.25} />}
          iconMotion="zap"
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
          icon={<TrendingUp className="h-5 w-5" strokeWidth={2.25} />}
          iconMotion="trend-up"
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
          icon={<ArrowDownRight className="h-5 w-5" strokeWidth={2.25} />}
          iconMotion="withdraw"
          trend="neutral"
        />
        <StatCard
          label="Próximo pago"
          value={nextPaymentLabel}
          sub={
            <>
              en{" "}
              <AnimatedNumber
                value={daysUntilPayment}
                className="inline font-semibold"
              />{" "}
              días
            </>
          }
          icon={<Calendar className="h-5 w-5" strokeWidth={2.25} />}
          iconMotion="calendar"
          iconMotionAlways
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-display font-semibold text-foreground">
              Ingresos vs Adelantos
            </h3>
            <div className="flex flex-wrap items-center gap-4">
              <ChartLegendItem
                color={CHART_COLORS.ingresos}
                label="Ingresos"
              />
              <ChartLegendItem
                color={CHART_COLORS.adelantos}
                label="Adelantos"
              />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={CHART_COLORS.ingresos}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_COLORS.ingresos}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorAdelantos" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={CHART_COLORS.adelantos}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_COLORS.adelantos}
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
                  formatter={(value: number, name: string) => [
                    formatCOP(value),
                    name === "ingresos" ? "Ingresos" : "Adelantos",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  name="ingresos"
                  stroke={CHART_COLORS.ingresos}
                  fill="url(#colorIngresos)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="adelantos"
                  name="adelantos"
                  stroke={CHART_COLORS.adelantos}
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
                className="group/activity-item animate-activity-item-enter flex items-center gap-3 rounded-lg px-1 py-0.5 transition-colors hover:bg-secondary/30"
                style={{ animationDelay: `${i * ACTIVITY_STAGGER_MS}ms` }}
              >
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center",
                    item.type === "ingreso"
                      ? "text-primary activity-icon-motion-ingreso"
                      : "text-[hsl(260_70%_50%)] activity-icon-motion-adelanto",
                  )}
                >
                  {item.type === "ingreso" ? (
                    <ArrowUpRight className="h-5 w-5" strokeWidth={2.25} />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" strokeWidth={2.25} />
                  )}
                </span>
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

      <div className="glass-card glow-border shine-hover flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
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
        <PrimaryActionButton
          className="shrink-0 px-6 py-3 text-sm"
          onClick={() => navigate(ROUTES.employee.adelanto)}
        >
          Solicitar adelanto
        </PrimaryActionButton>
      </div>
    </div>
  );
}

function ChartLegendItem({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-3 w-3 shrink-0 rounded-sm shadow-sm"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
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
  onIconClick,
  iconAriaLabel,
  iconMotion,
  iconMotionAlways,
}: {
  label: string;
  value: ReactNode;
  sub: ReactNode;
  icon: ReactNode;
  accent?: boolean;
  trend?: "up" | "neutral";
  onIconClick?: () => void;
  iconAriaLabel?: string;
  iconMotion?: "zap" | "trend-up" | "withdraw" | "calendar";
  iconMotionAlways?: boolean;
}) {
  const motionStyles: Record<
    NonNullable<typeof iconMotion>,
    { color: string; icon: string }
  > = {
    zap: {
      color: "text-primary",
      icon: "stat-card-icon-motion-zap",
    },
    "trend-up": {
      color: "text-primary",
      icon: "stat-card-icon-motion-trend-up",
    },
    withdraw: {
      color: "text-[hsl(260_70%_50%)]",
      icon: "stat-card-icon-motion-withdraw",
    },
    calendar: {
      color: "text-primary",
      icon: "stat-card-icon-motion-calendar",
    },
  };

  const motionConfig = iconMotion ? motionStyles[iconMotion] : null;

  const iconWrapperClass = cn(
    "flex shrink-0 items-center justify-center transition-opacity duration-300",
    motionConfig?.color ??
      (accent ? "text-primary" : "text-muted-foreground"),
    onIconClick &&
      "cursor-pointer rounded-sm hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
  );

  const iconContent = (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        motionConfig?.icon,
        iconMotionAlways && motionConfig && "stat-card-icon-motion-always",
      )}
    >
      {icon}
    </span>
  );

  return (
    <div
      className={cn(
        "glass-card group/stat-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        accent && "glow-border",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {onIconClick ? (
          <button
            type="button"
            onClick={onIconClick}
            aria-label={iconAriaLabel ?? "Abrir detalle"}
            className={iconWrapperClass}
          >
            {iconContent}
          </button>
        ) : (
          <div className={iconWrapperClass}>{iconContent}</div>
        )}
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
