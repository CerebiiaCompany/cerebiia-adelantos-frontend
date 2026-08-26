import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileCheck,
  MessageSquare,
  Percent,
  Settings2,
  Trophy,
  UserCheck,
  UserCog,
  UserX,
  Wallet,
  XCircle,
  Zap,
  Bell,
} from "lucide-react";
import type { NotificacionDTO } from "@/shared/api/types/notificacion";
import { formatRelative } from "@/shared/lib/dates";
import { normalizeNotificationHref } from "./normalizeNotificationHref";
import type { AppNotification } from "./types";

const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  advance_requested: Zap,
  advance_approved: CheckCircle2,
  advance_paid: Zap,
  advance_rejected: XCircle,
  payment_evidence: FileCheck,
  payroll_due_3d: Calendar,
  next_payment_net_updated: Wallet,
  cupo_80: AlertTriangle,
  cupo_low: AlertTriangle,
  cupo_exhausted: AlertTriangle,
  achievement_unlocked: Trophy,
  data_change_audit: UserCog,
  support_replied: MessageSquare,
  config_fee_updated: Settings2,
  config_advance_percent_updated: Percent,
  config_min_amount_updated: Settings2,
  config_installments_updated: Calendar,
  config_custom_updated: Settings2,
  employee_activated: UserCheck,
  employee_suspended: UserX,
  employer_advance_requested: Zap,
  employer_advance_approved: CheckCircle2,
  employer_advance_rejected: XCircle,
  employer_support_message: MessageSquare,
  provider_week_debt: Wallet,
  cuota_liberada: Wallet,
  cuotas_liberadas: Wallet,
  saldo_liberado: Wallet,
  employer_cuota_liberada: Wallet,
  employer_cuotas_liberadas: Wallet,
};

function enrichNotificationDescription(description: string, kind: string): string {
  if (!description) return "";

  if (kind === "advance_approved") {
    if (!description.includes("24 horas")) {
      const clean = description.trim().replace(/\.$/, "");
      return `${clean}. La transferencia se realizará en un tiempo máximo de 24 horas.`;
    }
  }

  if (kind === "advance_paid") {
    if (!description.includes("evidencia") && !description.includes("Mis adelantos")) {
      const match = description.match(/\$[\d.,]+/);
      const montoPart = match ? ` de ${match[0]}` : "";
      return `Se ha realizado el pago de tu adelanto${montoPart}. Revisa la evidencia en el módulo Mis adelantos.`;
    }
  }

  if (
    kind === "employer_cuota_liberada" ||
    kind === "employer_cuotas_liberadas"
  ) {
    if (
      !description.toLowerCase().includes("correspondiente") &&
      !description.toLowerCase().includes("mes de")
    ) {
      const currentMonth = new Date().toLocaleDateString("es-CO", {
        month: "long",
        year: "numeric",
      });
      const mesCapitalizado =
        currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);
      const clean = description.trim().replace(/\.$/, "");
      return `${clean} correspondiente a ${mesCapitalizado}.`;
    }
  }

  return description;
}

export function mapNotificacionDtoToApp(
  notification: NotificacionDTO,
): AppNotification {
  return {
    id: notification.id,
    kind: notification.kind,
    icon: NOTIFICATION_ICONS[notification.kind] ?? Bell,
    title: notification.title,
    description: enrichNotificationDescription(
      notification.description,
      notification.kind,
    ),
    time: formatRelative(notification.created_at),
    read: notification.leida,
    href: normalizeNotificationHref(notification.href, notification.kind),
  };
}

export function mapNotificacionDtosToApp(
  notifications: NotificacionDTO[],
): AppNotification[] {
  return notifications.map(mapNotificacionDtoToApp);
}
