// ⚠️ AGNOSTIC — local dashboard metrics until backend endpoints exist

import {
  createEmptyDashboardMetrics,
  serializeAdvanceHistoryRecord,
  type EmployeeDashboardMetrics,
} from "@/entities/employee-dashboard";
import { buildAdvanceHistoryRecord } from "@/shared/config/advanceHistory";

const STORAGE_PREFIX = "cerebiia:employee-dashboard:";

type DashboardListener = () => void;

const listeners = new Set<DashboardListener>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getStorageKey(employeeId: string): string {
  return `${STORAGE_PREFIX}${employeeId}`;
}

function formatActivityDate(date: Date): string {
  return `Hoy, ${date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}

function getMonthKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeEmployeeDashboard(listener: DashboardListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function loadEmployeeDashboardMetrics(
  employeeId: string,
): EmployeeDashboardMetrics {
  if (!isBrowser()) return createEmptyDashboardMetrics();

  const raw = window.localStorage.getItem(getStorageKey(employeeId));
  if (!raw) return createEmptyDashboardMetrics();

  try {
    const parsed = JSON.parse(raw) as EmployeeDashboardMetrics;
    return {
      ...createEmptyDashboardMetrics(),
      ...parsed,
      activity: Array.isArray(parsed.activity) ? parsed.activity : [],
      monthlyAdvances:
        typeof parsed.monthlyAdvances === "object" && parsed.monthlyAdvances
          ? parsed.monthlyAdvances
          : {},
      advanceHistory: Array.isArray(parsed.advanceHistory)
        ? parsed.advanceHistory
        : [],
    };
  } catch {
    return createEmptyDashboardMetrics();
  }
}

export function saveEmployeeDashboardMetrics(
  employeeId: string,
  metrics: EmployeeDashboardMetrics,
): void {
  if (!isBrowser()) return;

  window.localStorage.setItem(getStorageKey(employeeId), JSON.stringify(metrics));
  notifyListeners();
}

export function recordEmployeeAdvance(
  employeeId: string,
  amount: number,
): EmployeeDashboardMetrics {
  const current = loadEmployeeDashboardMetrics(employeeId);
  const now = new Date();
  const monthKey = getMonthKey(now);

  const historyRecord = buildAdvanceHistoryRecord(
    `adv-${now.getTime()}`,
    now.toISOString(),
    amount,
    "en_curso",
  );

  const nextMetrics: EmployeeDashboardMetrics = {
    ...current,
    totalAdvancedThisMonth: current.totalAdvancedThisMonth + amount,
    activity: [
      {
        type: "adelanto",
        amount: -amount,
        date: formatActivityDate(now),
        desc: "Adelanto rápido",
        createdAt: now.toISOString(),
      },
      ...current.activity,
    ].slice(0, 10),
    monthlyAdvances: {
      ...current.monthlyAdvances,
      [monthKey]: (current.monthlyAdvances[monthKey] ?? 0) + amount,
    },
    advanceHistory: [
      serializeAdvanceHistoryRecord(historyRecord),
      ...current.advanceHistory,
    ].slice(0, 50),
  };

  saveEmployeeDashboardMetrics(employeeId, nextMetrics);
  return nextMetrics;
}
