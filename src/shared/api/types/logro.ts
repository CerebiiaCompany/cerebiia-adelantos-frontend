// ⚠️ AGNOSTIC — logros / achievements API DTOs

export interface LogroAdminDTO {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  puntos: number;
  icon_key: string;
  regla: "primera_vez" | "adelanto_count" | "manual" | string;
  umbral: number | null;
  activo: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface CrearLogroRequest {
  codigo: string;
  titulo: string;
  descripcion: string;
  puntos: number;
  icon_key?: string;
  regla: "primera_vez" | "adelanto_count" | "manual";
  umbral?: number | null;
  activo?: boolean;
  orden?: number;
}

export interface ActualizarLogroRequest {
  titulo?: string;
  descripcion?: string;
  puntos?: number;
  icon_key?: string;
  regla?: "primera_vez" | "adelanto_count" | "manual";
  umbral?: number | null;
  activo?: boolean;
  orden?: number;
}

export interface LogroEmpleadoItemDTO {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  puntos: number;
  icon_key: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface LogrosEmpleadoSnapshotDTO {
  items: LogroEmpleadoItemDTO[];
  total_points: number;
  level: number;
  level_label: string;
  points_to_next_level: number;
  max_points_for_level: number;
  first_advance: {
    unlocked: boolean;
    completed: number;
    required: number;
  };
}
