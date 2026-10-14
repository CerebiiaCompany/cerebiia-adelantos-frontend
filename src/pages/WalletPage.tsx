import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Heart,
  Utensils,
  Eye,
  EyeOff,
  ChevronRight,
  ShoppingBag,
  Wallet,
  XCircle,
} from "lucide-react";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { PageHeader } from "@/components/layout/PageHeader";
import { useEmployeeDashboard } from "@/features/dashboard";
import { cn } from "@/lib/utils";

const allies = [
  {
    name: "Planes de Salud",
    desc: "Medicina prepagada, odontología, óptica y más",
    icon: Heart,
    iconColor: "text-primary",
    iconMotion: "wallet-icon-motion-heart",
  },
  {
    name: "Restaurantes",
    desc: "Descuentos en restaurantes aliados",
    icon: Utensils,
    iconColor: "text-[hsl(260_70%_50%)]",
    iconMotion: "wallet-icon-motion-utensils",
  },
  {
    name: "Tiendas",
    desc: "Compras en comercios aliados con beneficios",
    icon: ShoppingBag,
    iconColor: "text-primary",
    iconMotion: "wallet-icon-motion-bag",
  },
];

export default function WalletPage() {
  const dashboard = useEmployeeDashboard();
  const [showBalance, setShowBalance] = useState(true);

  if (!dashboard) return null;

  const balance = dashboard.walletBalance;
  const diasLaborados = dashboard.diasLaboradosMes ?? 0;
  const salarioDevengado = dashboard.accruedSalaryMonth ?? 0;
  const totalAdelantado = dashboard.totalAdvancedThisMonth;
  const hasAdvances = totalAdelantado > 0;

  const movements: Array<{
    type: "in" | "out";
    desc: string;
    amount: number;
    date: string;
    status?: "solicitado" | "aprobado" | "rechazado";
    statusLabel?: string;
    rejectionReason?: string | null;
  }> = (dashboard.recentActivity || []).map((item) => ({
    type: item.type === "ingreso" ? "in" : "out",
    desc: item.desc,
    amount: item.amount,
    date: item.date,
    status: item.status,
    statusLabel: item.statusLabel,
    rejectionReason: item.rejectionReason,
  }));

  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
      <PageHeader
        icon={Wallet}
        title="Wallet"
        description="Saldo, movimientos y beneficios aliados"
      />

      <div className="glass-card glow-border relative overflow-hidden p-6">
        <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5" />
        <div className="relative">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Saldo disponible</span>
              <button
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showBalance ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {diasLaborados} {diasLaborados === 1 ? "día laborado" : "días laborados"}
            </span>
          </div>

          <p className="mb-3 font-display text-4xl font-bold text-gradient">
            {showBalance ? (
              <AnimatedCurrency value={balance} duration={900} />
            ) : (
              "••••••"
            )}
          </p>

          <p className="text-xs text-muted-foreground">
            {hasAdvances
              ? `Ingreso acumulado según días laborados (${diasLaborados} días) menos adelantos solicitados este mes`
              : `Ingreso acumulado según días laborados este mes (${diasLaborados} de 30 días base)`}
          </p>

          <div className="mt-5 space-y-2 border-t border-border/60 pt-4 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Salario mensual base</span>
              <span className="font-medium text-foreground">
                {showBalance ? <AnimatedCurrency value={dashboard.salary} /> : "••••••"}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Ingreso acumulado devengado ({diasLaborados} días)</span>
              <span className="font-semibold text-primary">
                {showBalance ? (
                  <>
                    +<AnimatedCurrency value={salarioDevengado} />
                  </>
                ) : (
                  "••••••"
                )}
              </span>
            </div>
            {hasAdvances && (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Adelantos solicitados este mes</span>
                <span className="font-semibold text-destructive">
                  {showBalance ? (
                    <>
                      -<AnimatedCurrency value={totalAdelantado} />
                    </>
                  ) : (
                    "••••••"
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="mb-4 font-display font-semibold text-foreground">
          Servicios aliados
        </h3>
        <div className="space-y-3">
          {allies.map((ally) => (
            <div
              key={ally.name}
              className="group/wallet-ally flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary/40"
            >
              <span
                className={cn(
                  "inline-flex shrink-0 items-center justify-center",
                  ally.iconColor,
                  ally.iconMotion,
                )}
              >
                <ally.icon className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{ally.name}</p>
                <p className="text-xs text-muted-foreground">{ally.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover/wallet-ally:translate-x-0.5" />
            </div>
          ))}
        </div>
        <PrimaryActionButton type="button" className="mt-4 w-full py-3 text-sm">
          Conocer más aliados
        </PrimaryActionButton>
      </div>

      <div className="glass-card p-5">
        <h3 className="mb-4 font-display font-semibold text-foreground">
          Movimientos
        </h3>
        {movements.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground">
            Aún no tienes movimientos en tu wallet.
          </p>
        ) : (
          <div className="space-y-1">
            {movements.map((m, i) => (
              <div
                key={m.desc + m.date + i}
                className="group/wallet-movement flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-secondary/30 last:border-0"
              >
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center rounded-lg p-2",
                    m.type === "in"
                      ? "text-primary bg-primary/10 activity-icon-motion-ingreso"
                      : m.status === "solicitado"
                        ? "text-purple-600 bg-purple-500/10 dark:text-purple-400 dark:bg-purple-500/15 activity-icon-motion-adelanto"
                        : m.status === "rechazado"
                          ? "text-red-600 bg-red-500/10 dark:text-red-400 dark:bg-red-500/15"
                          : "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/15 activity-icon-motion-adelanto",
                  )}
                >
                  {m.type === "in" ? (
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} />
                  ) : m.status === "rechazado" ? (
                    <XCircle className="h-4 w-4" strokeWidth={2.25} />
                  ) : m.status === "solicitado" ? (
                    <Clock className="h-4 w-4" strokeWidth={2.25} />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {m.desc}
                    </p>
                    {m.status ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide border",
                          m.status === "solicitado" &&
                            "border-purple-300 bg-purple-100 text-purple-700 dark:border-purple-500/30 dark:bg-purple-950/50 dark:text-purple-300",
                          m.status === "rechazado" &&
                            "border-red-300 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-950/50 dark:text-red-300",
                          m.status === "aprobado" &&
                            "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-300",
                        )}
                      >
                        {m.statusLabel || (
                          m.status === "solicitado"
                            ? "Solicitado"
                            : m.status === "rechazado"
                              ? "Rechazado"
                              : "Aprobado"
                        )}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">{m.date}</p>
                </div>
                <AnimatedCurrency
                  value={Math.abs(m.amount)}
                  sign={m.amount > 0 ? "+" : "-"}
                  className={cn(
                    "text-sm font-semibold",
                    m.status === "rechazado"
                      ? "text-red-500 line-through opacity-80 dark:text-red-400"
                      : m.status === "solicitado"
                        ? "text-purple-600 dark:text-purple-400"
                        : m.amount > 0
                          ? "text-primary"
                          : "text-foreground",
                  )}
                  duration={650}
                  delay={i * 90 + 80}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
