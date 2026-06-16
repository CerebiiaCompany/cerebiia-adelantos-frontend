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
import { useState } from "react";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { PageHeader } from "@/components/layout/PageHeader";

const allies = [
  {
    name: "Planes de Salud",
    desc: "Medicina prepagada, odontología, óptica y más",
    icon: Heart,
    color: "bg-primary/10 text-primary",
  },
  {
    name: "Restaurantes",
    desc: "Descuentos en restaurantes aliados",
    icon: Utensils,
    color: "bg-warning/10 text-warning",
  },
  {
    name: "Tiendas",
    desc: "Compras en comercios aliados con beneficios",
    icon: ShoppingBag,
    color: "bg-info/10 text-info",
  },
];

const movements = [
  { type: "in", desc: "Nómina abril", amount: 4800000, date: "1 Abr 2026" },
  {
    type: "out",
    desc: "Plan de Salud Premium",
    amount: -350000,
    date: "5 Abr 2026",
  },
  {
    type: "out",
    desc: "Restaurante El Cielo",
    amount: -85000,
    date: "3 Abr 2026",
  },
  { type: "in", desc: "Nómina marzo", amount: 4500000, date: "1 Mar 2026" },
  { type: "out", desc: "Adelanto parcial", amount: -300000, date: "28 Mar 2026" },
  { type: "in", desc: "Bono productividad", amount: 600000, date: "15 Mar 2026" },
];

const BALANCE = 4100000;

export default function WalletPage() {
  const [showBalance, setShowBalance] = useState(true);

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
              <AnimatedCurrency value={BALANCE} duration={900} />
            ) : (
              "••••••"
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            Usa tu saldo para pagar en servicios aliados
          </p>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="mb-4 font-display font-semibold text-foreground">
          Servicios aliados
        </h3>
        <div className="space-y-3">
          {allies.map((ally, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${ally.color}`}
              >
                <ally.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{ally.name}</p>
                <p className="text-xs text-muted-foreground">{ally.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
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
        <div className="space-y-1">
          {movements.map((m, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-border/50 py-3 last:border-0"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  m.type === "in"
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {m.type === "in" ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
              </div>
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
      </div>
    </div>
  );
}
