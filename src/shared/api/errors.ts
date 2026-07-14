// ⚠️ AGNOSTIC — HTTP error parsing for DRF/JWT backend

export class ApiError extends Error {
  readonly status: number;
  readonly path: string;
  readonly body: unknown;

  constructor(status: number, path: string, body: unknown) {
    super(parseApiErrorMessage(body, status));
    this.name = "ApiError";
    this.status = status;
    this.path = path;
    this.body = body;
  }
}

function localizeApiDetail(detail: string): string {
  const normalized = detail.trim().toLowerCase();

  if (normalized === "invalid email or password") {
    return "Credenciales incorrectas. Verifica tus datos e intenta de nuevo.";
  }

  return detail;
}

function isBackendUnreachable(body: unknown, status: number): boolean {
  if (status !== 500 && status !== 502 && status !== 503) {
    return false;
  }

  if (body === null || body === "") {
    return true;
  }

  if (typeof body === "string") {
    const lower = body.toLowerCase();
    return (
      lower.includes("econnrefused") ||
      lower.includes("proxy error") ||
      lower.includes("socket hang up")
    );
  }

  return false;
}

function parseApiErrorMessage(body: unknown, status: number): string {
  if (isBackendUnreachable(body, status)) {
    return "No se pudo conectar con el backend. Inicia el servidor en http://localhost:8000 (Docker + runserver).";
  }
  if (typeof body === "string") {
    if (body.includes("<!DOCTYPE") || body.includes("<html")) {
      return `Error interno del servidor (${status}). Revisa la consola del backend.`;
    }
    const trimmed = body.trim();
    if (trimmed) return trimmed.slice(0, 280);
  }

  if (typeof body === "object" && body !== null) {
    const record = body as Record<string, unknown>;

    if (typeof record.detail === "string") {
      return localizeApiDetail(record.detail);
    }

    const fieldMessages = Object.values(record)
      .flatMap((value) => (Array.isArray(value) ? value : []))
      .filter((value): value is string => typeof value === "string");

    if (fieldMessages.length > 0) {
      return localizeApiDetail(fieldMessages[0]);
    }
  }

  if (status === 401) {
    return "Credenciales incorrectas. Verifica tus datos e intenta de nuevo.";
  }

  if (status === 403) {
    return "You do not have permission to perform this action";
  }

  if (status >= 500) {
    return `Error interno del servidor (${status})`;
  }

  return `Request failed (${status})`;
}
