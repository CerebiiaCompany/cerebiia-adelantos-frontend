// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) return "Ahora";
  if (minutes < 60) {
    return minutes === 1 ? "Hace 1 minuto" : `Hace ${minutes} minutos`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? "Hace 1 hora" : `Hace ${hours} horas`;
  }

  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;

  return formatDate(iso);
}
