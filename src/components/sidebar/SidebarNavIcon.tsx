import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SidebarIconAnimation } from "./sidebarNavConfig";

interface SidebarNavIconProps {
  icon: LucideIcon;
  animation: SidebarIconAnimation;
  isActive: boolean;
}

export function SidebarNavIcon({
  icon: Icon,
  animation,
  isActive,
}: SidebarNavIconProps) {
  return (
    <Icon
      className={cn(
        "relative shrink-0 will-change-transform transition-all duration-300",
        isActive ? "h-[19px] w-[19px]" : "h-[18px] w-[18px]",
        isActive
          ? cn("text-primary", `sidebar-icon-motion-${animation}`)
          : "text-muted-foreground/90 group-hover:text-primary",
      )}
      strokeWidth={isActive ? 2.35 : 2}
      aria-hidden="true"
    />
  );
}
