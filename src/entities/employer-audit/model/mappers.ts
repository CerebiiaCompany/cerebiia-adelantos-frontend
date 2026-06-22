// ⚠️ AGNOSTIC — maps registered advances to employer audit views

import type { SolicitudAdelantoDTO, EstadoSolicitud } from "@/shared/api/types/adelanto";
import type { EmpleadoDTO } from "@/shared/api/types";
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

/** Convierte solicitudes API a la estructura interna de auditoría empresa. */
export function mapSolicitudesToRegisteredCompanyAdvances(
  solicitudes: SolicitudAdelantoDTO[],
  empleados: EmpleadoDTO[],
): RegisteredCompanyAdvance[] {
  const empleadoById = new Map(empleados.map((empleado) => [empleado.id, empleado]));

  return solicitudes.map((solicitud) => {
    const empleado = empleadoById.get(solicitud.empleado_id);
    const advancedAmount = Number.parseFloat(solicitud.monto);
    const safeAmount = Number.isNaN(advancedAmount) ? 0 : advancedAmount;
    const feeAmount = Math.round(safeAmount * 0.025);

    return {
      id: solicitud.id,
      empresaId: solicitud.empresa_id,
      employeeId: solicitud.empleado_id,
      employeeName: empleado?.nombre ?? "Empleado",
      employeeDocument: empleado?.documento ?? "—",
      baseSalary: empleado ? parseSalary(empleado.salario) : 0,
      advancedAmount: safeAmount,
      installments: solicitud.numero_cuotas_snapshot,
      feeAmount,
      netDisbursedAmount: safeAmount - feeAmount,
      status: mapEstadoToCompanyAdvanceStatus(solicitud.estado),
      requestedAt: solicitud.created_at,
      transferId: solicitud.id.slice(0, 8).toUpperCase(),
    };
  });
}

/** Mapea solicitudes del backend (rol empresa) a registros de monitoreo. */
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
    installments: advance.installments,
    status: advance.status,
    processedAt: advance.requestedAt,
  }));
}

export function mapToLoanInstallmentRecords(
  advances: RegisteredCompanyAdvance[],
): EmployerLoanInstallmentRecord[] {
  return sortAdvancesByDate(advances)
    .filter((advance) => advance.installments > 1)
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
    netDisbursedAmount: advance.netDisbursedAmount,
    employeeName: advance.employeeName,
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
  const monthAdvances = advances.filter(
    (advance) => getMonthKey(new Date(advance.requestedAt)) === monthKey,
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
    (sum, advance) => sum + advance.netDisbursedAmount,
    0,
  );

  return {
    monthLabel: capitalizeMonth(getMonthLabel(referenceDate)),
    totalPayrollDeductions,
    providerReimbursement,
    employeeSummaries,
  };
}
