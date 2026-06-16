const UNITS = [
  "",
  "uno",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
  "nueve",
  "diez",
  "once",
  "doce",
  "trece",
  "catorce",
  "quince",
  "dieciséis",
  "diecisiete",
  "dieciocho",
  "diecinueve",
] as const;

const TENS = [
  "",
  "",
  "veinte",
  "treinta",
  "cuarenta",
  "cincuenta",
  "sesenta",
  "setenta",
  "ochenta",
  "noventa",
] as const;

const HUNDREDS = [
  "",
  "ciento",
  "doscientos",
  "trescientos",
  "cuatrocientos",
  "quinientos",
  "seiscientos",
  "setecientos",
  "ochocientos",
  "novecientos",
] as const;

function chunkToWords(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cien";

  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];

  if (hundred > 0) {
    parts.push(HUNDREDS[hundred] ?? "");
  }

  if (rest > 0) {
    if (rest < 20) {
      parts.push(UNITS[rest] ?? "");
    } else if (rest < 30) {
      parts.push(rest === 20 ? "veinte" : `veinti${UNITS[rest - 20]}`);
    } else {
      const ten = Math.floor(rest / 10);
      const unit = rest % 10;
      parts.push(
        unit === 0
          ? (TENS[ten] ?? "")
          : `${TENS[ten]} y ${UNITS[unit]}`,
      );
    }
  }

  return parts.filter(Boolean).join(" ");
}

function integerToWords(n: number): string {
  if (n === 0) return "cero";

  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const remainder = n % 1_000;
  const parts: string[] = [];

  if (millions > 0) {
    parts.push(
      millions === 1 ? "un millón" : `${integerToWords(millions)} millones`,
    );
  }

  if (thousands > 0) {
    parts.push(
      thousands === 1 ? "mil" : `${chunkToWords(thousands)} mil`,
    );
  }

  if (remainder > 0) {
    parts.push(chunkToWords(remainder));
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/** Convierte un monto entero en pesos colombianos a palabras (es-CO). */
export function amountInWordsSpanish(amount: number): string {
  const value = Math.max(0, Math.round(amount));
  const words = integerToWords(value);
  const currency = value === 1 ? "peso colombiano" : "pesos colombianos";
  return `${words} ${currency}`;
}
