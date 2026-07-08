import { describe, expect, it } from "vitest";
import { normalizeBancosList } from "./bancosMappers";

describe("normalizeBancosList", () => {
  const banco = {
    id: "b1",
    nombre: "Bancolombia",
    codigo: "007",
  };

  it("acepta array plano", () => {
    expect(normalizeBancosList([banco])).toEqual([banco]);
  });

  it("acepta respuesta paginada", () => {
    expect(
      normalizeBancosList({
        count: 1,
        page: 1,
        page_size: 20,
        next: null,
        previous: null,
        results: [banco],
      }),
    ).toEqual([banco]);
  });

  it("filtra entradas inválidas", () => {
    expect(
      normalizeBancosList([banco, { id: "x", codigo: "1" }, null]),
    ).toEqual([banco]);
  });
});
