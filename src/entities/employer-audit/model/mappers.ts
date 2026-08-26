// ⚠️ AGNOSTIC — maps registered advances to employer audit views

import { resolveSolicitudComprobanteUrl } from "@/shared/lib/comprobantePago";
import type {
  EmployerAdvanceAuditRecord,
  EmployerLoanInstallmentRecord,
  EmployerMovementRecord,
  EmployerNominaCuotaDetalle,
  EmployerNominaDescuentosSnapshot,
  EmployerNominaEmpleadoResumen,
  EmployerPayrollClosureSnapshot,
  EmployerPayrollDeductionSummary,
} from "./types";
import {
  MAX_ADVANCE_INSTALLMENTS,
  type CompanyAdvanceStatus,
  type RegisteredCompanyAdvance,
} from "./registryStorage";
import {
  calculateFeeForInstallmentIndex,
  DEFAULT_TARIFA_FIJA_POR_CUOTA,
} from "@/shared/config/advanceFees";
import {
  calculateAdvanceFee,
  calcularEstadoSeguimiento,
  isCuotaPagada,
  isRecoverableCompanyAdvance,
} from "./calculations";
import type {
  HistorialSolicitudEmpresaDTO,
  SolicitudAdelantoDTO,
  EstadoSolicitud,
} from "@/shared/api/types/adelanto";
import type { EmpleadoDTO } from "@/shared/api/types";

function parseSalary(salario: string): number {
  const amount = Number.parseFloat(salario);
  return Number.isNaN(amount) ? 0 : amount;
}

function getMonthKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
}

