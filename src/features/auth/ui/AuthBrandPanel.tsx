import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Shield, Sparkles, Wallet, Zap } from "lucide-react";
import { AuthBrandGuideList } from "./AuthBrandGuideList";
import type { AuthBrandGuideStep } from "./registerBrandPanelContent";

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
  steps?: AuthBrandGuideStep[];
  compactSteps?: AuthBrandGuideStep[];
}

export function AuthBrandPanel({
  title,
  description,
  steps,
  compactSteps,
}: AuthBrandPanelProps) {
  const showGuideSteps = steps && steps.length > 0;
  const panelCompactSteps =
    compactSteps && compactSteps.length > 0 ? compactSteps : steps;

  return (
    <section
      className="auth-brand-scroll relative hidden h-[100dvh] max-h-[100dvh] w-[46%] shrink-0 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain bg-gradient-primary text-primary-foreground xl:w-[52%] lg:flex"
      aria-label="Presentación de AdeCerebiia"
    >
      <div className="relative flex min-h-full flex-col">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-blob absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="animate-blob-delayed absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute right-12 top-1/3 h-40 w-40 animate-float rounded-full border border-white/10 bg-white/5 backdrop-blur-sm" />
          <div className="absolute bottom-24 right-1/4 h-24 w-24 animate-float rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm [animation-delay:2s]" />
        </div>

        <div className="relative z-10 flex min-h-[100dvh] flex-col px-10 py-10 xl:px-14 xl:py-12">
          <header className="animate-fade-in shrink-0 space-y-5">
            <div className="group flex cursor-default items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30 transition-all duration-300 group-hover:scale-105 group-hover:bg-white/25 group-hover:shadow-lg">
                <span className="font-display text-lg font-bold">A</span>
              </div>
              <span className="font-display text-2xl font-bold tracking-tight transition-transform duration-300 group-hover:translate-x-0.5">
                AdeCerebiia
              </span>
            </div>

            <div className="group inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium backdrop-blur-sm ring-1 ring-white/20 transition-all duration-300 hover:bg-white/20 hover:ring-white/30 xl:text-sm">
              <Sparkles className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 xl:h-4 xl:w-4" />
              Plataforma de adelantos de nómina
            </div>
          </header>

          <main className="shrink-0 grow py-10 xl:py-12">
            <div className="max-w-[26rem] space-y-8 xl:max-w-md xl:space-y-10">
              <div className="animate-stagger-up space-y-4">
                <h1 className="animate-stagger-up stagger-1 font-display text-[1.75rem] font-bold leading-[1.2] tracking-tight lg:text-3xl xl:text-4xl 2xl:text-[2.75rem]">
                  {title}
                </h1>
                <p className="animate-stagger-up stagger-2 max-w-prose text-sm leading-relaxed text-primary-foreground/80 xl:text-base">
                  {description}
                </p>
              </div>

              {showGuideSteps ? (
                <>
                  <AuthBrandGuideList
                    steps={panelCompactSteps ?? []}
                    variant="compact"
                    className="xl:hidden"
                  />
                  <AuthBrandGuideList
                    steps={steps}
                    variant="full"
                    className="hidden xl:block"
                  />
                </>
              ) : (
                <ul className="space-y-3">
                  {highlights.map(
                    (
                      { icon: Icon, title: itemTitle, description: itemDescription },
                      index,
                    ) => (
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
                          <p className="font-display font-semibold">
                            {itemTitle}
                          </p>
                          <p className="text-sm text-primary-foreground/75">
                            {itemDescription}
                          </p>
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          </main>

          <footer className="mt-auto shrink-0 border-t border-white/10 pt-6">
            <p className="text-center text-xs text-primary-foreground/55 xl:text-sm">
              © {new Date().getFullYear()} Cerebiia · Todos los derechos reservados
            </p>
          </footer>
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
