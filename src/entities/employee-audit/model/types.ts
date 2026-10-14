import type { AuditoriaCambioItemDTO } from "@/shared/api/types/empleado";

export type EmployeeAuditCategory =
  | "todos"
  | "solicitudes"
  | "cupo"
  | "perfil";

export type EmployeeAuditEventType =
  | "solicitud_creada"
  | "solicitud_en_revision"
  | "solicitud_aprobada"
  | "solicitud_rechazada"
  | "solicitud_pagada"
  | "cuota_liberada"
  | "cambio_perfil"
  | "inicio_sesion";

export interface EmployeeUnifiedAuditRecord {
  id: string;
  timestamp: string;
  eventType: EmployeeAuditEventType | string;
  category: "solicitudes" | "cupo" | "perfil";
  title: string;
  description: string;
  actorNombre: string;
  actorTipo: string;
  statusBadge: {
    label: string;
    tone: "success" | "warning" | "danger" | "info" | "purple" | "neutral";
  };
  /** Metadatos adicionales para adelantos / cupo / evidencias / perfil */
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
}

export interface EmployeeAuditSummaryMetrics {
  totalEvents: number;
  totalSolicitudesTracked: number;
  totalProfileChanges: number;
  totalCuotasLiberadas: number;
  availableAdvance: number;
  maxAdvanceLimit: number;
}
