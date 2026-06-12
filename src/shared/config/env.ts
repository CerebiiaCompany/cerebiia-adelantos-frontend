// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports
// import.meta.env is replaced at build time by Vite; Expo equivalent is process.env.
export const env = {
  apiUrl: (import.meta as any).env?.VITE_API_URL as string | undefined,
  appEnv: ((import.meta as any).env?.VITE_APP_ENV as string) ?? "development",
} as const;
