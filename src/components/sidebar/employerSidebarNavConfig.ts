import type { SidebarNavItemConfig } from "./sidebarNavConfig";
import {
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  LayoutDashboard,
  Receipt,
  Users,
} from "lucide-react";
import { ROUTES } from "@/shared/config/routes";

/** Módulos visibles para rol empresa: auditoría, control y transparencia */
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
  {
    title: "Monitoreo adelantos",
    url: ROUTES.employer.monitoreoAdelantos,
    icon: ClipboardCheck,
    animation: "control",
    moduleId: "employer.monitoreoAdelantos",
  },
  {
    title: "Seguimiento cuotas",
    url: ROUTES.employer.seguimientoCuotas,
    icon: CalendarClock,
    animation: "wallet",
    moduleId: "employer.seguimientoCuotas",
  },
  {
    title: "Historial movimientos",
    url: ROUTES.employer.historialMovimientos,
    icon: BookOpen,
    animation: "control",
    moduleId: "employer.historialMovimientos",
  },
  {
    title: "Retenciones y cierres",
    url: ROUTES.employer.retencionesCierres,
    icon: Receipt,
    animation: "dashboard",
    moduleId: "employer.retencionesCierres",
  },
];
