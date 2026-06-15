import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  Zap,
} from "lucide-react";

export interface DemoNotification {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    id: "advance-processed",
    icon: Zap,
    title: "Adelanto procesado",
    description: "Tu adelanto de $500.000 fue transferido exitosamente.",
    time: "Hace 2 horas",
    read: false,
  },
  {
    id: "next-payroll",
    icon: Calendar,
    title: "Próximo pago",
    description: "Tu nómina de $4.800.000 se depositará el 15 de abril.",
    time: "Hace 1 día",
    read: false,
  },
  {
    id: "limit-updated",
    icon: AlertTriangle,
    title: "Límite actualizado",
    description:
      "Tu límite dinámico aumentó a $2.400.000 basado en tu historial.",
    time: "Hace 3 días",
    read: true,
  },
  {
    id: "achievement-unlocked",
    icon: CheckCircle2,
    title: "Logro desbloqueado",
    description: "¡Felicidades! Obtuviste 'Control total' (+500 pts).",
    time: "Hace 5 días",
    read: true,
  },
  {
    id: "budget-reminder",
    icon: Bell,
    title: "Recordatorio",
    description: "Recuerda revisar tu presupuesto mensual en el asistente.",
    time: "Hace 1 semana",
    read: true,
  },
];

export function getUnreadNotifications(
  notifications: DemoNotification[] = DEMO_NOTIFICATIONS,
) {
  return notifications.filter((notification) => !notification.read);
}