function capitalizeMonth(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function resolveEmpresaId(empleados: EmpleadoDTO[]): string | null {
  return empleados[0]?.empresa_id ?? null;
}

function mapEstadoToCompanyAdvanceStatus(
  estado: EstadoSolicitud,
): CompanyAdvanceStatus {
  if (estado === "rechazado") return "rechazado";
  if (estado === "aprobado" || estado === "pagado") return "procesado";
  return "en_curso";
}

function buildRegisteredAdvanceFromAmounts(input: {
  id: string;
  empresaId: string;
  employeeId: string;
  employeeName: string;
  employeeDocument: string;
  baseSalary: number;
  monto: string;
  montoNeto?: string | null;
  tarifaTotal?: string | null;
  tarifaFijaPorCuotaSnapshot?: string | null;
  installments: number;
  estado: EstadoSolicitud;
  requestedAt: string;
  paymentEvidenceUrl?: string | null;
  rejectionReason?: string | null;
  pagadoEn?: string | null;
  decididoEn?: string | null;
  cuotas?: RegisteredCompanyAdvance["cuotas"];
}): RegisteredCompanyAdvance {
  const advancedAmount = Number.parseFloat(input.monto);
  const safeAmount = Number.isNaN(advancedAmount) ? 0 : advancedAmount;
  const parsedTarifaTotal = input.tarifaTotal
    ? Number.parseFloat(input.tarifaTotal)
    : Number.NaN;
  const parsedTarifaFija = input.tarifaFijaPorCuotaSnapshot
    ? Number.parseFloat(input.tarifaFijaPorCuotaSnapshot)
    : Number.NaN;
  const parsedNet = input.montoNeto
    ? Number.parseFloat(input.montoNeto)
    : Number.NaN;
  const feePerCuotaSnapshot =
    !Number.isNaN(parsedTarifaFija) && parsedTarifaFija > 0
      ? Math.round(parsedTarifaFija)
      : undefined;
  const feeAmount =
    !Number.isNaN(parsedTarifaTotal) && parsedTarifaTotal >= 0
      ? Math.round(parsedTarifaTotal)
      : calculateAdvanceFee(
          safeAmount,
          feePerCuotaSnapshot ?? DEFAULT_TARIFA_FIJA_POR_CUOTA,
          input.installments,
        );
  const netDisbursedAmount =
    !Number.isNaN(parsedNet) && parsedNet >= 0
      ? Math.round(parsedNet)
      : safeAmount - feeAmount;

  return {
    id: input.id,
    empresaId: input.empresaId,
    employeeId: input.employeeId,
    employeeName: input.employeeName,
    employeeDocument: input.employeeDocument,
    baseSalary: input.baseSalary,
    advancedAmount: safeAmount,
    installments: input.installments,
    feeAmount,
    feePerCuotaSnapshot,
    netDisbursedAmount,
    status: mapEstadoToCompanyAdvanceStatus(input.estado),
    estadoApi: input.estado,
    isPaid: input.estado === "pagado",
    requestedAt: input.requestedAt,
    transferId: input.id.slice(0, 8).toUpperCase(),
    paymentEvidenceUrl: input.paymentEvidenceUrl?.trim() || null,
    rejectionReason: input.rejectionReason?.trim() || null,
    pagadoEn: input.pagadoEn?.trim() || null,
    decididoEn: input.decididoEn?.trim() || null,
    cuotas: input.cuotas,
  };
}

/** Convierte el historial empresa API a la estructura interna de auditoría. */
export function mapHistorialEmpresaToRegisteredCompanyAdvances(
  historial: HistorialSolicitudEmpresaDTO[],
  empleados: EmpleadoDTO[],
  empresaId?: string | null,
): RegisteredCompanyAdvance[] {
  const empleadoById = new Map(
    empleados.map((empleado) => [empleado.id, empleado]),
  );
  const resolvedEmpresaId = empresaId ?? resolveEmpresaId(empleados) ?? "";

  return historial.map((item) => {
    const empleado = empleadoById.get(item.empleado_id);

    return buildRegisteredAdvanceFromAmounts({
      id: item.id,
      empresaId: resolvedEmpresaId,
      employeeId: item.empleado_id,
      employeeName: item.empleado_nombre || empleado?.nombre || "Empleado",
      employeeDocument:
        item.empleado_documento || empleado?.documento || "—",
      baseSalary: empleado ? parseSalary(empleado.salario) : 0,
      monto: item.monto,
      montoNeto: item.monto_neto,
      tarifaTotal: item.tarifa_total,
      tarifaFijaPorCuotaSnapshot: item.tarifa_fija_por_cuota_snapshot,
      installments: item.numero_cuotas_snapshot,
      estado: item.estado,
      requestedAt: item.created_at,
      paymentEvidenceUrl: resolveSolicitudComprobanteUrl(item),
      rejectionReason: item.motivo_rechazo,
      pagadoEn: item.pagado_en,
      decididoEn: item.decidido_en,
      cuotas: item.cuotas,
    });
  });
}

/** @deprecated Prefer mapHistorialEmpresaToRegisteredCompanyAdvances */
export function mapSolicitudesToRegisteredCompanyAdvances(
  solicitudes: SolicitudAdelantoDTO[],
  empleados: EmpleadoDTO[],
): RegisteredCompanyAdvance[] {
  const empleadoById = new Map(
    empleados.map((empleado) => [empleado.id, empleado]),
  );

  return solicitudes.map((solicitud) => {
    const empleado = empleadoById.get(solicitud.empleado_id);

    return buildRegisteredAdvanceFromAmounts({
      id: solicitud.id,
      empresaId: solicitud.empresa_id,
      employeeId: solicitud.empleado_id,
      employeeName: empleado?.nombre ?? "Empleado",
      employeeDocument: empleado?.documento ?? "—",
      baseSalary: empleado ? parseSalary(empleado.salario) : 0,
      monto: solicitud.monto,
      montoNeto: solicitud.monto_a_recibir ?? solicitud.monto_neto,
      tarifaTotal: solicitud.tarifa_total,
      tarifaFijaPorCuotaSnapshot: solicitud.tarifa_fija_por_cuota_snapshot,
      installments: solicitud.numero_cuotas_snapshot,
      estado: solicitud.estado,
      requestedAt: solicitud.created_at,
      paymentEvidenceUrl: resolveSolicitudComprobanteUrl(solicitud),
      rejectionReason: solicitud.motivo_rechazo,
    });
  });
}

export function mapSolicitudesToAdvanceAuditRecords(
  solicitudes: SolicitudAdelantoDTO[],
  empleados: EmpleadoDTO[],
): EmployerAdvanceAuditRecord[] {
  return mapToAdvanceAuditRecords(
    mapSolicitudesToRegisteredCompanyAdvances(solicitudes, empleados),
    empleados,
  );
}

export function sortAdvancesByDate(
  advances: RegisteredCompanyAdvance[],
): RegisteredCompanyAdvance[] {
  return [...advances].sort(
    (a, b) =>
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
  );
}

export function mapToAdvanceAuditRecords(
  advances: RegisteredCompanyAdvance[],
  empleados: EmpleadoDTO[],
): EmployerAdvanceAuditRecord[] {
  const salaryByEmployeeId = new Map(
    empleados.map((empleado) => [empleado.id, parseSalary(empleado.salario)]),
  );

  return sortAdvancesByDate(advances).map((advance) => ({
    id: advance.id,
    employeeName: advance.employeeName,
    employeeDocument: advance.employeeDocument,
    baseSalary: salaryByEmployeeId.get(advance.employeeId) ?? advance.baseSalary,
    advancedAmount: advance.advancedAmount,
    feeAmount: advance.feeAmount,
    installments: advance.installments,
    status: advance.status,
    processedAt: advance.requestedAt,
    cuotas: advance.cuotas,
    isPaid: advance.isPaid,
  }));
}

export function mapToLoanInstallmentRecords(
  advances: RegisteredCompanyAdvance[],
  referenceDate?: Date,
): EmployerLoanInstallmentRecord[] {
  return sortAdvancesByDate(advances)
    .filter(
      (advance) =>
        isRecoverableCompanyAdvance(advance.status) &&
        advance.installments > 1,
    )
    .map((advance) => {
      const totalToRecover = advance.advancedAmount;
      const totalInstallments = Math.min(
        advance.installments,
        MAX_ADVANCE_INSTALLMENTS,
      );

      const tracking = calcularEstadoSeguimiento(
        advance.cuotas,
        totalToRecover,
        totalInstallments,
        advance.estadoApi || advance.status,
        referenceDate,
      );

      const firstLiberationDate =
        tracking.cuotasPagadas > 0
          ? advance.pagadoEn || advance.decididoEn || advance.requestedAt
          : null;

      return {
        id: advance.id,
        employeeName: advance.employeeName,
        totalLoanAmount: totalToRecover,
        totalInstallments: tracking.totalCuotas,
        paidInstallments: tracking.cuotasPagadas,
        pendingInstallments: tracking.pendingInstallments,
        installmentValue: tracking.installmentValue,
        pendingBalance: tracking.saldoPorDescontar,
        currentMonthStatus: tracking.estadoCuotaMes,
        firstLiberationDate,
        isFullyPaid: tracking.isFullyPaid,
      };
    });
}

export function mapToMovementRecords(
  advances: RegisteredCompanyAdvance[],
): EmployerMovementRecord[] {
  return sortAdvancesByDate(advances).map((advance) => ({
    id: advance.id,
    transferId: advance.transferId,
    occurredAt: advance.requestedAt,
    type: "adelanto",
    status: advance.status,
    installments: advance.installments,
    netDisbursedAmount: advance.netDisbursedAmount,
    employeeName: advance.employeeName,
    paymentEvidenceUrl: advance.paymentEvidenceUrl ?? null,
    rejectionReason: advance.rejectionReason ?? null,
  }));
}

function monthKeyDiff(fromKey: string, toKey: string): number {
  const [fromYear, fromMonth] = fromKey.split("-").map(Number);
  const [toYear, toMonth] = toKey.split("-").map(Number);
  return (toYear - fromYear) * 12 + (toMonth - fromMonth);
}

/**
 * Meses en los que el adelanto genera retención/reembolso:
 * 1 cuota → solo el mes de solicitud; N cuotas → N meses consecutivos.
 */
function getAdvanceInstallmentMonthOffset(
  advance: RegisteredCompanyAdvance,
  monthKey: string,
): number | null {
  const requestKey = getMonthKey(new Date(advance.requestedAt));
  const offset = monthKeyDiff(requestKey, monthKey);
  if (offset < 0) return null;

  const planMonths = Math.max(1, advance.installments);
  if (offset >= planMonths) return null;
  return offset;
}

function feePerInstallmentAmount(
  advance: RegisteredCompanyAdvance,
  installmentOffset: number,
): number {
  return calculateFeeForInstallmentIndex(
    advance.feeAmount,
    advance.installments,
    installmentOffset,
    advance.feePerCuotaSnapshot ?? DEFAULT_TARIFA_FIJA_POR_CUOTA,
  );
}

function computeMonthlyDeduction(
  advance: RegisteredCompanyAdvance,
  installmentOffset: number,
): {
  advancesTotal: number;
  /** Comisión de la cuota del mes (informativa; no entra en totales). */
  feesTotal: number;
  loanInstallmentsTotal: number;
  grandTotal: number;
  installmentValue: number | null;
} {
  const feeThisMonth = feePerInstallmentAmount(advance, installmentOffset);

  if (advance.installments === 1) {
    return {
      advancesTotal: advance.advancedAmount,
      feesTotal: feeThisMonth,
      loanInstallmentsTotal: advance.advancedAmount,
      /** Principal del mes: lo que la empresa reembolsa al proveedor. */
      grandTotal: advance.advancedAmount,
      installmentValue: advance.advancedAmount,
    };
  }

  const installmentValue = Math.round(
    advance.advancedAmount / advance.installments,
  );

  return {
    advancesTotal: 0,
    feesTotal: feeThisMonth,
    loanInstallmentsTotal: installmentValue,
    /** Solo la cuota del mes, no el monto total del adelanto. */
    grandTotal: installmentValue,
    installmentValue,
  };
}

function formatInstallmentProgressLabel(
  entries: Array<{ current: number; total: number }>,
): string | null {
  if (entries.length === 0) return null;
  const labels = entries.map((entry) => {
    const noun = entry.total === 1 ? "cuota" : "cuotas";
    return `${entry.current} de ${entry.total} ${noun}`;
  });
  return [...new Set(labels)].join(" · ");
}

export function listPayrollClosureMonthOptions(
  advances: RegisteredCompanyAdvance[],
  referenceDate: Date = new Date(),
): Array<{ value: string; label: string }> {
  const keys = new Set<string>();
  keys.add(getMonthKey(referenceDate));

  advances.forEach((advance) => {
    if (!isRecoverableCompanyAdvance(advance.status)) return;
    const start = new Date(advance.requestedAt);
    const planMonths = Math.max(1, advance.installments);
    for (let offset = 0; offset < planMonths; offset += 1) {
      keys.add(
        getMonthKey(
          new Date(start.getFullYear(), start.getMonth() + offset, 1),
        ),
      );
    }
  });

  return [...keys]
    .sort((a, b) => b.localeCompare(a))
    .map((value) => {
      const [year, month] = value.split("-").map(Number);
      const date = new Date(year, month - 1, 1);
      return {
        value,
        label: capitalizeMonth(getMonthLabel(date)),
      };
    });
}

export function monthKeyToReferenceDate(monthKey: string): Date {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) return new Date();
  return new Date(year, month - 1, 15, 12, 0, 0, 0);
}

