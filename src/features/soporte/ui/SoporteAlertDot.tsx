import { NavAlertDot } from "@/components/sidebar/NavAlertDot";

interface SoporteAlertDotProps {
  className?: string;
  /** Show unread count when > 1; otherwise just the blinking dot. */
  count?: number;
  size?: "sm" | "md";
}

/** Blinking alert for unread company support replies. */
export function SoporteAlertDot({
  className,
  count = 0,
  size = "sm",
}: SoporteAlertDotProps) {
  return (
    <NavAlertDot
      className={className}
      count={count}
      size={size}
      label={
        count > 1
          ? `${count} respuestas nuevas de soporte`
          : "Nueva respuesta de soporte"
      }
    />
  );
}
