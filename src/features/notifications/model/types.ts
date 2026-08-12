import type { LucideIcon } from "lucide-react";
import type { NotificationKind } from "@/entities/notification";

export interface AppNotification {
  id: string;
  kind: NotificationKind | string;
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  read: boolean;
  href?: string;
}
