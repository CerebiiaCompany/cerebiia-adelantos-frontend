import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AuditComplianceBadgeProps = {
  className?: string;
};

export function AuditComplianceBadge({ className }: AuditComplianceBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 rounded-md border-destructive/30 bg-destructive/10 font-medium text-destructive",
        className,
      )}
    >
      <AlertTriangle className="h-3 w-3" />
      Alerta de Cumplimiento
    </Badge>
  );
}
