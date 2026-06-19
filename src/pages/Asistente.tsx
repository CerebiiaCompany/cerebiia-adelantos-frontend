import { Brain, TrendingUp, AlertTriangle, Lightbulb, Shield } from "lucide-react";
import {
  AnimatedNumber,
  AnimatedProgressBar,
} from "@/components/ui/animated-number";
import { PageHeader } from "@/components/layout/PageHeader";
import { useEmployeeDashboard } from "@/features/dashboard";
import { formatCOP } from "@/shared/lib";

const typeStyles = {
  success: "border-primary/20 bg-primary/5",
  warning: "border-warning/20 bg-warning/5",
  info: "border-info/20 bg-info/5",
};

const iconColors = {
  success: "text-primary",
  warning: "text-[hsl(260_70%_50%)]",
  info: "text-primary",
};

const FINANCIAL_SCORE = 0;
const MAX_SCORE = 100;

export default function Asistente() {
  const dashboard = useEmployeeDashboard();

  if (!dashboard) return null;

  const { availableAdvance, totalAdvancedThisMonth } = dashboard;

  const tips = [
    {
      icon: TrendingUp,
      title: "Buen momento para ahorrar",
      desc:
        totalAdvancedThisMonth === 0
          ? "Aún no tienes adelantos activos. Es un buen momento para planificar un fondo de emergencia."
          : "Tu nivel de adelantos es bajo. Considera guardar un fondo de emergencia equivalente a 1 mes de gastos.",
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
      desc: `Tu cupo disponible este mes es de ${formatCOP(availableAdvance)} (30% de tu salario). Solicita solo lo que necesites.`,
      type: "info" as const,
    },
    {
      icon: Shield,
      title: "Protección financiera",
      desc: "Tu puntaje financiero se calcula con el uso de adelantos. Al inicio es 0/100 y mejorará con un uso responsable.",
      type: "success" as const,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
      <PageHeader
        icon={Brain}
        title="Asistente financiero"
        description="Recomendaciones personalizadas"
      />

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
          <span className="text-muted-foreground">Sin historial aún</span>
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
            key={tip.title}
            className={`glass-card animate-slide-up border p-4 ${typeStyles[tip.type]}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <span
                className={`inline-flex shrink-0 items-center justify-center ${iconColors[tip.type]}`}
              >
                <tip.icon className="h-5 w-5" strokeWidth={2.25} />
              </span>
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
