import { useEffect, useRef, useState } from "react";

export interface UseAnimatedNumberOptions {
  duration?: number;
  enabled?: boolean;
  decimals?: number;
  delay?: number;
  /** Al cambiar, reinicia la animación desde 0 hasta el target. */
  restartKey?: number;
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export function useAnimatedNumber(
  target: number,
  {
    duration = 850,
    enabled = true,
    decimals = 0,
    delay = 0,
    restartKey,
  }: UseAnimatedNumberOptions = {},
) {
  const [displayValue, setDisplayValue] = useState(enabled ? 0 : target);
  const displayRef = useRef(displayValue);
  displayRef.current = displayValue;

  useEffect(() => {
    if (!enabled) {
      setDisplayValue(target);
      return;
    }

    let frameId = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const startAnimation = () => {
      const from =
        restartKey != null && restartKey > 0 ? 0 : displayRef.current;
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = easeOutQuart(progress);
        const next = from + (target - from) * eased;
        const rounded =
          decimals > 0
            ? Number(next.toFixed(decimals))
            : Math.round(next);

        setDisplayValue(rounded);

        if (progress < 1) {
          frameId = requestAnimationFrame(tick);
        } else {
          setDisplayValue(target);
        }
      };

      frameId = requestAnimationFrame(tick);
    };

    timeoutId = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(frameId);
    };
  }, [target, duration, enabled, decimals, delay, restartKey]);

  return displayValue;
}
