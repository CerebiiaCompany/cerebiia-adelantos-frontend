// ⚠️ AGNOSTIC — tracks which company support replies the employee has already opened

const STORAGE_KEY = "cerebiia.soporte.seen-responses";
export const SOPORTE_SEEN_CHANGED_EVENT = "cerebiia:soporte-seen-changed";

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
    window.dispatchEvent(new Event(SOPORTE_SEEN_CHANGED_EVENT));
  } catch {
    // ignore quota / private mode
  }
}

export function getSeenSoporteResponseIds(): Set<string> {
  return readSeenIds();
}

export function hasCompanySoporteReply(reporte: {
  respuesta_empresa?: string | null;
  estado?: string;
}): boolean {
  return (
    Boolean(reporte.respuesta_empresa?.trim()) || reporte.estado === "respondido"
  );
}

export function isSoporteResponseUnread(
  reporteId: string,
  hasCompanyReply: boolean,
  seenIds: Set<string> = readSeenIds(),
): boolean {
  return hasCompanyReply && !seenIds.has(reporteId);
}

export function markSoporteResponseSeen(reporteId: string): Set<string> {
  const next = readSeenIds();
  next.add(reporteId);
  writeSeenIds(next);
  return next;
}

export function countUnreadSoporteResponses(
  reportes: Array<{
    id: string;
    respuesta_empresa?: string | null;
    estado?: string;
  }>,
  seenIds: Set<string> = readSeenIds(),
): number {
  return reportes.filter((reporte) =>
    isSoporteResponseUnread(
      reporte.id,
      hasCompanySoporteReply(reporte),
      seenIds,
    ),
  ).length;
}
