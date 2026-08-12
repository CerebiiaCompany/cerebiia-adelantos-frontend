// ⚠️ AGNOSTIC — persisted notifications per employee (localStorage)

import {
  buildAdvanceRequestedNotification,
  type StoredNotification,
} from "./types";

const STORAGE_PREFIX = "cerebiia:employee-notifications:";

type NotificationListener = () => void;

const listeners = new Set<NotificationListener>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getStorageKey(employeeId: string): string {
  return `${STORAGE_PREFIX}${employeeId}`;
}

function isStoredNotification(value: unknown): value is StoredNotification {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.kind === "string" &&
    typeof record.title === "string" &&
    typeof record.description === "string" &&
    typeof record.createdAt === "string"
  );
}

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeEmployeeNotifications(
  listener: NotificationListener,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function loadEmployeeNotifications(
  employeeId: string,
): StoredNotification[] {
  if (!isBrowser() || !employeeId) return [];

  const raw = window.localStorage.getItem(getStorageKey(employeeId));
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isStoredNotification);
  } catch {
    return [];
  }
}

export function saveEmployeeNotifications(
  employeeId: string,
  notifications: StoredNotification[],
): void {
  if (!isBrowser() || !employeeId) return;

  window.localStorage.setItem(
    getStorageKey(employeeId),
    JSON.stringify(notifications.slice(0, 80)),
  );
  notifyListeners();
}

export function appendEmployeeNotification(
  employeeId: string,
  notification: StoredNotification,
): StoredNotification[] {
  const current = loadEmployeeNotifications(employeeId);
  const next = [notification, ...current].slice(0, 80);
  saveEmployeeNotifications(employeeId, next);
  return next;
}

export function appendAdvanceRequestedNotification(
  employeeId: string,
  amount: number,
): StoredNotification[] {
  return appendEmployeeNotification(
    employeeId,
    buildAdvanceRequestedNotification(amount),
  );
}

/**
 * Inserta solo notificaciones con id nuevo. Conserva las existentes,
 * ordena por createdAt desc y limita a 80.
 */
export function upsertEmployeeNotifications(
  employeeId: string,
  candidates: StoredNotification[],
): { notifications: StoredNotification[]; addedCount: number } {
  if (!employeeId || candidates.length === 0) {
    return {
      notifications: loadEmployeeNotifications(employeeId),
      addedCount: 0,
    };
  }

  const current = loadEmployeeNotifications(employeeId);
  const existingIds = new Set(current.map((item) => item.id));
  const toAdd = candidates.filter((item) => !existingIds.has(item.id));

  if (toAdd.length === 0) {
    return { notifications: current, addedCount: 0 };
  }

  const next = [...toAdd, ...current]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 80);

  saveEmployeeNotifications(employeeId, next);
  return { notifications: next, addedCount: toAdd.length };
}
