import type { AuditoriaCambioEmpleadoDTO } from "@/shared/api/types/empleado";
import type { HistorialSolicitudEmpresaDTO, CuotaAdelantoDTO } from "@/shared/api/types/adelanto";
import type { AdelantoConfiguracionDTO } from "@/shared/api/types/configuracion";
import { formatCOP, formatDate } from "@/shared/lib";
import { resolveSolicitudComprobanteUrl } from "@/shared/lib/comprobantePago";
import type {
  EmployerUnifiedAuditRecord,
  EmployerAuditSummaryMetrics,
} from "./employerUnifiedAuditTypes";

export interface EnrichedHistorialSolicitudEmpresa extends HistorialSolicitudEmpresaDTO {
  cuotas?: CuotaAdelantoDTO[];
}

export function deriveEmployerUnifiedAudit(params: {
  employeeProfileAudits: AuditoriaCambioEmpleadoDTO[];
  advances: EnrichedHistorialSolicitudEmpresa[];
  config?: AdelantoConfiguracionDTO | null;
}): {
  records: EmployerUnifiedAuditRecord[];
  metrics: EmployerAuditSummaryMetrics;
} {
  const {
    employeeProfileAudits = [],
    advances = [],
    config = null,
  } = params;

  const events: EmployerUnifiedAuditRecord[] = [];

  // 1. Mapear cambios de perfil / datos de empleados realizados por el empleado o la empresa
  employeeProfileAudits.forEach((audit) => {
    const changesCount = audit.cambios?.length || 0;
    const actor = audit.actor_nombre || (audit.actor_tipo === "empresa" ? "Empresa" : "Empleado");
    const actorTipo = audit.actor_tipo || "empleado";

    events.push({
      id: `profile-${audit.id}`,
      timestamp: audit.created_at,
      eventType: "cambio_perfil",
      category: "empleados",
      title: `Modificación de datos · ${audit.empleado_nombre || "Empleado"}`,
      description: `Se modificaron ${changesCount} campo${changesCount === 1 ? "" : "s"} en los datos personales/bancarios del empleado.`,
      employeeName: audit.empleado_nombre,
      employeeDocument: audit.empleado_documento,
      actorNombre: actor,
      actorTipo,
      statusBadge: {
        label: "Modificación",
        tone: "purple",
      },
      profileChanges: audit.cambios,
    });
  });

  let cuotasLiberadasCount = 0;

  // 2. Mapear ciclo de vida de cada solicitud de adelanto de la plantilla
  advances.forEach((adv) => {
    const montoNum = Number.parseFloat(adv.monto) || 0;
    const netoNum = Number.parseFloat(adv.monto_neto) || montoNum;
    const cuotasCount = adv.numero_cuotas_snapshot || 1;
    const evidenceUrl = resolveSolicitudComprobanteUrl(adv);
    const empName = adv.empleado_nombre || "Empleado";
    const empDoc = adv.empleado_documento || "—";

    // Evento A: Solicitud enviada / creada
    events.push({
      id: `solicitud-created-${adv.id}`,
      timestamp: adv.created_at,
      eventType: "solicitud_creada",
      category: "adelantos",
      title: `Solicitud de adelanto enviada · ${empName}`,
      description: `${empName} solicitó un adelanto de ${formatCOP(montoNum)} a diferir en ${cuotasCount} cuota${cuotasCount === 1 ? "" : "s"}.`,
      employeeName: empName,
      employeeDocument: empDoc,
      actorNombre: empName,
      actorTipo: "empleado",
      statusBadge: {
        label: "En revisión",
        tone: "warning",
      },
      solicitudId: adv.id,
      amount: montoNum,
      netAmount: netoNum,
      installments: cuotasCount,
      evidenceUrl,
    });

    // Evento B: Decisión (Aprobada o Rechazada)
    if (adv.decidido_en || adv.estado === "aprobado" || adv.estado === "pagado" || adv.estado === "rechazado") {
      const decisionTimestamp = adv.decidido_en || adv.created_at;
      const decididoPor = adv.decidido_por_nombre || "Super Admin";

      if (adv.estado === "rechazado") {
        events.push({
          id: `solicitud-rejected-${adv.id}`,
          timestamp: decisionTimestamp,
          eventType: "solicitud_rechazada",
          category: "adelantos",
          title: `Solicitud rechazada · ${empName}`,
          description: `La solicitud por ${formatCOP(montoNum)} fue rechazada. Motivo: ${adv.motivo_rechazo || "No cumple con las políticas de aprobación."}`,
          employeeName: empName,
          employeeDocument: empDoc,
          actorNombre: decididoPor,
          actorTipo: "sistema",
          statusBadge: {
            label: "Rechazado",
            tone: "danger",
          },
          solicitudId: adv.id,
          amount: montoNum,
          rejectionReason: adv.motivo_rechazo,
        });
      } else if (adv.estado === "aprobado" || adv.estado === "pagado") {
        events.push({
          id: `solicitud-approved-${adv.id}`,
          timestamp: decisionTimestamp,
          eventType: "solicitud_aprobada",
          category: "adelantos",
          title: `Solicitud aprobada · ${empName}`,
          description: `La solicitud por ${formatCOP(montoNum)} de ${empName} fue verificada y aprobada para desembolso.`,
          employeeName: empName,
          employeeDocument: empDoc,
          actorNombre: decididoPor,
          actorTipo: "sistema",
          statusBadge: {
            label: "Aprobado",
            tone: "success",
          },
          solicitudId: adv.id,
          amount: montoNum,
          netAmount: netoNum,
          installments: cuotasCount,
        });
      }
    }

    // Evento C: Desembolso / Pago realizado
    if (adv.pagado_en || adv.estado === "pagado") {
      const pagadoTimestamp = adv.pagado_en || adv.created_at;

      events.push({
        id: `solicitud-paid-${adv.id}`,
        timestamp: pagadoTimestamp,
        eventType: "solicitud_pagada",
        category: "adelantos",
        title: `Desembolso completado · ${empName}`,
        description: `Se efectuó la transferencia de ${formatCOP(netoNum)} a la cuenta de ${empName}. Comprobante de pago disponible.`,
        employeeName: empName,
        employeeDocument: empDoc,
        actorNombre: "Cerebiia / Pagos",
        actorTipo: "sistema",
        statusBadge: {
          label: "Pagado",
          tone: "success",
        },
        solicitudId: adv.id,
        amount: montoNum,
        netAmount: netoNum,
        installments: cuotasCount,
        evidenceUrl,
      });
    }

    // Evento D: Liberación de cuotas individuales por el Super Admin
    if (Array.isArray(adv.cuotas)) {
      adv.cuotas.forEach((cuota) => {
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
          const cuotaTimestamp = cuota.fecha_pago || cuota.fecha_corte || adv.created_at;

          events.push({
            id: `cuota-liberada-${adv.id}-${cuota.numero}`,
            timestamp: cuotaTimestamp,
            eventType: "cuota_liberada",
            category: "cuotas",
            title: `Cuota #${cuota.numero} de ${cuotasCount} liberada por Super Admin · ${empName}`,
            description: `El Super Admin liberó la cuota #${cuota.numero} de nómina por ${formatCOP(cuotaMontoNum)} de ${empName}. Retención saldada.`,
            employeeName: empName,
            employeeDocument: empDoc,
            actorNombre: "Super Admin",
            actorTipo: "sistema",
            statusBadge: {
              label: "Cuota liberada",
              tone: "info",
            },
            solicitudId: adv.id,
            amount: cuotaMontoNum,
            installments: cuotasCount,
            currentInstallment: cuota.numero,
          });
        }
      });
    }
  });

  // 3. Mapear configuración del Super Admin (Global o Personalizada para la empresa)
  if (config) {
    events.push({
      id: "config-rules-active",
      timestamp: new Date().toISOString(),
      eventType: "cambio_configuracion",
      category: "configuracion",
      title: "Reglas de adelanto vigentes (Super Admin)",
      description: `Configuración activa: Tope ${config.porcentajeMaximoAdelanto}% del salario, máx. ${config.numeroMaximoCuotas} cuota(s), tarifa fija ${formatCOP(config.tarifaFijaPorCuota)} por cuota, plazo máx. ${config.plazoMaximoDias} días.`,
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

  // Orden cronológico (más recientes primero)
  const sortedRecords = events.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  const metrics: EmployerAuditSummaryMetrics = {
    totalEvents: sortedRecords.length,
    totalAdvancesTracked: advances.length,
    totalCuotasLiberadas: cuotasLiberadasCount,
    totalEmployeeDataChanges: employeeProfileAudits.length,
    totalConfigEvents: config ? 1 : 0,
  };

  return {
    records: sortedRecords,
    metrics,
  };
}
