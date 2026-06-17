import type { LucideIcon } from "lucide-react";
import {
  Bell,
  History,
  LayoutDashboard,
  LineChart,
  Sparkles,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";

export type SidebarIconAnimation =
  | "dashboard"
  | "zap"
  | "history"
  | "wallet"
  | "chart"
  | "sparkle"
  | "trophy"
  | "bell";

export interface SidebarNavItemConfig {
  title: string;
  url: string;
  icon: LucideIcon;
  animation: SidebarIconAnimation;
  end?: boolean;
  tooltip?: string;
}

export const SIDEBAR_MAIN_ITEMS: SidebarNavItemConfig[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    animation: "dashboard",
    end: true,
  },
  { title: "Adelanto", url: "/adelanto", icon: Zap, animation: "zap" },
  {
    title: "Mis adelantos",
    url: "/mis-adelantos",
    icon: History,
    animation: "history",
  },
  { title: "Wallet", url: "/wallet", icon: Wallet, animation: "wallet" },
  { title: "Control", url: "/control", icon: LineChart, animation: "chart" },
  {
    title: "Asistente",
    url: "/asistente",
    icon: Sparkles,
    animation: "sparkle",
  },
  { title: "Logros", url: "/logros", icon: Trophy, animation: "trophy", tooltip: "Nuevos retos y misiones semanales para impulsar tu progreso." },
  {
    title: "Notificaciones",
    url: "/notificaciones",
    icon: Bell,
    animation: "bell",
  },
];
