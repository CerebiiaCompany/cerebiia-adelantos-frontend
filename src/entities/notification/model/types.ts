// ⚠️ AGNOSTIC — employee notification records (provisional hasta API)

export type NotificationKind = "advance_requested";

export interface StoredNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  createdAt: string;
}

export function buildAdvanceRequestedNotification(
  amount: number,
  createdAt: string = new Date().toISOString(),
): StoredNotification {
  const formattedAmount = `$${amount.toLocaleString("es-CO")}`;

  return {
    id: `advance-${new Date(createdAt).getTime()}`,
    kind: "advance_requested",
    title: "Adelanto solicitado",
    description: `Tu adelanto de ${formattedAmount} fue registrado y está en proceso.`,
    createdAt,
  };
}
