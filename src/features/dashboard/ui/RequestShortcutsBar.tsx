import { useEffect, useRef, useState } from "react";
import { FileText, History, Zap, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/shared/config/routes";

type RequestShortcut = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

const REQUEST_SHORTCUTS: RequestShortcut[] = [
  {
    id: "quick-advance",
    label: "Adelanto Rapido",
    href: ROUTES.employee.adelanto,
    icon: Zap,
  },
  {
    id: "my-advances",
    label: "Mis adelantos",
    href: ROUTES.employee.misAdelantos,
    icon: History,
  },
  {
    id: "payroll",
    label: "Ver mi Nómina",
    href: ROUTES.employee.control,
    icon: FileText,
  },
];

const AUTOPLAY_INTERVAL_MS = 4000;

type RequestShortcutsBarProps = {
  className?: string;
};

function ShortcutLink({
  shortcut,
  className,
}: {
  shortcut: RequestShortcut;
  className?: string;
}) {
  const Icon = shortcut.icon;

  return (
    <Link
      to={shortcut.href}
      className={cn(
        "group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30",
        className,
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50/60 p-2 transition-transform duration-200 group-hover:-translate-y-0.5">
        <Icon className="h-4 w-4 text-indigo-600" strokeWidth={2.25} aria-hidden />
      </span>
      <span className="whitespace-nowrap text-left text-xs font-medium leading-tight text-slate-700">
        {shortcut.label}
      </span>
    </Link>
  );
}

function DesktopShortcutsBar({ shortcuts }: { shortcuts: RequestShortcut[] }) {
  return (
    <div className="hidden min-w-0 md:block md:w-full lg:w-auto">
      <div className="flex min-w-max items-center gap-2 rounded-xl border border-slate-100 bg-white p-2 lg:min-w-0">
        {shortcuts.map((shortcut, index) => {
          const isLast = index === shortcuts.length - 1;

          return (
            <div key={shortcut.id} className="flex items-center">
              <ShortcutLink shortcut={shortcut} />

              {!isLast ? (
                <div
                  className="mx-1 h-8 shrink-0 border-r border-slate-200"
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MobileShortcutsCarousel({ shortcuts }: { shortcuts: RequestShortcut[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isPausedRef = useRef(false);

  useEffect(() => {
    if (!api) {
      return;
    }

    const handleSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    handleSelect();
    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const timer = window.setInterval(() => {
      if (isPausedRef.current) {
        return;
      }

      api.scrollNext();
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [api]);

  const pauseAutoplay = () => {
    isPausedRef.current = true;
  };

  const resumeAutoplay = () => {
    isPausedRef.current = false;
  };

  return (
    <div
      className="w-full md:hidden"
      onPointerDown={pauseAutoplay}
      onPointerUp={resumeAutoplay}
      onPointerLeave={resumeAutoplay}
      onPointerCancel={resumeAutoplay}
    >
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
          duration: 28,
          containScroll: "trimSnaps",
        }}
        className="w-full"
        aria-label="Atajos de solicitud"
      >
        <div className="rounded-xl border border-slate-100 bg-white p-2 shadow-sm">
          <CarouselContent className="-ml-2">
            {shortcuts.map((shortcut) => (
              <CarouselItem
                key={shortcut.id}
                className="basis-[84%] pl-2 sm:basis-[76%]"
              >
                <ShortcutLink shortcut={shortcut} className="w-full" />
              </CarouselItem>
            ))}
          </CarouselContent>

          <div
            className="mt-2 flex items-center justify-center gap-1.5"
            aria-hidden
          >
            {shortcuts.map((shortcut, index) => (
              <span
                key={shortcut.id}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === selectedIndex
                    ? "w-4 bg-indigo-600"
                    : "w-1.5 bg-slate-200",
                )}
              />
            ))}
          </div>
        </div>
      </Carousel>
    </div>
  );
}

export function RequestShortcutsBar({ className }: RequestShortcutsBarProps) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:gap-4",
        className,
      )}
    >
      <span className="hidden shrink-0 font-semibold text-slate-800 md:inline">
        Atajos de Solicitud
      </span>

      <MobileShortcutsCarousel shortcuts={REQUEST_SHORTCUTS} />
      <DesktopShortcutsBar shortcuts={REQUEST_SHORTCUTS} />
    </div>
  );
}
