import {
  ACHIEVEMENT_CATALOG,
  ACHIEVEMENT_POINTS_PER_LEVEL,
  ADVANCE_MILESTONE_THRESHOLDS,
} from "./catalog";
import type {
  AchievementId,
  EmployeeAchievementsSnapshot,
} from "./types";

export interface AchievementUnlockInput {
  /** Adelantos no rechazados (solicitado / en curso / aprobado / pagado). */
  completedAdvanceCount: number;
}

const LEVEL_LABELS: Record<number, string> = {
  1: "Nuevo usuario",
  2: "Usuario activo",
  3: "Usuario constante",
};

export function resolveUnlockedAchievementIds(
  input: AchievementUnlockInput,
): Set<AchievementId> {
  const unlocked = new Set<AchievementId>();
  const count = input.completedAdvanceCount;

  if (count >= 1) {
    unlocked.add("primera_vez");
  }
  if (count >= ADVANCE_MILESTONE_THRESHOLDS.adelanto_5) {
    unlocked.add("adelanto_5");
  }
  if (count >= ADVANCE_MILESTONE_THRESHOLDS.adelanto_15) {
    unlocked.add("adelanto_15");
  }
  if (count >= ADVANCE_MILESTONE_THRESHOLDS.adelanto_30) {
    unlocked.add("adelanto_30");
  }

  return unlocked;
}

export function calculateAchievementLevel(totalPoints: number): number {
  if (totalPoints < 0) return 1;
  return Math.floor(totalPoints / ACHIEVEMENT_POINTS_PER_LEVEL) + 1;
}

export function buildEmployeeAchievementsSnapshot(
  input: AchievementUnlockInput,
): EmployeeAchievementsSnapshot {
  const unlockedIds = resolveUnlockedAchievementIds(input);
  const items = ACHIEVEMENT_CATALOG.map((definition) => {
    const unlocked = unlockedIds.has(definition.id);
    return {
      ...definition,
      unlocked,
      unlockedAt: unlocked ? new Date().toISOString().slice(0, 10) : null,
    };
  }).sort((a, b) => {
    // Desbloqueadas primero; dentro de cada grupo se mantiene el orden del catálogo.
    if (a.unlocked === b.unlocked) return 0;
    return a.unlocked ? -1 : 1;
  });

  const totalPoints = items
    .filter((item) => item.unlocked)
    .reduce((sum, item) => sum + item.points, 0);

  const level = calculateAchievementLevel(totalPoints);
  const maxPointsForLevel = ACHIEVEMENT_POINTS_PER_LEVEL;
  const pointsIntoLevel = totalPoints % ACHIEVEMENT_POINTS_PER_LEVEL;
  const pointsToNextLevel = maxPointsForLevel - pointsIntoLevel;
  const primeraVezUnlocked = unlockedIds.has("primera_vez");

  return {
    items,
    totalPoints,
    level,
    levelLabel: LEVEL_LABELS[level] ?? `Nivel ${level}`,
    pointsToNextLevel,
    maxPointsForLevel,
    firstAdvance: {
      unlocked: primeraVezUnlocked,
      completed: Math.min(1, Math.max(0, input.completedAdvanceCount)),
      required: 1,
    },
  };
}
