import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Heart,
  Utensils,
  Eye,
  EyeOff,
  ChevronRight,
  ShoppingBag,
  Wallet,
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

  const balance = dashboard.salary;
  const movements: Array<{
    type: "in" | "out";
    desc: string;
    amount: number;
    date: string;
  }> = [];

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
          <div className="mb-2 flex items-center gap-2">
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
          <p className="mb-4 font-display text-4xl font-bold text-gradient">
            {showBalance ? (
              <AnimatedCurrency value={balance} duration={900} />
            ) : (
              "••••••"
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            Salario mensual registrado en tu cuenta
          </p>
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
                key={m.desc + m.date}
                className="group/wallet-movement flex items-center gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-secondary/30 last:border-0"
              >
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center",
                    m.type === "in"
                      ? "text-primary activity-icon-motion-ingreso"
                      : "text-[hsl(260_70%_50%)] activity-icon-motion-adelanto",
                  )}
                >
                  {m.type === "in" ? (
                    <ArrowUpRight className="h-5 w-5" strokeWidth={2.25} />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" strokeWidth={2.25} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {m.desc}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.date}</p>
                </div>
                <AnimatedCurrency
                  value={Math.abs(m.amount)}
                  sign={m.amount > 0 ? "+" : "-"}
                  className={`text-sm font-semibold ${
                    m.amount > 0 ? "text-primary" : "text-foreground"
                  }`}
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
