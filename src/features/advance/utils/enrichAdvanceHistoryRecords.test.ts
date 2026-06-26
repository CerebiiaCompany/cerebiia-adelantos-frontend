import { describe, expect, it } from "vitest";
import {
  enrichAdvanceHistoryRecords,
  formatAdvanceInstallmentsLabel,
} from "./enrichAdvanceHistoryRecords";
import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory.types";

const baseRecord: AdvanceHistoryRecord = {
  id: "adv-1",
  amount: 500_000,
  netAmount: 492_000,
  requestedAt: new Date("2026-06-10T10:00:00"),
  periodLabel: "junio 2026",
  status: "en_curso",
  transactionFeeAmount: 8_000,
  folio: "ADV-1",
  receiptStatus: "en_curso",
  paymentMethod: "Transferencia bancaria",
  installments: 2,
  bankName: "—",
  accountTypeLabel: "—",
  accountNumber: "—",
};

describe("enrichAdvanceHistoryRecords", () => {
  it("completa datos bancarios desde /empleados/me/", () => {
    const [record] = enrichAdvanceHistoryRecords(
      [baseRecord],
      {
        empleado_id: "1",
        nombre: "Ana",
        salario: "1500000.00",
        empresa_id: "emp-1",
        porcentaje_maximo_adelanto: "30.00",
        monto_maximo_adelanto: "450000.00",
        documento: "123",
        banco_nombre: "Nequi",
        numero_cuenta: "3001234567",
        tipo_cuenta: "ahorros",
        fecha_ingreso: "2024-06-01",
      },
      null,
    );

    expect(record.installments).toBe(2);
    expect(record.bankName).toBe("Nequi");
    expect(record.accountTypeLabel).toBe("Ahorros");
    expect(record.accountNumber).toBe("3001234567");
  });
});

describe("formatAdvanceInstallmentsLabel", () => {
  it("formatea singular y plural", () => {
    expect(formatAdvanceInstallmentsLabel(1)).toBe("1 cuota");
    expect(formatAdvanceInstallmentsLabel(3)).toBe("3 cuotas");
  });
});
