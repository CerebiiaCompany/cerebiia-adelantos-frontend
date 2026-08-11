import { cn } from "@/lib/utils";

interface SoporteAlertDotProps {
  className?: string;
  /** Show unread count when > 1; otherwise just the blinking dot. */
  count?: number;
  size?: "sm" | "md";
}

export function SoporteAlertDot({
  className,
  count = 0,
  size = "sm",
}: SoporteAlertDotProps) {
  if (count <= 0) return null;

  if (count > 1) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-display font-bold text-primary-foreground animate-pulse",
          size === "sm" ? "h-4 min-w-4 px-1 text-[10px]" : "h-5 min-w-5 px-1.5 text-[11px]",
          className,
        )}
        aria-label={`${count} respuestas nuevas de soporte`}
      >
        {count > 9 ? "9+" : count}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0",
        size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3",
        className,
      )}
      aria-label="Nueva respuesta de soporte"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-primary/70" />
      <span className="relative inline-flex h-full w-full rounded-full bg-primary" />
    </span>
  );
}
