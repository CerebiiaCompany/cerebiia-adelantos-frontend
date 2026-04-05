import { ArrowUpRight, ArrowDownRight, Calendar, Zap, TrendingUp, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const chartData = [
  { name: "Ene", ingresos: 4200, adelantos: 800 },
  { name: "Feb", ingresos: 4200, adelantos: 1200 },
  { name: "Mar", ingresos: 4500, adelantos: 600 },
  { name: "Abr", ingresos: 4500, adelantos: 900 },
  { name: "May", ingresos: 4800, adelantos: 400 },
  { name: "Jun", ingresos: 4800, adelantos: 700 },
];

const recentActivity = [
  { type: "adelanto", amount: -500, date: "Hoy, 14:30", desc: "Adelanto rápido" },
  { type: "ingreso", amount: 4800, date: "1 Abr", desc: "Nómina mensual" },
  { type: "adelanto", amount: -300, date: "28 Mar", desc: "Adelanto parcial" },
  { type: "ingreso", amount: 4500, date: "1 Mar", desc: "Nómina mensual" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Hola, Juan 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tu resumen financiero de hoy
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Disponible para adelanto"
          value="$2,400"
          sub="de $4,800"
          icon={<Zap className="h-4 w-4" />}
          accent
        />
        <StatCard
          label="Ingresos acumulados"
          value="$3,200"
          sub="+$160 hoy"
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
        />
        <StatCard
          label="Total adelantado"
          value="$500"
          sub="este mes"
          icon={<ArrowDownRight className="h-4 w-4" />}
          trend="neutral"
        />
        <StatCard
          label="Próximo pago"
          value="15 Abr"
          sub="en 10 días"
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Ingresos vs Adelantos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(155, 72%, 48%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(155, 72%, 48%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAdelantos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="hsl(215, 12%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(215, 12%, 40%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220, 18%, 12%)",
                    border: "1px solid hsl(220, 14%, 18%)",
                    borderRadius: "8px",
                    color: "hsl(210, 20%, 95%)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                />
                <Area type="monotone" dataKey="ingresos" stroke="hsl(155, 72%, 48%)" fill="url(#colorIngresos)" strokeWidth={2} />
                <Area type="monotone" dataKey="adelantos" stroke="hsl(38, 92%, 55%)" fill="url(#colorAdelantos)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Actividad reciente</h3>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  item.type === "ingreso" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                }`}>
                  {item.type === "ingreso" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.desc}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <span className={`text-sm font-semibold ${item.amount > 0 ? "text-primary" : "text-foreground"}`}>
                  {item.amount > 0 ? "+" : ""}${Math.abs(item.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="glass-card glow-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center animate-pulse-glow">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">¿Necesitas dinero ahora?</h3>
            <p className="text-sm text-muted-foreground">Solicita un adelanto en segundos</p>
          </div>
        </div>
        <a href="/adelanto" className="px-6 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
          Solicitar adelanto →
        </a>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, accent, trend }: {
  label: string; value: string; sub: string; icon: React.ReactNode; accent?: boolean; trend?: "up" | "neutral";
}) {
  return (
    <div className={`glass-card p-4 ${accent ? "glow-border" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-display font-bold ${accent ? "text-gradient" : "text-foreground"}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}
