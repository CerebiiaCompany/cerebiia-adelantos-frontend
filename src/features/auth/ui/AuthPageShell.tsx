import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthPageShellProps {
  brandPanel: ReactNode;
  children: ReactNode;
  centerMobileLogo?: boolean;
}

export function AuthPageShell({
  brandPanel,
  children,
  centerMobileLogo = false,
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

      <section className="relative flex min-w-0 flex-1 flex-col items-center justify-center px-4 py-10 sm:px-10">
        <div
          className={cn(
            "animate-stagger-up mb-8 flex items-center gap-3 lg:hidden",
            centerMobileLogo && "w-full justify-center",
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-md transition-transform duration-300 hover:scale-105">
            <span className="font-display text-sm font-bold text-primary-foreground">
              A
            </span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            AdeCerebiia
          </span>
        </div>

        <div className="flex w-full min-w-0 max-w-full flex-col items-center">
          {children}
        </div>

        <p className="animate-stagger-up stagger-6 mt-8 text-center text-xs text-muted-foreground lg:hidden">
          © {new Date().getFullYear()} Cerebiia
        </p>
      </section>
    </main>
  );
}
