// ⚠️ AGNOSTIC — employer notification persistence (localStorage)

import type { StoredNotification } from "./types";

const STORAGE_PREFIX = "cerebiia:employer-notifications:";

type NotificationListener = () => void;

const listeners = new Set<NotificationListener>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getStorageKey(employerUserId: string): string {
  return `${STORAGE_PREFIX}${employerUserId}`;
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

export function subscribeEmployerNotifications(
  listener: NotificationListener,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function loadEmployerNotifications(
  employerUserId: string,
): StoredNotification[] {
  if (!isBrowser() || !employerUserId) return [];

  const raw = window.localStorage.getItem(getStorageKey(employerUserId));
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredNotification);
  } catch {
    return [];
  }
}

export function saveEmployerNotifications(
  employerUserId: string,
  notifications: StoredNotification[],
): void {
  if (!isBrowser() || !employerUserId) return;

  window.localStorage.setItem(
    getStorageKey(employerUserId),
    JSON.stringify(notifications.slice(0, 100)),
  );
  notifyListeners();
}

export function upsertEmployerNotifications(
  employerUserId: string,
  candidates: StoredNotification[],
): { notifications: StoredNotification[]; addedCount: number } {
  if (!employerUserId || candidates.length === 0) {
    return {
      notifications: loadEmployerNotifications(employerUserId),
      addedCount: 0,
    };
  }

  const current = loadEmployerNotifications(employerUserId);
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
    .slice(0, 100);

  saveEmployerNotifications(employerUserId, next);
  return { notifications: next, addedCount: toAdd.length };
}
