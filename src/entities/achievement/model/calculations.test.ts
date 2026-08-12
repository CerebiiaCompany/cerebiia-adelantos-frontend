import { describe, expect, it } from "vitest";
import {
  buildEmployeeAchievementsSnapshot,
  resolveUnlockedAchievementIds,
} from "./calculations";

describe("achievement calculations", () => {
  it("desbloquea Primera vez con el primer adelanto no rechazado", () => {
    expect(resolveUnlockedAchievementIds({ completedAdvanceCount: 0 }).has("primera_vez")).toBe(
      false,
    );
    expect(resolveUnlockedAchievementIds({ completedAdvanceCount: 1 }).has("primera_vez")).toBe(
      true,
    );
  });

  it("desbloquea hitos N°5, N°15 y N°30 según el conteo de adelantos", () => {
    expect(resolveUnlockedAchievementIds({ completedAdvanceCount: 4 }).has("adelanto_5")).toBe(
      false,
    );
    expect(resolveUnlockedAchievementIds({ completedAdvanceCount: 5 }).has("adelanto_5")).toBe(
      true,
    );
    expect(resolveUnlockedAchievementIds({ completedAdvanceCount: 14 }).has("adelanto_15")).toBe(
      false,
    );
    expect(resolveUnlockedAchievementIds({ completedAdvanceCount: 15 }).has("adelanto_15")).toBe(
      true,
    );
    expect(resolveUnlockedAchievementIds({ completedAdvanceCount: 29 }).has("adelanto_30")).toBe(
      false,
    );
    expect(resolveUnlockedAchievementIds({ completedAdvanceCount: 30 }).has("adelanto_30")).toBe(
      true,
    );
  });

  it("suma puntos y progreso de bienvenida al completar el primer adelanto", () => {
    const locked = buildEmployeeAchievementsSnapshot({ completedAdvanceCount: 0 });
    expect(locked.totalPoints).toBe(0);
    expect(locked.level).toBe(1);
    expect(locked.firstAdvance).toEqual({
      unlocked: false,
      completed: 0,
      required: 1,
    });
    expect(locked.items.find((item) => item.id === "primera_vez")?.unlocked).toBe(false);

    const unlocked = buildEmployeeAchievementsSnapshot({ completedAdvanceCount: 1 });
    expect(unlocked.totalPoints).toBe(100);
    expect(unlocked.level).toBe(1);
    expect(unlocked.pointsToNextLevel).toBe(400);
    expect(unlocked.firstAdvance).toEqual({
      unlocked: true,
      completed: 1,
      required: 1,
    });
    expect(unlocked.items.find((item) => item.id === "primera_vez")?.unlocked).toBe(true);
    expect(unlocked.items[0]?.id).toBe("primera_vez");
    expect(unlocked.items[0]?.unlocked).toBe(true);
  });

  it("acumula puntos de hitos y prioriza desbloqueados", () => {
    const atFive = buildEmployeeAchievementsSnapshot({ completedAdvanceCount: 5 });
    expect(atFive.totalPoints).toBe(300); // 100 + 200
    expect(atFive.items.filter((item) => item.unlocked).map((item) => item.id)).toEqual([
      "primera_vez",
      "adelanto_5",
    ]);

    const atThirty = buildEmployeeAchievementsSnapshot({ completedAdvanceCount: 30 });
    expect(atThirty.totalPoints).toBe(1450); // 100 + 200 + 400 + 750
    expect(atThirty.items[0]?.unlocked).toBe(true);
    expect(atThirty.items.filter((item) => item.unlocked).map((item) => item.id)).toEqual([
      "primera_vez",
      "adelanto_5",
      "adelanto_15",
      "adelanto_30",
    ]);
  });
});
