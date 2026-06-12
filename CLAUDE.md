# CLAUDE.md — Cerebiia Adelantos Frontend

Guía de arquitectura y convenciones para Claude Code. Inspecciona este archivo antes de generar o modificar cualquier código en este repositorio.

---

## 1. Propósito del proyecto

**AdeCerebiia** es el frontend SPA de la plataforma de adelantos de nómina de Cerebiia. Permite a tres tipos de actores interactuar con el sistema:

| Actor | Ruta base | Descripción |
|---|---|---|
| Empleado | `/` `/adelanto` `/wallet` `/control` `/asistente` `/logros` | Solicitar y gestionar adelantos |
| Empleador | `/empleador/panel` | Ver planta y aprobar adelantos de su empresa |
| Admin / superadmin | `/admin/panel` | Gestión global, ejecución de transacciones |

---

## 2. Stack exacto (extraído de package.json)

| Herramienta | Versión |
|---|---|
| Vite | 5.4.19 |
| @vitejs/plugin-react-swc | 3.11.0 |
| React | 18.3.1 |
| TypeScript | 5.8.3 |
| React Router DOM | 6.30.1 |
| TanStack Query | 5.83.0 |
| React Hook Form | 7.61.1 |
| @hookform/resolvers | 3.10.0 |
| Zod | 3.25.76 |
| Tailwind CSS | 3.4.17 |
| tailwindcss-animate | 1.0.7 |
| shadcn/ui (Radix UI) | ver components.json |
| lucide-react | 0.462.0 |
| recharts | 2.15.4 |
| date-fns | 3.6.0 |
| sonner | 1.7.4 |
| clsx | 2.1.1 |
| tailwind-merge | 2.6.0 |
| lovable-tagger | 1.1.13 |
| Vitest | 3.2.4 |
| @testing-library/react | 16.0.0 |
| Playwright | vía lovable-agent-playwright-config |

**TypeScript:** modo **no strict** — `strict: false`, `strictNullChecks: false`, `noImplicitAny: false`. No añadir `"strict": true` ni flags adicionales de rigor.

**Scripts disponibles:**
```bash
npm run dev        # Vite dev server en http://localhost:8080
npm run build      # Build de producción (Vite)
npm run build:dev  # Build en modo development
npm run lint       # ESLint
npm run test       # Vitest (run una sola vez)
npm run test:watch # Vitest en modo watch
npx playwright test              # E2E tests (requiere servidor activo)
npx shadcn-ui@latest add <comp>  # Agregar componente shadcn/ui
```

---

## 3. Arquitectura — Clean Architecture adaptada a FSD

El proyecto sigue **Feature-Sliced Design** con una separación inspirada en Clean Architecture. Las capas se mapean así:

```
┌─────────────────────────────────────────────────────────┐
│  PRESENTACIÓN (UI)                                       │
│  src/app/   src/pages/   src/widgets/                    │
│  src/features/*/ui/   src/components/                    │
├─────────────────────────────────────────────────────────┤
│  APLICACIÓN (casos de uso / orquestación)                │
│  src/features/*/model/   (hooks con TanStack Query)      │
├─────────────────────────────────────────────────────────┤
│  INFRAESTRUCTURA (HTTP, adaptadores externos)            │
│  src/shared/api/client.ts   src/shared/api/endpoints/    │
├─────────────────────────────────────────────────────────┤
│  DOMINIO (tipos, reglas de negocio puras)                │
│  src/entities/   src/shared/validations/   src/shared/lib│
└─────────────────────────────────────────────────────────┘
```

### Regla de dependencias (flujo unidireccional)

```
UI → aplicación → infraestructura → dominio
```

**El dominio no depende de nada externo.** La infraestructura implementa lo que el dominio necesita. La UI nunca llama a `fetch` directamente ni contiene reglas de negocio.

### Regla de capas FSD

```
app → pages → widgets → features → entities → shared
```

Cada capa solo importa hacia abajo. **Prohibido importar entre features directamente.**

---

## 4. Estructura de carpetas

### Estado actual

