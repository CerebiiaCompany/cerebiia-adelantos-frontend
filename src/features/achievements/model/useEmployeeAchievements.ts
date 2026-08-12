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

const ICON_MAP: Record<string, AchievementIconKey> = {
  star: "star",
  milestone5: "milestone5",
  milestone15: "milestone15",
  milestone30: "milestone30",
  shield: "shield",
  flame: "flame",
  target: "target",
  award: "award",
};

function mapIcon(iconKey: string): AchievementIconKey {
  return ICON_MAP[iconKey] ?? "star";
}

function mapSnapshot(
  dto: LogrosEmpleadoSnapshotDTO,
): EmployeeAchievementsSnapshot {
  return {
    items: dto.items.map((item) => ({
      id: item.codigo as EmployeeAchievementsSnapshot["items"][number]["id"],
      title: item.titulo,
      description: item.descripcion,
      points: item.puntos,
      icon: mapIcon(item.icon_key),
      unlocked: item.unlocked,
      unlockedAt: item.unlocked_at
        ? item.unlocked_at.slice(0, 10)
        : null,
    })),
    totalPoints: dto.total_points,
    level: dto.level,
    levelLabel: dto.level_label,
    pointsToNextLevel: dto.points_to_next_level,
    maxPointsForLevel: dto.max_points_for_level,
    firstAdvance: dto.first_advance,
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
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  return {
    data: query.data ? mapSnapshot(query.data) : EMPTY_SNAPSHOT,
    isLoading: query.isLoading,
  };
}
