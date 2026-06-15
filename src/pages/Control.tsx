import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { AlertTriangle, TrendingDown, ShieldCheck } from "lucide-react";
import {
  AnimatedCurrency,
  AnimatedPercent,
} from "@/components/ui/animated-number";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

const formatCOP = (v: number) => `$${v.toLocaleString("es-CO")}`;

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

  return (
    <div className="mx-auto max-w-3xl animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Control de uso
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitorea tus adelantos y límites
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-card flex flex-col items-center p-5 text-center">
          <div className="relative mb-3 h-28 w-28">
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
                stroke="hsl(220, 90%, 55%)"
                strokeWidth="8"
                strokeDasharray={`${animatedPercent * 2.64} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatedPercent
                value={USED_PERCENT}
                className="font-display text-2xl font-bold text-foreground"
              />
            </div>
          </div>
          <p className="text-sm font-medium text-foreground">Utilizado este mes</p>
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

        <div className="glass-card p-5 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <AnimatedCurrency
            value={LIMIT_DYNAMIC}
            className="font-display text-2xl font-bold text-foreground"
          />
          <p className="text-sm text-muted-foreground">Límite dinámico</p>
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

        <div className="glass-card p-5 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
            <TrendingDown className="h-5 w-5 text-warning" />
          </div>
          <AnimatedCurrency
            value={NEXT_PAYMENT}
            className="font-display text-2xl font-bold text-foreground"
          />
          <p className="text-sm text-muted-foreground">Próximo pago neto</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Descontando adelantos
          </p>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="mb-4 font-display font-semibold text-foreground">
          Historial de adelantos
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barSize={32}>
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
              <Bar dataKey="adelantos" radius={[6, 6, 0, 0]}>
                {monthlyData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      i === monthlyData.length - 1
                        ? "hsl(220, 90%, 55%)"
                        : "hsl(220, 14%, 88%)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card flex items-start gap-3 border-warning/20 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div>
          <p className="text-sm font-medium text-foreground">Consejo financiero</p>
          <p className="text-xs text-muted-foreground">
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
