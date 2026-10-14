import type { AuditoriaCambioEmpleadoDTO } from "@/shared/api/types/empleado";
import type { SolicitudAdelantoDTO, CuotaAdelantoDTO } from "@/shared/api/types/adelanto";
import type { AdelantoConfiguracionDTO } from "@/shared/api/types/configuracion";
import type { ParsedAdelantoConfiguracion } from "@/shared/api/configuracionMappers";
import { formatCOP } from "@/shared/lib";
import { resolveSolicitudComprobanteUrl } from "@/shared/lib/comprobantePago";
import type {
  EmployeeUnifiedAuditRecord,
  EmployeeAuditSummaryMetrics,
} from "./types";

export interface EnrichedSolicitudWithCuotas extends SolicitudAdelantoDTO {
  cuotas?: CuotaAdelantoDTO[];
}

export type AnyAdelantoConfigInput =
  | AdelantoConfiguracionDTO
  | ParsedAdelantoConfiguracion
  | Record<string, unknown>;

export interface NormalizedAuditConfig {
  porcentajeMaximoAdelanto: number | null;
  numeroMaximoCuotas: number | null;
  plazoMaximoDias: number | null;
  tarifaFijaPorCuota: number | null;
  montoMinimoAdelanto: number | null;
  scope: "global" | "empresa" | "empleado";
  updatedAt?: string | null;
}

export function normalizeAuditConfig(
  raw: AnyAdelantoConfigInput | null | undefined,
): NormalizedAuditConfig | null {
  if (!raw || typeof raw !== "object") return null;

  const parseNumber = (val: unknown): number | null => {
    if (val === null || val === undefined || val === "") return null;
    if (typeof val === "number") return Number.isFinite(val) ? val : null;
    const str = String(val).replace(/[^0-9.-]/g, "").trim();
    if (!str) return null;
    const n = Number.parseFloat(str);
    return Number.isFinite(n) ? n : null;
  };

  const rec = raw as Record<string, unknown>;

  const porcentaje = parseNumber(
    rec.porcentajeMaximoAdelanto ?? rec.porcentaje_maximo_adelanto,
  );
  const cuotas = parseNumber(
    rec.numeroMaximoCuotas ?? rec.numero_maximo_cuotas,
  );
  const plazo = parseNumber(
    rec.plazoMaximoDias ?? rec.plazo_maximo_dias,
  );
  const tarifa = parseNumber(
    rec.tarifaFijaPorCuota ?? rec.tarifa_fija_por_cuota,
  );
  const minimo = parseNumber(
    rec.montoMinimoAdelanto ?? rec.monto_minimo ?? rec.monto_minimo_adelanto,
  );

  let scope: "global" | "empresa" | "empleado" = "global";
  const origen = String(rec.origen || rec.scope || "").toLowerCase();
  if (origen === "empresa") scope = "empresa";
  else if (origen === "empleado") scope = "empleado";
  else if (origen === "personalizada") scope = "empresa";

  const updatedAt =
    typeof rec.updatedAt === "string"
      ? rec.updatedAt
      : typeof rec.updated_at === "string"
        ? rec.updated_at
        : null;

  return {
    porcentajeMaximoAdelanto: porcentaje,
    numeroMaximoCuotas: cuotas != null && cuotas > 0 ? Math.round(cuotas) : null,
    plazoMaximoDias: plazo != null && plazo > 0 ? Math.round(plazo) : null,
    tarifaFijaPorCuota: tarifa != null ? Math.round(tarifa) : null,
    montoMinimoAdelanto: minimo != null ? Math.round(minimo) : null,
    scope,
    updatedAt,
  };
}

/**
 * Deriva la auditoría unificada del empleado.
 * Hallazgo QA UX-04: El empleado debe visualizar EXCLUSIVAMENTE sus propias acciones:
 * solicitudes, cambios de perfil e inicios de sesión, en un lenguaje claro y amigable,
 * excluyendo configuraciones internas del Super Admin reservadas para el BackOffice.
 */
