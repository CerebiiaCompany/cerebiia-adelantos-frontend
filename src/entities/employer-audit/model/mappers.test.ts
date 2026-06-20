import { describe, expect, it } from "vitest";
import {
  buildPayrollClosureSnapshot,
  mapToAdvanceAuditRecords,
  mapToLoanInstallmentRecords,
  mapToMovementRecords,
} from "./mappers";
import type { RegisteredCompanyAdvance } from "./registryStorage";

const sampleAdvances: RegisteredCompanyAdvance[] = [
  {
    id: "adv-1",
    empresaId: "empresa-1",
    employeeId: "emp-1",
    employeeName: "Ana Pérez",
    employeeDocument: "123",
    baseSalary: 2_000_000,
    advancedAmount: 400_000,
    installments: 1,
    feeAmount: 10_000,
    netDisbursedAmount: 390_000,
    status: "en_curso",
    requestedAt: "2026-06-19T10:00:00-05:00",
    transferId: "TRF-1",
  },
  {
    id: "adv-2",
    empresaId: "empresa-1",
    employeeId: "emp-2",
    employeeName: "Luis Gómez",
    employeeDocument: "456",
    baseSalary: 3_000_000,
    advancedAmount: 900_000,
    installments: 3,
    feeAmount: 22_500,
    netDisbursedAmount: 877_500,
    status: "en_curso",
    requestedAt: "2026-06-19T11:00:00-05:00",
    transferId: "TRF-2",
  },
];

describe("employer audit mappers", () => {
  it("mapea adelantos para monitoreo con salario del endpoint", () => {
    const records = mapToAdvanceAuditRecords(sampleAdvances, [
      {
        id: "emp-1",
        documento: "123",
        nombre: "Ana Pérez",
        salario: "2500000.00",
        banco: "Bancolombia",
        numero_cuenta: "1",
        estado: "activo",
        empresa_id: "empresa-1",
        created_at: "",
        updated_at: "",
      },
    ]);

    const anaRecord = records.find((record) => record.employeeDocument === "123");
    expect(anaRecord?.baseSalary).toBe(2_500_000);
    expect(anaRecord?.installments).toBe(1);
  });

  it("solo incluye adelantos con 2 o 3 cuotas en seguimiento", () => {
    const loans = mapToLoanInstallmentRecords(sampleAdvances);
    expect(loans).toHaveLength(1);
    expect(loans[0].totalInstallments).toBe(3);
    expect(loans[0].totalLoanAmount).toBe(900_000);
    expect(loans[0].installmentValue).toBe(300_000);
  });

  it("genera movimientos desde adelantos reales", () => {
    const movements = mapToMovementRecords(sampleAdvances);
    expect(movements).toHaveLength(2);
    expect(movements[0].netDisbursedAmount).toBe(877_500);
  });

  it("consolida retenciones del mes actual", () => {
    const closure = buildPayrollClosureSnapshot(
      sampleAdvances,
      new Date("2026-06-20T12:00:00-05:00"),
    );

    expect(closure.employeeSummaries).toHaveLength(2);
    expect(closure.totalPayrollDeductions).toBe(700_000);
    expect(closure.providerReimbursement).toBe(390_000 + 877_500);
  });
});
