import { describe, expect, it } from "vitest";
import {
  buildPayrollClosureSnapshot,
  listPayrollClosureEmployeeAdvances,
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
    status: "procesado",
    requestedAt: "2026-06-19T10:00:00-05:00",
    transferId: "TRF-1",
    paymentEvidenceUrl: null,
    rejectionReason: null,
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
    feeAmount: 16_000,
    feePerCuotaSnapshot: 8_000,
    netDisbursedAmount: 884_000,
    status: "procesado",
    requestedAt: "2026-06-19T11:00:00-05:00",
    transferId: "TRF-2",
    paymentEvidenceUrl: "https://cdn.example.com/comprobante.pdf",
    rejectionReason: null,
  },
];

const melannyCase: RegisteredCompanyAdvance[] = [
  {
    id: "adv-rechazado",
    empresaId: "empresa-1",
    employeeId: "emp-m",
    employeeName: "Melanny Guate",
    employeeDocument: "1005026054",
    baseSalary: 1_700_000,
    advancedAmount: 500_000,
    installments: 2,
    feeAmount: 16_000,
    netDisbursedAmount: 484_000,
    status: "rechazado",
    requestedAt: "2026-07-14T10:00:00-05:00",
    transferId: "TRF-R",
    paymentEvidenceUrl: null,
    rejectionReason: "No se puede",
  },
  {
    id: "adv-aprobado",
    empresaId: "empresa-1",
    employeeId: "emp-m",
    employeeName: "Melanny Guate",
    employeeDocument: "1005026054",
    baseSalary: 1_700_000,
    advancedAmount: 100_000,
    installments: 1,
    feeAmount: 12_000,
    netDisbursedAmount: 88_000,
    status: "procesado",
    requestedAt: "2026-07-14T13:00:00-05:00",
    transferId: "TRF-A",
    paymentEvidenceUrl: "http://localhost:9000/media/x.jpe",
    rejectionReason: null,
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

  it("solo incluye adelantos con 2 o 3 cuotas en seguimiento y calcula cuotas pagadas/pendientes", () => {
    const multiAdvances: RegisteredCompanyAdvance[] = [
      {
        ...sampleAdvances[0],
        id: "adv-multi-track",
        installments: 2,
        advancedAmount: 200_000,
        isPaid: true,
        estadoApi: "pagado",
        pagadoEn: "2026-08-15T10:00:00-05:00",
      },
    ];

    const loans = mapToLoanInstallmentRecords(multiAdvances);
    expect(loans).toHaveLength(1);
    expect(loans[0].totalInstallments).toBe(2);
    expect(loans[0].paidInstallments).toBe(1);
    expect(loans[0].pendingInstallments).toBe(1);
    expect(loans[0].installmentValue).toBe(100_000);
    expect(loans[0].pendingBalance).toBe(100_000);
    expect(loans[0].firstLiberationDate).toBe("2026-08-15T10:00:00-05:00");
  });

  it("excluye rechazados del seguimiento de cuotas", () => {
    const loans = mapToLoanInstallmentRecords(melannyCase);
    expect(loans).toHaveLength(0);
  });

  it("genera movimientos desde adelantos reales", () => {
    const movements = mapToMovementRecords(sampleAdvances);
    expect(movements).toHaveLength(2);
    expect(movements[0].netDisbursedAmount).toBe(884_000);
    expect(movements[0].installments).toBe(3);
    expect(movements[0].status).toBeDefined();
    expect(movements[0].paymentEvidenceUrl).toBe(
      "https://cdn.example.com/comprobante.pdf",
    );
  });

  it("consolida retenciones del mes actual", () => {
    const closure = buildPayrollClosureSnapshot(
      sampleAdvances,
      new Date("2026-06-20T12:00:00-05:00"),
    );

    expect(closure.monthKey).toBe("2026-06");
    expect(closure.employeeSummaries).toHaveLength(2);
    // Ana 400k (1 cuota) + Luis 300k (cuota 1 de 900k/3)
    expect(closure.totalPayrollDeductions).toBe(700_000);
    expect(closure.providerReimbursement).toBe(700_000);

    const ana = closure.employeeSummaries.find(
      (item) => item.employeeDocument === "123",
    );
    expect(ana?.advancesCount).toBe(1);
    expect(ana?.installments).toBe(1);
    expect(ana?.installmentValue).toBe(400_000);
    expect(ana?.installmentProgressLabel).toBe("1 de 1 cuota");
    expect(ana?.principalTotal).toBe(400_000);
    expect(ana?.loanInstallmentsTotal).toBe(400_000);

    const luis = closure.employeeSummaries.find(
      (item) => item.employeeDocument === "456",
    );
    expect(luis?.advancesCount).toBe(1);
    expect(luis?.installments).toBe(3);
    expect(luis?.installmentValue).toBe(300_000);
    expect(luis?.installmentProgressLabel).toBe("1 de 3 cuotas");
    expect(luis?.principalTotal).toBe(900_000);
    expect(luis?.loanInstallmentsTotal).toBe(300_000);
    // Promo (fee 16k = 8k×2): 1ª cuota gratis → comisión informativa 0 en mes de solicitud
    expect(luis?.feesTotal).toBe(0);
    // La comisión no entra al consolidado ni al reembolso
    expect(closure.totalPayrollDeductions).toBe(700_000);
  });

  it("reembolsa al proveedor solo la cuota del mes en planes multi-cuota", () => {
    const advance: RegisteredCompanyAdvance[] = [
      {
        ...sampleAdvances[1],
        id: "adv-2cuotas",
        advancedAmount: 200_000,
        installments: 2,
        feeAmount: 8_000,
        feePerCuotaSnapshot: 8_000,
        requestedAt: "2026-06-10T10:00:00-05:00",
      },
    ];

    const june = buildPayrollClosureSnapshot(
      advance,
      new Date("2026-06-20T12:00:00-05:00"),
    );
    expect(june.providerReimbursement).toBe(100_000);
    expect(june.totalPayrollDeductions).toBe(100_000);
    expect(june.employeeSummaries[0].advancesCount).toBe(1);
    expect(june.employeeSummaries[0].installmentProgressLabel).toBe(
      "1 de 2 cuotas",
    );
    expect(june.employeeSummaries[0].principalTotal).toBe(200_000);
    expect(june.employeeSummaries[0].loanInstallmentsTotal).toBe(100_000);
    expect(june.employeeSummaries[0].feesTotal).toBe(0);

    const july = buildPayrollClosureSnapshot(
      advance,
      new Date("2026-07-15T12:00:00-05:00"),
    );
    expect(july.providerReimbursement).toBe(100_000);
    expect(july.totalPayrollDeductions).toBe(100_000);
    expect(july.employeeSummaries[0].loanInstallmentsTotal).toBe(100_000);
    expect(july.employeeSummaries[0].installmentProgressLabel).toBe(
      "2 de 2 cuotas",
    );
    expect(july.employeeSummaries[0].principalTotal).toBe(200_000);
    expect(july.employeeSummaries[0].feesTotal).toBe(8_000);
    // No se “realizó” en julio: solo se cobra la cuota 2.
    expect(july.employeeSummaries[0].advancesCount).toBe(0);

    const august = buildPayrollClosureSnapshot(
      advance,
      new Date("2026-08-15T12:00:00-05:00"),
    );
    expect(august.employeeSummaries).toHaveLength(0);
    expect(august.providerReimbursement).toBe(0);
  });

  it("retenciones ignoran el adelanto rechazado (caso Melanny)", () => {
    const closure = buildPayrollClosureSnapshot(
      melannyCase,
      new Date("2026-07-14T15:00:00-05:00"),
    );

    expect(closure.employeeSummaries).toHaveLength(1);
    expect(closure.employeeSummaries[0].advancesCount).toBe(1);
    expect(closure.employeeSummaries[0].installments).toBe(1);
    expect(closure.employeeSummaries[0].advancesTotal).toBe(100_000);
    expect(closure.employeeSummaries[0].loanInstallmentsTotal).toBe(100_000);
    expect(closure.employeeSummaries[0].installmentProgressLabel).toBe(
      "1 de 1 cuota",
    );    expect(closure.totalPayrollDeductions).toBe(100_000);
    expect(closure.providerReimbursement).toBe(100_000);
  });

  it("marca cuotas mixtas cuando un empleado tiene planes distintos", () => {
    const mixed: RegisteredCompanyAdvance[] = [
      {
        ...sampleAdvances[0],
        id: "adv-a",
        employeeId: "emp-x",
        employeeName: "Carlos Mixed",
        employeeDocument: "999",
        installments: 1,
        advancedAmount: 200_000,
        requestedAt: "2026-06-10T10:00:00-05:00",
      },
      {
        ...sampleAdvances[1],
        id: "adv-b",
        employeeId: "emp-x",
        employeeName: "Carlos Mixed",
        employeeDocument: "999",
        installments: 2,
        advancedAmount: 400_000,
        requestedAt: "2026-06-12T10:00:00-05:00",
      },
    ];

    const closure = buildPayrollClosureSnapshot(
      mixed,
      new Date("2026-06-20T12:00:00-05:00"),
    );

    expect(closure.employeeSummaries).toHaveLength(1);
    expect(closure.employeeSummaries[0].advancesCount).toBe(2);
    expect(closure.employeeSummaries[0].installments).toBeNull();
    expect(closure.employeeSummaries[0].installmentValue).toBeNull();
  });

  it("descuenta cuotas liberadas por Super Admin y marca paz y salvo", () => {
    const paidAdvances: RegisteredCompanyAdvance[] = [
      {
        ...sampleAdvances[0],
        id: "adv-paid-1",
        employeeId: "emp-1",
        employeeName: "Jose Andres Vargas Soto",
        employeeDocument: "1090545465",
        installments: 1,
        advancedAmount: 300_000,
        requestedAt: "2026-08-10T10:00:00-05:00",
        isPaid: true,
        estadoApi: "pagado",
      },
      {
        ...sampleAdvances[0],
        id: "adv-paid-2",
        employeeId: "emp-2",
        employeeName: "Melanny Yilyan Guate Restrepo",
        employeeDocument: "1005026054",
        installments: 1,
        advancedAmount: 600_000,
        requestedAt: "2026-08-10T10:00:00-05:00",
        isPaid: true,
        estadoApi: "pagado",
      },
    ];

    const closure = buildPayrollClosureSnapshot(
      paidAdvances,
      new Date("2026-08-15T12:00:00-05:00"),
    );

    expect(closure.totalPayrollDeductions).toBe(900_000);
    expect(closure.totalPaid).toBe(900_000);
    expect(closure.totalPending).toBe(0);
    expect(closure.providerReimbursement).toBe(0);
    expect(closure.isAllSettled).toBe(true);
    expect(closure.employeeSummaries[0].isSettled).toBe(true);
    expect(closure.employeeSummaries[0].statusLabel).toBe("Saldado");
    expect(closure.employeeSummaries[1].isSettled).toBe(true);
    expect(closure.employeeSummaries[1].statusLabel).toBe("Saldado");
  });

  it("mantiene pendiente las cuotas de meses futuros en planes multi-cuota", () => {
    const multiMonthAdvances: RegisteredCompanyAdvance[] = [
      {
        ...sampleAdvances[0],
        id: "adv-multi-1",
        employeeId: "emp-1",
        employeeName: "Jose Andres Vargas Soto",
        employeeDocument: "1090545465",
        installments: 2,
        advancedAmount: 200_000,
        requestedAt: "2026-08-10T10:00:00-05:00",
        isPaid: true,
        estadoApi: "pagado",
      },
    ];

    // Agosto (mes de solicitud / cuota 1 liberada)
    const augustClosure = buildPayrollClosureSnapshot(
      multiMonthAdvances,
      new Date("2026-08-15T12:00:00-05:00"),
    );
    expect(augustClosure.totalPayrollDeductions).toBe(100_000);
    expect(augustClosure.totalPaid).toBe(100_000);
    expect(augustClosure.totalPending).toBe(0);
    expect(augustClosure.providerReimbursement).toBe(0);
    expect(augustClosure.isAllSettled).toBe(true);
    expect(augustClosure.employeeSummaries[0].statusLabel).toBe("Saldado");

    // Septiembre (mes siguiente / cuota 2 de 2 pendiente)
    const septemberClosure = buildPayrollClosureSnapshot(
      multiMonthAdvances,
      new Date("2026-09-15T12:00:00-05:00"),
    );
    expect(septemberClosure.totalPayrollDeductions).toBe(100_000);
    expect(septemberClosure.totalPaid).toBe(0);
    expect(septemberClosure.totalPending).toBe(100_000);
    expect(septemberClosure.providerReimbursement).toBe(100_000);
    expect(septemberClosure.isAllSettled).toBe(false);
    expect(septemberClosure.employeeSummaries[0].isSettled).toBe(false);
    expect(septemberClosure.employeeSummaries[0].statusLabel).toBe("Pendiente");
  });

  it("lista adelantos del empleado para el detalle del mes", () => {
    const detail = listPayrollClosureEmployeeAdvances(
      sampleAdvances,
      "456",
      new Date("2026-06-20T12:00:00-05:00"),
    );

    expect(detail).toHaveLength(1);
    expect(detail[0].employeeName).toBe("Luis Gómez");
    expect(detail[0].advancedAmount).toBe(900_000);
  });
});
