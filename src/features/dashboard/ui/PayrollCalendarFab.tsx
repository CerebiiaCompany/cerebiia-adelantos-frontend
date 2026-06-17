import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const FAB_STORAGE_KEY = "payroll-calendar-fab-position";
const HEADER_HEIGHT = 56;
const VIEWPORT_MARGIN = 16;
const DRAG_THRESHOLD_PX = 6;
const FAB_ESTIMATED_SIZE = 56;

type FabPosition = {
  right: number;
  top: number;
};

type PayrollCalendarFabProps = {
  onClick: () => void;
  daysUntilPayment?: number;
  className?: string;
};

function readStoredPosition(): FabPosition | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(FAB_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as FabPosition & { x?: number; y?: number };

    if (
      typeof parsed.right === "number" &&
      typeof parsed.top === "number" &&
      Number.isFinite(parsed.right) &&
      Number.isFinite(parsed.top)
    ) {
      return { right: parsed.right, top: parsed.top };
    }

    if (
      typeof parsed.x === "number" &&
      typeof parsed.y === "number" &&
      Number.isFinite(parsed.x) &&
      Number.isFinite(parsed.y)
    ) {
      return {
        right: window.innerWidth - parsed.x - FAB_ESTIMATED_SIZE,
        top: parsed.y,
      };
    }

    return null;
  } catch {
    return null;
  }
}

function getDefaultPosition(): FabPosition {
  return {
    right: VIEWPORT_MARGIN,
    top: HEADER_HEIGHT + 12,
  };
}

function clampPosition(
  position: FabPosition,
  width: number,
  height: number,
): FabPosition {
  if (typeof window === "undefined") return position;

  const minRight = VIEWPORT_MARGIN;
  const maxRight = Math.max(
    minRight,
    window.innerWidth - width - VIEWPORT_MARGIN,
  );
  const minTop = HEADER_HEIGHT + 8;
  const maxTop = Math.max(
    minTop,
    window.innerHeight - height - VIEWPORT_MARGIN,
  );

  return {
    right: Math.min(maxRight, Math.max(minRight, position.right)),
    top: Math.min(maxTop, Math.max(minTop, position.top)),
  };
}

function resolveInitialPosition(): FabPosition {
  return clampPosition(
    readStoredPosition() ?? getDefaultPosition(),
    FAB_ESTIMATED_SIZE,
    FAB_ESTIMATED_SIZE,
  );
}

export function PayrollCalendarFab({
  onClick,
  daysUntilPayment,
  className,
}: PayrollCalendarFabProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef({
    pointerId: -1,
    didMove: false,
    startPointerX: 0,
    startPointerY: 0,
    originRight: 0,
    originTop: 0,
  });

  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<FabPosition>(resolveInitialPosition);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const persistPosition = useCallback((next: FabPosition) => {
    const clamped = clampPosition(
      next,
      buttonRef.current?.offsetWidth || FAB_ESTIMATED_SIZE,
      buttonRef.current?.offsetHeight || FAB_ESTIMATED_SIZE,
    );
    setPosition(clamped);
    window.localStorage.setItem(FAB_STORAGE_KEY, JSON.stringify(clamped));
  }, []);

  const syncPosition = useCallback((next?: FabPosition) => {
    const element = buttonRef.current;
    const width = element?.offsetWidth || FAB_ESTIMATED_SIZE;
    const height = element?.offsetHeight || FAB_ESTIMATED_SIZE;
    const base = next ?? readStoredPosition() ?? getDefaultPosition();
    persistPosition(clampPosition(base, width, height));
  }, [persistPosition]);

  useLayoutEffect(() => {
    if (!mounted) return;
    syncPosition();
  }, [mounted, syncPosition]);

  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => {
      setPosition((current) => {
        const clamped = clampPosition(
          current,
          buttonRef.current?.offsetWidth || FAB_ESTIMATED_SIZE,
          buttonRef.current?.offsetHeight || FAB_ESTIMATED_SIZE,
        );
        window.localStorage.setItem(FAB_STORAGE_KEY, JSON.stringify(clamped));
        return clamped;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mounted]);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragRef.current = {
      pointerId: event.pointerId,
      didMove: false,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      originRight: position.right,
      originTop: position.top,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId || !buttonRef.current) return;

    const deltaX = event.clientX - drag.startPointerX;
    const deltaY = event.clientY - drag.startPointerY;

    if (!drag.didMove && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) {
      return;
    }

    drag.didMove = true;

    setPosition(
      clampPosition(
        {
          right: drag.originRight - deltaX,
          top: drag.originTop + deltaY,
        },
        buttonRef.current.offsetWidth,
        buttonRef.current.offsetHeight,
      ),
    );
  };

  const finishDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);

    const element = buttonRef.current;
    if (element) {
      setPosition((current) => {
        const clamped = clampPosition(
          current,
          element.offsetWidth,
          element.offsetHeight,
        );
        window.localStorage.setItem(FAB_STORAGE_KEY, JSON.stringify(clamped));
        return clamped;
      });
    }

    if (!drag.didMove) {
      onClick();
    }

    dragRef.current.pointerId = -1;
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <button
      ref={buttonRef}
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      aria-label="Consultar calendario de nómina. Arrastra para mover."
      style={{
        right: position.right,
        top: position.top,
        left: "auto",
      }}
      className={cn(
        "group/payroll-fab fixed z-[60] flex touch-none select-none flex-row items-center justify-end gap-0 overflow-hidden rounded-full border border-primary/20 bg-background/90 p-1 shadow-[0_8px_32px_hsl(var(--primary)/0.22)] backdrop-blur-md animate-fade-in",
        isDragging
          ? "cursor-grabbing scale-[1.02] border-primary/35 shadow-[0_14px_44px_hsl(var(--primary)/0.32)] transition-none"
          : "cursor-grab transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_12px_40px_hsl(var(--primary)/0.28)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <span
        className={cn(
          "max-w-0 overflow-hidden whitespace-nowrap pr-0 text-right text-sm font-semibold text-foreground opacity-0 transition-all duration-300",
          !isDragging &&
            "group-hover/payroll-fab:max-w-[11rem] group-hover/payroll-fab:pr-3 group-hover/payroll-fab:opacity-100",
          "group-focus-visible/payroll-fab:max-w-[11rem] group-focus-visible/payroll-fab:pr-3 group-focus-visible/payroll-fab:opacity-100",
        )}
      >
        Consultar calendario
      </span>

      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center sm:h-12 sm:w-12">
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full bg-primary/20",
            !isDragging && "animate-pulse-glow",
          )}
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-gradient-primary opacity-90"
        />
        <span className="relative inline-flex items-center justify-center stat-card-icon-motion-calendar text-primary-foreground">
          <Calendar className="h-5 w-5" strokeWidth={2.25} />
        </span>
        {typeof daysUntilPayment === "number" && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-accent px-1 text-[10px] font-bold leading-none text-accent-foreground shadow-sm">
            {daysUntilPayment}
          </span>
        )}
      </span>
    </button>,
    document.body,
  );
}
