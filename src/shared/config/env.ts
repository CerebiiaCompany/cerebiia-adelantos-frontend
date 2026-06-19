// ⚠️ AGNOSTIC — import.meta.env is replaced at build time by Vite.

export function resolveApiUrl(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  const trimmed = raw?.trim();

  if (trimmed) {
    return trimmed.replace(/\/$/, "");
  }

  // Dev fallback: Vite proxy forwards /api → backend (evita CORS en :8080/:8081).
  if (import.meta.env.DEV) {
    return "/api/v1";
  }

  return "";
}

export const env = {
  apiUrl: resolveApiUrl(),
  appEnv: (import.meta.env.VITE_APP_ENV as string | undefined) ?? "development",
  isApiConfigured: Boolean(resolveApiUrl()),
} as const;
