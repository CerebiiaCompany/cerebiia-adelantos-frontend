import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { AlertTriangle, TrendingDown, ShieldCheck } from "lucide-react";

const formatCOP = (v: number) => `$${v.toLocaleString("es-CO")}`;

const monthlyData = [
  { name: "Ene", adelantos: 800000, limite: 2400000 },
  { name: "Feb", adelantos: 1200000, limite: 2400000 },
  { name: "Mar", adelantos: 600000, limite: 2250000 },
  { name: "Abr", adelantos: 500000, limite: 2400000 },
];

export default function Control() {
  const usedPercent = 21;
  const limitDynamic = 2400000;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Control de uso</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitorea tus adelantos y límites</p>
      </div>

      {/* Usage Ring */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 flex flex-col items-center text-center">
          <div className="relative w-28 h-28 mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(220, 14%, 90%)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(220, 90%, 55%)" strokeWidth="8"
                strokeDasharray={`${usedPercent * 2.64} 264`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-foreground">{usedPercent}%</span>
            </div>
          </div>
          <p className="text-sm font-medium text-foreground">Utilizado este mes</p>
          <p className="text-xs text-muted-foreground">$500.000 de $2.400.000</p>
        </div>

        <div className="glass-card p-5 text-center">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{formatCOP(limitDynamic)}</p>
          <p className="text-sm text-muted-foreground">Límite dinámico</p>
          <p className="text-xs text-primary mt-1">+$150.000 vs mes anterior</p>
        </div>

        <div className="glass-card p-5 text-center">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center mx-auto mb-3">
            <TrendingDown className="h-5 w-5 text-warning" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">$4.300.000</p>
          <p className="text-sm text-muted-foreground">Próximo pago neto</p>
          <p className="text-xs text-muted-foreground mt-1">Descontando adelantos</p>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Historial de adelantos</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barSize={32}>
              <XAxis dataKey="name" stroke="hsl(220, 10%, 70%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(220, 10%, 70%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
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
              <Bar dataKey="adelantos" radius={[6, 6, 0, 0]}>
                {monthlyData.map((_, i) => (
                  <Cell key={i} fill={i === monthlyData.length - 1 ? "hsl(220, 90%, 55%)" : "hsl(220, 14%, 88%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alert */}
      <div className="glass-card p-4 flex items-start gap-3 border-warning/20">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Consejo financiero</p>
          <p className="text-xs text-muted-foreground">Estás usando solo el 21% de tu límite este mes. ¡Excelente control financiero! Tu límite puede aumentar el próximo mes.</p>
        </div>
      </div>
    </div>
  );
}
