// Central route constants — features import from here instead of hardcoding strings
export const ROUTES = {
  login: "/login",
  employee: {
    dashboard: "/",
    adelanto: "/adelanto",
    wallet: "/wallet",
    control: "/control",
    asistente: "/asistente",
    logros: "/logros",
    notificaciones: "/notificaciones",
    perfil: "/perfil",
  },
  employer: {
    panel: "/empleador/panel",
  },
  admin: {
    panel: "/admin/panel",
  },
} as const;
