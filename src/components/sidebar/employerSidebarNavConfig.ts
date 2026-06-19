import type { SidebarNavItemConfig } from "./sidebarNavConfig";
import { LayoutDashboard, Users } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";

/** Módulos visibles para rol empresa: Dashboard + Mis empleados */
export const EMPLOYER_SIDEBAR_ITEMS: SidebarNavItemConfig[] = [
  {
    title: "Dashboard",
    url: ROUTES.employer.panel,
    icon: LayoutDashboard,
    animation: "dashboard",
    end: true,
    moduleId: "employer.dashboard",
  },
  {
    title: "Mis empleados",
    url: ROUTES.employer.misEmpleados,
    icon: Users,
    animation: "wallet",
    moduleId: "employer.misEmpleados",
  },
];
