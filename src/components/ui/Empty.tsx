import React from "react";
import { AlertCircle, RefreshCw, Dumbbell, Trophy, Apple, Calendar, Users } from "lucide-react";

// Re-export context icons for convenience
export { Dumbbell, Trophy, Apple, Calendar, Users };

// ─── EmptyState ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 text-teal-600 mb-6">
        <span className="w-9 h-9 flex items-center justify-center">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 active:bg-teal-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ─── LoadingState ───────────────────────────────────────────────────────────────

interface LoadingStateProps {
  rows?: number;
  type?: "list" | "card" | "table";
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-gray-200 rounded-full w-2/5" />
            <div className="h-3 bg-gray-200 rounded-full w-3/5" />
          </div>
          <div className="h-3 bg-gray-200 rounded-full w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

function CardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 space-y-3 shadow-sm">
          <div className="h-4 bg-gray-200 rounded-full w-3/5" />
          <div className="h-3 bg-gray-200 rounded-full w-full" />
          <div className="h-3 bg-gray-200 rounded-full w-4/5" />
          <div className="flex gap-2 pt-1">
            <div className="h-7 bg-gray-200 rounded-lg w-20" />
            <div className="h-7 bg-gray-200 rounded-lg w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      {/* header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100">
        {[40, 28, 20, 12].map((w, i) => (
          <div key={i} className={`h-3 bg-gray-200 rounded-full`} style={{ width: `${w}%` }} />
        ))}
      </div>
      {/* rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-50 last:border-0"
        >
          {[40, 28, 20, 12].map((w, j) => (
            <div
              key={j}
              className="h-3 bg-gray-200 rounded-full"
              style={{ width: `${w}%`, opacity: 1 - j * 0.15 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function LoadingState({ rows = 3, type = "list" }: LoadingStateProps) {
  return (
    <div className="animate-pulse w-full">
      {type === "list" && <ListSkeleton rows={rows} />}
      {type === "card" && <CardSkeleton rows={rows} />}
      {type === "table" && <TableSkeleton rows={rows} />}
    </div>
  );
}

// ─── ErrorState ─────────────────────────────────────────────────────────────────

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Algo deu errado",
  message = "Ocorreu um erro inesperado. Tente novamente.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-500 mb-6">
        <AlertCircle className="w-9 h-9" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 active:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      )}
    </div>
  );
}

// ─── Loader ──────────────────────────────────────────────────────────────────────

type LoaderSize = "sm" | "md" | "lg";
type LoaderColor = "teal" | "white" | "gray";

interface LoaderProps {
  size?: LoaderSize;
  color?: LoaderColor;
}

const sizeMap: Record<LoaderSize, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-7 h-7 border-2",
  lg: "w-11 h-11 border-[3px]",
};

const colorMap: Record<LoaderColor, string> = {
  teal: "border-teal-200 border-t-teal-600",
  white: "border-white/30 border-t-white",
  gray: "border-gray-200 border-t-gray-500",
};

export function Loader({ size = "md", color = "teal" }: LoaderProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`rounded-full animate-spin ${sizeMap[size]} ${colorMap[color]}`}
        role="status"
        aria-label="Carregando"
      />
    </div>
  );
}
