import { ListChecks } from "lucide-react";
import type { AuthBrandGuideStep } from "./registerBrandPanelContent";

type AuthMobileBrandGuideProps = {
  title: string;
  summary: string;
  steps: AuthBrandGuideStep[];
};

export function AuthMobileBrandGuide({
  title,
  summary,
  steps,
}: AuthMobileBrandGuideProps) {
  if (steps.length === 0) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-primary/12 bg-gradient-to-br from-primary/[0.07] via-background to-background shadow-sm lg:hidden">
      <div className="border-b border-primary/10 bg-primary/[0.04] px-4 py-3">
        <div className="flex items-center gap-2 text-primary">
          <ListChecks className="h-4 w-4 shrink-0" strokeWidth={2.25} />
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Guía del paso
          </span>
        </div>
        <h2 className="mt-1.5 font-display text-lg font-bold leading-snug text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {summary}
        </p>
      </div>

      <div className="px-4 py-3">
        <ol className="space-y-3">
          {steps.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.title} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="pt-1 text-sm font-medium leading-snug text-foreground">
                  {item.title}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
