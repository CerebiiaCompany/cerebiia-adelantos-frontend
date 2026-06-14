import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AuthPageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function AuthPageTransition({
  children,
  className,
}: AuthPageTransitionProps) {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className={cn("auth-page-enter w-full", className)}>
      {children}
    </div>
  );
}
