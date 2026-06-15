import { forwardRef } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ProfilePasswordInputProps
  extends React.ComponentPropsWithoutRef<typeof Input> {
  show: boolean;
  onToggleShow: () => void;
  toggleLabel: string;
}

export const ProfilePasswordInput = forwardRef<
  HTMLInputElement,
  ProfilePasswordInputProps
>(({ show, onToggleShow, toggleLabel, disabled, className, ...field }, ref) => (
  <div className="relative rounded-xl">
    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      ref={ref}
      type={show ? "text" : "password"}
      disabled={disabled}
      className={cn(
        "h-10 rounded-xl border-border/80 bg-background/80 pl-10 pr-10 text-sm transition-all duration-300 focus-visible:ring-primary/30 disabled:opacity-60",
        className,
      )}
      {...field}
    />
    <button
      type="button"
      disabled={disabled}
      onClick={onToggleShow}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      aria-label={toggleLabel}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  </div>
));

ProfilePasswordInput.displayName = "ProfilePasswordInput";
