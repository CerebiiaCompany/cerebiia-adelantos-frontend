import type { AchievementDefinition } from "./types";

/** Catálogo de logros del empleado (UI consume iconos aparte). */
export const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  {
    id: "primera_vez",
    title: "Primera vez",
    description: "Completaste tu primer adelanto",
    points: 100,
    icon: "star",
  },
  {
    id: "adelanto_5",
    title: "Adelanto N° 5",
    description: "¡Enhorabuena! Completaste tu adelanto N° 5",
    points: 200,
    icon: "milestone5",
  },
  {
    id: "adelanto_15",
    title: "Adelanto N° 15",
    description: "¡Enhorabuena! Completaste tu adelanto N° 15",
    points: 400,
    icon: "milestone15",
  },
  {
    id: "adelanto_30",
    title: "Adelanto N° 30",
    description: "¡Enhorabuena! Completaste tu adelanto N° 30",
    points: 750,
    icon: "milestone30",
  },
  {
    id: "control_total",
    title: "Control total",
    description: "No te sobreendeudaste 3 meses seguidos",
    points: 500,
    icon: "shield",
  },
  {
    id: "racha_5",
    title: "Racha de 5",
    description: "5 meses consecutivos bajo el 50% del límite",
    points: 300,
    icon: "flame",
  },
  {
    id: "meta_ahorro",
    title: "Meta ahorro",
    description: "Ahorraste el equivalente a 1 semana de ingresos",
    points: 400,
    icon: "target",
  },
  {
    id: "usuario_premium",
    title: "Usuario premium",
    description: "Mantén puntaje 90+ por 6 meses",
    points: 1000,
    icon: "award",
  },
];

/** Umbrales de adelantos no rechazados para hitos de uso. */
export const ADVANCE_MILESTONE_THRESHOLDS = {
  adelanto_5: 5,
  adelanto_15: 15,
  adelanto_30: 30,
} as const;

export const ACHIEVEMENT_POINTS_PER_LEVEL = 500;
