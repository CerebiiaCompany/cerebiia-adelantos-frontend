import type { ReactNode } from "react";

import { AuthFormPanelBackground } from "@/features/auth/ui/AuthFormPanelBackground";
import { AuthPageTransition } from "@/features/auth/ui/AuthPageTransition";

interface AuthPageShellProps {
  brandPanel: ReactNode;
  children: ReactNode;
}

export function AuthPageShell({
  brandPanel,
  children,
}: AuthPageShellProps) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-white lg:h-[100dvh] lg:max-h-[100dvh] lg:flex-row lg:overflow-hidden">
      {brandPanel}

      <section className="relative flex min-w-0 flex-1 flex-col bg-white lg:h-full lg:min-h-0 lg:overflow-hidden">
        <AuthFormPanelBackground />

        <div className="relative z-10 animate-stagger-up flex shrink-0 items-center gap-3 px-4 pb-6 pt-10 sm:px-10 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-md transition-transform duration-300 hover:scale-105">
            <span className="font-display text-sm font-bold text-primary-foreground">
              A
            </span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            AdeCerebiia
          </span>
        </div>

        <div className="auth-form-scroll relative z-10 flex flex-col lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-y-contain">
          <div className="flex flex-col px-4 py-10 sm:px-10 lg:min-h-full">
            <div className="flex w-full min-w-0 flex-col items-stretch lg:my-auto lg:items-center">
              <AuthPageTransition className="flex w-full min-w-0 max-w-full flex-col items-stretch lg:items-center">
                {children}
              </AuthPageTransition>
            </div>

            <p className="animate-stagger-up stagger-6 mt-8 w-full shrink-0 text-center text-xs text-muted-foreground lg:hidden">
              © {new Date().getFullYear()} Cerebiia
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
