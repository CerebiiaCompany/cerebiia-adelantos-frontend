import { cn } from "@/lib/utils";
import type { AuthBrandGuideStep } from "./registerBrandPanelContent";

const staggerClasses = [
  "stagger-3",
  "stagger-4",
  "stagger-5",
  "stagger-6",
  "stagger-6",
] as const;

type AuthBrandGuideListProps = {
  steps: AuthBrandGuideStep[];
  variant?: "full" | "compact";
  className?: string;
};

export function AuthBrandGuideList({
  steps,
  variant = "full",
  className,
}: AuthBrandGuideListProps) {
  const isCompact = variant === "compact";

  return (
    <ol className={cn(isCompact ? "space-y-3" : "space-y-4", className)}>
      {steps.map((item, index) => {
        const Icon = item.icon;

        return (
          <li
            key={item.title}
            className={cn(
              "animate-stagger-up flex items-start",
              isCompact ? "gap-3" : "gap-4",
              staggerClasses[Math.min(index, staggerClasses.length - 1)],
            )}
          >
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20",
                isCompact ? "h-9 w-9" : "h-10 w-10",
              )}
            >
              <Icon
                className={cn(
                  "text-primary-foreground",
                  isCompact ? "h-4 w-4" : "h-[1.125rem] w-[1.125rem]",
                )}
                strokeWidth={2}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={cn(
                  "font-display font-semibold leading-snug",
                  isCompact ? "text-sm" : "text-[0.9375rem] xl:text-base",
                )}
              >
                {item.title}
              </p>
              {!isCompact && item.description ? (
                <p className="mt-1 text-sm leading-relaxed text-primary-foreground/72">
                  {item.description}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
