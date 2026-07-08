import { describe, expect, it, vi } from "vitest";
import {
  buildEmpleadosListPath,
  extractPaginatedResults,
  fetchAllEmpleadosPages,
} from "./empleadoList";
import type { EmpleadoDTO } from "./types/empleado";

const empleadoFixture: EmpleadoDTO = {
  id: "emp-1",
  documento: "123",
  nombre: "Juan",
  salario: "1000000.00",
  banco_id: "b1",
  banco_nombre: "Bancolombia",
  numero_cuenta: "123",
  tipo_documento: "cc",
  email_empleado: "juan@test.com",
  celular: "300",
  tipo_contrato: "indefinido",
  fecha_ingreso: "2024-01-01",
  tipo_cuenta: "ahorros",
  estado: "activo",
  empresa_id: "empresa-1",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("empleadoList", () => {
  it("construye query params para listar empleados", () => {
    expect(buildEmpleadosListPath()).toBe("/empleados/");
    expect(buildEmpleadosListPath({ estado: "activo", page: 2 })).toBe(
      "/empleados/?estado=activo&page=2",
    );
  });

  it("extrae results de respuesta paginada", () => {
    expect(
      extractPaginatedResults({
        count: 1,
        page: 1,
        page_size: 20,
        next: null,
        previous: null,
        results: [empleadoFixture],
      }),
    ).toEqual([empleadoFixture]);
  });

  it("devuelve array vacío si la respuesta no es lista ni paginada", () => {
    expect(extractPaginatedResults(null)).toEqual([]);
    expect(extractPaginatedResults({ count: 0 })).toEqual([]);
  });

  it("recorre todas las páginas al cargar empleados", async () => {
    const listPage = vi
      .fn()
      .mockResolvedValueOnce({
        count: 2,
        page: 1,
        page_size: 100,
        next: 2,
        previous: null,
        results: [{ ...empleadoFixture, id: "emp-1" }],
      })
      .mockResolvedValueOnce({
        count: 2,
        page: 2,
        page_size: 100,
        next: null,
        previous: 1,
        results: [{ ...empleadoFixture, id: "emp-2" }],
      });

    const empleados = await fetchAllEmpleadosPages(listPage);
    expect(empleados).toHaveLength(2);
    expect(listPage).toHaveBeenCalledTimes(2);
  });
});
