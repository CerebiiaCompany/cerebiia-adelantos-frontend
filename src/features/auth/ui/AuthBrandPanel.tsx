import type { ReactNode } from "react";
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

export interface AuthBrandPanelProps {
  title: ReactNode;
  description: ReactNode;
}

export function AuthBrandPanel({ title, description }: AuthBrandPanelProps) {
  return (
    <section
      className="relative hidden h-[100dvh] max-h-[100dvh] w-[52%] shrink-0 flex-col overflow-hidden bg-gradient-primary text-primary-foreground lg:flex"
      aria-label="Presentación de AdeCerebiia"
    >
      <div className="relative flex h-full flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-blob absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="animate-blob-delayed absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute right-12 top-1/3 h-40 w-40 animate-float rounded-full border border-white/10 bg-white/5 backdrop-blur-sm" />
          <div className="absolute bottom-24 right-1/4 h-24 w-24 animate-float rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm [animation-delay:2s]" />
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col p-12">
          <div className="animate-fade-in shrink-0">
            <div className="group flex cursor-default items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30 transition-all duration-300 group-hover:scale-105 group-hover:bg-white/25 group-hover:shadow-lg">
                <span className="font-display text-lg font-bold">A</span>
              </div>
              <span className="font-display text-2xl font-bold tracking-tight transition-transform duration-300 group-hover:translate-x-0.5">
                AdeCerebiia
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-center py-10">
            <div className="max-w-md space-y-8">
              <div className="animate-stagger-up space-y-4">
                <div className="group inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm ring-1 ring-white/20 transition-all duration-300 hover:bg-white/20 hover:ring-white/30">
                  <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                  Plataforma de adelantos de nómina
                </div>
                <div className="animate-stagger-up stagger-1 font-display text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                  {title}
                </div>
                <div className="animate-stagger-up stagger-2 text-base leading-relaxed text-primary-foreground/80">
                  {description}
                </div>
              </div>

              <ul className="space-y-2">
                {highlights.map(({ icon: Icon, title: itemTitle, description: itemDescription }, index) => (
                  <li
                    key={itemTitle}
                    className={cn(
                      "highlight-item animate-stagger-up flex items-start gap-4",
                      highlightStagger[index],
                    )}
                  >
                    <div className="highlight-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display font-semibold">{itemTitle}</p>
                      <p className="text-sm text-primary-foreground/75">
                        {itemDescription}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="animate-stagger-up stagger-6 shrink-0 text-center text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Cerebiia · Todos los derechos reservados
          </p>
        </div>
      </div>
    </section>
  );
}

export function AuthDefaultHeadline() {
  return (
    <>
      Tu dinero,
      <br />
      a tu ritmo.
    </>
  );
}
