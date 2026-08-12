// ⚠️ AGNOSTIC — employee achievements / badges domain
// Catálogo y unlocks viven en backend (superadmin CRUD + GET /logros/me/).

export type AchievementId = string;

export type AchievementIconKey =
  | "star"
  | "milestone5"
  | "milestone15"
  | "milestone30"
  | "shield"
  | "flame"
  | "target"
  | "award";

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  points: number;
  icon: AchievementIconKey;
}

export interface AchievementProgressItem extends AchievementDefinition {
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface EmployeeAchievementsSnapshot {
  items: AchievementProgressItem[];
  totalPoints: number;
  level: number;
  levelLabel: string;
  pointsToNextLevel: number;
  maxPointsForLevel: number;
  /** Progreso del logro de bienvenida (primer adelanto). */
  firstAdvance: {
    unlocked: boolean;
    completed: number;
    required: number;
  };
}
