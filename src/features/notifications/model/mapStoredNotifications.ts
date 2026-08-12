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
  achievement_unlocked: Trophy,
  data_change_audit: UserCog,
  support_replied: MessageSquare,
  config_fee_updated: Settings2,
  config_advance_percent_updated: Percent,
  config_min_amount_updated: Settings2,
  employee_activated: UserCheck,
  employee_suspended: UserX,
  employer_advance_requested: Zap,
  employer_advance_approved: CheckCircle2,
  employer_advance_rejected: XCircle,
  employer_support_message: MessageSquare,
  provider_week_debt: Wallet,
};

export function mapNotificacionDtoToApp(
  notification: NotificacionDTO,
): AppNotification {
  return {
    id: notification.id,
    kind: notification.kind,
    icon: NOTIFICATION_ICONS[notification.kind] ?? Bell,
    title: notification.title,
    description: notification.description,
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
