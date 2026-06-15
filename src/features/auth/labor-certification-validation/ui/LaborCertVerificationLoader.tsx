import { FileScan } from "lucide-react";
import { cn } from "@/lib/utils";

interface LaborCertVerificationLoaderProps {
  className?: string;
  compact?: boolean;
}

/** Documento tipo certificado en escáner para certificación laboral. */
export function LaborCertVerificationLoader({
  className,
  compact = false,
}: LaborCertVerificationLoaderProps) {
  const documentSize = compact ? "h-6 w-[1.125rem]" : "h-9 w-7";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-end justify-center",
        compact ? "h-5 w-5" : "h-10 w-10",
        className,
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          "absolute inset-x-[12%] bottom-0 h-1 rounded-sm bg-gradient-to-r from-primary/10 via-primary/25 to-primary/10",
          compact && "h-0.5",
        )}
      />

      <div
        className={cn(
          "animate-document-verify-pulse relative overflow-hidden rounded-[3px] border border-primary/35 bg-gradient-to-b from-background via-primary/[0.04] to-primary/[0.08] shadow-sm",
          documentSize,
          compact ? "bottom-0.5" : "bottom-1",
        )}
      >
        <div className="absolute left-1 right-1 top-1 h-0.5 rounded-full bg-primary/30" />
        <div className="absolute left-1 right-1.5 top-2 h-px rounded-full bg-primary/18" />
        <div className="absolute left-1 right-2 top-2.5 h-px rounded-full bg-primary/15" />
        <div className="absolute left-1 right-1 top-3 h-px rounded-full bg-primary/18" />
        <div className="absolute left-1 right-2.5 top-3.5 h-px rounded-full bg-primary/12" />
        <div className="absolute bottom-1 left-1 h-1.5 w-1.5 rounded-full border border-primary/25 bg-primary/10" />

        <div className="animate-document-scan absolute inset-x-0 top-0 h-1.5 bg-gradient-to-b from-primary/0 via-primary/55 to-primary/0 shadow-[0_0_6px_hsl(var(--primary)/0.3)]" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent" />
      </div>

      {!compact && (
        <div className="absolute -bottom-0.5 -right-0.5 flex h-[1.125rem] w-[1.125rem] items-center justify-center rounded-full bg-background shadow-sm ring-2 ring-primary/25">
          <FileScan className="h-2.5 w-2.5 text-primary animate-spin-slow" />
        </div>
      )}
    </div>
  );
}
