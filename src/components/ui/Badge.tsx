import React from "react";
import { Flame, Crown, Star, Zap, Trophy } from "lucide-react";

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

type BadgeVariant = "teal" | "green" | "gold" | "red" | "gray" | "purple";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  teal: "bg-teal-500/15 text-teal-300 border border-teal-500/30",
  green: "bg-green-500/15 text-green-300 border border-green-500/30",
  gold: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
  red: "bg-red-500/15 text-red-300 border border-red-500/30",
  gray: "bg-white/10 text-white/60 border border-white/15",
  purple: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px] gap-1",
  md: "px-3 py-1 text-xs gap-1.5",
};

export function Badge({ variant, size = "md", children, icon }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold tracking-wide leading-none",
        variantClasses[variant],
        sizeClasses[size]
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// LevelBadge
// ---------------------------------------------------------------------------

interface LevelBadgeProps {
  level: number;
  xp: number;
}

function getLevelIcon(level: number): React.ReactNode {
  if (level >= 30) return <Crown size={14} className="text-yellow-300" />;
  if (level >= 20) return <Trophy size={14} className="text-purple-300" />;
  if (level >= 10) return <Flame size={14} className="text-orange-400" />;
  if (level >= 5) return <Zap size={14} className="text-teal-300" />;
  return <Star size={14} className="text-blue-300" />;
}

function getLevelVariant(level: number): BadgeVariant {
  if (level >= 30) return "gold";
  if (level >= 20) return "purple";
  if (level >= 10) return "red";
  if (level >= 5) return "teal";
  return "gray";
}

export function LevelBadge({ level, xp }: LevelBadgeProps) {
  return (
    <Badge
      variant={getLevelVariant(level)}
      size="md"
      icon={getLevelIcon(level)}
    >
      Nível {level}
      <span className="opacity-60 font-normal ml-1">· {xp} XP</span>
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// StreakBadge
// ---------------------------------------------------------------------------

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <Badge
      variant="gold"
      size="md"
      icon={<Flame size={13} className="text-orange-400" />}
    >
      {streak} {streak === 1 ? "dia" : "dias"} seguidos
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// AchievementBadge
// ---------------------------------------------------------------------------

type AchievementSize = "sm" | "md" | "lg";

interface AchievementBadgeProps {
  icon: string;
  title: string;
  unlocked: boolean;
  size?: AchievementSize;
}

const achievementSizeClasses: Record<
  AchievementSize,
  { wrapper: string; emoji: string; text: string }
> = {
  sm: {
    wrapper: "w-14 h-14",
    emoji: "text-2xl",
    text: "text-[10px]",
  },
  md: {
    wrapper: "w-20 h-20",
    emoji: "text-3xl",
    text: "text-[11px]",
  },
  lg: {
    wrapper: "w-28 h-28",
    emoji: "text-4xl",
    text: "text-xs",
  },
};

export function AchievementBadge({
  icon,
  title,
  unlocked,
  size = "md",
}: AchievementBadgeProps) {
  const s = achievementSizeClasses[size];

  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-2 transition-all duration-300",
          s.wrapper,
          unlocked
            ? "border-yellow-400/60 bg-yellow-400/10 shadow-[0_0_16px_rgba(234,179,8,0.25)]"
            : "border-white/10 bg-white/5 grayscale opacity-40"
        )}
      >
        <span className={s.emoji}>{icon}</span>
      </div>
      <span
        className={cn(
          "text-center font-medium leading-tight max-w-[80px]",
          s.text,
          unlocked ? "text-white/80" : "text-white/30"
        )}
      >
        {title}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MuscleTag
// ---------------------------------------------------------------------------

interface MuscleTagProps {
  muscle: string;
}

const muscleColors: Record<string, string> = {
  peito: "bg-red-400",
  costas: "bg-blue-400",
  ombros: "bg-purple-400",
  biceps: "bg-teal-400",
  "bíceps": "bg-teal-400",
  triceps: "bg-cyan-400",
  "tríceps": "bg-cyan-400",
  abdomen: "bg-yellow-400",
  "abdômen": "bg-yellow-400",
  glúteos: "bg-pink-400",
  gluteos: "bg-pink-400",
  quadriceps: "bg-orange-400",
  "quadríceps": "bg-orange-400",
  isquiotibiais: "bg-amber-400",
  panturrilha: "bg-lime-400",
  antebraco: "bg-sky-400",
  "antebraço": "bg-sky-400",
  trapézio: "bg-indigo-400",
  trapezio: "bg-indigo-400",
};

function getMuscleColor(muscle: string): string {
  const key = muscle.toLowerCase();
  return muscleColors[key] ?? "bg-white/40";
}

export function MuscleTag({ muscle }: MuscleTagProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/8 border border-white/10 text-white/70 text-[11px] font-medium tracking-wide">
      <span
        className={cn("w-2 h-2 rounded-full flex-shrink-0", getMuscleColor(muscle))}
      />
      {muscle}
    </span>
  );
}
