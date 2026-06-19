import { PanelLeftClose } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useAuthAccess } from "@/features/auth";
import { canAccessModule } from "@/shared/config/moduleAccess";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
  useSidebarLayout,
} from "@/components/ui/sidebar";
import { AppTooltip } from "@/components/ui/app-tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidebarNavLink } from "@/components/sidebar/SidebarNavLink";
import { SidebarLogoutButton } from "@/components/sidebar/SidebarLogoutButton";
import { EMPLOYEE_SIDEBAR_ITEMS, type SidebarNavItemConfig } from "@/components/sidebar/sidebarNavConfig";

type AppSidebarProps = {
  brandSubtitle?: string;
  navItems?: SidebarNavItemConfig[];
  sectionLabel?: string;
};

export function AppSidebar({
  brandSubtitle = "Panel empleado",
  navItems = EMPLOYEE_SIDEBAR_ITEMS,
  sectionLabel = "Principal",
}: AppSidebarProps = {}) {
  return (
    <Sidebar collapsible="icon" className="app-sidebar border-r-0">
      <AppSidebarContent
        brandSubtitle={brandSubtitle}
        navItems={navItems}
        sectionLabel={sectionLabel}
      />
    </Sidebar>
  );
}

function AppSidebarContent({
  brandSubtitle,
  navItems,
  sectionLabel,
}: Required<AppSidebarProps>) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const layout = useSidebarLayout();
  const { appRole } = useAuthAccess();
  const isDrawer = layout === "drawer";
  const collapsed = layout === "panel" && state === "collapsed";
  const location = useLocation();

  const visibleNavItems = useMemo(
    () =>
      navItems.filter(
        (item) => appRole && canAccessModule(appRole, item.moduleId),
      ),
    [appRole, navItems],
  );

  return (
    <>
      {layout === "panel" && <SidebarRail />}
      <SidebarHeader className="shrink-0 px-3 pb-0 pt-4">
        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center px-0" : "gap-3 px-1.5",
            isDrawer && "justify-between",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="app-sidebar-brand-mark">
              <span>A</span>
            </div>
            {(!collapsed || isDrawer) && (
              <div className="min-w-0 animate-fade-in">
                <p className="app-sidebar-brand-title text-gradient">
                  AdeCerebiia
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/90">
                  {brandSubtitle}
                </p>
              </div>
            )}
          </div>
          {isDrawer && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Cerrar menú"
              className="h-9 w-9 shrink-0 rounded-lg text-foreground/70 hover:bg-primary/5 hover:text-primary"
              onClick={() => setOpenMobile(false)}
            >
              <PanelLeftClose className="h-5 w-5" strokeWidth={2.25} />
            </Button>
          )}
        </div>
        <div className="app-sidebar-header-divider mx-1.5 mt-4" aria-hidden />
      </SidebarHeader>

      <SidebarContent
        className={cn(
          "min-h-0 flex-1 pt-3",
          collapsed ? "!overflow-visible px-2" : "px-3",
        )}
      >
        <SidebarGroup className="gap-2">
          {!collapsed && (
            <SidebarGroupLabel className="app-sidebar-section-label mb-1 h-auto p-0">
              {sectionLabel}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn("gap-0.5", collapsed && "items-center")}>
              {visibleNavItems.map((item) => {
                const isActive = Boolean(
                  location.pathname === item.url ||
                    (!item.end && location.pathname.startsWith(item.url)),
                );

                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={cn(collapsed && "flex w-full justify-center")}
                  >
                    {item.tooltip && !isMobile ? (
                      <AppTooltip
                        text={item.tooltip}
                        side={collapsed ? "right" : "bottom"}
                        align="center"
                        sideOffset={collapsed ? 12 : 8}
                      >
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "sidebar-menu-link h-auto p-0 hover:bg-transparent data-[active=true]:bg-transparent",
                            collapsed && "sidebar-menu-link--collapsed",
                          )}
                        >
                          <SidebarNavLink item={item} collapsed={collapsed} />
                        </SidebarMenuButton>
                      </AppTooltip>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={collapsed && !item.tooltip ? item.title : undefined}
                        className={cn(
                          "sidebar-menu-link h-auto p-0 hover:bg-transparent data-[active=true]:bg-transparent",
                          collapsed && "sidebar-menu-link--collapsed",
                        )}
                      >
                        <SidebarNavLink item={item} collapsed={collapsed} />
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter
        className={cn(
          "app-sidebar-footer sticky bottom-0 z-10 px-3 pb-4 pt-3",
        )}
      >
        <SidebarMenu className={cn("gap-0.5", collapsed && "items-center")}>
          <SidebarLogoutButton collapsed={collapsed} />
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
