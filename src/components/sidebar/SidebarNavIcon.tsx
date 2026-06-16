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
        "relative shrink-0 h-[18px] w-[18px] will-change-transform transition-colors duration-300",
        isActive
          ? cn("text-primary", `sidebar-icon-motion-${animation}`)
          : "text-muted-foreground group-hover:text-primary",
      )}
      strokeWidth={isActive ? 2.25 : 2}
      aria-hidden="true"
    />
  );
}
