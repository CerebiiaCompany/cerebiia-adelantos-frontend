import { DEMO_NOTIFICATIONS } from "@/shared/config/demoNotifications";

const STORAGE_KEY = "cerebiia:read-notification-ids";

export function loadReadNotificationIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Set();
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function saveReadNotificationIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Ignorar errores de almacenamiento (modo privado, cuota, etc.)
  }
}

export function getInitialReadNotificationIds(): Set<string> {
  const stored = loadReadNotificationIds();
  const preReadFromDemo = DEMO_NOTIFICATIONS.filter(
    (notification) => notification.read,
  ).map((notification) => notification.id);

  return new Set([...stored, ...preReadFromDemo]);
}
