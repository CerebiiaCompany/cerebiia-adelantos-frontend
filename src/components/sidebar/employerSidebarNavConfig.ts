import type { SidebarNavItemConfig } from "./sidebarNavConfig";
import {
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
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
    animation: "history",
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
    animation: "history",
    moduleId: "employer.historialMovimientos",
  },
  {
    title: "Retenciones y cierres",
    url: ROUTES.employer.retencionesCierres,
    icon: Receipt,
    animation: "dashboard",
    moduleId: "employer.retencionesCierres",
  },
  {
    title: "Auditorías",
    url: ROUTES.employer.auditorias,
    icon: ClipboardList,
    animation: "history",
    tooltip: "Control de cambios en datos de empleados.",
    moduleId: "employer.auditorias",
  },
  {
    title: "Soportes",
    url: ROUTES.employer.soportes,
    icon: MessageCircle,
    animation: "bell",
    tooltip: "Reportes de datos incorrectos enviados por empleados.",
    moduleId: "employer.soportes",
  },
];