```
src/
├── app/                        # Raíz SPA (creado en scaffold FSD)
│   ├── providers/index.tsx     # QueryClientProvider, TooltipProvider, Toasters
│   ├── router/
│   │   ├── routes.tsx          # Árbol de rutas (BrowserRouter + Routes)
│   │   └── guards/RoleGuard.tsx # Guard de rol (placeholder)
│   └── App.tsx                 # Entry point real (importado desde main.tsx)
│
├── pages/                      # Un componente por ruta
│   ├── public/LoginPage.tsx    # /login (usa features/auth)
│   ├── employee/index.ts       # Placeholder — páginas employee nuevas aquí
│   ├── employer/index.ts       # Placeholder
│   ├── admin/index.ts          # Placeholder
│   │   ── Legacy (migrar gradualmente) ──
│   ├── Dashboard.tsx           # / (empleado)
│   ├── Adelanto.tsx            # /adelanto (empleado)
│   ├── WalletPage.tsx          # /wallet
│   ├── Control.tsx             # /control
│   ├── Asistente.tsx           # /asistente
│   ├── Logros.tsx              # /logros
│   ├── Notificaciones.tsx      # /notificaciones
│   ├── Perfil.tsx              # /perfil
│   └── NotFound.tsx            # 404
│
├── features/                   # Funcionalidad por dominio
│   ├── auth/
│   │   ├── ui/LoginForm.tsx    # Formulario con React Hook Form + Zod
│   │   ├── model/useLogin.ts   # Hook con useMutation de TanStack Query
│   │   └── index.ts            # API pública de la feature
│   ├── payroll-advance/index.ts
│   ├── employer-panel/index.ts
│   └── admin-panel/index.ts
│
├── entities/                   # Modelos de dominio compartidos
│   ├── advance/model/types.ts  # AdvanceStatus, Advance
│   ├── advance/index.ts
│   ├── user/model/types.ts     # UserRole, User
│   └── user/index.ts
│
├── shared/                     # Transversal sin lógica de negocio
│   ├── api/                    # ⚠️ AGNÓSTICO — futuro @cerebiia/core
│   │   ├── client.ts           # Wrapper de fetch (http.get/post/put/del)
│   │   ├── endpoints/          # auth.ts, advances.ts
│   │   ├── types/index.ts      # DTOs (LoginRequest, AuthResponse, AdvanceDTO)
│   │   └── index.ts
│   ├── validations/            # ⚠️ AGNÓSTICO — futuro @cerebiia/core
│   │   ├── auth.schema.ts      # loginSchema, LoginFormValues
│   │   ├── advance.schema.ts   # requestAdvanceSchema
│   │   └── index.ts
│   ├── lib/                    # ⚠️ AGNÓSTICO — futuro @cerebiia/core
│   │   ├── currency.ts         # formatCOP, parseCOP
│   │   ├── dates.ts            # formatDate, formatRelative
│   │   └── index.ts
│   ├── config/
│   │   ├── env.ts              # import.meta.env wrapping
│   │   ├── routes.ts           # constantes ROUTES
│   │   └── index.ts
│   └── ui/index.ts             # Barrel de shadcn/ui (re-exporta components/ui)
│
├── widgets/                    # Composiciones grandes de UI
│   ├── sidebar/index.ts
│   └── advance-table/index.ts
│
├── components/                 # Legado + shadcn/ui (NO mover, Lovable escribe aquí)
│   ├── AppLayout.tsx           # Layout principal con SidebarProvider + Outlet
│   ├── AppSidebar.tsx          # Sidebar con navegación colapsable
│   ├── NavLink.tsx             # Wrapper de NavLink con activeClassName
│   └── ui/                     # Generado por shadcn/ui CLI — no editar a mano
│
├── hooks/
│   ├── use-mobile.tsx          # useIsMobile() con matchMedia
│   └── use-toast.ts            # Toast hook (shadcn)
│
├── lib/
│   └── utils.ts                # cn() = clsx + tailwind-merge
│
├── test/
│   ├── example.test.ts         # Placeholder
│   └── setup.ts                # @testing-library/jest-dom + matchMedia mock
│
├── index.css                   # Variables CSS, custom utilities, animaciones
├── main.tsx                    # ReactDOM.createRoot → src/app/App.tsx
└── vite-env.d.ts
```

### Estructura objetivo (migración progresiva)

Al crear código nuevo, seguir este destino. **No romper código existente de golpe.**

```
# Cuando extraigas lógica de un page legacy:
src/pages/employee/DashboardPage.tsx     # Componente solo visual
src/features/dashboard/model/useDashboard.ts  # Hook con datos
src/entities/advance/model/types.ts      # Tipos compartidos

# Las reglas de negocio (fee = amount * 0.025) van a:
src/entities/advance/model/calculations.ts    # Lógica pura sin React

# formatCOP ya está en shared/lib — usar esa, borrar las copias inline
import { formatCOP } from "@/shared/lib";
```

