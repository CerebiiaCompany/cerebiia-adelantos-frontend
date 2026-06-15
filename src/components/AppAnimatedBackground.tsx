import { cn } from "@/lib/utils";

interface WaveLayerProps {
  className?: string;
  animationClass?: string;
}

function WaveLayer({
  className,
  animationClass = "animate-app-wave-drift",
}: WaveLayerProps) {
  return (
    <svg
      className={cn(
        "absolute bottom-0 left-0 block h-full w-[200%]",
        animationClass,
        className,
      )}
      viewBox="0 0 2880 280"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M0,128 C360,48 720,208 1080,128 C1440,48 1800,208 2160,128 C2520,48 2880,208 2880,128 L2880,280 L0,280 Z"
      />
    </svg>
  );
}

export function AppAnimatedBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/[0.05]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-accent/[0.04] to-primary/[0.07]" />

      <div className="animate-blob absolute -left-24 top-[6%] h-80 w-80 rounded-full bg-primary/[0.14] blur-3xl" />
      <div className="animate-blob-delayed absolute -right-20 top-[18%] h-96 w-96 rounded-full bg-accent/[0.12] blur-3xl" />
      <div className="animate-blob absolute left-[35%] top-[42%] h-64 w-64 rounded-full bg-primary/[0.09] blur-3xl [animation-delay:2s]" />
      <div className="animate-blob absolute -bottom-16 right-[28%] h-72 w-72 rounded-full bg-accent/[0.1] blur-3xl [animation-delay:4s]" />

      <div className="app-panel-dot-grid absolute inset-0 opacity-45" />

      <div className="absolute inset-x-0 bottom-0 h-[40vh] min-h-[210px]">
        <WaveLayer
          className="text-primary/[0.2]"
          animationClass="animate-app-wave-drift-slow"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[32vh] min-h-[170px]">
        <WaveLayer
          className="text-accent/[0.16]"
          animationClass="animate-app-wave-drift-medium"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[24vh] min-h-[130px]">
        <WaveLayer
          className="text-primary/[0.12]"
          animationClass="animate-app-wave-drift-fast"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/80 via-background/30 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/90 to-transparent" />
    </div>
  );
}
