import type { LucideIcon } from "lucide-react";
import {
  Bell,
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
  { title: "Wallet", url: "/wallet", icon: Wallet, animation: "wallet" },
  { title: "Control", url: "/control", icon: LineChart, animation: "chart" },
  {
    title: "Asistente",
    url: "/asistente",
    icon: Sparkles,
    animation: "sparkle",
  },
  { title: "Logros", url: "/logros", icon: Trophy, animation: "trophy" },
];

export const SIDEBAR_SECONDARY_ITEMS: SidebarNavItemConfig[] = [
  {
    title: "Notificaciones",
    url: "/notificaciones",
    icon: Bell,
    animation: "bell",
  },
];
