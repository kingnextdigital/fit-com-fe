import React from 'react';

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ className, children, onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm',
        hover &&
          'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
        onClick && !hover && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CardHeader
// ---------------------------------------------------------------------------

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  iconColor?: string;
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
  iconColor = 'bg-teal-500',
}: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between px-5 pt-5 pb-0">
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-xl text-white shrink-0',
              iconColor,
            )}
          >
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="ml-auto pl-3 shrink-0">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CardContent
// ---------------------------------------------------------------------------

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

type StatColor = 'teal' | 'gold' | 'green' | 'purple';

const STAT_PALETTE: Record<
  StatColor,
  { bg: string; icon: string; text: string; ring: string }
> = {
  teal: {
    bg: 'bg-teal-50',
    icon: 'bg-teal-500',
    text: 'text-teal-600',
    ring: 'ring-teal-100',
  },
  gold: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-500',
    text: 'text-amber-600',
    ring: 'ring-amber-100',
  },
  green: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-500',
    text: 'text-emerald-600',
    ring: 'ring-emerald-100',
  },
  purple: {
    bg: 'bg-violet-50',
    icon: 'bg-violet-500',
    text: 'text-violet-600',
    ring: 'ring-violet-100',
  },
};

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: StatColor;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  change,
  icon,
  color = 'teal',
  loading = false,
}: StatCardProps) {
  const palette = STAT_PALETTE[color];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-200" />
        </div>
        <div className="h-7 w-24 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-16 bg-gray-100 rounded" />
      </div>
    );
  }

  const changePositive = change !== undefined && change >= 0;
  const changeNegative = change !== undefined && change < 0;

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm p-5',
        'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-xl text-white',
            palette.icon,
          )}
        >
          {icon}
        </div>
        {change !== undefined && (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              changePositive && 'bg-emerald-50 text-emerald-600',
              changeNegative && 'bg-red-50 text-red-500',
            )}
          >
            {changePositive ? '+' : ''}
            {change}%
          </span>
        )}
      </div>

      <p className="text-2xl font-bold text-gray-800 leading-none mb-1">{value}</p>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MetricCard — StatCard with an inline SVG sparkline
// ---------------------------------------------------------------------------

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  data: number[];
  color?: StatColor;
}

function Sparkline({
  data,
  color,
}: {
  data: number[];
  color: StatColor;
}) {
  const STROKE: Record<StatColor, string> = {
    teal: '#14b8a6',
    gold: '#f59e0b',
    green: '#10b981',
    purple: '#8b5cf6',
  };
  const FILL: Record<StatColor, string> = {
    teal: 'rgba(20,184,166,0.12)',
    gold: 'rgba(245,158,11,0.12)',
    green: 'rgba(16,185,129,0.12)',
    purple: 'rgba(139,92,246,0.12)',
  };

  if (!data || data.length < 2) return null;

  const W = 120;
  const H = 40;
  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV || 1;

  const toX = (i: number) => (i / (data.length - 1)) * W;
  const toY = (v: number) => H - ((v - minV) / range) * (H - 4) - 2;

  const points = data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const areaPoints = [
    `0,${H}`,
    ...data.map((v, i) => `${toX(i)},${toY(v)}`),
    `${W},${H}`,
  ].join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-10"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={areaPoints} fill={FILL[color]} />
      <polyline
        points={points}
        fill="none"
        stroke={STROKE[color]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MetricCard({
  label,
  value,
  unit,
  data,
  color = 'teal',
}: MetricCardProps) {
  const palette = STAT_PALETTE[color];

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm p-5',
        'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
      )}
    >
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
        {label}
      </p>

      <div className="flex items-end gap-1 mb-3">
        <span className="text-2xl font-bold text-gray-800 leading-none">{value}</span>
        {unit && (
          <span className={cn('text-sm font-semibold mb-0.5', palette.text)}>{unit}</span>
        )}
      </div>

      <Sparkline data={data} color={color} />
    </div>
  );
}
