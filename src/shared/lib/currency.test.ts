import { formatSalaryInput, normalizeSalaryInput } from "./currency";

describe("salary input formatting", () => {
  it("normaliza separadores es-CO y en-US", () => {
    expect(normalizeSalaryInput("1.500.000")).toBe("1500000");
    expect(normalizeSalaryInput("1.500.000,50")).toBe("1500000.50");
    expect(normalizeSalaryInput("1,500,000.00")).toBe("1500000.00");
    expect(normalizeSalaryInput("2,000,000")).toBe("2000000");
    expect(normalizeSalaryInput("2.000.000")).toBe("2000000");
    expect(normalizeSalaryInput("3,200,000")).toBe("3200000");
    expect(normalizeSalaryInput("2,000")).toBe("2000");
    expect(normalizeSalaryInput("1500,50")).toBe("1500.50");
    expect(normalizeSalaryInput("1500.50")).toBe("1500.50");
  });

  it("formatea miles y millones para visualización", () => {
    expect(formatSalaryInput("1500000")).toBe("1.500.000");
    expect(formatSalaryInput("1500000.50")).toBe("1.500.000,50");
    expect(formatSalaryInput("25000000")).toBe("25.000.000");
  });

  it("mantiene coherencia al normalizar un valor ya formateado", () => {
    const formatted = formatSalaryInput("3500000");
    expect(normalizeSalaryInput(formatted)).toBe("3500000");
    expect(normalizeSalaryInput(formatSalaryInput("2000000"))).toBe("2000000");
  });
});
