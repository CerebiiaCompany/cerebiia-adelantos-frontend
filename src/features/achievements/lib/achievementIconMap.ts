import type { LucideIcon } from "lucide-react";
import {
  Award,
  Clock,
  Coins,
  Crown,
  Flame,
  Gem,
  Medal,
  PiggyBank,
  Rocket,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Timer,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";

export interface AchievementIconInfo {
  Icon: LucideIcon;
  color: string;
  iconName: string;
}

const DEFAULT_COLOR_MAP: Record<string, string> = {
  rocket: "#2563EB", // Azul Eléctrico
  wallet: "#10B981", // Verde Esmeralda
  star: "#F59E0B", // Dorado Ámbar
  trophy: "#F59E0B", // Dorado Ámbar
  coins: "#EC4899", // Rosa Neón
  "piggy-bank": "#EC4899", // Rosa Neón
  piggybank: "#EC4899", // Rosa Neón
  flame: "#F97316", // Naranja Fuego
  crown: "#9333EA", // Violeta Cerebiia
  clock: "#06B6D4", // Cian Océano
  timer: "#06B6D4", // Cian Océano
  shield: "#6366F1", // Índigo
  "shield-check": "#6366F1", // Índigo
  shieldcheck: "#6366F1", // Índigo
  medal: "#0D9488", // Verde Azulado
  award: "#0D9488", // Verde Azulado
  target: "#EF4444", // Rojo Coral
  gem: "#8B5CF6", // Púrpura Joya
  zap: "#EAB308", // Amarillo Rayo
  sparkles: "#F59E0B", // Dorado Ámbar
  milestone5: "#6366F1",
  milestone15: "#8B5CF6",
  milestone30: "#EC4899",
};

const ICON_MAP: Record<string, LucideIcon> = {
  trophy: Trophy,
  rocket: Rocket,
  wallet: Wallet,
  star: Star,
  coins: Coins,
  "piggy-bank": PiggyBank,
  piggybank: PiggyBank,
  flame: Flame,
  crown: Crown,
  clock: Clock,
  timer: Timer,
  shield: Shield,
  "shield-check": ShieldCheck,
  shieldcheck: ShieldCheck,
  medal: Medal,
  award: Award,
  target: Target,
  gem: Gem,
  zap: Zap,
  sparkles: Sparkles,
  milestone5: Shield,
  milestone15: Medal,
  milestone30: Crown,
};

export function resolveAchievementIcon(
  iconKey: string | null | undefined,
): AchievementIconInfo {
  if (!iconKey || typeof iconKey !== "string") {
    return {
      Icon: Trophy,
      color: "#F59E0B",
      iconName: "trophy",
    };
  }

  const trimmed = iconKey.trim();
  const parts = trimmed.split(":");
  const rawName = (parts[0] || "")
    .toLowerCase()
    .trim()
    .replace(/_/g, "-");
  const customColor =
    parts.length > 1 && parts[1].trim().length > 0
      ? parts.slice(1).join(":").trim()
      : null;

  const Icon = ICON_MAP[rawName] || Trophy;
  const defaultColor = DEFAULT_COLOR_MAP[rawName] || "#F59E0B";
  const color = customColor || defaultColor;

  return {
    Icon,
    color,
    iconName: rawName || "trophy",
  };
}
