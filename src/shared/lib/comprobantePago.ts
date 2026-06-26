// ⚠️ AGNOSTIC — URLs de comprobantes de transferencia (media del backend)

import { resolveApiUrl } from "@/shared/config/env";

export type ComprobanteFileKind = "image" | "pdf" | "other";

export function resolveMediaBaseUrl(): string {
  const configured = import.meta.env.VITE_MEDIA_URL as string | undefined;
  const trimmed = configured?.trim();

  if (trimmed) {
    return trimmed.replace(/\/$/, "");
  }

  const apiUrl = resolveApiUrl();
  if (!apiUrl || apiUrl.startsWith("/")) {
    return "";
  }

  return apiUrl.replace(/\/api\/v1\/?$/, "");
}

/**
 * Convierte la ruta relativa del backend en URL accesible desde el navegador.
 * Ej: comprobantes/{id}/transferencia.jpg → /media/comprobantes/{id}/transferencia.jpg
 */
export function resolveComprobantePagoUrl(
  comprobantePath: string | null | undefined,
): string | null {
  if (!comprobantePath?.trim()) return null;

  const trimmed = comprobantePath.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const normalized = trimmed.replace(/^\/+/, "");
  const mediaPath = normalized.startsWith("media/")
    ? `/${normalized}`
    : `/media/${normalized}`;

  const mediaBase = resolveMediaBaseUrl();
  return mediaBase ? `${mediaBase}${mediaPath}` : mediaPath;
}

export function getComprobanteFileKind(url: string): ComprobanteFileKind {
  const path = url.split("?")[0]?.toLowerCase() ?? "";

  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(path)) {
    return "image";
  }

  if (path.endsWith(".pdf")) {
    return "pdf";
  }

  return "other";
}
