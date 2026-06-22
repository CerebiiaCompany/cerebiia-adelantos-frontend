// ⚠️ AGNOSTIC — HTTP client with Bearer JWT, refresh queue, and 401 retry.

import { authStorage } from "./authStorage";
import { isSystemUserSession } from "./authMappers";
import { ApiError } from "./errors";
import { resolveApiUrl } from "@/shared/config/env";
import type { RefreshTokenResponse } from "./types/auth";

const BASE_URL = resolveApiUrl();

const NO_BEARER_PATHS = [
  "/auth/login/",
  "/auth/refresh/",
  "/empleados/login/",
  "/empleados/verificar-pre-registro/",
  "/empleados/activar/",
] as const;

const NO_REFRESH_ON_401_PATHS = [
  ...NO_BEARER_PATHS,
  "/auth/logout/",
] as const;

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let refreshPromise: Promise<boolean> | null = null;

export function registerUnauthorizedHandler(handler: UnauthorizedHandler): () => void {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null;
    }
  };
}

function isNoBearerPath(path: string): boolean {
  return NO_BEARER_PATHS.some((publicPath) => path.includes(publicPath));
}

function isNoRefreshOn401Path(path: string): boolean {
  return NO_REFRESH_ON_401_PATHS.some((publicPath) => path.includes(publicPath));
}

async function parseResponseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const session = authStorage.get();
    if (
      !session?.refreshToken ||
      !BASE_URL ||
      !isSystemUserSession(session)
    ) {
      return false;
    }

    try {
      const res = await fetch(`${BASE_URL}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: session.refreshToken }),
      });

      if (!res.ok) return false;

      const data = (await res.json()) as RefreshTokenResponse;
      authStorage.updateTokens(data.access, data.refresh);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function refreshAuthTokens(): Promise<boolean> {
  return refreshAccessToken();
}

async function request<T>(
  path: string,
  init?: RequestInit,
  hasRetried = false,
): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError(0, path, { detail: "API URL is not configured" });
  }

  const session = authStorage.get();
  const headers = new Headers(init?.headers);
  const isFormData = init?.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.accessToken && !isNoBearerPath(path)) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  let res: Response;

  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError(0, path, {
      detail: "No se pudo conectar con el servidor. Verifica que el backend esté activo.",
    });
  }

  if (res.status === 401 && !hasRetried && !isNoRefreshOn401Path(path) && session) {
    const canRefresh =
      isSystemUserSession(session) && Boolean(session.refreshToken);

    if (canRefresh) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request<T>(path, init, true);
      }
    }

    authStorage.clear();
    unauthorizedHandler?.();
  }

  const body = await parseResponseBody(res);

  if (!res.ok) {
    throw new ApiError(res.status, path, body);
  }

  if (res.status === 204 || body === null) {
    return undefined as T;
  }

  return body as T;
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  postForm: <T>(path: string, body: FormData) =>
    request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export function getApiBaseUrl(): string {
  return BASE_URL;
}
