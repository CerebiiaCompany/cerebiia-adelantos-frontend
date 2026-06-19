import { describe, expect, it } from "vitest";
import { createEmpleadoSchema } from "./empleado.schema";

describe("createEmpleadoSchema", () => {
  it("acepta un empleado válido", () => {
    const result = createEmpleadoSchema.safeParse({
      documento: " 12345678 ",
      nombre: " Juan Pérez ",
      salario: "1,500,000.00",
      banco: "Bancolombia",
      numero_cuenta: "123456789",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.documento).toBe("12345678");
      expect(result.data.nombre).toBe("Juan Pérez");
      expect(result.data.salario).toBe("1500000.00");
    }
  });

  it("rechaza documentos fuera del rango 6-12 dígitos", () => {
    const short = createEmpleadoSchema.safeParse({
      documento: "12345",
      nombre: "Juan Pérez",
      salario: "1500000",
      banco: "Bancolombia",
      numero_cuenta: "123456789",
    });
    const long = createEmpleadoSchema.safeParse({
      documento: "1234567890123",
      nombre: "Juan Pérez",
      salario: "1500000",
      banco: "Bancolombia",
      numero_cuenta: "123456789",
    });

    expect(short.success).toBe(false);
    expect(long.success).toBe(false);
  });

  it("rechaza salarios con más de 12 dígitos o decimales inválidos", () => {
    const tooManyDigits = createEmpleadoSchema.safeParse({
      documento: "12345678",
      nombre: "Juan Pérez",
      salario: "1234567890123.00",
      banco: "Bancolombia",
      numero_cuenta: "123456789",
    });
    const invalidDecimals = createEmpleadoSchema.safeParse({
      documento: "12345678",
      nombre: "Juan Pérez",
      salario: "1500000.123",
      banco: "Bancolombia",
      numero_cuenta: "123456789",
    });

    expect(tooManyDigits.success).toBe(false);
    expect(invalidDecimals.success).toBe(false);
  });
});
