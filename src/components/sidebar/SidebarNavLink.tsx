import { NavLink, useMatch } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SidebarNavIcon } from "./SidebarNavIcon";
import type { SidebarNavItemConfig } from "./sidebarNavConfig";

interface SidebarNavLinkProps {
  item: SidebarNavItemConfig;
  collapsed?: boolean;
}

export function SidebarNavLink({ item, collapsed = false }: SidebarNavLinkProps) {
  const isActive = Boolean(
    useMatch({ path: item.url, end: item.end ?? item.url === "/" }),
  );

  return (
    <NavLink
      to={item.url}
      end={item.end ?? item.url === "/"}
      className={cn(
        "group relative flex items-center rounded-lg transition-colors duration-300 ease-out",
        collapsed
          ? "mx-auto h-9 w-9 shrink-0 justify-center p-0"
          : "w-full gap-3.5 px-3.5 py-2.5",
        isActive
          ? "bg-primary/[0.08] font-medium text-primary"
          : "text-muted-foreground hover:bg-primary/[0.06] hover:text-foreground",
      )}
    >
      <SidebarNavIcon
        icon={item.icon}
        animation={item.animation}
        isActive={isActive}
      />

      {!collapsed && (
        <span className="truncate text-sm tracking-tight">{item.title}</span>
      )}
    </NavLink>
  );
}
