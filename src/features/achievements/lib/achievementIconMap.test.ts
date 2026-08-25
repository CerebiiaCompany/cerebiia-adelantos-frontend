import { describe, expect, it } from "vitest";
import { resolveAchievementIcon } from "./achievementIconMap";

describe("resolveAchievementIcon", () => {
  it("resuelve iconos estándar por nombre de lucide", () => {
    const trophy = resolveAchievementIcon("trophy");
    expect(trophy.iconName).toBe("trophy");
    expect(trophy.color).toBe("#F59E0B");

    const rocket = resolveAchievementIcon("rocket");
    expect(rocket.iconName).toBe("rocket");
    expect(rocket.color).toBe("#2563EB");

    const wallet = resolveAchievementIcon("wallet");
    expect(wallet.iconName).toBe("wallet");
    expect(wallet.color).toBe("#10B981");

    const coins = resolveAchievementIcon("coins");
    expect(coins.iconName).toBe("coins");
    expect(coins.color).toBe("#EC4899");

    const flame = resolveAchievementIcon("flame");
    expect(flame.iconName).toBe("flame");
    expect(flame.color).toBe("#F97316");

    const crown = resolveAchievementIcon("crown");
    expect(crown.iconName).toBe("crown");
    expect(crown.color).toBe("#9333EA");

    const clock = resolveAchievementIcon("clock");
    expect(clock.iconName).toBe("clock");
    expect(clock.color).toBe("#06B6D4");

    const shield = resolveAchievementIcon("shield");
    expect(shield.iconName).toBe("shield");
    expect(shield.color).toBe("#6366F1");

    const medal = resolveAchievementIcon("medal");
    expect(medal.iconName).toBe("medal");
    expect(medal.color).toBe("#0D9488");
  });

  it("soporta formato icono:color con color personalizado", () => {
    const customRocket = resolveAchievementIcon("rocket:#3B82F6");
    expect(customRocket.iconName).toBe("rocket");
    expect(customRocket.color).toBe("#3B82F6");

    const customStar = resolveAchievementIcon("star:#FFD700");
    expect(customStar.iconName).toBe("star");
    expect(customStar.color).toBe("#FFD700");
  });

  it("usa fallback para iconos no reconocidos o valores nulos", () => {
    const nullResult = resolveAchievementIcon(null);
    expect(nullResult.iconName).toBe("trophy");
    expect(nullResult.color).toBe("#F59E0B");

    const unknownResult = resolveAchievementIcon("unknown_icon_xyz");
    expect(unknownResult.color).toBe("#F59E0B");
  });
});
