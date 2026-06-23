import { describe, expect, it } from "vitest";
import {
  formatFechaIngreso,
  formatTipoContrato,
  formatTipoCuenta,
  formatTipoDocumento,
} from "./empleadoDisplayLabels";

describe("empleadoDisplayLabels", () => {
  it("formatea tipos de documento del backend", () => {
    expect(formatTipoDocumento("cc")).toBe("CC");
    expect(formatTipoDocumento("pas")).toBe("Pasaporte");
  });

  it("formatea tipo de cuenta y contrato", () => {
    expect(formatTipoCuenta("ahorros")).toBe("Ahorros");
    expect(formatTipoContrato("indefinido")).toBe("Término Indefinido");
  });

  it("formatea fecha de ingreso", () => {
    expect(formatFechaIngreso("2024-06-15")).toMatch(/2024/);
  });
});
