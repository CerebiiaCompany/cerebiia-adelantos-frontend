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

function computeMonthlyDeduction(advance: RegisteredCompanyAdvance): {
  advancesTotal: number;
  feesTotal: number;
  loanInstallmentsTotal: number;
  grandTotal: number;
} {
  if (advance.installments === 1) {
    return {
      advancesTotal: advance.advancedAmount,
      feesTotal: advance.feeAmount,
      loanInstallmentsTotal: 0,
      grandTotal: advance.advancedAmount,
    };
  }

  const installmentValue = Math.round(
    advance.advancedAmount / advance.installments,
  );

  return {
    advancesTotal: 0,
    feesTotal: 0,
    loanInstallmentsTotal: installmentValue,
    grandTotal: installmentValue,
  };
}

export function buildPayrollClosureSnapshot(
  advances: RegisteredCompanyAdvance[],
  referenceDate: Date = new Date(),
): EmployerPayrollClosureSnapshot {
  const monthKey = getMonthKey(referenceDate);
  // Solo aprobados/pagados: un rechazado nunca genera retención ni reembolso.
  const monthAdvances = advances.filter(
    (advance) =>
      isRecoverableCompanyAdvance(advance.status) &&
      getMonthKey(new Date(advance.requestedAt)) === monthKey,
  );

  const summaryMap = new Map<string, EmployerPayrollDeductionSummary>();

  monthAdvances.forEach((advance) => {
    const deduction = computeMonthlyDeduction(advance);
    const current = summaryMap.get(advance.employeeId) ?? {
      employeeName: advance.employeeName,
      employeeDocument: advance.employeeDocument,
      advancesTotal: 0,
      feesTotal: 0,
      loanInstallmentsTotal: 0,
      grandTotal: 0,
    };

    summaryMap.set(advance.employeeId, {
      ...current,
      advancesTotal: current.advancesTotal + deduction.advancesTotal,
      feesTotal: current.feesTotal + deduction.feesTotal,
      loanInstallmentsTotal:
        current.loanInstallmentsTotal + deduction.loanInstallmentsTotal,
      grandTotal: current.grandTotal + deduction.grandTotal,
    });
  });

  const employeeSummaries = [...summaryMap.values()].sort((a, b) =>
    a.employeeName.localeCompare(b.employeeName, "es"),
  );

  const totalPayrollDeductions = employeeSummaries.reduce(
    (sum, item) => sum + item.grandTotal,
    0,
  );
  const providerReimbursement = monthAdvances.reduce(
    (sum, advance) => sum + advance.advancedAmount,
    0,
  );

  return {
    monthLabel: capitalizeMonth(getMonthLabel(referenceDate)),
    totalPayrollDeductions,
    providerReimbursement,
    employeeSummaries,
  };
}
