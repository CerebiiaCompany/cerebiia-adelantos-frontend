// ⚠️ AGNOSTIC — derive employee notifications from domain snapshots

import {
  getDaysUntilPayment,
  getNextPaymentDate,
} from "@/shared/config/payrollCalendar";
import {
  buildAchievementUnlockedNotification,
  buildAdvanceApprovedNotification,
  buildAdvancePaidNotification,
  buildAdvanceRejectedNotification,
  buildAdvanceRequestedNotification,
  buildConfigAdvancePercentUpdatedNotification,
  buildConfigFeeUpdatedNotification,
  buildCupo80Notification,
  buildDataChangeAuditNotification,
  buildNextPaymentNetUpdatedNotification,
  buildPaymentEvidenceNotification,
  buildPayrollDue3dNotification,
  buildSupportRepliedNotification,
  type StoredNotification,
} from "./types";
import type { AdelantoConfigSnapshot } from "./adelantoConfigSnapshot";

export interface DeriveSolicitudInput {
  id: string;
  monto: number;
  estado: string;
  createdAt: string;
  updatedAt?: string | null;
  decididoEn?: string | null;
  pagadoEn?: string | null;
  motivoRechazo?: string | null;
  comprobantePagoUrl?: string | null;
}

export interface DeriveAuditInput {
  id: string;
  actorTipo: string;
  actorNombre: string;
  createdAt: string;
}

export interface DeriveReporteInput {
  id: string;
  estado: string;
  respondidoEn?: string | null;
  respondidoPorNombre?: string | null;
  createdAt: string;
}

export interface DeriveAchievementInput {
  id: string;
  title: string;
  points: number;
  unlocked: boolean;
}

export interface DeriveEmployeeNotificationsRoutes {
  misAdelantos: string;
  control: string;
  logros: string;
  auditorias: string;
  soportes: string;
  adelanto: string;
}

export interface DeriveEmployeeNotificationsInput {
  now?: Date;
  routes: DeriveEmployeeNotificationsRoutes;
  solicitudes: DeriveSolicitudInput[];
  auditoriaCambios: DeriveAuditInput[];
  reportes: DeriveReporteInput[];
  achievements: DeriveAchievementInput[];
  /** Uso de cupo del mes actual (0–100). */
  cupoUsedPercent: number;
  monthKey: string;
  nextPaymentNet: number | null;
  /** Snapshot previo del neto; null = primera sincronización (no notificar). */
  previousNextPaymentNet: number | null;
  /** Config actual de adelantos (super admin). */
  adelantoConfig: AdelantoConfigSnapshot | null;
  /** Snapshot previo de config; null = baseline sin notificar. */
  previousAdelantoConfig: AdelantoConfigSnapshot | null;
}

export interface DeriveEmployeeNotificationsResult {
  notifications: StoredNotification[];
  /** Nuevo valor a persistir como snapshot del próximo pago neto. */
  nextPaymentNetSnapshot: number | null;
  /** Nuevo snapshot de configuración de adelantos. */
  adelantoConfigSnapshot: AdelantoConfigSnapshot | null;
}

function toIsoDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseAmount(monto: number): number {
  if (!Number.isFinite(monto)) return 0;
  return Math.round(monto);
}

