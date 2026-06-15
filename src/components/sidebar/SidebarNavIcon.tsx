import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SidebarIconAnimation } from "./sidebarNavConfig";

interface SidebarNavIconProps {
  icon: LucideIcon;
  animation: SidebarIconAnimation;
  isActive: boolean;
  collapsed?: boolean;
}

export function SidebarNavIcon({
  icon: Icon,
  animation,
  isActive,
  collapsed = false,
}: SidebarNavIconProps) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-[10px] transition-[background-color,box-shadow,transform] duration-300 ease-out",
        collapsed ? "aspect-square h-9 w-9" : "h-8 w-8",
        isActive
          ? cn(
              "bg-gradient-primary text-primary-foreground shadow-sm shadow-primary/20",
              collapsed ? "ring-1 ring-primary/25" : "ring-1 ring-primary/20",
            )
          : "bg-primary/[0.08] text-primary/75 group-hover:bg-primary/[0.12] group-hover:text-primary",
      )}
    >
      {isActive && (
        <span
          className="pointer-events-none absolute inset-0 rounded-lg bg-white/15 animate-sidebar-icon-glow"
          aria-hidden="true"
        />
      )}
      <Icon
        className={cn(
          "relative z-[1] h-4 w-4 will-change-transform",
          !isActive && "transition-transform duration-300 group-hover:scale-105",
          isActive && `sidebar-icon-motion-${animation}`,
        )}
        strokeWidth={isActive ? 2.25 : 2}
        aria-hidden="true"
      />
    </span>
  );
}
