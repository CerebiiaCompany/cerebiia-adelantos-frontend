import { ArrowUpRight, ArrowDownRight, Heart, Utensils, Eye, EyeOff, ChevronRight, ShoppingBag } from "lucide-react";
import { useState } from "react";

const formatCOP = (v: number) => `$${v.toLocaleString("es-CO")}`;

const allies = [
  { name: "Planes de Salud", desc: "Medicina prepagada, odontología, óptica y más", icon: Heart, color: "bg-primary/10 text-primary" },
  { name: "Restaurantes", desc: "Descuentos en restaurantes aliados", icon: Utensils, color: "bg-warning/10 text-warning" },
  { name: "Tiendas", desc: "Compras en comercios aliados con beneficios", icon: ShoppingBag, color: "bg-info/10 text-info" },
];

const movements = [
  { type: "in", desc: "Nómina abril", amount: 4800000, date: "1 Abr 2026" },
  { type: "out", desc: "Plan de Salud Premium", amount: -350000, date: "5 Abr 2026" },
  { type: "out", desc: "Restaurante El Cielo", amount: -85000, date: "3 Abr 2026" },
  { type: "in", desc: "Nómina marzo", amount: 4500000, date: "1 Mar 2026" },
  { type: "out", desc: "Adelanto parcial", amount: -300000, date: "28 Mar 2026" },
  { type: "in", desc: "Bono productividad", amount: 600000, date: "15 Mar 2026" },
];

export default function WalletPage() {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-foreground">Wallet</h1>

      {/* Balance Card */}
      <div className="glass-card glow-border p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Saldo disponible</span>
            <button onClick={() => setShowBalance(!showBalance)} className="text-muted-foreground hover:text-foreground">
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-4xl font-display font-bold text-gradient mb-4">
            {showBalance ? "$4.100.000" : "••••••"}
          </p>
          <p className="text-xs text-muted-foreground">Usa tu saldo para pagar en servicios aliados</p>
        </div>
      </div>

      {/* Allied Services */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Servicios aliados</h3>
        <div className="space-y-3">
          {allies.map((ally, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${ally.color}`}>
                <ally.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{ally.name}</p>
                <p className="text-xs text-muted-foreground">{ally.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
        <button className="w-full mt-4 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
          Conocer más aliados →
        </button>
      </div>

      {/* Movements */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Movimientos</h3>
        <div className="space-y-1">
          {movements.map((m, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                m.type === "in" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
              }`}>
                {m.type === "in" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{m.desc}</p>
                <p className="text-xs text-muted-foreground">{m.date}</p>
              </div>
              <span className={`text-sm font-semibold ${m.amount > 0 ? "text-primary" : "text-foreground"}`}>
                {m.amount > 0 ? "+" : ""}{formatCOP(Math.abs(m.amount))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
