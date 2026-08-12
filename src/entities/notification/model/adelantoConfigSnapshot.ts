// ⚠️ AGNOSTIC — snapshot of adelanto config for change detection

export interface AdelantoConfigSnapshot {
  tarifaFijaPorCuota: number;
  porcentajeMaximoAdelanto: number;
}

const STORAGE_PREFIX = "cerebiia:employee-adelanto-config:";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getStorageKey(employeeId: string): string {
  return `${STORAGE_PREFIX}${employeeId}`;
}

function isSnapshot(value: unknown): value is AdelantoConfigSnapshot {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.tarifaFijaPorCuota === "number" &&
    Number.isFinite(record.tarifaFijaPorCuota) &&
    typeof record.porcentajeMaximoAdelanto === "number" &&
    Number.isFinite(record.porcentajeMaximoAdelanto)
  );
}

export function loadAdelantoConfigSnapshot(
  employeeId: string,
): AdelantoConfigSnapshot | null {
  if (!isBrowser() || !employeeId) return null;
  try {
    const raw = window.localStorage.getItem(getStorageKey(employeeId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveAdelantoConfigSnapshot(
  employeeId: string,
  value: AdelantoConfigSnapshot | null,
): void {
  if (!isBrowser() || !employeeId) return;
  try {
    if (value == null) {
      window.localStorage.removeItem(getStorageKey(employeeId));
      return;
    }
    window.localStorage.setItem(getStorageKey(employeeId), JSON.stringify(value));
  } catch {
    // ignore quota / private mode
  }
}
