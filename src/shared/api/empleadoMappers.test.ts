import { describe, expect, it } from "vitest";
import {
  mapEmpleadoDtoToFormValues,
  mapTipoDocumentoFromApi,
  mapTipoDocumentoToApi,
} from "./empleadoMappers";
import type { EmpleadoDTO } from "./types/empleado";

describe("empleadoMappers", () => {
  it("mapea tipos de documento del formulario al backend", () => {
    expect(mapTipoDocumentoToApi("CC")).toBe("cc");
    expect(mapTipoDocumentoToApi("PASSPORT")).toBe("pas");
    expect(mapTipoDocumentoToApi("CE")).toBe("ce");
  });

  it("mapea tipos de documento del backend al formulario", () => {
    expect(mapTipoDocumentoFromApi("cc")).toBe("CC");
    expect(mapTipoDocumentoFromApi("pas")).toBe("PASSPORT");
    expect(mapTipoDocumentoFromApi("ce")).toBe("CE");
  });

  it("mapea EmpleadoDTO a valores del formulario de edición", () => {
    const empleado = {
      id: "emp-1",
      documento: "12345678",
      nombre: "Juan Pérez",
      salario: "1500000.00",
      banco_id: "banco-1",
      banco_nombre: "Bancolombia",
      numero_cuenta: "1234567890",
      tipo_documento: "cc",
      email_empleado: "juan@empresa.com",
      celular: "3001234567",
      tipo_contrato: "indefinido",
      fecha_ingreso: "2024-01-15",
      tipo_cuenta: "ahorros",
      estado: "activo",
      empresa_id: "empresa-1",
      created_at: "2024-01-15T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z",
    } satisfies EmpleadoDTO;

    expect(mapEmpleadoDtoToFormValues(empleado)).toEqual({
      tipo_documento: "CC",
      documento: "12345678",
      nombre: "Juan Pérez",
      correo: "juan@empresa.com",
      celular: "3001234567",
      salario: "1500000.00",
      tipo_contrato: "indefinido",
      fecha_ingreso: "2024-01-15",
      banco_id: "banco-1",
      tipo_cuenta: "ahorros",
      numero_cuenta: "1234567890",
    });
  });
});
