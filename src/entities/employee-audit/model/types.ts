import type { AuditoriaCambioItemDTO } from "@/shared/api/types/empleado";

export type EmployeeAuditCategory =
  | "todos"
  | "solicitudes"
  | "cupo"
  | "configuracion"
  | "perfil";

export type EmployeeAuditEventType =
  | "solicitud_creada"
  | "solicitud_en_revision"
  | "solicitud_aprobada"
  | "solicitud_rechazada"
  | "solicitud_pagada"
  | "cuota_liberada"
  | "cambio_perfil"
  | "cambio_configuracion";

export interface EmployeeUnifiedAuditRecord {
  id: string;
  timestamp: string;
  eventType: EmployerAuditEventType | EmployeeAuditEventType;
  category: "solicitudes" | "cupo" | "configuracion" | "perfil";
  title: string;
  description: string;
  actorNombre: string;
  actorTipo: string;
  statusBadge: {
    label: string;
    tone: "success" | "warning" | "danger" | "info" | "purple" | "neutral";
  };
  /** Metadatos adicionales para adelantos / cupo / evidencias / perfil / configuración */
  solicitudId?: string;
  amount?: number;
  netAmount?: number;
  installments?: number;
  currentInstallment?: number;
  cupoAnterior?: number;
  cupoNuevo?: number;
  evidenceUrl?: string | null;
  rejectionReason?: string | null;
  profileChanges?: AuditoriaCambioItemDTO[];
  configDetails?: {
    scope: "global" | "empresa" | "empleado";
    scopeTargetName?: string;
    parameters: Array<{
      parameter: string;
      value: string | number;
    }>;
  };
}

export interface EmployeeAuditSummaryMetrics {
  totalEvents: number;
  totalSolicitudesTracked: number;
  totalProfileChanges: number;
  totalCuotasLiberadas: number;
  availableAdvance: number;
  maxAdvanceLimit: number;
}
