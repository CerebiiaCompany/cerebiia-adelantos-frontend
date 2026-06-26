// ⚠️ AGNOSTIC — payroll advance dashboard rules

import type {
  DashboardChartPoint,
  EmployeeDashboardMetrics,
  EmployeeDashboardSnapshot,
} from "./types";
import {
  calculateCumulativeAccumulatedIncome,
  calculateDailySalaryIncome,
  calculateIncomeForCalendarMonth,
} from "./salaryAccrual";

export const ADVANCE_SALARY_RATIO = 0.3;

export function parseEmployeeSalary(salario: string): number {
  const amount = Number.parseFloat(salario);
  if (Number.isNaN(amount)) return 0;
  return Math.round(amount);
}

export function calculateMaxAdvanceLimit(salary: number): number {
  return Math.floor(salary * ADVANCE_SALARY_RATIO);
}

export function calculateAvailableAdvance(
  salary: number,
  totalAdvanced: number,
): number {
  return Math.max(0, calculateMaxAdvanceLimit(salary) - totalAdvanced);
}

export function calculateWalletBalance(
  salary: number,
  totalAdvanced: number,
): number {
  return Math.max(0, salary - totalAdvanced);
}

export function createEmptyDashboardMetrics(): EmployeeDashboardMetrics {
  return {
    totalAdvancedThisMonth: 0,
    accumulatedIncome: 0,
    incomeToday: 0,
    activity: [],
    monthlyAdvances: {},
    advanceHistory: [],
  };
}

function formatMonthLabel(date: Date): string {
  const label = date.toLocaleDateString("es-CO", { month: "short" });
  const normalized = label.replace(/\./g, "");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getMonthKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

export function buildDashboardChartData(
  monthlyAdvances: Record<string, number>,
  salary = 0,
  referenceDate: Date = new Date(),
  incomeStartDate?: string | Date | null,
): DashboardChartPoint[] {
  const points: DashboardChartPoint[] = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(referenceDate);
    date.setDate(1);
    date.setMonth(date.getMonth() - offset);

    const monthKey = getMonthKey(date);
    points.push({
      name: formatMonthLabel(date),
      ingresos: calculateIncomeForCalendarMonth(
        salary,
        incomeStartDate,
        date,
        referenceDate,
      ),
      adelantos: monthlyAdvances[monthKey] ?? 0,
    });
  }

  return points;
}

export function buildEmployeeDashboardSnapshot(
  displayName: string,
  salary: number,
  metrics: EmployeeDashboardMetrics,
  maxAdvanceLimit?: number,
  referenceDate: Date = new Date(),
  incomeStartDate?: string | Date | null,
): EmployeeDashboardSnapshot {
  const limit = maxAdvanceLimit ?? calculateMaxAdvanceLimit(salary);
  const availableAdvance = Math.max(0, limit - metrics.totalAdvancedThisMonth);
  const walletBalance = calculateWalletBalance(
    salary,
    metrics.totalAdvancedThisMonth,
  );
  const accumulatedIncome = calculateCumulativeAccumulatedIncome(
    salary,
    incomeStartDate,
    referenceDate,
  );
  const incomeToday = calculateDailySalaryIncome(salary, referenceDate);

  return {
    displayName,
    salary,
    availableAdvance,
    maxAdvanceLimit: limit,
    accumulatedIncome,
    incomeToday,
    totalAdvancedThisMonth: metrics.totalAdvancedThisMonth,
    walletBalance,
    chartData: buildDashboardChartData(
      metrics.monthlyAdvances,
      salary,
      referenceDate,
      incomeStartDate,
    ),
    recentActivity: metrics.activity,
  };
}
