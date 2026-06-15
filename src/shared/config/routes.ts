// Central route constants — features import from here instead of hardcoding strings
export const ROUTES = {
  login: "/login",
  forgotPassword: "/recuperar-contrasena",
  register: "/registro",
  registerValidation: "/registro/validacion",
  employee: {
    dashboard: "/",
    adelanto: "/adelanto",
    wallet: "/wallet",
    control: "/control",
    asistente: "/asistente",
    logros: "/logros",
    notificaciones: "/notificaciones",
  },
  employer: {
    panel: "/empleador/panel",
  },
  admin: {
    panel: "/admin/panel",
  },
} as const;
