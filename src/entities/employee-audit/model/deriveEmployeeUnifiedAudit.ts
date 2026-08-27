import type { AuditoriaCambioEmpleadoDTO } from "@/shared/api/types/empleado";
import type { SolicitudAdelantoDTO, CuotaAdelantoDTO } from "@/shared/api/types/adelanto";
import type { AdelantoConfiguracionDTO } from "@/shared/api/types/configuracion";
import { formatCOP } from "@/shared/lib";
import { resolveSolicitudComprobanteUrl } from "@/shared/lib/comprobantePago";
import type {
  EmployeeUnifiedAuditRecord,
  EmployeeAuditSummaryMetrics,
} from "./types";

export interface EnrichedSolicitudWithCuotas extends SolicitudAdelantoDTO {
  cuotas?: CuotaAdelantoDTO[];
}

export function deriveEmployeeUnifiedAudit(params: {
  profileAuditRecords: AuditoriaCambioEmpleadoDTO[];
  solicitudes: EnrichedSolicitudWithCuotas[];
  config?: AdelantoConfiguracionDTO | null;
  availableAdvance?: number;
  maxAdvanceLimit?: number;
}): {
  records: EmployeeUnifiedAuditRecord[];
  metrics: EmployeeAuditSummaryMetrics;
} {
  const {
    profileAuditRecords = [],
    solicitudes = [],
    config = null,
    availableAdvance = 0,
    maxAdvanceLimit = 0,
  } = params;

  const events: EmployeeUnifiedAuditRecord[] = [];

  // 1. Mapear auditoría de cambios de perfil y datos
  profileAuditRecords.forEach((item) => {
    const changesCount = item.cambios?.length || 0;
    const actor = item.actor_nombre || "Empleado";
    const actorTipo = item.actor_tipo || "empleado";

    events.push({
      id: `profile-${item.id}`,
      timestamp: item.created_at,
      eventType: "cambio_perfil",
      category: "perfil",
      title: "Actualización de información personal/bancaria",
      description: `Se registraron modificaciones en ${changesCount} campo${changesCount === 1 ? "" : "s"} del perfil.`,
      actorNombre: actor,
      actorTipo,
      statusBadge: {
        label: "Modificación",
        tone: "purple",
      },
      profileChanges: item.cambios,
    });
  });

  let cuotasLiberadasCount = 0;

  // 2. Mapear ciclo de vida de cada solicitud de adelanto
  solicitudes.forEach((solicitud) => {
    const montoNum = Number.parseFloat(solicitud.monto) || 0;
    const netoNum =
      Number.parseFloat(solicitud.monto_a_recibir ?? solicitud.monto_neto ?? "0") ||
      montoNum;
    const cuotasCount = solicitud.numero_cuotas_snapshot || 1;
    const evidenceUrl = resolveSolicitudComprobanteUrl(solicitud);

    // Evento 1: Creación / Solicitud enviada
    events.push({
      id: `solicitud-created-${solicitud.id}`,
      timestamp: solicitud.created_at,
      eventType: "solicitud_creada",
      category: "solicitudes",
      title: `Solicitud de adelanto enviada · ${formatCOP(montoNum)}`,
      description: `Creaste una solicitud de adelanto por ${formatCOP(montoNum)} a diferir en ${cuotasCount} cuota${cuotasCount === 1 ? "" : "s"}. Estado inicial: En revisión.`,
      actorNombre: "Empleado",
      actorTipo: "empleado",
      statusBadge: {
        label: "En revisión",
        tone: "warning",
      },
      solicitudId: solicitud.id,
      amount: montoNum,
      netAmount: netoNum,
      installments: cuotasCount,
      evidenceUrl,
    });

    // Evento 2: Decisión (Aprobada o Rechazada)
    if (solicitud.decidido_en || solicitud.estado === "aprobado" || solicitud.estado === "pagado" || solicitud.estado === "rechazado") {
      const decisionTimestamp =
        solicitud.decidido_en ||
        (solicitud.estado === "rechazado" && solicitud.updated_at) ||
        solicitud.created_at;

      if (solicitud.estado === "rechazado") {
        events.push({
          id: `solicitud-rejected-${solicitud.id}`,
          timestamp: decisionTimestamp,
          eventType: "solicitud_rechazada",
          category: "solicitudes",
          title: `Solicitud de adelanto rechazada · ${formatCOP(montoNum)}`,
          description: `La solicitud por ${formatCOP(montoNum)} no fue aprobada. Motivo: ${solicitud.motivo_rechazo || "No cumple con las condiciones requeridas."}`,
          actorNombre: "Administración / Super Admin",
          actorTipo: "sistema",
          statusBadge: {
            label: "Rechazado",
            tone: "danger",
          },
          solicitudId: solicitud.id,
          amount: montoNum,
          rejectionReason: solicitud.motivo_rechazo,
        });
      } else if (solicitud.estado === "aprobado" || solicitud.estado === "pagado") {
        events.push({
          id: `solicitud-approved-${solicitud.id}`,
          timestamp: decisionTimestamp,
          eventType: "solicitud_aprobada",
          category: "solicitudes",
          title: `Solicitud de adelanto aprobada · ${formatCOP(montoNum)}`,
          description: `Tu solicitud por ${formatCOP(montoNum)} fue verificada y aprobada para desembolso.`,
          actorNombre: "Administración / Super Admin",
          actorTipo: "sistema",
          statusBadge: {
            label: "Aprobado",
            tone: "success",
          },
          solicitudId: solicitud.id,
          amount: montoNum,
          netAmount: netoNum,
          installments: cuotasCount,
        });
      }
    }

    // Evento 3: Desembolso / Pago realizado
    if (solicitud.pagado_en || solicitud.estado === "pagado") {
      const pagadoTimestamp =
        solicitud.pagado_en || solicitud.updated_at || solicitud.created_at;

      events.push({
        id: `solicitud-paid-${solicitud.id}`,
        timestamp: pagadoTimestamp,
        eventType: "solicitud_pagada",
        category: "solicitudes",
        title: `Desembolso completado · ${formatCOP(netoNum)}`,
        description: `Se efectuó la transferencia de ${formatCOP(netoNum)} a tu cuenta bancaria. Comprobante y evidencia de pago disponibles.`,
        actorNombre: "Cerebiia / Pagos",
        actorTipo: "sistema",
        statusBadge: {
          label: "Pagado",
          tone: "success",
        },
        solicitudId: solicitud.id,
        amount: montoNum,
        netAmount: netoNum,
        installments: cuotasCount,
        evidenceUrl,
      });
    }

    // Evento 4: Liberación de cuotas individuales por Super Admin
    if (Array.isArray(solicitud.cuotas)) {
      solicitud.cuotas.forEach((cuota) => {
        const cEstado = String(cuota.estado || "").toLowerCase().trim();
        const isLiberada =
          cEstado === "pagado" ||
          cEstado === "pagada" ||
          cEstado === "liberado" ||
          cEstado === "liberada" ||
          Boolean(cuota.fecha_pago);

        if (isLiberada) {
          cuotasLiberadasCount += 1;
          const cuotaMontoNum = Number.parseFloat(cuota.monto) || Math.round(montoNum / cuotasCount);
          const cuotaTimestamp =
            cuota.fecha_pago || cuota.fecha_corte || solicitud.created_at;

          const cupoTarget = maxAdvanceLimit > 0 ? maxAdvanceLimit : (availableAdvance || cuotaMontoNum);
          const cupoNuevo = availableAdvance > 0 ? availableAdvance : cupoTarget;
          const cupoAnterior = Math.max(0, cupoNuevo - cuotaMontoNum);

          events.push({
            id: `cuota-liberada-${solicitud.id}-${cuota.numero}`,
            timestamp: cuotaTimestamp,
            eventType: "cuota_liberada",
            category: "cupo",
            title: `Cuota #${cuota.numero} de ${cuotasCount} liberada por Super Admin`,
            description: `Se liquidó la cuota #${cuota.numero} por ${formatCOP(cuotaMontoNum)}. Tu saldo disponible aumentó de ${formatCOP(cupoAnterior)} a ${formatCOP(cupoNuevo)} (+${formatCOP(cuotaMontoNum)}).`,
            actorNombre: "Super Admin",
            actorTipo: "sistema",
            statusBadge: {
              label: "Cupo restaurado",
              tone: "info",
            },
            solicitudId: solicitud.id,
            amount: cuotaMontoNum,
            installments: cuotasCount,
            currentInstallment: cuota.numero,
            cupoAnterior,
            cupoNuevo,
          });
        }
      });
    }
  });

  // 3. Mapear configuración del Super Admin (reglas vigentes para adelantos)
  if (config) {
    events.push({
      id: "employee-config-rules-active",
      timestamp: new Date().toISOString(),
      eventType: "cambio_configuracion",
      category: "configuracion",
      title: "Reglas de adelanto vigentes (Super Admin)",
      description: `Parámetros activos de tu empresa: Tope ${config.porcentajeMaximoAdelanto}% del salario, máx. ${config.numeroMaximoCuotas} cuota(s), tarifa fija ${formatCOP(config.tarifaFijaPorCuota)} por cuota, plazo máx. ${config.plazoMaximoDias} días.`,
      actorNombre: "Super Admin",
      actorTipo: "sistema",
      statusBadge: {
        label: "Configuración",
        tone: "info",
      },
      configDetails: {
        scope: "global",
        parameters: [
          { parameter: "Porcentaje máximo de adelanto", value: `${config.porcentajeMaximoAdelanto}% del salario` },
          { parameter: "Número máximo de cuotas", value: config.numeroMaximoCuotas },
          { parameter: "Tarifa fija por cuota", value: formatCOP(config.tarifaFijaPorCuota) },
          { parameter: "Plazo máximo", value: `${config.plazoMaximoDias} días` },
        ],
      },
    });
  }

  // Ordenar todos los eventos cronológicamente (más recientes primero)
  const sortedRecords = events.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  const metrics: EmployeeAuditSummaryMetrics = {
    totalEvents: sortedRecords.length,
    totalSolicitudesTracked: solicitudes.length,
    totalProfileChanges: profileAuditRecords.length,
    totalCuotasLiberadas: cuotasLiberadasCount,
    availableAdvance,
    maxAdvanceLimit,
  };

  return {
    records: sortedRecords,
    metrics,
  };
}
