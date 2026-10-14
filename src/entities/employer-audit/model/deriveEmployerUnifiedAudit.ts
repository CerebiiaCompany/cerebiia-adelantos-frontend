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
    const tarifaTotalNum = Number.parseFloat(adv.tarifa_total || "0") || 0;
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
        description: `Se efectuó la transferencia de ${formatCOP(netoNum)} a la cuenta de ${empName}. La comisión de ${formatCOP(tarifaTotalNum)} se descuenta por nómina a través de la empresa. Comprobante de pago disponible.`,
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
  const parseNum = (v: unknown): number | null => {
    if (v === null || v === undefined || v === "") return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    const str = String(v).replace(/[^0-9.-]/g, "").trim();
    if (!str) return null;
    const n = Number.parseFloat(str);
    return Number.isFinite(n) ? n : null;
  };

  const rawConfig = config as Record<string, unknown> | null;
  const cfgPct = rawConfig ? parseNum(rawConfig.porcentajeMaximoAdelanto ?? rawConfig.porcentaje_maximo_adelanto) : null;
  const cfgCuotas = rawConfig ? parseNum(rawConfig.numeroMaximoCuotas ?? rawConfig.numero_maximo_cuotas) : null;
  const cfgTarifa = rawConfig ? parseNum(rawConfig.tarifaFijaPorCuota ?? rawConfig.tarifa_fija_por_cuota) : null;
  const cfgPlazo = rawConfig ? parseNum(rawConfig.plazoMaximoDias ?? rawConfig.plazo_maximo_dias) : null;
  const cfgMinimo = rawConfig ? parseNum(rawConfig.montoMinimoAdelanto ?? rawConfig.monto_minimo ?? rawConfig.monto_minimo_adelanto) : null;

  if (rawConfig) {
    const parts: string[] = [];
    parts.push(cfgPct != null ? `Tope ${cfgPct}% del salario` : "Tope: No configurado");
    parts.push(cfgCuotas != null ? `máx. ${cfgCuotas} cuota(s)` : "cuotas: No configurado");
    parts.push(cfgTarifa != null ? `tarifa fija ${formatCOP(Math.round(cfgTarifa))} por cuota` : "tarifa fija: No configurado");
    parts.push(cfgPlazo != null ? `plazo máx. ${cfgPlazo} días` : "plazo: No configurado");

    const description = `Configuración activa: ${parts.join(", ")}.`;

    const parameters: Array<{ parameter: string; value: string | number }> = [
      {
        parameter: "Porcentaje máximo de adelanto",
        value: cfgPct != null ? `${cfgPct}% del salario` : "No configurado",
      },
      {
        parameter: "Número máximo de cuotas",
        value: cfgCuotas != null ? cfgCuotas : "No configurado",
      },
      {
        parameter: "Tarifa fija por cuota",
        value: cfgTarifa != null ? formatCOP(Math.round(cfgTarifa)) : "No configurado",
      },
      {
        parameter: "Plazo máximo",
        value: cfgPlazo != null ? `${cfgPlazo} días` : "No configurado",
      },
    ];

    if (cfgMinimo != null) {
      parameters.push({
        parameter: "Monto mínimo de adelanto",
        value: formatCOP(Math.round(cfgMinimo)),
      });
    }

    const scopeStr = String(rawConfig.scope || rawConfig.origen || "global").toLowerCase();
    const resolvedScope: "global" | "personalizada" =
      scopeStr === "empresa" || scopeStr === "empleado" || scopeStr === "personalizada"
        ? "personalizada"
        : "global";

    events.push({
      id: "config-rules-active",
      timestamp: (rawConfig.updatedAt as string) || (rawConfig.updated_at as string) || new Date().toISOString(),
      eventType: "cambio_configuracion",
      category: "configuracion",
      title: "Reglas de adelanto vigentes (Super Admin)",
      description,
      actorNombre: "Super Admin",
      actorTipo: "sistema",
      statusBadge: {
        label: "Configuración",
        tone: "info",
      },
      configDetails: {
        scope: resolvedScope,
        parameters,
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
