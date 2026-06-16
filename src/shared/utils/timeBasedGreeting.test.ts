import { describe, expect, it } from "vitest";
import { CloudSun, MoonStar, Sunrise } from "lucide-react";
import {
  getDayPeriod,
  getFirstName,
  getTimeBasedGreeting,
} from "./timeBasedGreeting";

describe("getDayPeriod", () => {
  it("clasifica la mañana entre las 5:00 y las 11:59", () => {
    expect(getDayPeriod(5)).toBe("morning");
    expect(getDayPeriod(11)).toBe("morning");
  });

  it("clasifica la tarde entre las 12:00 y las 18:59", () => {
    expect(getDayPeriod(12)).toBe("afternoon");
    expect(getDayPeriod(18)).toBe("afternoon");
  });

  it("clasifica la noche en el resto del día", () => {
    expect(getDayPeriod(19)).toBe("night");
    expect(getDayPeriod(0)).toBe("night");
    expect(getDayPeriod(4)).toBe("night");
  });
});

describe("getFirstName", () => {
  it("extrae el primer nombre", () => {
    expect(getFirstName("Erick Herrera")).toBe("Erick");
  });

  it("devuelve un fallback cuando no hay nombre", () => {
    expect(getFirstName("")).toBe("allí");
    expect(getFirstName("   ")).toBe("allí");
  });
});

describe("getTimeBasedGreeting", () => {
  it("genera saludo matutino con icono de amanecer", () => {
    const greeting = getTimeBasedGreeting(
      new Date("2026-06-13T09:30:00"),
      "Erick Herrera",
    );

    expect(greeting.period).toBe("morning");
    expect(greeting.title).toBe("Buenos días, Erick");
    expect(greeting.icon).toBe(Sunrise);
  });

  it("genera saludo vespertino", () => {
    const greeting = getTimeBasedGreeting(
      new Date("2026-06-13T15:00:00"),
      "Erick Herrera",
    );

    expect(greeting.period).toBe("afternoon");
    expect(greeting.title).toBe("Buenas tardes, Erick");
    expect(greeting.icon).toBe(CloudSun);
  });

  it("genera saludo nocturno con icono de luna y estrella", () => {
    const greeting = getTimeBasedGreeting(
      new Date("2026-06-13T21:00:00"),
      "Erick Herrera",
    );

    expect(greeting.period).toBe("night");
    expect(greeting.title).toBe("Buenas noches, Erick");
    expect(greeting.icon).toBe(MoonStar);
  });
});
