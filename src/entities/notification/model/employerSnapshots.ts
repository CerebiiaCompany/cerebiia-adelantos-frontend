// ⚠️ AGNOSTIC — employer snapshots for change detection

export interface EmployerAdelantoConfigSnapshot {
  tarifaFijaPorCuota: number;
  porcentajeMaximoAdelanto: number;
  montoMinimoAdelanto: number | null;
}

export interface EmployerSuspendedSnapshot {
  baselineReady: boolean;
  /** empleadoId → updatedAt ISO */
  inactiveById: Record<string, string>;
}

const CONFIG_PREFIX = "cerebiia:employer-adelanto-config:";
const SUSPENDED_PREFIX = "cerebiia:employer-suspended-empleados:";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readJson<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function loadEmployerAdelantoConfigSnapshot(
  employerUserId: string,
): EmployerAdelantoConfigSnapshot | null {
  const parsed = readJson<EmployerAdelantoConfigSnapshot>(
    `${CONFIG_PREFIX}${employerUserId}`,
  );
  if (!parsed || typeof parsed.tarifaFijaPorCuota !== "number") return null;
  return parsed;
}

export function saveEmployerAdelantoConfigSnapshot(
  employerUserId: string,
  value: EmployerAdelantoConfigSnapshot | null,
): void {
  if (!isBrowser() || !employerUserId) return;
  const key = `${CONFIG_PREFIX}${employerUserId}`;
  if (value == null) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }
  writeJson(key, value);
}

export function loadEmployerSuspendedSnapshot(
  employerUserId: string,
): EmployerSuspendedSnapshot {
  const parsed = readJson<EmployerSuspendedSnapshot>(
    `${SUSPENDED_PREFIX}${employerUserId}`,
  );
  if (!parsed || typeof parsed.inactiveById !== "object" || !parsed.inactiveById) {
    return { baselineReady: false, inactiveById: {} };
  }
  return {
    baselineReady: parsed.baselineReady === true,
    inactiveById: parsed.inactiveById,
  };
}

export function saveEmployerSuspendedSnapshot(
  employerUserId: string,
  value: EmployerSuspendedSnapshot,
): void {
  writeJson(`${SUSPENDED_PREFIX}${employerUserId}`, value);
}

/** ISO week key YYYY-Www (UTC-ish local calendar). */
export function getIsoWeekKey(date: Date = new Date()): string {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNum = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNum + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7,
    );
  return `${target.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Vie–Dom: ventana de “culminación” de semana laboral. */
export function isWeekCulminating(date: Date = new Date()): boolean {
  const day = date.getDay();
  return day === 5 || day === 6 || day === 0;
}
