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
 * Host Docker interno `minio` no es resoluble en el browser del host.
 * Lo reescribimos a localhost (puerto publicado por docker-compose).
 */
export function publicizeStorageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "minio") {
      parsed.hostname = "localhost";
      return parsed.toString();
    }
  } catch {
    return url;
  }
  return url;
}

/**
 * Convierte la ruta relativa del backend en URL accesible desde el navegador.
 * Ej: comprobantes/{id}/transferencia.jpg → /media/comprobantes/{id}/transferencia.jpg
 * También acepta `/media/...` o URL absoluta https://...
 */
export function resolveComprobantePagoUrl(
  comprobantePath: string | null | undefined,
): string | null {
  if (!comprobantePath?.trim()) return null;

  const trimmed = comprobantePath.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return publicizeStorageUrl(trimmed);
  }

  const normalized = trimmed.replace(/^\/+/, "");
  const mediaPath = normalized.startsWith("media/")
    ? `/${normalized}`
    : `/media/${normalized}`;

  const mediaBase = resolveMediaBaseUrl();
  return mediaBase ? `${mediaBase}${mediaPath}` : mediaPath;
}

/**
 * Contrato backend (listado/detalle/historial):
 * prioriza `comprobante_pago_url` (URL usable) y cae a `comprobante_pago` (FileField path).
 */
export function resolveSolicitudComprobanteUrl(fields: {
  comprobante_pago_url?: string | null;
  comprobante_pago?: string | null;
}): string | null {
  return resolveComprobantePagoUrl(
    fields.comprobante_pago_url ?? fields.comprobante_pago,
  );
}

export function getComprobanteFileKind(url: string): ComprobanteFileKind {
  const path = url.split("?")[0]?.toLowerCase() ?? "";

  // Incluye `.jpe` (JPEG abreviado que a veces sube MinIO/OS).
  if (/\.(png|jpg|jpeg|jpe|gif|webp|bmp|svg)$/.test(path)) {
    return "image";
  }

  if (path.endsWith(".pdf")) {
    return "pdf";
  }

  return "other";
}
