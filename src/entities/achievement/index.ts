export type {
  AchievementId,
  AchievementIconKey,
  AchievementDefinition,
  AchievementProgressItem,
  EmployeeAchievementsSnapshot,
} from "./model/types";
export {
  ACHIEVEMENT_CATALOG,
  ACHIEVEMENT_POINTS_PER_LEVEL,
  ADVANCE_MILESTONE_THRESHOLDS,
} from "./model/catalog";
export {
  buildEmployeeAchievementsSnapshot,
  calculateAchievementLevel,
  resolveUnlockedAchievementIds,
} from "./model/calculations";
