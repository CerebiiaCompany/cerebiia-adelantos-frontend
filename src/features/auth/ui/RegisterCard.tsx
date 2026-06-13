import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RegisterCardProps {
  children: ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
}

export function RegisterCard({
  children,
  isLoading = false,
  loadingMessage = "Procesando...",
}: RegisterCardProps) {
  return (
    <div
      className={cn(
        "login-card glass-card glow-border relative overflow-hidden p-8 sm:p-10",
        isLoading && "pointer-events-none opacity-90",
      )}
    >
      {isLoading && (
        <div className="loading-bar" aria-hidden="true">
          <div className="animate-shimmer h-full w-full" />
        </div>
      )}

      {children}

      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/20 backdrop-blur-[1px]"
          aria-hidden="true"
        >
          <div className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-sm font-medium text-muted-foreground shadow-lg ring-1 ring-border/50">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {loadingMessage}
          </div>
        </div>
      )}
    </div>
  );
}