export function deriveEmployeeUnifiedAudit(params: {
  profileAuditRecords: AuditoriaCambioEmpleadoDTO[];
  solicitudes: EnrichedSolicitudWithCuotas[];
  config?: AnyAdelantoConfigInput | null;
  availableAdvance?: number;
  maxAdvanceLimit?: number;
}): {
  records: EmployeeUnifiedAuditRecord[];
  metrics: EmployeeAuditSummaryMetrics;
} {
  const {
    profileAuditRecords = [],
    solicitudes = [],
    availableAdvance = 0,
    maxAdvanceLimit = 0,
  } = params;

  const events: EmployeeUnifiedAuditRecord[] = [];

  // 1. Mapear auditoría de cambios de perfil, datos bancarios e inicios de sesión
  profileAuditRecords.forEach((item) => {
    const changesCount = item.cambios?.length || 0;
    const actor = item.actor_nombre || "Tú";
    const actorTipo = item.actor_tipo || "empleado";
    const accionStr = String(item.accion || "").toLowerCase();

    const isLogin =
      accionStr.includes("login") ||
      accionStr.includes("inicio_sesion") ||
      accionStr.includes("autenticacion");

    if (isLogin) {
      events.push({
        id: `session-${item.id}`,
        timestamp: item.created_at,
        eventType: "inicio_sesion",
        category: "perfil",
        title: "Inicio de sesión seguro",
        description: "Acceso exitoso registrado en tu cuenta de empleado.",
        actorNombre: actor,
        actorTipo,
        statusBadge: {
          label: "Sesión activa",
          tone: "info",
        },
      });
    } else {
      events.push({
        id: `profile-${item.id}`,
        timestamp: item.created_at,
        eventType: "cambio_perfil",
        category: "perfil",
        title: "Actualización de información personal o bancaria",
        description: changesCount > 0
          ? `Se actualizaron ${changesCount} dato${changesCount === 1 ? "" : "s"} de tu perfil.`
          : "Actualizaste la información de tu cuenta.",
        actorNombre: actor,
        actorTipo,
        statusBadge: {
          label: "Modificación",
          tone: "purple",
        },
        profileChanges: item.cambios,
      });
    }
  });

  let cuotasLiberadasCount = 0;

  // 2. Mapear ciclo de vida de cada solicitud de adelanto del empleado
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
      title: `Solicitud enviada · ${formatCOP(montoNum)}`,
      description: `Enviaste una solicitud de adelanto por ${formatCOP(montoNum)} a diferir en ${cuotasCount} cuota${cuotasCount === 1 ? "" : "s"}. Estado: En revisión.`,
      actorNombre: "Tú",
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
          title: `Solicitud no aprobada · ${formatCOP(montoNum)}`,
          description: `Tu solicitud no fue aprobada. Motivo: ${solicitud.motivo_rechazo || "No cumple con las condiciones o cupo disponible de tu empresa."}`,
          actorNombre: "Revisión de adelantos",
          actorTipo: "empresa",
          statusBadge: {
            label: "No aprobado",
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
          title: `Solicitud aprobada · ${formatCOP(montoNum)}`,
          description: `Tu solicitud de adelanto por ${formatCOP(montoNum)} fue aprobada y se prepara para transferencia bancaria.`,
          actorNombre: "Aprobación de adelantos",
          actorTipo: "empresa",
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
        title: `Transferencia completada · ${formatCOP(netoNum)}`,
        description: `Se transfirieron exitosamente ${formatCOP(netoNum)} a tu cuenta bancaria. Comprobante de pago disponible.`,
        actorNombre: "Cerebiia Pagos",
        actorTipo: "sistema",
        statusBadge: {
          label: "Transferido",
          tone: "success",
        },
        solicitudId: solicitud.id,
        amount: montoNum,
        netAmount: netoNum,
        installments: cuotasCount,
        evidenceUrl,
      });
    }

    // Evento 4: Liquidación de cuotas individuales y liberación de cupo
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
            title: `Cuota #${cuota.numero} de ${cuotasCount} liquidada · Cupo liberado`,
            description: `Se liquidó la cuota #${cuota.numero} por ${formatCOP(cuotaMontoNum)}. Tu saldo disponible para adelantos aumentó a ${formatCOP(cupoNuevo)} (+${formatCOP(cuotaMontoNum)}).`,
            actorNombre: "Nómina",
            actorTipo: "empresa",
            statusBadge: {
              label: "Cupo liberado",
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

  // UX-04: Los eventos de configuración del sistema (Super Admin) NO se agregan a la auditoría del empleado.
  // Pertenecen exclusivamente al BackOffice del administrador.

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
