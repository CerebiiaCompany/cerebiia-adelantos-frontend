// Central route constants — features import from here instead of hardcoding strings
export const ROUTES = {
  login: "/login",
  forgotPassword: "/recuperar-contrasena",
  register: "/registro",
  registerValidation: "/registro/validacion",
  employee: {
    dashboard: "/",
    adelanto: "/adelanto",
    misAdelantos: "/mis-adelantos",
    wallet: "/wallet",
    control: "/control",
    asistente: "/asistente",
    logros: "/logros",
    notificaciones: "/notificaciones",
  },
  employer: {
    panel: "/empleador/panel",
    misEmpleados: "/empleador/mis-empleados",
  },
  admin: {
    panel: "/admin/panel",
  },
} as const;
