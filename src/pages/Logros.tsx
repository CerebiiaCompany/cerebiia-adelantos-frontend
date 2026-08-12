import { Trophy } from "lucide-react";
import {
  AnimatedNumber,
  AnimatedProgressBar,
} from "@/components/ui/animated-number";
import { PageHeader } from "@/components/layout/PageHeader";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useEmployeeAchievements } from "@/features/achievements";
import type { AchievementIconKey } from "@/entities/achievement";
import { cn } from "@/lib/utils";

const ACHIEVEMENT_BADGE_SRC: Record<AchievementIconKey, string> = {
  star: "/images/badge-copa.svg",
  milestone5: "/images/badge-5.svg",
  milestone15: "/images/badge-15.svg",
  milestone30: "/images/badge-30.svg",
  shield: "/images/badge-escudo.svg",
  flame: "/images/badge-llama.svg",
  target: "/images/badge-meta.svg",
  award: "/images/badge-award.svg",
};

export default function Logros() {
  const { hash } = useLocation();
  const { data } = useEmployeeAchievements();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace(/^#/, "");
    const node = document.getElementById(id);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    node.classList.add("ring-2", "ring-primary/40");
    const timer = window.setTimeout(() => {
      node.classList.remove("ring-2", "ring-primary/40");
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [hash, data.items]);

  const {
    items,
    totalPoints,
    level,
    levelLabel,
    pointsToNextLevel,
    maxPointsForLevel,
  } = data;

  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
      <PageHeader
        icon={Trophy}
        title="Logros y puntos"
        description="Badges, niveles y recompensas"
      />

      <div className="glass-card glow-border p-6 text-center">
        <img
          src="/images/badge-copa.svg"
          alt=""
          className="mx-auto mb-3 h-[4.5rem] w-[4.5rem] object-contain drop-shadow-[0_8px_18px_rgba(79,70,229,0.28)]"
          draggable={false}
        />
        <p className="text-sm text-muted-foreground">Nivel actual</p>
        <AnimatedNumber
          value={level}
          className="font-display text-4xl font-bold text-gradient"
        />
        <p className="mt-1 text-sm text-muted-foreground">{levelLabel}</p>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>
              <AnimatedNumber value={totalPoints} className="inline" /> pts
            </span>
            <span>
              <AnimatedNumber
                value={maxPointsForLevel}
                className="inline"
                duration={800}
              />{" "}
              pts
            </span>
          </div>
          <AnimatedProgressBar
            value={totalPoints % maxPointsForLevel}
            max={maxPointsForLevel}
            className="h-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            <AnimatedNumber
              value={pointsToNextLevel}
              className="inline font-medium text-foreground"
              duration={850}
            />{" "}
            pts para nivel {level + 1}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((achievement, i) => {
          const badgeSrc = ACHIEVEMENT_BADGE_SRC[achievement.icon];
          const unlocked = achievement.unlocked;

          return (
            <div
              key={achievement.id}
              id={`logro-${achievement.id}`}
              className={cn(
                "glass-card flex items-center gap-4 p-4 transition-opacity",
                unlocked ? "opacity-100 ring-1 ring-primary/15" : "opacity-50",
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center",
                  unlocked
                    ? "drop-shadow-[0_6px_14px_rgba(79,70,229,0.3)]"
                    : "opacity-70 grayscale-[0.25]",
                )}
              >
                <img
                  src={badgeSrc}
                  alt=""
                  className="h-12 w-12 object-contain"
                  draggable={false}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {achievement.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "text-sm font-bold",
                    unlocked ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  +
                  <AnimatedNumber
                    value={achievement.points}
                    className="inline"
                    duration={650}
                    delay={i * 70 + 60}
                  />
                </p>
                <p
                  className={cn(
                    "text-xs font-medium",
                    unlocked ? "text-emerald-600" : "text-muted-foreground",
                  )}
                >
                  {unlocked ? "Desbloqueado" : "Bloqueado"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
