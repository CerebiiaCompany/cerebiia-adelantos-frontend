// ⚠️ AGNOSTIC — snapshot of next payment net for change detection

const STORAGE_PREFIX = "cerebiia:employee-next-payment-net:";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getStorageKey(employeeId: string): string {
  return `${STORAGE_PREFIX}${employeeId}`;
}

export function loadNextPaymentNetSnapshot(
  employeeId: string,
): number | null {
  if (!isBrowser() || !employeeId) return null;
  try {
    const raw = window.localStorage.getItem(getStorageKey(employeeId));
    if (raw == null || raw === "") return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

export function saveNextPaymentNetSnapshot(
  employeeId: string,
  value: number | null,
): void {
  if (!isBrowser() || !employeeId) return;
  try {
    if (value == null) {
      window.localStorage.removeItem(getStorageKey(employeeId));
      return;
    }
    window.localStorage.setItem(getStorageKey(employeeId), String(value));
  } catch {
    // ignore quota / private mode
  }
}
