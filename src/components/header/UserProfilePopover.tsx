import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserProfilePanel } from "@/components/header/UserProfilePanel";
import { UserProfileAccountPanel } from "@/components/header/profile/UserProfileAccountPanel";
import { UserProfileSettingsPanel } from "@/components/header/profile/UserProfileSettingsPanel";
import {
  HEADER_POPOVER_COLLISION_PADDING,
  headerPopoverContentClass,
} from "@/components/header/headerPopoverStyles";
import { DEMO_EMPLOYEE_PROFILE } from "@/shared/config/demoEmployeeProfile";
import { cn } from "@/lib/utils";

type ProfileView = "profile" | "account" | "settings";

export function UserProfilePopover() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [view, setView] = useState<ProfileView>("profile");

  const handleOpenChange = (open: boolean) => {
    setPopoverOpen(open);
    if (!open) {
      setView("profile");
    }
  };

  return (
    <Popover open={popoverOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Ver perfil"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary shadow-sm shadow-primary/20 ring-2 ring-primary/15 transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <span className="text-xs font-semibold text-primary-foreground">
            {DEMO_EMPLOYEE_PROFILE.initials}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={10}
        collisionPadding={HEADER_POPOVER_COLLISION_PADDING}
        className={cn(
          headerPopoverContentClass(view === "settings"),
          "rounded-2xl border-slate-100 bg-white",
        )}
      >
        {view === "profile" ? (
          <UserProfilePanel
            onOpenAccount={() => setView("account")}
            onOpenSettings={() => setView("settings")}
          />
        ) : view === "account" ? (
          <UserProfileAccountPanel onBack={() => setView("profile")} />
        ) : (
          <UserProfileSettingsPanel onBack={() => setView("profile")} />
        )}
      </PopoverContent>
    </Popover>
  );
}
