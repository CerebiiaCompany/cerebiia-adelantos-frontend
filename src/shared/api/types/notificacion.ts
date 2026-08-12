// ⚠️ AGNOSTIC — notifications API DTOs

export interface NotificacionDTO {
  id: string;
  recipient_tipo: "empleado" | "empresa" | string;
  recipient_id: string;
  kind: string;
  title: string;
  description: string;
  href: string;
  dedupe_key: string;
  leida: boolean;
  created_at: string;
}

export interface ListadoNotificacionesDTO {
  items: NotificacionDTO[];
  unread_count: number;
}

export interface MarcarLeidasRequest {
  ids: string[];
}

export interface MarcarLeidasResponse {
  updated: number;
}
