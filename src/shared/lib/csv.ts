// ⚠️ AGNOSTIC — CSV export utility

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  if (text.includes('"') || text.includes(",") || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildCsvContent(rows: (string | number)[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

export function downloadCsvFile(
  filename: string,
  rows: (string | number)[][],
): void {
  if (typeof document === "undefined") return;

  const content = buildCsvContent(rows);
  const blob = new Blob([`\uFEFF${content}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
