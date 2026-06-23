import { describe, expect, it } from "vitest";
import {
  buildPayrollClosureSnapshot,
  mapSolicitudesToAdvanceAuditRecords,
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
    feeAmount: 8_000,
    netDisbursedAmount: 392_000,
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
    feeAmount: 8_000,
    netDisbursedAmount: 892_000,
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
        banco_id: "bank-1",
        banco_nombre: "Bancolombia",
        numero_cuenta: "1",
        tipo_documento: "cc",
        email_empleado: "ana@empresa.com",
        celular: "3001234567",
        tipo_contrato: "indefinido",
        fecha_ingreso: "2024-01-01",
        tipo_cuenta: "ahorros",
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

  it("mapea solicitudes API a registros de monitoreo", () => {
    const records = mapSolicitudesToAdvanceAuditRecords(
      [
        {
          id: "sol-1",
          empleado_id: "emp-1",
          empresa_id: "empresa-1",
          monto: "400000.00",
          numero_cuotas_snapshot: 2,
          plazo_dias_snapshot: 60,
          estado: "solicitado",
          created_at: "2026-06-22T16:56:49Z",
        },
      ],
      [
        {
          id: "emp-1",
          documento: "123",
          nombre: "Ana Pérez",
          salario: "2000000.00",
          banco_id: "bank-1",
          banco_nombre: "Bancolombia",
          numero_cuenta: "1",
          tipo_documento: "cc",
          email_empleado: "ana@empresa.com",
          celular: "3001234567",
          tipo_contrato: "indefinido",
          fecha_ingreso: "2024-01-01",
          tipo_cuenta: "ahorros",
          estado: "activo",
          empresa_id: "empresa-1",
          created_at: "",
          updated_at: "",
        },
      ],
    );

    expect(records).toHaveLength(1);
    expect(records[0].advancedAmount).toBe(400_000);
    expect(records[0].status).toBe("en_curso");
    expect(records[0].installments).toBe(2);
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
    expect(movements[0].netDisbursedAmount).toBe(892_000);
  });

  it("consolida retenciones del mes actual", () => {
    const closure = buildPayrollClosureSnapshot(
      sampleAdvances,
      new Date("2026-06-20T12:00:00-05:00"),
    );

    expect(closure.employeeSummaries).toHaveLength(2);
    expect(closure.totalPayrollDeductions).toBe(700_000);
    expect(closure.providerReimbursement).toBe(392_000 + 892_000);
  });
});
