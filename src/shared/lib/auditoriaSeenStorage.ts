// ⚠️ AGNOSTIC — tracks which employee data-change audits the company has already opened

const STORAGE_KEY = "cerebiia.auditoria.seen-cambios";
export const AUDITORIA_SEEN_CHANGED_EVENT = "cerebiia:auditoria-seen-changed";

function readSeenIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function writeSeenIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    window.dispatchEvent(new Event(AUDITORIA_SEEN_CHANGED_EVENT));
  } catch {
    // ignore quota / private mode
  }
}

export function getSeenAuditoriaCambioIds(): Set<string> {
  return readSeenIds();
}

/** Changes that should alert the company (someone other than the company edited data). */
export function isAuditoriaCambioAlertable(cambio: {
  actor_tipo?: string;
}): boolean {
  return cambio.actor_tipo !== "empresa";
}

export function isAuditoriaCambioUnread(
  cambioId: string,
  alertable: boolean,
  seenIds: Set<string> = readSeenIds(),
): boolean {
  return alertable && !seenIds.has(cambioId);
}

export function markAuditoriaCambioSeen(cambioId: string): Set<string> {
  const next = readSeenIds();
  next.add(cambioId);
  writeSeenIds(next);
  return next;
}

export function countUnreadAuditoriaCambios(
  cambios: Array<{ id: string; actor_tipo?: string }>,
  seenIds: Set<string> = readSeenIds(),
): number {
  return cambios.filter((cambio) =>
    isAuditoriaCambioUnread(
      cambio.id,
      isAuditoriaCambioAlertable(cambio),
      seenIds,
    ),
  ).length;
}
