import type { ComponentPropsWithoutRef } from "react";
import { SelectContent } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type FormModalSelectContentProps = ComponentPropsWithoutRef<typeof SelectContent>;

/**
 * SelectContent ajustado para modales (z-index por encima del Dialog).
 * Radix Select usa z-50 por defecto y queda detrás del overlay del modal.
 */
export function FormModalSelectContent({
  className,
  position = "popper",
  sideOffset = 4,
  ...props
}: FormModalSelectContentProps) {
  return (
    <SelectContent
      position={position}
      sideOffset={sideOffset}
      className={cn("z-[110] rounded-xl border-border/80", className)}
      {...props}
    />
  );
}
