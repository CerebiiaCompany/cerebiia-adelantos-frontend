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
        "group relative flex items-center overflow-visible rounded-lg transition-colors duration-300 ease-out",
        collapsed
          ? "mx-auto h-9 w-9 shrink-0 justify-center p-0 hover:bg-transparent"
          : "w-full gap-2.5 px-2 py-1.5 hover:bg-primary/[0.06] hover:pl-2.5",
        isActive &&
          !collapsed &&
          "bg-gradient-to-r from-primary/14 via-primary/8 to-transparent font-semibold text-primary shadow-sm ring-1 ring-primary/15",
        isActive && collapsed && "text-primary",
        !isActive && "text-muted-foreground hover:text-foreground",
      )}
    >
      {isActive && !collapsed && (
        <span
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-primary animate-sidebar-nav-indicator"
          aria-hidden="true"
        />
      )}

      <SidebarNavIcon
        icon={item.icon}
        animation={item.animation}
        isActive={isActive}
        collapsed={collapsed}
      />

      {!collapsed && (
        <span className="truncate text-sm tracking-tight">{item.title}</span>
      )}
    </NavLink>
  );
}