export function deriveEmployeeNotifications(
  input: DeriveEmployeeNotificationsInput,
): DeriveEmployeeNotificationsResult {
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();
  const routes = input.routes;
  const notifications: StoredNotification[] = [];

  for (const solicitud of input.solicitudes) {
    const amount = parseAmount(solicitud.monto);
    const estado = solicitud.estado;
    const href = routes.misAdelantos;

    // Solo notificar al empleado cuando el estado cambie a aprobado, pagado o rechazado (no al solicitar)
    if (estado === "aprobado") {
      notifications.push(
        buildAdvanceApprovedNotification(
          solicitud.id,
          amount,
          solicitud.decididoEn || solicitud.updatedAt || solicitud.createdAt,
          href,
        ),
      );
    } else if (estado === "pagado") {
      notifications.push(
        buildAdvancePaidNotification(
          solicitud.id,
          amount,
          solicitud.pagadoEn ||
            solicitud.decididoEn ||
            solicitud.updatedAt ||
            solicitud.createdAt,
          href,
        ),
      );
    } else if (estado === "rechazado") {
      notifications.push(
        buildAdvanceRejectedNotification(
          solicitud.id,
          amount,
          solicitud.decididoEn || solicitud.updatedAt || solicitud.createdAt,
          href,
          solicitud.motivoRechazo,
        ),
      );
    }
  }

  const daysUntil = getDaysUntilPayment(now);
  if (daysUntil >= 0 && daysUntil <= 3) {
    const nextPayment = getNextPaymentDate(now);
    const paymentDateIso = toIsoDateKey(nextPayment);
    notifications.push(
      buildPayrollDue3dNotification(
        paymentDateIso,
        daysUntil,
        nowIso,
        routes.control,
      ),
    );
  }

  let nextPaymentNetSnapshot = input.previousNextPaymentNet;
  if (
    input.nextPaymentNet != null &&
    Number.isFinite(input.nextPaymentNet)
  ) {
    const net = Math.round(input.nextPaymentNet);
    if (
      input.previousNextPaymentNet != null &&
      Math.round(input.previousNextPaymentNet) !== net
    ) {
      notifications.push(
        buildNextPaymentNetUpdatedNotification(
          input.monthKey,
          net,
          nowIso,
          routes.control,
        ),
      );
    }
    nextPaymentNetSnapshot = net;
  }

  if (input.cupoUsedPercent >= 80) {
    notifications.push(
      buildCupo80Notification(
        input.monthKey,
        Math.min(100, Math.round(input.cupoUsedPercent)),
        nowIso,
        routes.control,
      ),
    );
  }

  for (const achievement of input.achievements) {
    if (!achievement.unlocked) continue;
    notifications.push(
      buildAchievementUnlockedNotification(
        achievement.id,
        achievement.title,
        achievement.points,
        nowIso,
        `${routes.logros}#logro-${achievement.id}`,
      ),
    );
  }

  for (const cambio of input.auditoriaCambios) {
    notifications.push(
      buildDataChangeAuditNotification(
        cambio.id,
        cambio.actorTipo,
        cambio.actorNombre,
        cambio.createdAt,
        routes.auditorias,
      ),
    );
  }

  for (const reporte of input.reportes) {
    const estado = String(reporte.estado);
    const replied =
      estado === "respondido" ||
      estado === "resuelto" ||
      Boolean(reporte.respondidoEn);
    if (!replied) continue;
    notifications.push(
      buildSupportRepliedNotification(
        reporte.id,
        reporte.respondidoEn || reporte.createdAt,
        routes.soportes,
        reporte.respondidoPorNombre,
      ),
    );
  }

  let adelantoConfigSnapshot = input.previousAdelantoConfig;
  if (input.adelantoConfig) {
    const current = {
      tarifaFijaPorCuota: Math.round(input.adelantoConfig.tarifaFijaPorCuota),
      porcentajeMaximoAdelanto: input.adelantoConfig.porcentajeMaximoAdelanto,
    };
    const previous = input.previousAdelantoConfig;

    if (previous) {
      if (
        Math.round(previous.tarifaFijaPorCuota) !== current.tarifaFijaPorCuota
      ) {
        notifications.push(
          buildConfigFeeUpdatedNotification(
            current.tarifaFijaPorCuota,
            Math.round(previous.tarifaFijaPorCuota),
            nowIso,
            routes.adelanto,
          ),
        );
      }
      if (previous.porcentajeMaximoAdelanto !== current.porcentajeMaximoAdelanto) {
        notifications.push(
          buildConfigAdvancePercentUpdatedNotification(
            current.porcentajeMaximoAdelanto,
            previous.porcentajeMaximoAdelanto,
            nowIso,
            routes.adelanto,
          ),
        );
      }
    }

    adelantoConfigSnapshot = current;
  }

  return {
    notifications,
    nextPaymentNetSnapshot,
    adelantoConfigSnapshot,
  };
}
