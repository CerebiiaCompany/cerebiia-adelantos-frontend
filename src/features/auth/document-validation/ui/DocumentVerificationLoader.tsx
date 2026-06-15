import { ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentVerificationLoaderProps {
  className?: string;
}

/** Animación de cédula en escaneo para la verificación de identidad. */
export function DocumentVerificationLoader({
  className,
}: DocumentVerificationLoaderProps) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 items-center justify-center",
        className,
      )}
      aria-hidden="true"
    >
      <div className="animate-document-verify-pulse relative h-8 w-[2.125rem] overflow-hidden rounded-[5px] border-[1.5px] border-primary/35 bg-gradient-to-br from-primary/[0.1] via-background to-primary/[0.04] shadow-sm">
        <div className="absolute left-1 top-1 h-3 w-2.5 rounded-[2px] bg-primary/25" />
        <div className="absolute left-1.5 top-2 h-1.5 w-1.5 rounded-full bg-primary/35" />
        <div className="absolute bottom-1 left-1 h-0.5 w-2 rounded-full bg-primary/20" />

        <div className="absolute left-4 top-1.5 h-0.5 w-4 rounded-full bg-primary/25" />
        <div className="absolute left-4 top-2.5 h-0.5 w-3 rounded-full bg-primary/18" />
        <div className="absolute left-4 top-3.5 h-0.5 w-3.5 rounded-full bg-primary/18" />
        <div className="absolute bottom-1.5 right-1 h-2 w-2 rounded-full border border-primary/25 bg-primary/10" />

        <div className="animate-document-scan absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-primary/0 via-primary/55 to-primary/0 shadow-[0_0_8px_hsl(var(--primary)/0.35)]" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-transparent" />
      </div>

      <div className="absolute -bottom-0.5 -right-0.5 flex h-[1.125rem] w-[1.125rem] items-center justify-center rounded-full bg-background shadow-sm ring-2 ring-primary/25">
        <ScanLine className="h-2.5 w-2.5 text-primary animate-spin-slow" />
      </div>
    </div>
  );
}
