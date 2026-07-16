// ⚠️ AGNOSTIC — maps registered advances to employer audit views

import { resolveSolicitudComprobanteUrl } from "@/shared/lib/comprobantePago";
import type {
  EmployerAdvanceAuditRecord,
  EmployerLoanInstallmentRecord,
  EmployerMovementRecord,
  EmployerPayrollClosureSnapshot,
  EmployerPayrollDeductionSummary,
} from "./types";
import {
  MAX_ADVANCE_INSTALLMENTS,
  type CompanyAdvanceStatus,
  type RegisteredCompanyAdvance,
} from "./registryStorage";
import {
  calculateAdvanceFee,
  isRecoverableCompanyAdvance,
} from "./calculations";
import { DEFAULT_TARIFA_FIJA_POR_CUOTA } from "@/shared/config/advanceFees";
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
  installments: number;
  estado: EstadoSolicitud;
  requestedAt: string;
  paymentEvidenceUrl?: string | null;
  rejectionReason?: string | null;
}): RegisteredCompanyAdvance {
  const advancedAmount = Number.parseFloat(input.monto);
  const safeAmount = Number.isNaN(advancedAmount) ? 0 : advancedAmount;
  const parsedTarifaTotal = input.tarifaTotal
    ? Number.parseFloat(input.tarifaTotal)
    : Number.NaN;
  const parsedNet = input.montoNeto
    ? Number.parseFloat(input.montoNeto)
    : Number.NaN;
  const feeAmount =
    !Number.isNaN(parsedTarifaTotal) && parsedTarifaTotal >= 0
      ? Math.round(parsedTarifaTotal)
      : calculateAdvanceFee(safeAmount, DEFAULT_TARIFA_FIJA_POR_CUOTA, input.installments);
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
    netDisbursedAmount,
    status: mapEstadoToCompanyAdvanceStatus(input.estado),
    requestedAt: input.requestedAt,
    transferId: input.id.slice(0, 8).toUpperCase(),
    paymentEvidenceUrl: input.paymentEvidenceUrl?.trim() || null,
    rejectionReason: input.rejectionReason?.trim() || null,
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
      installments: item.numero_cuotas_snapshot,
      estado: item.estado,
      requestedAt: item.created_at,
      paymentEvidenceUrl: resolveSolicitudComprobanteUrl(item),
      rejectionReason: item.motivo_rechazo,
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
  }));
}

export function mapToLoanInstallmentRecords(
  advances: RegisteredCompanyAdvance[],
): EmployerLoanInstallmentRecord[] {
  return sortAdvancesByDate(advances)
    .filter(
      (advance) =>
        isRecoverableCompanyAdvance(advance.status) &&
        advance.installments > 1,
    )
    .map((advance) => {
      const totalToRecover = advance.advancedAmount;
      const installmentValue = Math.round(
        totalToRecover / advance.installments,
      );

      return {
        id: advance.id,
        employeeName: advance.employeeName,
        totalLoanAmount: totalToRecover,
        totalInstallments: Math.min(
          advance.installments,
          MAX_ADVANCE_INSTALLMENTS,
        ),
        paidInstallments: 0,
        installmentValue,
        pendingBalance: totalToRecover,
        currentMonthStatus:
          advance.status === "en_curso" ? "pendiente" : "al_dia",
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

function computeMonthlyDeduction(advance: RegisteredCompanyAdvance): {
  advancesTotal: number;
  feesTotal: number;
  loanInstallmentsTotal: number;
  grandTotal: number;
  installmentValue: number | null;
} {
  if (advance.installments === 1) {
    return {
      advancesTotal: advance.advancedAmount,
      feesTotal: advance.feeAmount,
      loanInstallmentsTotal: 0,
      /** Principal del mes: lo que la empresa reembolsa al proveedor. */
      grandTotal: advance.advancedAmount,
      installmentValue: null,
    };
  }

  const installmentValue = Math.round(
    advance.advancedAmount / advance.installments,
  );

  return {
    advancesTotal: 0,
    feesTotal: 0,
    loanInstallmentsTotal: installmentValue,
    /** Solo la cuota del mes, no el monto total del adelanto. */
    grandTotal: installmentValue,
    installmentValue,
  };
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
  };

  const summaryMap = new Map<string, SummaryAcc>();

  monthAdvances.forEach((advance) => {
    const offset = getAdvanceInstallmentMonthOffset(advance, monthKey);
    if (offset === null) return;

    const deduction = computeMonthlyDeduction(advance);
    const isRequestMonth = offset === 0;
    const current = summaryMap.get(advance.employeeId) ?? {
      employeeName: advance.employeeName,
      employeeDocument: advance.employeeDocument,
      advancesCount: 0,
      installments: null,
      installmentValue: null,
      advancesTotal: 0,
      feesTotal: 0,
      loanInstallmentsTotal: 0,
      grandTotal: 0,
      installmentPlans: [],
      installmentValues: [],
    };

    summaryMap.set(advance.employeeId, {
      ...current,
      // Solo cuenta como “realizado en el mes” en el mes de solicitud.
      advancesCount: current.advancesCount + (isRequestMonth ? 1 : 0),
      advancesTotal: current.advancesTotal + deduction.advancesTotal,
      feesTotal:
        current.feesTotal + (isRequestMonth ? deduction.feesTotal : 0),
      loanInstallmentsTotal:
        current.loanInstallmentsTotal + deduction.loanInstallmentsTotal,
      grandTotal: current.grandTotal + deduction.grandTotal,
      installmentPlans: [...current.installmentPlans, advance.installments],
      installmentValues: [
        ...current.installmentValues,
        deduction.installmentValue,
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
        installments !== null &&
        installments > 1 &&
        uniqueValues.length === 1
          ? uniqueValues[0]
          : null;

      return {
        employeeName: summary.employeeName,
        employeeDocument: summary.employeeDocument,
        advancesCount: summary.advancesCount,
        installments,
        installmentValue,
        advancesTotal: summary.advancesTotal,
        feesTotal: summary.feesTotal,
        loanInstallmentsTotal: summary.loanInstallmentsTotal,
        grandTotal: summary.grandTotal,
      };
    })
    .sort((a, b) => a.employeeName.localeCompare(b.employeeName, "es"));

  const totalPayrollDeductions = employeeSummaries.reduce(
    (sum, item) => sum + item.grandTotal,
    0,
  );
  // Reembolso = mismo principal del mes que se descuenta al empleado
  // (monto completo si 1 cuota; solo la cuota del mes si es 2+).
  const providerReimbursement = totalPayrollDeductions;

  return {
    monthKey,
    monthLabel: capitalizeMonth(getMonthLabel(referenceDate)),
    totalPayrollDeductions,
    providerReimbursement,
    employeeSummaries,
  };
}
