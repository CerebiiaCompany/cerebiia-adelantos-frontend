import * as React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export const primaryActionButtonClassName =
  "btn-login inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary font-semibold text-primary-foreground shadow-md";

type PrimaryActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  showArrow?: boolean;
  loading?: boolean;
  loadingText?: React.ReactNode;
};

export function PrimaryActionButton({
  asChild = false,
  className,
  children,
  showArrow = true,
  loading = false,
  loadingText,
  disabled,
  type,
  ...props
}: PrimaryActionButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      type={asChild ? undefined : type ?? "button"}
      className={cn(
        primaryActionButtonClassName,
        loading && "animate-pulse-glow",
        className,
      )}
      disabled={asChild ? undefined : disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText ?? children}
        </>
      ) : (
        <>
          {children}
          {showArrow && !asChild ? (
            <ArrowRight className="btn-arrow h-4 w-4 shrink-0" />
          ) : null}
        </>
      )}
    </Comp>
  );
}
