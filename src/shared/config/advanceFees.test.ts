import { describe, expect, it } from "vitest";
import {
  ADVANCE_TRANSACTION_FEE_AMOUNT,
  calculateAdvanceTransactionFee,
  formatAdvanceTransactionFeeLabel,
} from "./advanceFees";

describe("advanceFees", () => {
  it("aplica comisión fija de $8.000 por adelanto", () => {
    expect(ADVANCE_TRANSACTION_FEE_AMOUNT).toBe(8_000);
    expect(calculateAdvanceTransactionFee(500_000)).toBe(8_000);
    expect(calculateAdvanceTransactionFee(1_000_000)).toBe(8_000);
    expect(calculateAdvanceTransactionFee(0)).toBe(0);
  });

  it("formatea la etiqueta de comisión fija", () => {
    expect(formatAdvanceTransactionFeeLabel()).toContain("8.000");
    expect(formatAdvanceTransactionFeeLabel()).toContain("Comisión fija");
  });
});