---

## 5. Dónde crear cada cosa

| Necesitas | Destino |
|---|---|
| Nueva ruta | `src/app/router/routes.tsx` |
| Página nueva | `src/pages/<actor>/<Nombre>Page.tsx` |
| Componente de feature | `src/features/<feature>/ui/<Nombre>.tsx` |
| Hook con TanStack Query | `src/features/<feature>/model/use<Nombre>.ts` |
| Llamada HTTP | `src/shared/api/endpoints/<dominio>.ts` |
| Tipo DTO (request/response) | `src/shared/api/types/index.ts` |
| Esquema Zod | `src/shared/validations/<dominio>.schema.ts` |
| Tipo de dominio (entidad) | `src/entities/<entidad>/model/types.ts` |
| Utilidad pura (formato, cálculo) | `src/shared/lib/<dominio>.ts` |
| Componente shadcn/ui nuevo | `npx shadcn-ui@latest add <comp>` → añadir re-export en `src/shared/ui/index.ts` |
| Constante de ruta | `src/shared/config/routes.ts` (objeto ROUTES) |
| Variable de entorno | `src/shared/config/env.ts` |

---

## 6. Convenciones de código

### TypeScript
- Modo **no strict** — no añadir `!` innecesariamente, pero el compilador no lo exige
- Interfaces preferidas sobre `type` para objetos con forma fija
- `type` para uniones, aliases simples (`type AdvanceStatus = "pending" | ...`)
- Inferencia de tipos cuando es obvio; anotar en límites de módulos (params y returns de hooks)

### Componentes React
- Siempre **funcionales** — nunca class components
- **Default export** para páginas: `export default function DashboardPage()`
- **Named export** para componentes reutilizables: `export function LoginForm()`
- `forwardRef` cuando el componente envuelve un elemento nativo y necesita ref (ver `NavLink.tsx`)
- Inline components aceptables dentro del mismo archivo de página (ver `StatCard` en Dashboard.tsx), pero si se reutiliza en otro lugar, extraer

### Imports y alias
```ts
// Alias disponibles (configurados en tsconfig.app.json + vite.config.ts)
import { cn } from "@/lib/utils";           // utilidades base
import { formatCOP } from "@/shared/lib";   // shared layer
import { loginSchema } from "@/shared/validations/auth.schema";
import { authEndpoints } from "@/shared/api/endpoints";
import { useLogin } from "@/features/auth";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui";       // o directamente de @/components/ui/button
```

- Nunca rutas relativas profundas (`../../../components`). Usar siempre alias `@/`.
- Importar desde el barrel `index.ts` de cada feature/entity, nunca desde archivos internos de otra feature.

### Tailwind y estilos
- Usar clases de Tailwind **siempre** para estilos — cero CSS modules, cero `style={{}}` inline salvo casos imposibles de hacer en Tailwind.
- `cn()` de `@/lib/utils` para combinar clases condicionales.
- **Utilities CSS personalizadas** (definidas en `src/index.css`):
  - `.glass-card` — tarjeta con backdrop-blur y shadow-card
  - `.glow-border` — borde con shadow-glow y primary/30
  - `.text-gradient` — texto con gradiente azul→morado
  - `.bg-gradient-primary` — fondo con gradiente (azul→morado)
  - `.animate-fade-in`, `.animate-slide-up`, `.animate-pulse-glow`, `.animate-float`
- **Tokens de color** (CSS variables): usar `text-primary`, `text-muted-foreground`, `bg-background`, `bg-secondary`, `text-foreground`, `border-border`, `text-destructive`, `text-warning`, `text-success`, `text-info`.
- **Tipografía**: `font-sans` (Inter) para texto normal, `font-display` (Space Grotesk) para headings y valores numéricos importantes.
- **Border radius**: usar `rounded-xl` (--radius = 0.75rem), `rounded-lg`, `rounded-md`, `rounded-sm` — no inventar valores arbitrarios.
- **Dark mode**: configurado con `darkMode: ["class"]` en tailwind.config.ts, pero NO implementado todavía. No añadir clases `dark:` sin confirmar con el equipo.

