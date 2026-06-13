export function normalizeOcrText(text: string): string {
  return text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9<>\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countKeywordMatches(
  normalizedText: string,
  keywords: string[],
): string[] {
  return keywords.filter((keyword) => {
    const normalizedKeyword = normalizeOcrText(keyword);
    return normalizedText.includes(normalizedKeyword);
  });
}

export function hasSufficientOcrText(text: string): boolean {
  const cleaned = text.replace(/\s+/g, "");
  return cleaned.length >= 20;
}
