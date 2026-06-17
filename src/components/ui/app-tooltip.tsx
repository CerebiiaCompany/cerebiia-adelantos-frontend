import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const APP_TOOLTIP_FILL = "#2D3748";

export interface AppTooltipProps {
  text: string;
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  disabled?: boolean;
  className?: string;
  delayDuration?: number;
}

export function AppTooltip({
  text,
  children,
  side = "bottom",
  align = "center",
  sideOffset = 10,
  disabled = false,
  className,
  delayDuration = 200,
}: AppTooltipProps) {
  if (disabled) {
    return children;
  }

  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          avoidCollisions
          collisionPadding={12}
          className={cn(
            "app-tooltip-content relative z-[300] max-w-[15.5rem] rounded-lg border-0 px-3.5 py-2.5 text-sm font-normal leading-relaxed text-white shadow-lg outline-none",
            "animate-in fade-in-0 duration-200",
            "data-[side=bottom]:slide-in-from-bottom-1 data-[side=top]:slide-in-from-top-1",
            "data-[side=left]:slide-in-from-left-1 data-[side=right]:slide-in-from-right-1",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-150",
            className,
          )}
        >
          {text}
          <TooltipPrimitive.Arrow
            width={12}
            height={6}
            className="app-tooltip-arrow drop-shadow-sm"
          />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export { APP_TOOLTIP_FILL };
