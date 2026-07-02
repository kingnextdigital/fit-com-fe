import React from "react";
import { cn } from "@/lib/utils";

// ─── Color maps ────────────────────────────────────────────────────────────────

const BAR_COLOR_MAP: Record<string, string> = {
  teal:   "bg-teal-500",
  gold:   "bg-yellow-400",
  green:  "bg-emerald-500",
  purple: "bg-purple-500",
};

const BAR_GLOW_MAP: Record<string, string> = {
  teal:   "shadow-teal-500/40",
  gold:   "shadow-yellow-400/40",
  green:  "shadow-emerald-500/40",
  purple: "shadow-purple-500/40",
};

const RING_COLOR_MAP: Record<string, string> = {
  teal:  "#14b8a6",
  gold:  "#facc15",
  green: "#10b981",
};

const BAR_SIZE_MAP: Record<string, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

// ─── ProgressBar ──────────────────────────────────────────────────────────────

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "teal" | "gold" | "green" | "purple";
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = "teal",
  label,
  showValue = false,
  size = "md",
  animated = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, (value / max) * 100));
  const fillColor = BAR_COLOR_MAP[color] ?? BAR_COLOR_MAP.teal;
  const glowColor = BAR_GLOW_MAP[color] ?? BAR_GLOW_MAP.teal;
  const barHeight = BAR_SIZE_MAP[size] ?? BAR_SIZE_MAP.md;

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-medium text-white/70 tracking-wide uppercase">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-xs font-semibold text-white/90 tabular-nums">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full bg-white/10 overflow-hidden backdrop-blur-sm",
          barHeight
        )}
      >
        <div
          className={cn(
            "h-full rounded-full shadow-md",
            fillColor,
            glowColor,
            animated && "transition-all duration-700 ease-in-out"
          )}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          {/* Shimmer overlay */}
          <div
            className={cn(
              "h-full w-full rounded-full opacity-40",
              "bg-gradient-to-r from-transparent via-white/30 to-transparent"
            )}
          />
        </div>
      </div>
    </div>
  );
}

// ─── ProgressRing ─────────────────────────────────────────────────────────────

export interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: "teal" | "gold" | "green";
  label?: string | React.ReactNode;
  animated?: boolean;
  className?: string;
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 8,
  color = "teal",
  label,
  animated = false,
  className,
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const strokeColor = RING_COLOR_MAP[color] ?? RING_COLOR_MAP.teal;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
        aria-label={`Progress: ${Math.round(clamped)}%`}
        role="img"
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Fill */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={
            animated
              ? { transition: "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)" }
              : undefined
          }
          filter={`drop-shadow(0 0 4px ${strokeColor}80)`}
        />
      </svg>
      {/* Center label */}
      {label !== undefined && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          {typeof label === "string" ? (
            <span className="text-xs font-semibold text-white/90 leading-none text-center">
              {label}
            </span>
          ) : (
            label
          )}
        </div>
      )}
    </div>
  );
}

// ─── XPBar ────────────────────────────────────────────────────────────────────

export interface XPBarProps {
  xp: number;
  level: number;
  nextLevelXp: number;
  currentLevelXp: number;
  className?: string;
}

export function XPBar({ xp, level, nextLevelXp, currentLevelXp, className }: XPBarProps) {
  const rangeXp = nextLevelXp - currentLevelXp;
  const progressXp = xp - currentLevelXp;
  const percentage =
    rangeXp > 0 ? Math.min(100, Math.max(0, (progressXp / rangeXp) * 100)) : 100;

  return (
    <div className={cn("flex items-center gap-3 w-full", className)}>
      {/* Level badge */}
      <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/30 border border-yellow-300/20">
        <span className="text-sm font-bold text-yellow-950 leading-none">
          {level}
        </span>
      </div>

      {/* Bar + numbers */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-yellow-400/90 uppercase tracking-wider">
            Nível {level}
          </span>
          <span className="text-xs tabular-nums text-white/50">
            {xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
          </span>
        </div>
        <div className="relative h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-in-out shadow-md shadow-yellow-400/30"
            style={{
              width: `${percentage}%`,
              background: "linear-gradient(90deg, #f59e0b, #facc15)",
            }}
          >
            <div className="h-full w-full rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </div>
        </div>
        <div className="mt-1 text-right">
          <span className="text-[10px] text-white/30 tabular-nums">
            +{(nextLevelXp - xp).toLocaleString()} XP para o próximo nível
          </span>
        </div>
      </div>
    </div>
  );
}