### shadcn/ui
- Agregar nuevos componentes con el CLI: `npx shadcn-ui@latest add <componente>`
- Los componentes se generan en `src/components/ui/` — **nunca editar esos archivos a mano** (Lovable los puede sobrescribir).
- Después de agregar un componente, añadir su re-export en `src/shared/ui/index.ts`.
- Estilo base: `"style": "default"`, `"baseColor": "slate"`, `cssVariables: true` (ver `components.json`).

### Formularios
```tsx
// Patrón estándar: React Hook Form + zodResolver + schema de shared/validations
const form = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: "", password: "" },
});
```

### Routing
- Usar `<Link>` de react-router-dom (no `<a href>`). Excepción: links externos.
- Para navegación activa usar el componente `NavLink` de `@/components/NavLink` (no el de react-router directamente), ya que añade soporte para `activeClassName`.
- Todas las rutas están centralizadas en `src/app/router/routes.tsx`.
- Las rutas como strings viven en `src/shared/config/routes.ts` (objeto `ROUTES`). No hardcodear strings de rutas en features.

### Hooks de data fetching
```ts
// useQuery para lectura, useMutation para escritura
import { useQuery, useMutation } from "@tanstack/react-query";
import { advancesEndpoints } from "@/shared/api/endpoints";

export function useAdvanceList() {
  return useQuery({
    queryKey: ["advances"],
    queryFn: advancesEndpoints.list,
  });
}
```

---

## 7. Capas agnósticas — CRÍTICO

`src/shared/api/`, `src/shared/validations/`, `src/shared/lib/` son **completamente agnósticas de React y del navegador**.

**Prohibido en estas carpetas:**
- `import ... from "react-router-dom"` o `"react-router"`
- `import ... from "react-dom"` o `"react-dom/client"`
- Componentes de UI o hooks acoplados al DOM
- Imports de `next/*` u otros frameworks

**Permitido:**
- TypeScript puro
- Zod (compatible con React Native)
- `fetch` nativo (agnóstico de plataforma)

**Motivo:** Estas carpetas se extraerán al paquete `@cerebiia/core` para reutilizarlas en la app móvil Expo/React Native sin modificaciones. ESLint ya tiene reglas que fallan el build si se viola esto.

---

## 8. Git y colaboración con Lovable

### El bot
Los commits automáticos de Lovable son firmados por `gpt-engineer-app[bot]`. La rama `main` puede recibir commits del bot y de desarrolladores humanos de forma concurrente.

### Reglas obligatorias de Git
```bash
# ANTES de hacer push, siempre:
git pull --rebase origin main   # o la rama correspondiente
git push origin <rama>

# NUNCA:
git push --force origin main    # puede destruir commits del bot
git push --force origin develop # puede destruir trabajo de otros devs
```

- Usar `--force-with-lease` en lugar de `--force` si es absolutamente necesario en una rama feature personal.
- Nunca hacer `git push --force` sobre `main` o `develop`.
- Commits atómicos y descriptivos en español o inglés (el historial del bot es en inglés).

### Mantener compatibilidad con Lovable
- **No cambiar** la configuración base de Vite, React o TypeScript de forma que rompa el template `vite_react_shadcn_ts`.
- **No renombrar** `src/components/ui/` — el CLI de shadcn y Lovable escriben ahí.
- **No mover** `src/lib/utils.ts` — es referenciado por `components.json` (`"utils": "@/lib/utils"`).
- **No mover** `src/index.css` — referenciado en `components.json` y en `src/main.tsx`.
- **No commitear** archivos `.env`, `.env.local`, ni secrets. El `.gitignore` actual cubre `*.local` pero NO archivos `.env` sin sufijo — verificar antes de hacer stage.

---

## 9. Testing

### Unit / Component (Vitest + Testing Library)
```ts
// Archivos: src/**/*.test.ts(x) o src/**/*.spec.ts(x)
// Setup: src/test/setup.ts (configura jest-dom + mock de matchMedia)
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
```

### E2E (Playwright)
```ts
// Config: playwright.config.ts (usa createLovableConfig de Lovable)
// Fixture: playwright-fixture.ts (re-exporta test/expect de Lovable)
import { test, expect } from "./playwright-fixture";  // no del paquete playwright directamente
```

El servidor debe estar corriendo antes de ejecutar Playwright.

---

## 10. Anti-patrones — NO HACER

Los tres ejemplos siguientes son **casos reales encontrados en este repositorio**. No repetirlos.

### [1] Lógica de negocio en un componente de UI — `Adelanto.tsx:10-12`

