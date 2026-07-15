// ⚠️ AGNOSTIC — tracks empresa users that already completed the required password change
// when the backend does not yet send must_change_password.

const STORAGE_KEY = "cerebiia_empresa_password_changed";

function readIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function writeIds(ids: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export const passwordChangeCompletionStorage = {
  hasCompleted(userId: string): boolean {
    return readIds().has(userId);
  },

  markCompleted(userId: string): void {
    const ids = readIds();
    ids.add(userId);
    writeIds(ids);
  },

  clear(userId?: string): void {
    if (!userId) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const ids = readIds();
    ids.delete(userId);
    writeIds(ids);
  },
};
