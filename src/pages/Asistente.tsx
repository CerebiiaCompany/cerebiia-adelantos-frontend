import { Brain, TrendingUp, AlertTriangle, Lightbulb, Shield } from "lucide-react";

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

export default function Asistente() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
          <Brain className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Asistente financiero</h1>
          <p className="text-muted-foreground text-sm">Recomendaciones personalizadas</p>
        </div>
      </div>

      {/* Score */}
      <div className="glass-card glow-border p-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">Tu puntaje financiero</p>
        <p className="text-6xl font-display font-bold text-gradient">85</p>
        <p className="text-sm text-muted-foreground mt-2">de 100 · <span className="text-primary">Excelente</span></p>
        <div className="w-full bg-secondary rounded-full h-2 mt-4">
          <div className="bg-gradient-primary h-2 rounded-full transition-all" style={{ width: "85%" }} />
        </div>
      </div>

      {/* Tips */}
      <div className="space-y-3">
        {tips.map((tip, i) => (
          <div key={i} className={`glass-card p-4 border ${typeStyles[tip.type]} animate-slide-up`} style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconStyles[tip.type]}`}>
                <tip.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
