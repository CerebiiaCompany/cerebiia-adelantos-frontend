const NUMERIC_SEQUENCE_PATTERN = /[\d\s.,\-/|OoIlLBZS]{6,}/g;

const OCR_DIGIT_REPLACEMENTS: Array<[RegExp, string]> = [
  [/O/g, "0"],
  [/Q/g, "0"],
  [/I/g, "1"],
  [/L/g, "1"],
  [/\|/g, "1"],
  [/S/g, "5"],
  [/B/g, "8"],
  [/Z/g, "2"],
];

export function extractDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function correctNumericSequences(value: string): string {
  return value.replace(NUMERIC_SEQUENCE_PATTERN, (segment) => {
    let corrected = segment.toUpperCase();

    for (const [pattern, replacement] of OCR_DIGIT_REPLACEMENTS) {
      corrected = corrected.replace(pattern, replacement);
    }

    return corrected;
  });
}

export function normalizeOcrDigits(value: string): string {
  return extractDigits(correctNumericSequences(value));
}

function digitsMatchWithTolerance(
  expectedDigits: string,
  ocrDigits: string,
): boolean {
  if (!expectedDigits || !ocrDigits) {
    return false;
  }

  if (ocrDigits.includes(expectedDigits)) {
    return true;
  }

  const withoutLeadingZeros = expectedDigits.replace(/^0+/, "");
  if (
    withoutLeadingZeros.length >= 6 &&
    ocrDigits.includes(withoutLeadingZeros)
  ) {
    return true;
  }

  if (expectedDigits.length >= 8) {
    const suffix = expectedDigits.slice(-8);
    if (ocrDigits.includes(suffix)) {
      return true;
    }
  }

  return false;
}

export function isDocumentNumberInOcrText(
  ocrText: string,
  expectedDocumentNumber: string,
): boolean {
  const expectedDigits = extractDigits(expectedDocumentNumber);
  if (!expectedDigits) {
    return false;
  }

  const candidates = [
    normalizeOcrDigits(ocrText),
    extractDigits(ocrText),
  ];

  return candidates.some((candidate) =>
    digitsMatchWithTolerance(expectedDigits, candidate),
  );
}
