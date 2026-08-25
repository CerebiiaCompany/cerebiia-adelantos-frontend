import { CheckCircle2, Lock, Sparkles, Trophy } from "lucide-react";
import {
  AnimatedNumber,
  AnimatedProgressBar,
} from "@/components/ui/animated-number";
import { PageHeader } from "@/components/layout/PageHeader";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  useEmployeeAchievements,
  resolveAchievementIcon,
} from "@/features/achievements";
import { cn } from "@/lib/utils";

export default function Logros() {
  const { hash } = useLocation();
  const { data, isLoading } = useEmployeeAchievements();

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

  const unlockedCount = items.filter((i) => i.unlocked).length;

  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
      <PageHeader
        icon={Trophy}
        title="Logros y puntos"
        description="Insignias, niveles y recompensas por tu actividad"
      />

      {/* Tarjeta de Nivel y Progreso */}
      <div className="glass-card glow-border relative overflow-hidden p-6 text-center shadow-lg">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
          <Trophy className="h-10 w-10 text-amber-500" strokeWidth={2.25} />
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Nivel actual
        </p>
        <div className="my-1">
          <AnimatedNumber
            value={level}
            className="font-display text-4xl font-extrabold text-gradient"
          />
        </div>
        <p className="text-sm font-medium text-foreground">{levelLabel}</p>

        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              <AnimatedNumber value={totalPoints} className="inline" /> pts
              ganados
            </span>
            <span>
              {unlockedCount} de {items.length} insignias
            </span>
          </div>

          <AnimatedProgressBar
            value={totalPoints % maxPointsForLevel}
            max={maxPointsForLevel}
            className="h-2.5 rounded-full"
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Meta: {maxPointsForLevel} pts
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
              <Sparkles className="h-3 w-3" />
              <AnimatedNumber
                value={pointsToNextLevel}
                className="inline font-bold"
                duration={850}
              />{" "}
              pts para nivel {level + 1}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Insignias Dinámicas */}
      <div className="space-y-3">
        {isLoading && items.length === 0 ? (
          <div className="glass-card p-8 text-center text-sm text-muted-foreground">
            Cargando catálogo de logros...
          </div>
        ) : items.length === 0 ? (
          <div className="glass-card p-8 text-center text-sm text-muted-foreground">
            No hay logros disponibles en este momento.
          </div>
        ) : (
          items.map((achievement, i) => {
            const unlocked = achievement.unlocked;
            const iconInfo = resolveAchievementIcon(
              achievement.iconKey || achievement.icon,
            );
            const Icon = iconInfo.Icon;
            const color = iconInfo.color;

            return (
              <div
                key={achievement.id}
                id={`logro-${achievement.id}`}
                className={cn(
                  "glass-card relative flex items-center gap-4 rounded-xl p-4 transition-all duration-300",
                  unlocked
                    ? "glow-border opacity-100 ring-1 ring-primary/15 shadow-sm"
                    : "opacity-60 grayscale-[0.4] hover:opacity-80",
                )}
              >
                {/* Contenedor del Icono con Glow */}
                <div
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all",
                  )}
                  style={
                    unlocked
                      ? {
                          backgroundColor: `${color}18`,
                          borderColor: `${color}40`,
                          boxShadow: `0 0 20px ${color}35`,
                        }
                      : {
                          backgroundColor: "hsl(var(--muted) / 0.5)",
                          borderColor: "hsl(var(--border) / 0.6)",
                        }
                  }
                >
                  <Icon
                    className="h-7 w-7 transition-transform"
                    style={{ color: unlocked ? color : "hsl(var(--muted-foreground))" }}
                    strokeWidth={2.25}
                  />
                </div>

                {/* Título y Descripción */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "font-semibold leading-tight",
                        unlocked
                          ? "text-sm text-foreground"
                          : "text-sm text-muted-foreground",
                      )}
                    >
                      {achievement.title}
                    </p>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>

                {/* Puntos y Estado */}
                <div className="shrink-0 text-right space-y-1.5">
                  <div
                    className={cn(
                      "font-display text-sm font-bold tracking-tight",
                      unlocked ? "text-amber-500 dark:text-amber-400" : "text-muted-foreground/60",
                    )}
                  >
                    +
                    <AnimatedNumber
                      value={achievement.points}
                      className="inline"
                      duration={650}
                      delay={i * 60 + 50}
                    />{" "}
                    pts
                  </div>

                  <div>
                    {unlocked ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Desbloqueado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-secondary/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        Bloqueado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

