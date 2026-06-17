import type { LucideIcon } from "lucide-react";
import { CloudSun, MoonStar, Sunrise } from "lucide-react";

export type DayPeriod = "morning" | "afternoon" | "night";

export type TimeBasedGreeting = {
  period: DayPeriod;
  title: string;
  description: string;
  icon: LucideIcon;
  iconContainerClassName: string;
  iconClassName: string;
  iconAnimationClassName: string;
};

const GREETING_BY_PERIOD = {
  morning: {
    greeting: "Buenos días",
    description: "Un buen momento para revisar tus finanzas",
    icon: Sunrise,
    iconContainerClassName:
      "rounded-full bg-primary/15 ring-4 ring-primary/10",
    iconClassName: "text-primary",
    iconAnimationClassName: "greeting-icon-sun-glow",
  },
  afternoon: {
    greeting: "Buenas tardes",
    description: "Tu resumen financiero de hoy",
    icon: CloudSun,
    iconContainerClassName:
      "rounded-full bg-[hsl(260_70%_55%_/_0.12)] ring-4 ring-[hsl(260_70%_55%_/_0.1)]",
    iconClassName: "text-[hsl(260_70%_50%)]",
    iconAnimationClassName: "greeting-icon-sunset-hide",
  },
  night: {
    greeting: "Buenas noches",
    description: "Cierra el día con tus números al día",
    icon: MoonStar,
    iconContainerClassName:
      "rounded-full bg-primary/15 ring-4 ring-primary/10",
    iconClassName: "text-primary",
    iconAnimationClassName: "greeting-icon-moon-float",
  },
} as const satisfies Record<
  DayPeriod,
  Omit<TimeBasedGreeting, "period" | "title">
>;

export function getDayPeriod(hour: number): DayPeriod {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 19) return "afternoon";
  return "night";
}

export function getFirstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "allí";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

export function getTimeBasedGreeting(
  date: Date = new Date(),
  fullName?: string,
): TimeBasedGreeting {
  const period = getDayPeriod(date.getHours());
  const config = GREETING_BY_PERIOD[period];
  const firstName = fullName ? getFirstName(fullName) : "allí";

  return {
    period,
    title: `${config.greeting}, ${firstName}`,
    description: config.description,
    icon: config.icon,
    iconContainerClassName: config.iconContainerClassName,
    iconClassName: config.iconClassName,
    iconAnimationClassName: config.iconAnimationClassName,
  };
}
