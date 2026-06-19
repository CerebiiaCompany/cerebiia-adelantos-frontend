import { describe, expect, it } from "vitest";
import {
  buildEmployeeDashboardSnapshot,
  createEmptyDashboardMetrics,
  parseEmployeeSalary,
} from "./calculations";

describe("employee dashboard calculations", () => {
  it("inicia con el 30% del salario disponible y el resto en ceros", () => {
    const snapshot = buildEmployeeDashboardSnapshot(
      "Erick",
      parseEmployeeSalary("2400000.00"),
      createEmptyDashboardMetrics(),
    );

    expect(snapshot.salary).toBe(2_400_000);
    expect(snapshot.availableAdvance).toBe(720_000);
    expect(snapshot.accumulatedIncome).toBe(0);
    expect(snapshot.incomeToday).toBe(0);
    expect(snapshot.totalAdvancedThisMonth).toBe(0);
    expect(snapshot.recentActivity).toHaveLength(0);
    expect(snapshot.chartData.every((point) => point.ingresos === 0)).toBe(true);
    expect(snapshot.chartData.every((point) => point.adelantos === 0)).toBe(true);
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
    );

    expect(snapshot.totalAdvancedThisMonth).toBe(500_000);
    expect(snapshot.availableAdvance).toBe(220_000);
    expect(snapshot.recentActivity).toHaveLength(1);
    expect(snapshot.chartData.some((point) => point.adelantos === 500_000)).toBe(
      true,
    );
  });
});