/** Adelantos del empleado que impactan retenciones/reembolso del mes. */
export function listPayrollClosureEmployeeAdvances(
  advances: RegisteredCompanyAdvance[],
  employeeDocument: string,
  referenceDate: Date = new Date(),
): RegisteredCompanyAdvance[] {
  const monthKey = getMonthKey(referenceDate);
  return sortAdvancesByDate(
    advances.filter(
      (advance) =>
        advance.employeeDocument === employeeDocument &&
        isRecoverableCompanyAdvance(advance.status) &&
        getAdvanceInstallmentMonthOffset(advance, monthKey) !== null,
    ),
  );
}

function isAdvanceInstallmentPaidForMonth(
  advance: RegisteredCompanyAdvance,
  offset: number,
): boolean {
  if (Array.isArray(advance.cuotas) && advance.cuotas.length > 0) {
    const cuota = advance.cuotas.find((c) => c.numero === offset + 1);
    if (cuota) {
      const cEstado = String(cuota.estado || "").toLowerCase().trim();
      return (
        cEstado === "pagado" ||
        cEstado === "pagada" ||
        cEstado === "liberado" ||
        cEstado === "liberada" ||
        Boolean(cuota.fecha_pago)
      );
    }
  }

  return false;
}

export function buildPayrollClosureSnapshot(
  advances: RegisteredCompanyAdvance[],
  referenceDate: Date = new Date(),
): EmployerPayrollClosureSnapshot {
  const monthKey = getMonthKey(referenceDate);
  // Solo aprobados/pagados: un rechazado nunca genera retención ni reembolso.
  // Multi-cuota: también entra en los meses siguientes (cuota 2, 3, …).
  const monthAdvances = advances.filter(
    (advance) =>
      isRecoverableCompanyAdvance(advance.status) &&
      getAdvanceInstallmentMonthOffset(advance, monthKey) !== null,
  );

  type SummaryAcc = EmployerPayrollDeductionSummary & {
    installmentPlans: number[];
    installmentValues: Array<number | null>;
    installmentProgress: Array<{ current: number; total: number }>;
  };

  const summaryMap = new Map<string, SummaryAcc>();

  monthAdvances.forEach((advance) => {
    const offset = getAdvanceInstallmentMonthOffset(advance, monthKey);
    if (offset === null) return;

    const deduction = computeMonthlyDeduction(advance, offset);
    const isRequestMonth = offset === 0;
    const planTotal = Math.max(1, advance.installments);
    const isPaid = isAdvanceInstallmentPaidForMonth(advance, offset);

    const current = summaryMap.get(advance.employeeId) ?? {
      employeeName: advance.employeeName,
      employeeDocument: advance.employeeDocument,
      advancesCount: 0,
      installments: null,
      installmentValue: null,
      installmentProgressLabel: null,
      principalTotal: 0,
      advancesTotal: 0,
      feesTotal: 0,
      loanInstallmentsTotal: 0,
      grandTotal: 0,
      paidAmount: 0,
      pendingAmount: 0,
      isSettled: false,
      statusLabel: "Pendiente",
      installmentPlans: [],
      installmentValues: [],
      installmentProgress: [],
    };

    const advanceMonthlyAmount = deduction.grandTotal;
    const advancePaidAmount = isPaid ? advanceMonthlyAmount : 0;
    const advancePendingAmount = isPaid ? 0 : advanceMonthlyAmount;

    summaryMap.set(advance.employeeId, {
      ...current,
      // Solo cuenta como “realizado en el mes” en el mes de solicitud.
      advancesCount: current.advancesCount + (isRequestMonth ? 1 : 0),
      principalTotal: current.principalTotal + advance.advancedAmount,
      advancesTotal: current.advancesTotal + deduction.advancesTotal,
      // Comisión por cuota del mes: informativa en cada mes del plan (no suma a totales).
      feesTotal: current.feesTotal + deduction.feesTotal,
      loanInstallmentsTotal:
        current.loanInstallmentsTotal + deduction.loanInstallmentsTotal,
      grandTotal: current.grandTotal + deduction.grandTotal,
      paidAmount: current.paidAmount + advancePaidAmount,
      pendingAmount: current.pendingAmount + advancePendingAmount,
      installmentPlans: [...current.installmentPlans, advance.installments],
      installmentValues: [
        ...current.installmentValues,
        deduction.installmentValue,
      ],
      installmentProgress: [
        ...current.installmentProgress,
        { current: offset + 1, total: planTotal },
      ],
    });
  });

  const employeeSummaries = [...summaryMap.values()]
    .map((summary) => {
      const uniquePlans = [...new Set(summary.installmentPlans)];
      const multiCuotaValues = summary.installmentValues.filter(
        (value): value is number => value !== null,
      );
      const uniqueValues = [...new Set(multiCuotaValues)];

      const installments =
        uniquePlans.length === 1 ? uniquePlans[0] : null;
      const installmentValue =
        installments !== null && uniqueValues.length === 1
          ? uniqueValues[0]
          : null;

      const isSettled =
        summary.grandTotal > 0 && summary.pendingAmount === 0;
      const isPartiallySettled =
        summary.paidAmount > 0 && summary.pendingAmount > 0;
      const statusLabel = isSettled
        ? "Saldado"
        : isPartiallySettled
          ? "Parcial"
          : "Pendiente";

      return {
        employeeName: summary.employeeName,
        employeeDocument: summary.employeeDocument,
        advancesCount: summary.advancesCount,
        installments,
        installmentValue,
        installmentProgressLabel: formatInstallmentProgressLabel(
          summary.installmentProgress,
        ),
        principalTotal: summary.principalTotal,
        advancesTotal: summary.advancesTotal,
        feesTotal: summary.feesTotal,
        loanInstallmentsTotal: summary.loanInstallmentsTotal,
        grandTotal: summary.grandTotal,
        paidAmount: summary.paidAmount,
        pendingAmount: summary.pendingAmount,
        isSettled,
        statusLabel,
      };
    })
    .sort((a, b) => a.employeeName.localeCompare(b.employeeName, "es"));

  const totalPayrollDeductions = employeeSummaries.reduce(
    (sum, item) => sum + item.grandTotal,
    0,
  );
  const totalPaid = employeeSummaries.reduce(
    (sum, item) => sum + item.paidAmount,
    0,
  );
  const totalPending = employeeSummaries.reduce(
    (sum, item) => sum + item.pendingAmount,
    0,
  );

  const providerReimbursementTotal = totalPayrollDeductions;
  const providerReimbursement = totalPending;
  const isAllSettled =
    totalPayrollDeductions > 0 && totalPending === 0;

  return {
    monthKey,
    monthLabel: capitalizeMonth(getMonthLabel(referenceDate)),
    totalPayrollDeductions,
    totalPaid,
    totalPending,
    providerReimbursement,
    providerReimbursementTotal,
    isAllSettled,
    employeeSummaries,
  };
}

