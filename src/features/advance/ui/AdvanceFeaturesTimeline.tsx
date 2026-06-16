import { Clock, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdvanceTimelineIconNode,
  AdvanceTimelineShell,
  AdvanceTimelineTrack,
} from "./AdvanceTimelineParts";

const FEATURES = [
  { icon: Zap, title: "Instantáneo", desc: "Recibe en minutos" },
  { icon: Shield, title: "Seguro", desc: "Datos encriptados" },
  { icon: Clock, title: "Sin trámites", desc: "1 clic y listo" },
] as const;

export function AdvanceFeaturesTimeline() {
  return (
    <AdvanceTimelineShell>
      <div
        className={cn(
          "relative mb-3 hidden gap-y-3 sm:grid",
          "sm:grid-cols-[1fr_minmax(2rem,3fr)_1fr_minmax(2rem,3fr)_1fr]",
          "sm:items-center",
        )}
      >
        <div className="col-start-1 row-start-1 flex justify-center">
          <AdvanceTimelineIconNode icon={FEATURES[0].icon} />
        </div>
        <AdvanceTimelineTrack className="col-start-2 row-start-1" />
        <div className="col-start-3 row-start-1 flex justify-center">
          <AdvanceTimelineIconNode icon={FEATURES[1].icon} />
        </div>
        <AdvanceTimelineTrack className="col-start-4 row-start-1" />
        <div className="col-start-5 row-start-1 flex justify-center">
          <AdvanceTimelineIconNode icon={FEATURES[2].icon} />
        </div>

        {FEATURES.map((feature, index) => (
          <div
            key={feature.title}
            className={cn(
              "row-start-2 px-1 text-center",
              index === 0 && "col-start-1",
              index === 1 && "col-start-3",
              index === 2 && "col-start-5",
            )}
          >
            <p className="text-sm font-semibold text-foreground">
              {feature.title}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      <ol className="relative flex flex-col sm:hidden">
        {FEATURES.map((feature, index) => (
          <li key={feature.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <AdvanceTimelineIconNode icon={feature.icon} />
              {index < FEATURES.length - 1 ? (
                <AdvanceTimelineTrack orientation="vertical" className="my-1.5" />
              ) : null}
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-foreground">
                {feature.title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {feature.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </AdvanceTimelineShell>
  );
}
