import { ScanFace } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelfieVerificationLoaderProps {
  className?: string;
  compact?: boolean;
}

/** Carita en escaneo para la verificación facial. */
export function SelfieVerificationLoader({
  className,
  compact = false,
}: SelfieVerificationLoaderProps) {
  const faceSize = compact ? "h-5 w-5" : "h-8 w-8";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        compact ? "h-5 w-5" : "h-10 w-10",
        className,
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          "animate-face-verify-pulse relative overflow-hidden rounded-full border-[1.5px] border-primary/35 bg-gradient-to-br from-primary/[0.12] via-background to-primary/[0.05] shadow-sm",
          faceSize,
        )}
      >
        <div className="absolute left-[24%] top-[32%] h-1 w-1 rounded-full bg-primary/55" />
        <div className="absolute right-[24%] top-[32%] h-1 w-1 rounded-full bg-primary/55" />

        <svg
          viewBox="0 0 32 32"
          className="absolute inset-x-[16%] bottom-[20%] h-[28%] w-[68%] text-primary/45"
          aria-hidden="true"
        >
          <path
            d="M2 14c4 6 24 6 28 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-face-smile"
          />
        </svg>

        <div className="animate-face-scan absolute inset-y-1 w-1 bg-gradient-to-b from-primary/0 via-primary/60 to-primary/0 shadow-[0_0_6px_hsl(var(--primary)/0.35)]" />

        <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-primary/10" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent" />
      </div>

      {!compact && (
        <div className="absolute -bottom-0.5 -right-0.5 flex h-[1.125rem] w-[1.125rem] items-center justify-center rounded-full bg-background shadow-sm ring-2 ring-primary/25">
          <ScanFace className="h-2.5 w-2.5 text-primary animate-spin-slow" />
        </div>
      )}
    </div>
  );
}
