import { ArrowUpRight, ArrowDownRight, Send, Plus, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const movements = [
  { type: "in", desc: "Nómina abril", amount: 4800, date: "1 Abr 2026" },
  { type: "out", desc: "Adelanto rápido", amount: -500, date: "5 Abr 2026" },
  { type: "out", desc: "Transferencia a María", amount: -200, date: "3 Abr 2026" },
  { type: "in", desc: "Nómina marzo", amount: 4500, date: "1 Mar 2026" },
  { type: "out", desc: "Adelanto parcial", amount: -300, date: "28 Mar 2026" },
  { type: "in", desc: "Bono productividad", amount: 600, date: "15 Mar 2026" },
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
            {showBalance ? "$4,100.00" : "••••••"}
          </p>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              <Send className="h-4 w-4" /> Enviar
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
              <Plus className="h-4 w-4" /> Agregar
            </button>
          </div>
        </div>
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
                {m.amount > 0 ? "+" : ""}${Math.abs(m.amount).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