function getDefaultFechaCorte(requestedAt: string, offset = 0): string {
  const date = new Date(requestedAt);
  const target = new Date(date.getFullYear(), date.getMonth() + offset + 1, 0);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, "0");
  const day = String(target.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Construye el reporte consolidado de cuotas a descontar para el Dashboard de Empresa,
 * basándose en los adelantos y el plan de cuotas enriquecido.
 */
export function buildNominaDescuentosSnapshot(
  advances: RegisteredCompanyAdvance[],
  periodo: string,
): EmployerNominaDescuentosSnapshot {
  const employeeMap = new Map<
    string,
    {
      fullName: string;
      documento: string;
      advanceIds: Set<string>;
      cuotas: EmployerNominaCuotaDetalle[];
    }
  >();

  const recoverable = advances.filter((advance) =>
    isRecoverableCompanyAdvance(advance.status),
  );

  recoverable.forEach((advance) => {
    const doc = advance.employeeDocument || "—";
    const employeeEntry = employeeMap.get(doc) ?? {
      fullName: advance.employeeName,
      documento: doc,
      advanceIds: new Set<string>(),
      cuotas: [],
    };

    if (Array.isArray(advance.cuotas) && advance.cuotas.length > 0) {
      advance.cuotas.forEach((c) => {
        const matchesMonth =
          (c.fecha_corte && c.fecha_corte.startsWith(periodo)) ||
          (!c.fecha_corte &&
            getAdvanceInstallmentMonthOffset(advance, periodo) ===
              c.numero - 1);

        if (matchesMonth) {
          employeeEntry.advanceIds.add(advance.id);
          const cuotaMonto =
            typeof c.monto === "number"
              ? String(c.monto)
              : c.monto ||
                String(
                  Math.round(advance.advancedAmount / advance.installments),
                );

          employeeEntry.cuotas.push({
            solicitud_id: advance.id,
            cuota_numero: c.numero,
            total_cuotas: advance.cuotas?.length || advance.installments,
            fecha_corte:
              c.fecha_corte ||
              getDefaultFechaCorte(advance.requestedAt, c.numero - 1),
            estado_cuota: isCuotaPagada(c) ? "pagada" : "pendiente",
            monto_solicitud: String(advance.advancedAmount),
            monto_a_descontar: cuotaMonto,
          });
        }
      });
    } else {
      const offset = getAdvanceInstallmentMonthOffset(advance, periodo);
      if (offset !== null) {
        employeeEntry.advanceIds.add(advance.id);
        const installmentValue = Math.round(
          advance.advancedAmount / Math.max(1, advance.installments),
        );
        const isPaid = isAdvanceInstallmentPaidForMonth(advance, offset);

        employeeEntry.cuotas.push({
          solicitud_id: advance.id,
          cuota_numero: offset + 1,
          total_cuotas: Math.max(1, advance.installments),
          fecha_corte: getDefaultFechaCorte(advance.requestedAt, offset),
          estado_cuota: isPaid ? "pagada" : "pendiente",
          monto_solicitud: String(advance.advancedAmount),
          monto_a_descontar: String(installmentValue),
        });
      }
    }

    if (employeeEntry.cuotas.length > 0) {
      employeeMap.set(doc, employeeEntry);
    }
  });

  const resumen: EmployerNominaEmpleadoResumen[] = [...employeeMap.values()]
    .map((entry) => {
      // Suma solo las cuotas no descontadas (pendientes)
      const totalDescontar = entry.cuotas.reduce((sum, c) => {
        if (c.estado_cuota === "pagada") return sum;
        return sum + (Number.parseFloat(c.monto_a_descontar) || 0);
      }, 0);

      const totalDescontado = entry.cuotas.reduce((sum, c) => {
        if (c.estado_cuota !== "pagada") return sum;
        return sum + (Number.parseFloat(c.monto_a_descontar) || 0);
      }, 0);

      const totalGeneral = entry.cuotas.reduce(
        (sum, c) => sum + (Number.parseFloat(c.monto_a_descontar) || 0),
        0,
      );

      const isAllDescontado =
        entry.cuotas.length > 0 &&
        entry.cuotas.every((c) => c.estado_cuota === "pagada");

      return {
        fullName: entry.fullName,
        documento: entry.documento,
        cantidadAdelantos: entry.advanceIds.size,
        cuotasMes: entry.cuotas.length,
        totalDescontar,
        totalDescontado,
        totalGeneral,
        isAllDescontado,
        cuotas: entry.cuotas.sort((a, b) => a.cuota_numero - b.cuota_numero),
      };
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "es"));

  const totalDescontar = resumen.reduce(
    (sum, item) => sum + item.totalDescontar,
    0,
  );
  const totalDescontado = resumen.reduce(
    (sum, item) => sum + item.totalDescontado,
    0,
  );
  const totalGeneral = resumen.reduce(
    (sum, item) => sum + item.totalGeneral,
    0,
  );

  const cuotasDelMes = resumen.reduce((sum, item) => sum + item.cuotasMes, 0);
  const cuotasPendientes = resumen.reduce(
    (sum, item) =>
      sum + item.cuotas.filter((c) => c.estado_cuota !== "pagada").length,
    0,
  );
  const cuotasDescontadas = resumen.reduce(
    (sum, item) =>
      sum + item.cuotas.filter((c) => c.estado_cuota === "pagada").length,
    0,
  );

  const empleadosConDescuento = resumen.filter(
    (item) => item.totalDescontar > 0,
  ).length;

  return {
    periodo,
    totalDescontar,
    totalDescontado,
    totalGeneral,
    empleadosConDescuento,
    cuotasDelMes,
    cuotasPendientes,
    cuotasDescontadas,
    resumen,
  };
}
