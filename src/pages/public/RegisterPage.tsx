import { RegisterForm } from "@/features/auth";
import { cn } from "@/lib/utils";
import { Shield, Sparkles, Wallet, Zap } from "lucide-react";

const highlightStagger = ["stagger-3", "stagger-4", "stagger-5"] as const;

const highlights = [
  {
    icon: Zap,
    title: "Adelantos al instante",
    description: "Accede a tu nómina cuando más lo necesites.",
  },
  {
    icon: Shield,
    title: "Seguro y transparente",
    description: "Tus datos y transacciones siempre protegidos.",
  },
  {
    icon: Wallet,
    title: "Control total",
    description: "Empleados, empleadores y empresas en un solo lugar.",
  },
];

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 lg:hidden"
        aria-hidden="true"
      >
        <div className="animate-blob absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="animate-blob-delayed absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <section
        className="relative hidden w-[52%] flex-col justify-between overflow-hidden bg-gradient-primary p-12 text-primary-foreground lg:flex"
        aria-label="Presentación de AdeCerebiia"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-blob absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="animate-blob-delayed absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute right-12 top-1/3 h-40 w-40 animate-float rounded-full border border-white/10 bg-white/5 backdrop-blur-sm" />
          <div className="absolute bottom-24 right-1/4 h-24 w-24 animate-float rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm [animation-delay:2s]" />
        </div>

        <div className="relative z-10 animate-fade-in">
          <div className="group flex cursor-default items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30 transition-all duration-300 group-hover:scale-105 group-hover:bg-white/25 group-hover:shadow-lg">
              <span className="font-display text-lg font-bold">A</span>
            </div>
            <span className="font-display text-2xl font-bold tracking-tight transition-transform duration-300 group-hover:translate-x-0.5">
              AdeCerebiia
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-8">
          <div className="animate-stagger-up space-y-4">
            <div className="group inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm ring-1 ring-white/20 transition-all duration-300 hover:bg-white/20 hover:ring-white/30">
              <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              Plataforma de adelantos de nómina
            </div>
            <h1 className="animate-stagger-up stagger-1 font-display text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Tu dinero,
              <br />
              <span className="inline-block transition-transform duration-500 hover:translate-x-1">
                a tu ritmo.
              </span>
            </h1>
            <p className="animate-stagger-up stagger-2 text-base leading-relaxed text-primary-foreground/80">
              Gestiona adelantos de forma simple, rápida y segura para toda tu
              organización.
            </p>
          </div>

          <ul className="space-y-2">
            {highlights.map(({ icon: Icon, title, description }, index) => (
              <li
                key={title}
                className={cn(
                  "highlight-item animate-stagger-up flex items-start gap-4",
                  highlightStagger[index],
                )}
              >
                <div className="highlight-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display font-semibold">{title}</p>
                  <p className="text-sm text-primary-foreground/75">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="animate-stagger-up stagger-6 relative z-10 text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} Cerebiia · Todos los derechos reservados
        </p>
      </section>

      <section className="relative flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10">
        <div className="animate-stagger-up mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-md transition-transform duration-300 hover:scale-105">
            <span className="font-display text-sm font-bold text-primary-foreground">
              A
            </span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            AdeCerebiia
          </span>
        </div>

        <RegisterForm />

        <p className="animate-stagger-up stagger-6 mt-8 text-center text-xs text-muted-foreground lg:hidden">
          © {new Date().getFullYear()} Cerebiia
        </p>
      </section>
    </main>
  );
}
