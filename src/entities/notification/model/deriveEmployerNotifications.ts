// ⚠️ AGNOSTIC — derive employer notifications from domain snapshots

import {
  buildConfigAdvancePercentUpdatedNotification,
  buildConfigFeeUpdatedNotification,
  buildConfigMinAmountUpdatedNotification,
  buildEmployeeActivatedNotification,
  buildEmployeeSuspendedNotification,
  buildEmployerAdvanceApprovedNotification,
  buildEmployerAdvanceRejectedNotification,
  buildEmployerAdvanceRequestedNotification,
  buildEmployerDataChangeAuditNotification,
  buildEmployerSupportMessageNotification,
  buildProviderWeekDebtNotification,
  type StoredNotification,
} from "./types";
import type { EmployerAdelantoConfigSnapshot } from "./employerSnapshots";
import { getIsoWeekKey, isWeekCulminating } from "./employerSnapshots";

export interface DeriveEmployerSolicitudInput {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  monto: number;
  estado: string;
  createdAt: string;
  decididoEn?: string | null;
  motivoRechazo?: string | null;
}

export interface DeriveEmployerAuditInput {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  actorTipo: string;
  actorNombre: string;
  accion: string;
  createdAt: string;
}

export interface DeriveEmployerReporteInput {
  id: string;
  empleadoNombre: string;
  estado: string;
  createdAt: string;
}

export interface DeriveEmployerInactiveEmpleadoInput {
  id: string;
  nombre: string;
  updatedAt: string;
}

export interface DeriveEmployerNotificationsRoutes {
  misEmpleados: string;
  auditorias: string;
  historialMovimientos: string;
  monitoreoAdelantos: string;
  soportes: string;
  retencionesCierres: string;
  panel: string;
}

export interface DeriveEmployerNotificationsInput {
  now?: Date;
  routes: DeriveEmployerNotificationsRoutes;
  solicitudes: DeriveEmployerSolicitudInput[];
  auditoriaCambios: DeriveEmployerAuditInput[];
  reportes: DeriveEmployerReporteInput[];
  inactiveEmpleados: DeriveEmployerInactiveEmpleadoInput[];
  /** Snapshot previo de inactivos. */
  previousInactiveById: Record<string, string>;
  /** Si ya se estableció baseline de suspendidos (evita flood en 1er sync). */
  suspendedBaselineReady: boolean;
  adelantoConfig: EmployerAdelantoConfigSnapshot | null;
  previousAdelantoConfig: EmployerAdelantoConfigSnapshot | null;
  providerDebtAmount: number | null;
  providerPeriodLabel: string;
}

export interface DeriveEmployerNotificationsResult {
  notifications: StoredNotification[];
  adelantoConfigSnapshot: EmployerAdelantoConfigSnapshot | null;
  inactiveByIdSnapshot: Record<string, string>;
  suspendedBaselineReady: boolean;
}

