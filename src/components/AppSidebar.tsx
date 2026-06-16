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
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { SidebarNavLink } from "@/components/sidebar/SidebarNavLink";
import { SidebarLogoutButton } from "@/components/sidebar/SidebarLogoutButton";
import {
  SIDEBAR_MAIN_ITEMS,
} from "@/components/sidebar/sidebarNavConfig";

export function AppSidebar() {
  const { state, isMobile } = useSidebar();
  const collapsed = !isMobile && state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-primary/10"
    >
      <SidebarHeader className="shrink-0 px-2 pb-2 pt-3">
        <div className="p-2">
          <div
            className={cn(
              "flex items-center",
              collapsed ? "justify-center" : "gap-3 px-3 py-2",
            )}
          >
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-lg bg-gradient-primary shadow-sm shadow-primary/20 transition-transform duration-300 hover:scale-105",
                collapsed ? "aspect-square h-9 w-9" : "h-8 w-8",
              )}
            >
              <span className="font-display text-xs font-bold text-primary-foreground">
                A
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0 animate-fade-in">
                <p className="font-display text-base font-bold leading-none tracking-tight text-foreground">
                  AdeCerebiia
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-primary/80">
                  Panel empleado
                </p>
              </div>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent
        className={cn(
          "min-h-0 flex-1",
          collapsed ? "!overflow-visible px-2" : "px-2",
        )}
      >
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary/70">
              Principal
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn("gap-1", collapsed && "items-center")}>
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
          "sticky bottom-0 z-10 border-t border-primary/10 bg-background/95 px-2 pb-3 pt-2 backdrop-blur-md",
        )}
      >
        <SidebarMenu className={cn("gap-1", collapsed && "items-center")}>
          <SidebarLogoutButton collapsed={collapsed} />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
