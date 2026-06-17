import { PanelLeftClose } from "lucide-react";
import { useLocation } from "react-router-dom";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidebarNavLink } from "@/components/sidebar/SidebarNavLink";
import { SidebarLogoutButton } from "@/components/sidebar/SidebarLogoutButton";
import { SIDEBAR_MAIN_ITEMS } from "@/components/sidebar/sidebarNavConfig";

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = !isMobile && state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="app-sidebar border-r-0">
      <SidebarRail />
      <SidebarHeader className="shrink-0 px-3 pb-0 pt-4">
        <div
          className={cn(
            "flex items-center",
            collapsed && !isMobile ? "justify-center px-0" : "gap-3 px-1.5",
            isMobile && "justify-between",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="app-sidebar-brand-mark">
              <span>A</span>
            </div>
            {(!collapsed || isMobile) && (
              <div className="min-w-0 animate-fade-in">
                <p className="app-sidebar-brand-title text-gradient">
                  AdeCerebiia
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/90">
                  Panel empleado
                </p>
              </div>
            )}
          </div>
          {isMobile && (
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
              Principal
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn("gap-0.5", collapsed && "items-center")}>
              {SIDEBAR_MAIN_ITEMS.map((item) => {
                const isActive = Boolean(
                  location.pathname === item.url ||
                    (item.url !== "/" &&
                      location.pathname.startsWith(item.url)),
                );

                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={cn(collapsed && "flex w-full justify-center")}
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "sidebar-menu-link h-auto p-0 hover:bg-transparent data-[active=true]:bg-transparent",
                        collapsed && "sidebar-menu-link--collapsed",
                      )}
                    >
                      <SidebarNavLink item={item} collapsed={collapsed} />
                    </SidebarMenuButton>
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
    </Sidebar>
  );
}
