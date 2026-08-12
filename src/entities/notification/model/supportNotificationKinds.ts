import type { NotificationKind } from "./types";

/** Kinds que disparan sonido de mensaje (empleado + empresa). */
export const SUPPORT_NOTIFICATION_KINDS = [
  "support_replied",
  "employer_support_message",
] as const satisfies readonly NotificationKind[];

export function isSupportNotificationKind(kind: string): boolean {
  return (SUPPORT_NOTIFICATION_KINDS as readonly string[]).includes(kind);
}
