import { cn } from "@/lib/utils";

/** Ancho seguro para popovers del header: nunca excede el viewport en móvil. */
export function headerPopoverContentClass(wide = false) {
  return cn(
    "overflow-hidden border-primary/10 p-0 shadow-lg shadow-primary/5",
    wide ? "w-[min(calc(100vw-1.25rem),24rem)]" : "w-[min(calc(100vw-1.25rem),20rem)]",
  );
}

export const HEADER_POPOVER_COLLISION_PADDING = 12;
