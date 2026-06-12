import type { AuthResponse } from "@/shared/api/types";

const STORAGE_KEY = "cerebiia_auth";

export type AuthSession = AuthResponse;

export const authSession = {
  get(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  },

  set(session: AuthSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
