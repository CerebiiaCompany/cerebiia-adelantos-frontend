import {
  formatChartAxisMoney,
  formatSalaryInput,
  normalizeSalaryInput,
} from "./currency";

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

describe("formatChartAxisMoney (UX-06: escala de eje sin marcas repetidas)", () => {
  it("muestra $0 para valor cero", () => {
    expect(formatChartAxisMoney(0)).toBe("$0");
  });

  it("formatea en miles (K) montos inferiores a 1 millón evitando repetición de $0.1M", () => {
    expect(formatChartAxisMoney(25_000)).toBe("$25K");
    expect(formatChartAxisMoney(50_000)).toBe("$50K");
    expect(formatChartAxisMoney(75_000)).toBe("$75K");
    expect(formatChartAxisMoney(100_000)).toBe("$100K");
    expect(formatChartAxisMoney(120_000)).toBe("$120K");
    expect(formatChartAxisMoney(500_000)).toBe("$500K");
    expect(formatChartAxisMoney(900_000)).toBe("$900K");
  });

  it("formatea en millones (M) montos de 1 millón o más de forma compacta", () => {
    expect(formatChartAxisMoney(1_000_000)).toBe("$1M");
    expect(formatChartAxisMoney(1_200_000)).toBe("$1.2M");
    expect(formatChartAxisMoney(1_250_000)).toBe("$1.25M");
    expect(formatChartAxisMoney(1_500_000)).toBe("$1.5M");
    expect(formatChartAxisMoney(1_800_000)).toBe("$1.8M");
    expect(formatChartAxisMoney(2_000_000)).toBe("$2M");
  });

  it("garantiza etiquetas únicas en secuencias típicas de ticks de Recharts", () => {
    const ticksSmallDomain = [0, 25_000, 50_000, 75_000, 100_000];
    const labelsSmall = ticksSmallDomain.map(formatChartAxisMoney);
    expect(labelsSmall).toEqual(["$0", "$25K", "$50K", "$75K", "$100K"]);
    expect(new Set(labelsSmall).size).toBe(labelsSmall.length);

    const ticksMediumDomain = [0, 450_000, 900_000, 1_350_000, 1_800_000];
    const labelsMedium = ticksMediumDomain.map(formatChartAxisMoney);
    expect(labelsMedium).toEqual(["$0", "$450K", "$900K", "$1.35M", "$1.8M"]);
    expect(new Set(labelsMedium).size).toBe(labelsMedium.length);
  });
});
