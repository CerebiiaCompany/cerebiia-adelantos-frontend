import { Trophy, Star, Shield, Flame, Target, Award } from "lucide-react";

const achievements = [
  { icon: Shield, title: "Control total", desc: "No te sobreendeudaste 3 meses seguidos", points: 500, unlocked: true },
  { icon: Flame, title: "Racha de 5", desc: "5 meses consecutivos bajo el 50% del límite", points: 300, unlocked: true },
  { icon: Star, title: "Primera vez", desc: "Completaste tu primer adelanto", points: 100, unlocked: true },
  { icon: Target, title: "Meta ahorro", desc: "Ahorraste el equivalente a 1 semana de ingresos", points: 400, unlocked: false },
  { icon: Award, title: "Usuario premium", desc: "Mantén puntaje 90+ por 6 meses", points: 1000, unlocked: false },
];

export default function Logros() {
  const totalPoints = 900;
  const level = 3;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-foreground">Logros y puntos</h1>

      {/* Level Card */}
      <div className="glass-card glow-border p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-3">
          <Trophy className="h-8 w-8 text-primary-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Nivel actual</p>
        <p className="text-4xl font-display font-bold text-gradient">{level}</p>
        <p className="text-sm text-muted-foreground mt-1">Financiero responsable</p>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{totalPoints} pts</span>
            <span>1,200 pts</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-gradient-primary h-2 rounded-full" style={{ width: "75%" }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">300 pts para nivel 4</p>
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-3">
        {achievements.map((a, i) => (
          <div key={i} className={`glass-card p-4 flex items-center gap-4 ${!a.unlocked ? "opacity-50" : ""}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              a.unlocked ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
            }`}>
              <a.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${a.unlocked ? "text-primary" : "text-muted-foreground"}`}>
                +{a.points}
              </p>
              <p className="text-xs text-muted-foreground">{a.unlocked ? "Desbloqueado" : "Bloqueado"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
