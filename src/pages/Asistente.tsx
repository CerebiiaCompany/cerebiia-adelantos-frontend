import { Brain, TrendingUp, AlertTriangle, Lightbulb, Shield } from "lucide-react";
import {
  AnimatedNumber,
  AnimatedProgressBar,
} from "@/components/ui/animated-number";

const tips = [
  {
    icon: TrendingUp,
    title: "Buen momento para ahorrar",
    desc: "Tu nivel de adelantos es bajo. Considera guardar un fondo de emergencia equivalente a 1 mes de gastos.",
    type: "success" as const,
  },
  {
    icon: AlertTriangle,
    title: "Evita adelantos consecutivos",
    desc: "Solicitar adelantos en semanas consecutivas puede reducir tu límite dinámico en un 10%.",
    type: "warning" as const,
  },
  {
    icon: Lightbulb,
    title: "Cuánto solicitar",
    desc: "Basado en tus gastos recurrentes, te recomendamos no adelantar más de $1.200.000 este mes para mantener un balance saludable.",
    type: "info" as const,
  },
  {
    icon: Shield,
    title: "Protección financiera",
    desc: "Tu puntaje financiero es 85/100. Mantenerlo por encima de 80 te da acceso a mejores condiciones.",
    type: "success" as const,
  },
];

const typeStyles = {
  success: "border-primary/20 bg-primary/5",
  warning: "border-warning/20 bg-warning/5",
  info: "border-info/20 bg-info/5",
};

const iconStyles = {
  success: "bg-primary/15 text-primary",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/15 text-info",
};

const FINANCIAL_SCORE = 85;
const MAX_SCORE = 100;

export default function Asistente() {
  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
          <Brain className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Asistente financiero
          </h1>
          <p className="text-sm text-muted-foreground">
            Recomendaciones personalizadas
          </p>
        </div>
      </div>

      <div className="glass-card glow-border p-6 text-center">
        <p className="mb-2 text-sm text-muted-foreground">Tu puntaje financiero</p>
        <AnimatedNumber
          value={FINANCIAL_SCORE}
          className="font-display text-6xl font-bold text-gradient"
          duration={1000}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          de{" "}
          <AnimatedNumber value={MAX_SCORE} className="inline font-medium" /> ·{" "}
          <span className="text-primary">Excelente</span>
        </p>
        <AnimatedProgressBar
          value={FINANCIAL_SCORE}
          max={MAX_SCORE}
          className="mt-4 h-2"
        />
      </div>

      <div className="space-y-3">
        {tips.map((tip, i) => (
          <div
            key={i}
            className={`glass-card animate-slide-up border p-4 ${typeStyles[tip.type]}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconStyles[tip.type]}`}
              >
                <tip.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {tip.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