```tsx
// ❌ ENCONTRADO EN src/pages/Adelanto.tsx líneas 10-12:
const fee = Math.round(amount * 0.025);   // regla de negocio: comisión del 2.5%
const total = amount - fee;               // cálculo de dominio
```

La regla de negocio (qué es la comisión, cómo se calcula el neto) no pertenece al componente. Va en la capa de dominio:

```ts
// ✅ Correcto — src/entities/advance/model/calculations.ts
export const FEE_RATE = 0.025;
export function calculateFee(amount: number): number {
  return Math.round(amount * FEE_RATE);
}
export function calculateNet(amount: number): number {
  return amount - calculateFee(amount);
}

// El componente solo consume:
import { calculateFee, calculateNet } from "@/entities/advance/model/calculations";
const fee = calculateFee(amount);
const total = calculateNet(amount);
```

---

### [2] Utilidad duplicada en múltiples páginas — `Dashboard.tsx:20` y `Adelanto.tsx:5`

```ts
// ❌ ENCONTRADO EN src/pages/Dashboard.tsx línea 20:
const formatCOP = (v: number) => `$${v.toLocaleString("es-CO")}`;

// ❌ ENCONTRADO EN src/pages/Adelanto.tsx línea 5 (idéntica):
const formatCOP = (v: number) => `$${v.toLocaleString("es-CO")}`;
```

Esta función ya existe en `src/shared/lib/currency.ts` (creada en el scaffold). Las copias locales son deuda técnica — eliminarlas cuando se toque cada página:

```ts
// ✅ Correcto — importar desde la capa compartida
import { formatCOP } from "@/shared/lib";
```

---

### [3] Navegación con `<a>` HTML en vez de `<Link>` — `Dashboard.tsx:136`

```tsx
// ❌ ENCONTRADO EN src/pages/Dashboard.tsx línea 136:
<a href="/adelanto" className="px-6 py-3 rounded-xl bg-gradient-primary ...">
  Solicitar adelanto →
</a>
```

`<a href>` provoca una recarga completa de la SPA. Para rutas internas usar `<Link>` de react-router-dom, y la constante de `ROUTES` para evitar strings hardcodeados:

```tsx
// ✅ Correcto
import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes";

<Link to={ROUTES.employee.adelanto} className="px-6 py-3 rounded-xl bg-gradient-primary ...">
  Solicitar adelanto →
</Link>
```

---

### Otros anti-patrones (arquitectura)

```tsx
// ❌ fetch/axios directo en un componente
function Dashboard() {
  useEffect(() => {
    fetch("/api/advances").then(...); // va en shared/api/endpoints/ + features/*/model/
  }, []);
}

// ❌ Una feature importando otra feature directamente
// En features/payroll-advance/model/useRequestAdvance.ts:
import { useLogin } from "@/features/auth"; // PROHIBIDO — subir a entities/ o shared/

// ❌ react-router en la capa shared/
// En src/shared/api/client.ts:
import { useNavigate } from "react-router-dom"; // PROHIBIDO — ESLint lo rompe
```

### Anti-patrones de estilos

```tsx
// ❌ Estilos inline cuando Tailwind puede hacerlo
<div style={{ fontSize: "14px" }}>   // → className="text-sm"

// ❌ Shadows/gradientes inventados fuera del sistema
<div style={{ boxShadow: "0 0 30px blue" }}>
// → usar .glow-border o .glass-card (definidas en src/index.css)
```

### Anti-patrones de Git

```bash
# ❌ Nunca
git push --force origin main    # destruye commits del bot gpt-engineer-app[bot]
git push --force origin develop # destruye trabajo de otros devs

# ❌ Nunca commitear
.env       # el .gitignore actual NO cubre .env sin sufijo — verificar antes de git add
*.pem
secrets.json
```

---

## 11. Alias de path (resumen)

| Alias | Carpeta |
|---|---|
| `@/*` | `src/*` |
| `@/app/*` | `src/app/*` |
| `@/pages/*` | `src/pages/*` |
| `@/widgets/*` | `src/widgets/*` |
| `@/features/*` | `src/features/*` |
| `@/entities/*` | `src/entities/*` |
| `@/shared/*` | `src/shared/*` |
| `@/components/*` | `src/components/*` |
| `@/lib/*` | `src/lib/*` |
| `@/hooks/*` | `src/hooks/*` |
