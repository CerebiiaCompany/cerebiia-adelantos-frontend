import { Trophy, Star, Shield, Flame, Target, Award } from "lucide-react";
import {
  AnimatedNumber,
  AnimatedProgressBar,
} from "@/components/ui/animated-number";
import { PageHeader } from "@/components/layout/PageHeader";

const achievements = [
  {
    icon: Shield,
    title: "Control total",
    desc: "No te sobreendeudaste 3 meses seguidos",
    points: 500,
    unlocked: true,
  },
  {
    icon: Flame,
    title: "Racha de 5",
    desc: "5 meses consecutivos bajo el 50% del límite",
    points: 300,
    unlocked: true,
  },
  {
    icon: Star,
    title: "Primera vez",
    desc: "Completaste tu primer adelanto",
    points: 100,
    unlocked: true,
  },
  {
    icon: Target,
    title: "Meta ahorro",
    desc: "Ahorraste el equivalente a 1 semana de ingresos",
    points: 400,
    unlocked: false,
  },
  {
    icon: Award,
    title: "Usuario premium",
    desc: "Mantén puntaje 90+ por 6 meses",
    points: 1000,
    unlocked: false,
  },
];

const TOTAL_POINTS = 900;
const MAX_POINTS = 1200;
const POINTS_TO_NEXT_LEVEL = 300;
const LEVEL = 3;

export default function Logros() {
  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
      <PageHeader
        icon={Trophy}
        title="Logros y puntos"
        description="Badges, niveles y recompensas"
      />

      <div className="glass-card glow-border p-6 text-center">
        <div className="level-badge mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary">
          <Trophy className="level-badge-icon h-8 w-8 text-primary-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Nivel actual</p>
        <AnimatedNumber
          value={LEVEL}
          className="font-display text-4xl font-bold text-gradient"
        />
        <p className="mt-1 text-sm text-muted-foreground">
          Financiero responsable
        </p>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>
              <AnimatedNumber value={TOTAL_POINTS} className="inline" /> pts
            </span>
            <span>
              <AnimatedNumber
                value={MAX_POINTS}
                className="inline"
                duration={800}
              />{" "}
              pts
            </span>
          </div>
          <AnimatedProgressBar
            value={TOTAL_POINTS}
            max={MAX_POINTS}
            className="h-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            <AnimatedNumber
              value={POINTS_TO_NEXT_LEVEL}
              className="inline font-medium text-foreground"
              duration={850}
            />{" "}
            pts para nivel 4
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {achievements.map((a, i) => (
          <div
            key={i}
            className={`glass-card flex items-center gap-4 p-4 ${!a.unlocked ? "opacity-50" : ""}`}
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                a.unlocked
                  ? "bg-primary/15 text-primary ring-4 ring-primary/10"
                  : "bg-secondary text-muted-foreground ring-4 ring-border/40"
              }`}
            >
              <a.icon className="h-6 w-6" strokeWidth={2.25} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </div>
            <div className="text-right">
              <p
                className={`text-sm font-bold ${a.unlocked ? "text-primary" : "text-muted-foreground"}`}
              >
                +
                <AnimatedNumber
                  value={a.points}
                  className="inline"
                  duration={650}
                  delay={i * 70 + 60}
                />
              </p>
              <p className="text-xs text-muted-foreground">
                {a.unlocked ? "Desbloqueado" : "Bloqueado"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
