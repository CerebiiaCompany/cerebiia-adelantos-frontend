import { describe, expect, it } from "vitest";
import {
  buildInstallmentCutoffDates,
  formatIsoDateLocal,
  resolveInstallmentCutoffIso,
} from "./installmentCutoffDates";

describe("installmentCutoffDates", () => {
  it("inicia la primera cuota en el mes de la solicitud", () => {
    const dates = buildInstallmentCutoffDates("2026-07-14T10:00:00-05:00", 2);

    expect(dates).toHaveLength(2);
    expect(formatIsoDateLocal(dates[0])).toBe("2026-07-30");
    expect(formatIsoDateLocal(dates[1])).toBe("2026-08-30");
  });

  it("con una sola cuota usa el pago del mismo mes", () => {
    const dates = buildInstallmentCutoffDates(new Date(2026, 6, 10), 1);
    expect(formatIsoDateLocal(dates[0])).toBe("2026-07-30");
  });

  it("ajusta febrero al último día del mes", () => {
    const dates = buildInstallmentCutoffDates(new Date(2026, 1, 5), 1);
    expect(formatIsoDateLocal(dates[0])).toBe("2026-02-28");
  });

  it("resuelve ISO por número de cuota", () => {
    expect(
      resolveInstallmentCutoffIso("2026-07-14T12:00:00Z", 1, 3),
    ).toBe("2026-07-30");
    expect(
      resolveInstallmentCutoffIso("2026-07-14T12:00:00Z", 3, 3),
    ).toBe("2026-09-30");
  });
});
