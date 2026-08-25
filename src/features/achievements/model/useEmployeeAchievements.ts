import { useQuery } from "@tanstack/react-query";
import type {
  AchievementIconKey,
  EmployeeAchievementsSnapshot,
} from "@/entities/achievement";
import { useAuth } from "@/features/auth";
import { isEmpleadoSession } from "@/shared/api";
import { logrosEndpoints } from "@/shared/api/endpoints";
import type { LogrosEmpleadoSnapshotDTO } from "@/shared/api/types/logro";
import { env } from "@/shared/config/env";

const LOGROS_ME_QUERY_KEY = ["logros", "me"] as const;

const LEVEL_LABELS: Record<number, string> = {
  1: "Nuevo usuario",
  2: "Usuario activo",
  3: "Usuario constante",
  4: "Usuario experto",
  5: "Maestro del adelanto",
};

const POINTS_PER_LEVEL = 500;

function mapSnapshot(
  dto: LogrosEmpleadoSnapshotDTO,
): EmployeeAchievementsSnapshot {
  const activeItems = (dto.items || []).filter(
    (item) => item.activo !== false,
  );

  const sortedItems = [...activeItems].sort((a, b) => {
    const ordenA = typeof a.orden === "number" ? a.orden : 999;
    const ordenB = typeof b.orden === "number" ? b.orden : 999;
    return ordenA - ordenB;
  });

  const items: EmployeeAchievementsSnapshot["items"] = sortedItems.map((item) => ({
    id: item.codigo || item.id,
    codigo: item.codigo,
    title: item.titulo,
    description: item.descripcion,
    points: item.puntos,
    icon: item.icon_key as AchievementIconKey,
    iconKey: item.icon_key,
    orden: item.orden,
    activo: item.activo,
    unlocked: Boolean(item.unlocked),
    unlockedAt: item.unlocked_at ? item.unlocked_at.slice(0, 10) : null,
  }));

  const totalPoints = items
    .filter((item) => item.unlocked)
    .reduce((sum, item) => sum + item.points, 0);

  const maxPointsForLevel =
    dto.max_points_for_level && dto.max_points_for_level > 0
      ? dto.max_points_for_level
      : POINTS_PER_LEVEL;

  const level =
    dto.level && dto.level > 0
      ? dto.level
      : Math.floor(totalPoints / maxPointsForLevel) + 1;

  const levelLabel =
    dto.level_label ||
    LEVEL_LABELS[level] ||
    `Nivel ${level}`;

  const pointsIntoLevel = totalPoints % maxPointsForLevel;
  const pointsToNextLevel = maxPointsForLevel - pointsIntoLevel;

  const firstAdvanceUnlocked = items.some(
    (i) => (i.codigo === "primera_vez" || i.id === "primera_vez") && i.unlocked,
  );

  return {
    items,
    totalPoints,
    level,
    levelLabel,
    pointsToNextLevel,
    maxPointsForLevel,
    firstAdvance: dto.first_advance ?? {
      unlocked: firstAdvanceUnlocked,
      completed: firstAdvanceUnlocked ? 1 : 0,
      required: 1,
    },
  };
}

const EMPTY_SNAPSHOT: EmployeeAchievementsSnapshot = {
  items: [],
  totalPoints: 0,
  level: 1,
  levelLabel: "Nuevo usuario",
  pointsToNextLevel: 500,
  maxPointsForLevel: 500,
  firstAdvance: { unlocked: false, completed: 0, required: 1 },
};

/**
 * Logros del empleado desde GET /logros/me/ (persistidos en backend).
 * El servidor desbloquea según reglas del catálogo administrado por superadmin.
 */
export function useEmployeeAchievements(): {
  data: EmployeeAchievementsSnapshot;
  isLoading: boolean;
} {
  const { session } = useAuth();
  const isEmpleado = session ? isEmpleadoSession(session) : false;
  const enabled = Boolean(env.apiUrl) && isEmpleado;

  const query = useQuery({
    queryKey: LOGROS_ME_QUERY_KEY,
    queryFn: () => logrosEndpoints.me(),
    enabled,
    staleTime: 0,
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
  });

  return {
    data: query.data ? mapSnapshot(query.data) : EMPTY_SNAPSHOT,
    isLoading: query.isLoading,
  };
}
