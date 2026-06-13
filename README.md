# Cerebiia Adelantos — Frontend



Plataforma de adelantos de nómina para tres actores: **empleado**, **empleador** y **empresa (admin/superadmin)**.

## Stack


| Herramienta | Rol |
|---|---|
| Vite 5 + React 18 | Build tool / framework |
| TypeScript 5 (no strict) | Lenguaje |
| React Router DOM v6 | Routing |
| TanStack Query v5 | Server state |
| React Hook Form + Zod | Formularios |
| Tailwind v3 + shadcn/ui | UI |
| Vitest + Testing Library | Unit / component tests |
| Playwright | E2E tests |

## Arquitectura — Feature-Sliced Design (FSD)

```
src/
├── app/          # Raíz SPA: providers, router, guards
├── pages/        # Un componente por ruta
│   ├── public/   # /login, /registro
│   ├── employee/ # /adelanto, /wallet…
│   ├── employer/ # /empleador/panel
│   └── admin/    # /admin/panel
├── features/     # Funcionalidad por dominio
│   ├── auth/
│   ├── payroll-advance/
│   ├── employer-panel/
│   └── admin-panel/
├── entities/     # Modelos de dominio compartidos
│   ├── advance/
│   └── user/
├── shared/       # Transversal sin lógica de negocio
│   ├── api/           ← ⚠️ AGNÓSTICO (futuro @cerebiia/core)
│   ├── validations/   ← ⚠️ AGNÓSTICO (futuro @cerebiia/core)
│   ├── lib/           ← ⚠️ AGNÓSTICO (futuro @cerebiia/core)
│   ├── ui/            # Barrel de shadcn/ui
│   └── config/        # env, rutas
└── widgets/      # Composiciones grandes de UI
```

### Regla de dependencias (unidireccional)

```
app → pages → widgets → features → entities → shared
```

Cada capa solo importa hacia abajo. **Prohibido** importar entre features directamente.

### Capas agnósticas (`shared/api`, `shared/validations`, `shared/lib`)

Estas carpetas no pueden importar `react-router-dom`, `react-dom` ni cualquier primitivo de UI.
Son las candidatas a extraerse al paquete `@cerebiia/core` que consumirá la app móvil (Expo).

## Alias de path

| Alias | Carpeta |
|---|---|
| `@/*` | `src/*` |
| `@/shared/*` | `src/shared/*` |
| `@/features/*` | `src/features/*` |
| `@/entities/*` | `src/entities/*` |
| `@/widgets/*` | `src/widgets/*` |
| `@/pages/*` | `src/pages/*` |
| `@/app/*` | `src/app/*` |

## Comandos

```bash
npm run dev       # servidor de desarrollo (puerto 8080)
npm run build     # build de producción
npm run test      # vitest (unit + component)
npm run lint      # eslint
npx playwright test  # tests e2e
```

## Agregar un componente shadcn/ui

```bash
npx shadcn-ui@latest add <component>
```

Los componentes se generan en `src/components/ui/` y se re-exportan desde `src/shared/ui/index.ts`.