export function deriveEmployerNotifications(
  input: DeriveEmployerNotificationsInput,
): DeriveEmployerNotificationsResult {
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();
  const routes = input.routes;
  const notifications: StoredNotification[] = [];

  for (const cambio of input.auditoriaCambios) {
    if (cambio.accion === "confirmacion_activacion") {
      notifications.push(
        buildEmployeeActivatedNotification(
          cambio.empleadoId,
          cambio.empleadoNombre,
          cambio.createdAt,
          routes.misEmpleados,
        ),
      );
      continue;
    }

    notifications.push(
      buildEmployerDataChangeAuditNotification(
        cambio.id,
        cambio.empleadoNombre,
        cambio.actorTipo,
        cambio.actorNombre,
        cambio.createdAt,
        routes.auditorias,
      ),
    );
  }

  const hadBaseline = input.suspendedBaselineReady;

  for (const empleado of input.inactiveEmpleados) {
    const prevUpdated = input.previousInactiveById[empleado.id];

    if (hadBaseline && prevUpdated !== empleado.updatedAt) {
      notifications.push(
        buildEmployeeSuspendedNotification(
          empleado.id,
          empleado.nombre,
          empleado.updatedAt || nowIso,
          routes.misEmpleados,
        ),
      );
    }
  }

  const prunedInactive: Record<string, string> = {};
  for (const empleado of input.inactiveEmpleados) {
    prunedInactive[empleado.id] = empleado.updatedAt;
  }

  for (const solicitud of input.solicitudes) {
    const amount = Math.round(solicitud.monto) || 0;
    const href = routes.historialMovimientos;
    const estado = solicitud.estado;

    if (estado === "solicitado" || estado === "en_revision") {
      notifications.push(
        buildEmployerAdvanceRequestedNotification(
          solicitud.id,
          solicitud.empleadoNombre,
          amount,
          solicitud.createdAt,
          href,
        ),
      );
    } else if (estado === "aprobado" || estado === "pagado") {
      notifications.push(
        buildEmployerAdvanceApprovedNotification(
          solicitud.id,
          solicitud.empleadoNombre,
          amount,
          solicitud.decididoEn || solicitud.createdAt,
          href,
        ),
      );
    } else if (estado === "rechazado") {
      notifications.push(
        buildEmployerAdvanceRejectedNotification(
          solicitud.id,
          solicitud.empleadoNombre,
          amount,
          solicitud.decididoEn || solicitud.createdAt,
          href,
          solicitud.motivoRechazo,
        ),
      );
    }
  }

  for (const reporte of input.reportes) {
    const estado = String(reporte.estado);
    if (estado !== "pendiente" && estado !== "en_revision") continue;
    notifications.push(
      buildEmployerSupportMessageNotification(
        reporte.id,
        reporte.empleadoNombre,
        reporte.createdAt,
        routes.soportes,
      ),
    );
  }

  let adelantoConfigSnapshot = input.previousAdelantoConfig;
  if (input.adelantoConfig) {
    const current: EmployerAdelantoConfigSnapshot = {
      tarifaFijaPorCuota: Math.round(input.adelantoConfig.tarifaFijaPorCuota),
      porcentajeMaximoAdelanto: input.adelantoConfig.porcentajeMaximoAdelanto,
      montoMinimoAdelanto:
        input.adelantoConfig.montoMinimoAdelanto != null
          ? Math.round(input.adelantoConfig.montoMinimoAdelanto)
          : null,
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
            routes.panel,
          ),
        );
      }
      if (
        previous.porcentajeMaximoAdelanto !== current.porcentajeMaximoAdelanto
      ) {
        notifications.push(
          buildConfigAdvancePercentUpdatedNotification(
            current.porcentajeMaximoAdelanto,
            previous.porcentajeMaximoAdelanto,
            nowIso,
            routes.panel,
          ),
        );
      }
      if (
        previous.montoMinimoAdelanto != null &&
        current.montoMinimoAdelanto != null &&
        previous.montoMinimoAdelanto !== current.montoMinimoAdelanto
      ) {
        notifications.push(
          buildConfigMinAmountUpdatedNotification(
            current.montoMinimoAdelanto,
            previous.montoMinimoAdelanto,
            nowIso,
            routes.panel,
          ),
        );
      } else if (
        previous.montoMinimoAdelanto == null &&
        current.montoMinimoAdelanto != null
      ) {
        // primera vez que aparece monto mínimo en API tras baseline vacío de ese campo
        // no notificar si previous snapshot existía sin el campo — only when previous had a value
      }
    }

    adelantoConfigSnapshot = current;
  }

  if (
    isWeekCulminating(now) &&
    input.providerDebtAmount != null &&
    input.providerDebtAmount > 0
  ) {
    const weekKey = getIsoWeekKey(now);
    notifications.push(
      buildProviderWeekDebtNotification(
        weekKey,
        Math.round(input.providerDebtAmount),
        input.providerPeriodLabel || weekKey,
        nowIso,
        routes.retencionesCierres,
      ),
    );
  }

  return {
    notifications,
    adelantoConfigSnapshot,
    inactiveByIdSnapshot: prunedInactive,
    suspendedBaselineReady: true,
  };
}
