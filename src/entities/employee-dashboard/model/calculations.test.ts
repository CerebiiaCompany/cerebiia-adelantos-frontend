import { describe, expect, it } from "vitest";
import {
  buildEmployeeDashboardSnapshot,
  createEmptyDashboardMetrics,
  parseEmployeeSalary,
} from "./calculations";

describe("employee dashboard calculations", () => {
  const juneReference = new Date("2026-06-13T12:00:00");
  const hireDate = "2026-01-15";

  it("inicia con el 30% del salario disponible y acumula ingresos desde el ingreso", () => {
    const snapshot = buildEmployeeDashboardSnapshot(
      "Erick",
      parseEmployeeSalary("2400000.00"),
      createEmptyDashboardMetrics(),
      undefined,
      juneReference,
      hireDate,
    );

    expect(snapshot.salary).toBe(2_400_000);
    expect(snapshot.availableAdvance).toBe(720_000);
    expect(snapshot.maxAdvanceLimit).toBe(720_000);
    expect(snapshot.accumulatedIncome).toBe(11_956_129);
    expect(snapshot.incomeToday).toBe(80_000);
    expect(snapshot.totalAdvancedThisMonth).toBe(0);
    expect(snapshot.walletBalance).toBe(2_400_000);
    expect(snapshot.recentActivity).toHaveLength(0);
    expect(snapshot.chartData.every((point) => point.adelantos === 0)).toBe(true);
    expect(snapshot.chartData.at(-1)?.ingresos).toBe(1_040_000);
    expect(snapshot.chartData.at(-2)?.ingresos).toBe(2_400_000);
  });

  it("no acumula ingresos sin fecha de ingreso del empleado", () => {
    const snapshot = buildEmployeeDashboardSnapshot(
      "Erick",
      parseEmployeeSalary("2400000.00"),
      createEmptyDashboardMetrics(),
      undefined,
      juneReference,
    );

    expect(snapshot.accumulatedIncome).toBe(0);
    expect(snapshot.walletBalance).toBe(2_400_000);
    expect(snapshot.chartData.every((point) => point.ingresos === 0)).toBe(true);
  });

  it("actualiza métricas cuando hay actividad de adelanto", () => {
    const snapshot = buildEmployeeDashboardSnapshot(
      "Erick",
      2_400_000,
      {
        ...createEmptyDashboardMetrics(),
        totalAdvancedThisMonth: 500_000,
        activity: [
          {
            type: "adelanto",
            amount: -500_000,
            date: "Hoy, 14:30",
            desc: "Adelanto rápido",
            createdAt: "2026-06-19T14:30:00.000Z",
          },
        ],
        monthlyAdvances: {
          "2026-06": 500_000,
        },
      },
      720_000,
      juneReference,
      hireDate,
    );

    expect(snapshot.totalAdvancedThisMonth).toBe(500_000);
    expect(snapshot.availableAdvance).toBe(220_000);
    expect(snapshot.walletBalance).toBe(1_900_000);
    expect(snapshot.recentActivity).toHaveLength(1);
    expect(snapshot.chartData.some((point) => point.adelantos === 500_000)).toBe(
      true,
    );
  });
});
