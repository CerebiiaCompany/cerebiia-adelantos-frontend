import { describe, expect, it } from "vitest";
import { createEmpleadoSchema, isCreateEmpleadoStep1Complete } from "./empleado.schema";

const validPayload = {
  tipo_documento: "CC",
  documento: " 12345678 ",
  nombre: " Juan Pérez ",
  correo: " Juan.Perez@Correo.COM ",
  celular: "300 123 4567",
  salario: "1,500,000.00",
  tipo_contrato: "indefinido",
  fecha_ingreso: "2024-06-15",
  banco_id: "550e8400-e29b-41d4-a716-446655440000",
  tipo_cuenta: "ahorros",
  numero_cuenta: "123456789",
} as const;

describe("createEmpleadoSchema", () => {
  it("acepta un empleado válido con los nuevos campos", () => {
    const result = createEmpleadoSchema.safeParse(validPayload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.documento).toBe("12345678");
      expect(result.data.nombre).toBe("Juan Pérez");
      expect(result.data.correo).toBe("juan.perez@correo.com");
      expect(result.data.celular).toBe("3001234567");
      expect(result.data.salario).toBe("1500000.00");
      expect(result.data.tipo_contrato).toBe("indefinido");
      expect(result.data.tipo_cuenta).toBe("ahorros");
    }
  });

  it("rechaza documentos inválidos según el tipo seleccionado", () => {
    const invalidCc = createEmpleadoSchema.safeParse({
      ...validPayload,
      tipo_documento: "CC",
      documento: "12345",
    });
    const invalidBanco = createEmpleadoSchema.safeParse({
      ...validPayload,
      banco_id: "",
    });

    expect(invalidCc.success).toBe(false);
    expect(invalidBanco.success).toBe(false);
  });

  it("rechaza correo o celular inválidos", () => {
    const invalidEmail = createEmpleadoSchema.safeParse({
      ...validPayload,
      correo: "correo-invalido",
    });
    const invalidPhone = createEmpleadoSchema.safeParse({
      ...validPayload,
      celular: "2001234567",
    });

    expect(invalidEmail.success).toBe(false);
    expect(invalidPhone.success).toBe(false);
  });

  it("rechaza salarios con más de 12 dígitos y trunca decimales a 2", () => {
    const tooManyDigits = createEmpleadoSchema.safeParse({
      ...validPayload,
      salario: "1234567890123.00",
    });
    const truncatedDecimals = createEmpleadoSchema.safeParse({
      ...validPayload,
      salario: "1.500.000,123",
    });

    expect(tooManyDigits.success).toBe(false);
    expect(truncatedDecimals.success).toBe(true);
    if (truncatedDecimals.success) {
      expect(truncatedDecimals.data.salario).toBe("1500000.12");
    }
  });

  it("detecta cuando el paso 1 está incompleto o completo", () => {
    expect(isCreateEmpleadoStep1Complete({})).toBe(false);
    expect(
      isCreateEmpleadoStep1Complete({
        tipo_documento: "CC",
        documento: "12345678",
        nombre: "Juan Pérez",
        correo: "juan@correo.com",
        celular: "3001234567",
      }),
    ).toBe(true);
  });

  it("rechaza fechas de ingreso futuras", () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const future = futureDate.toISOString().split("T")[0];

    const result = createEmpleadoSchema.safeParse({
      ...validPayload,
      fecha_ingreso: future,
    });

    expect(result.success).toBe(false);
  });
});
