import type { AuditoriaCambioItemDTO } from "@/shared/api/types/empleado";

export type EmployerAuditCategory =
  | "todos"
  | "adelantos"
  | "cuotas"
  | "configuracion"
  | "empleados";

export type EmployerAuditEventType =
  | "solicitud_creada"
  | "solicitud_aprobada"
  | "solicitud_rechazada"
  | "solicitud_pagada"
  | "cuota_liberada"
  | "cambio_perfil"
  | "cambio_configuracion";

export interface EmployerUnifiedAuditRecord {
  id: string;
  timestamp: string;
  eventType: EmployerAuditEventType;
  category: "adelantos" | "cuotas" | "configuracion" | "empleados";
  title: string;
  description: string;
  employeeName?: string;
  employeeDocument?: string;
  actorNombre: string;
  actorTipo: string;
  statusBadge: {
    label: string;
    tone: "success" | "warning" | "danger" | "info" | "purple" | "neutral";
  };
  /** Metadatos de la operación */
  solicitudId?: string;
  amount?: number;
  netAmount?: number;
  installments?: number;
  currentInstallment?: number;
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

export interface EmployerAuditSummaryMetrics {
  totalEvents: number;
  totalAdvancesTracked: number;
  totalCuotasLiberadas: number;
  totalEmployeeDataChanges: number;
  totalConfigEvents: number;
}
