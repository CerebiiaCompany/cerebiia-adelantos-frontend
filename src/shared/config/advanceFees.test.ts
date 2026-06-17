import { describe, expect, it } from "vitest";
import {
  ADVANCE_TRANSACTION_FEE_RATE,
  calculateAdvanceTransactionFee,
  formatAdvanceTransactionFeeRate,
} from "./advanceFees";

describe("advanceFees", () => {
  it("calcula la comisión al 2.5%", () => {
    expect(calculateAdvanceTransactionFee(500_000)).toBe(12_500);
    expect(calculateAdvanceTransactionFee(1_000_000)).toBe(25_000);
  });

  it("formatea el porcentaje de comisión", () => {
    expect(formatAdvanceTransactionFeeRate()).toBe("2.5%");
    expect(formatAdvanceTransactionFeeRate(ADVANCE_TRANSACTION_FEE_RATE)).toBe(
      "2.5%",
    );
  });
});
