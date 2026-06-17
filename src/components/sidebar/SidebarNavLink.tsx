import { NavLink, useMatch } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { SidebarNavIcon } from "./SidebarNavIcon";
import type { SidebarNavItemConfig } from "./sidebarNavConfig";

interface SidebarNavLinkProps {
  item: SidebarNavItemConfig;
  collapsed?: boolean;
}

export function SidebarNavLink({ item, collapsed = false }: SidebarNavLinkProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const isActive = Boolean(
    useMatch({ path: item.url, end: item.end ?? item.url === "/" }),
  );

  return (
    <NavLink
      to={item.url}
      end={item.end ?? item.url === "/"}
      onClick={() => {
        if (isMobile) {
          setOpenMobile(false);
        }
      }}
      className={cn(
        "app-sidebar-nav-link group relative flex items-center text-muted-foreground",
        collapsed
          ? "app-sidebar-nav-link--collapsed mx-auto h-10 w-10 shrink-0 justify-center p-0"
          : "w-full gap-3 px-3 py-2.5",
        isActive && "app-sidebar-nav-link--active",
      )}
    >
      <SidebarNavIcon
        icon={item.icon}
        animation={item.animation}
        isActive={isActive}
      />

      {!collapsed && (
        <span className="truncate text-[0.8125rem] tracking-tight">{item.title}</span>
      )}
    </NavLink>
  );
}
