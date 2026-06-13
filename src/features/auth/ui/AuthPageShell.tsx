import type { ReactNode } from "react";

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
    <main className="relative flex min-h-screen overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 lg:hidden"
        aria-hidden="true"
      >
        <div className="animate-blob absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="animate-blob-delayed absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {brandPanel}

      <section className="relative flex min-w-0 flex-1 flex-col items-stretch justify-center px-4 py-10 sm:px-10 lg:items-center">
        <div className="animate-stagger-up mb-8 flex w-full items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-md transition-transform duration-300 hover:scale-105">
            <span className="font-display text-sm font-bold text-primary-foreground">
              A
            </span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            AdeCerebiia
          </span>
        </div>

        <AuthPageTransition className="flex w-full min-w-0 max-w-full flex-col items-stretch lg:items-center">
          {children}
        </AuthPageTransition>

        <p className="animate-stagger-up stagger-6 mt-8 w-full text-center text-xs text-muted-foreground lg:hidden">
          © {new Date().getFullYear()} Cerebiia
        </p>
      </section>
    </main>
  );
}
