import { describe, expect, it } from "vitest";
import {
  buildExcelListRange,
  toExcelColumnLetter,
} from "./empleadoImportExcelValidation";

describe("empleadoImportExcelValidation", () => {
  it("convierte índice de columna a letra Excel", () => {
    expect(toExcelColumnLetter(1)).toBe("A");
    expect(toExcelColumnLetter(4)).toBe("D");
    expect(toExcelColumnLetter(11)).toBe("K");
  });

  it("construye rango con nombre de hoja escapado", () => {
    expect(buildExcelListRange("Listas", 1, 3)).toBe("'Listas'!$A$1:$A$3");
  });
});
