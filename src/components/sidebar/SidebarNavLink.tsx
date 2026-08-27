import { forwardRef } from "react";
import { NavLink, useMatch } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { NavAlertDot } from "@/components/sidebar/NavAlertDot";
import { SidebarNavIcon } from "./SidebarNavIcon";
import type { SidebarNavItemConfig } from "./sidebarNavConfig";

interface SidebarNavLinkProps {
  item: SidebarNavItemConfig;
  collapsed?: boolean;
  badgeCount?: number;
  badgeLabel?: string;
}

export const SidebarNavLink = forwardRef<HTMLAnchorElement, SidebarNavLinkProps>(
  function SidebarNavLink(
    { item, collapsed = false, badgeCount = 0, badgeLabel },
    ref,
  ) {
    const { isMobile, setOpenMobile, setOpen } = useSidebar();
    const isActive = Boolean(
      useMatch({ path: item.url, end: item.end ?? item.url === "/" }),
    );

    return (
      <NavLink
        ref={ref}
        to={item.url}
        end={item.end ?? item.url === "/"}
        onClick={() => {
          setOpenMobile(false);
        }}
        className={cn(
          "app-sidebar-nav-link group relative flex items-center text-muted-foreground",
          collapsed
            ? "app-sidebar-nav-link--collapsed mx-auto h-11 w-11 shrink-0 justify-center p-0"
            : "w-full gap-3.5 px-3.5 py-3",
          isActive && "app-sidebar-nav-link--active",
        )}
      >
        <span className="relative inline-flex shrink-0">
          <SidebarNavIcon
            icon={item.icon}
            animation={item.animation}
            isActive={isActive}
          />
          {collapsed && badgeCount > 0 ? (
            <NavAlertDot
              count={badgeCount}
              label={badgeLabel}
              className="absolute -right-1 -top-0.5"
            />
          ) : null}
        </span>

        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-sm tracking-tight">
              {item.title}
            </span>
            {badgeCount > 0 ? (
              <NavAlertDot count={badgeCount} label={badgeLabel} />
            ) : null}
          </>
        )}
      </NavLink>
    );
  },
);

SidebarNavLink.displayName = "SidebarNavLink";
