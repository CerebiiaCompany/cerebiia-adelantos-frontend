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
import type { AppModuleId } from "@/shared/config/moduleAccess";
import { ROUTES } from "@/shared/config/routes";

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
  moduleId: AppModuleId;
}

/** Módulos visibles para rol empleado */
export const EMPLOYEE_SIDEBAR_ITEMS: SidebarNavItemConfig[] = [
  {
    title: "Dashboard",
    url: ROUTES.employee.dashboard,
    icon: LayoutDashboard,
    animation: "dashboard",
    end: true,
    moduleId: "employee.dashboard",
  },
  {
    title: "Adelanto",
    url: ROUTES.employee.adelanto,
    icon: Zap,
    animation: "zap",
    moduleId: "employee.adelanto",
  },
  {
    title: "Mis adelantos",
    url: ROUTES.employee.misAdelantos,
    icon: History,
    animation: "history",
    moduleId: "employee.misAdelantos",
  },
  {
    title: "Wallet",
    url: ROUTES.employee.wallet,
    icon: Wallet,
    animation: "wallet",
    moduleId: "employee.wallet",
  },
  {
    title: "Control",
    url: ROUTES.employee.control,
    icon: LineChart,
    animation: "chart",
    moduleId: "employee.control",
  },
  {
    title: "Asistente",
    url: ROUTES.employee.asistente,
    icon: Sparkles,
    animation: "sparkle",
    moduleId: "employee.asistente",
  },
  {
    title: "Logros",
    url: ROUTES.employee.logros,
    icon: Trophy,
    animation: "trophy",
    tooltip:
      "Nuevos retos y misiones semanales para impulsar tu progreso.",
    moduleId: "employee.logros",
  },
  {
    title: "Notificaciones",
    url: ROUTES.employee.notificaciones,
    icon: Bell,
    animation: "bell",
    moduleId: "employee.notificaciones",
  },
];

/** @deprecated Use EMPLOYEE_SIDEBAR_ITEMS */
export const SIDEBAR_MAIN_ITEMS = EMPLOYEE_SIDEBAR_ITEMS;
