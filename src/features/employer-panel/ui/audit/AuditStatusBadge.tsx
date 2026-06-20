import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_CLASSES: Record<StatusTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-primary/20 bg-primary/5 text-primary",
  neutral: "border-border bg-secondary/50 text-muted-foreground",
};

type AuditStatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  className?: string;
};

export function AuditStatusBadge({
  label,
  tone = "neutral",
  className,
}: AuditStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-md font-medium", TONE_CLASSES[tone], className)}
    >
      {label}
    </Badge>
  );
}
