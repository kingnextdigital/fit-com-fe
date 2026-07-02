import React, { createContext, useContext, useId } from 'react';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
  variant: 'underline' | 'pills';
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab components must be used inside <Tabs>.');
  return ctx;
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

export interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

export function Tabs({ value, onChange, children }: TabsProps) {
  const baseId = useId();
  return (
    <TabsContext.Provider value={{ value, onChange, variant: 'pills', baseId }}>
      {children}
    </TabsContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// TabList
// ---------------------------------------------------------------------------

export interface TabListProps {
  children: React.ReactNode;
  variant?: 'underline' | 'pills';
}

export function TabList({ children, variant = 'pills' }: TabListProps) {
  const ctx = useTabsContext();

  // Override variant on context for children to read
  const enriched: TabsContextValue = { ...ctx, variant };

  const containerClass =
    variant === 'pills'
      ? 'inline-flex items-center gap-1 rounded-2xl bg-gray-100 p-1'
      : 'flex items-center gap-0 border-b border-gray-200';

  return (
    <TabsContext.Provider value={enriched}>
      <div role="tablist" className={containerClass}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Tab
// ---------------------------------------------------------------------------

export interface TabProps {
  value: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  badge?: number;
}

export function Tab({ value, icon, children, badge }: TabProps) {
  const { value: activeValue, onChange, variant, baseId } = useTabsContext();
  const isActive = value === activeValue;

  const pillActive =
    'bg-teal-700 text-white shadow-sm shadow-teal-800/20';
  const pillInactive =
    'text-gray-600 hover:text-gray-900 hover:bg-white/60';

  const underlineActive =
    'text-teal-700 border-b-2 border-teal-700 -mb-px font-semibold';
  const underlineInactive =
    'text-gray-500 hover:text-gray-800 border-b-2 border-transparent -mb-px hover:border-gray-300';

  let buttonClass: string;
  if (variant === 'pills') {
    buttonClass = [
      'relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium',
      'transition-all duration-200 ease-in-out focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1',
      isActive ? pillActive : pillInactive,
    ].join(' ');
  } else {
    buttonClass = [
      'relative flex items-center gap-1.5 px-4 py-2.5 text-sm',
      'transition-all duration-200 ease-in-out focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1',
      isActive ? underlineActive : underlineInactive,
    ].join(' ');
  }

  return (
    <button
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${value}`}
      onClick={() => onChange(value)}
      className={buttonClass}
      type="button"
    >
      {icon && (
        <span className="shrink-0 w-4 h-4 flex items-center justify-center">
          {icon}
        </span>
      )}
      {children}
      {badge !== undefined && badge > 0 && (
        <span
          className={[
            'ml-1 inline-flex items-center justify-center rounded-full text-xs font-semibold',
            'min-w-[1.125rem] h-[1.125rem] px-1',
            isActive
              ? 'bg-white/25 text-white'
              : 'bg-teal-100 text-teal-700',
          ].join(' ')}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// TabPanel
// ---------------------------------------------------------------------------

export interface TabPanelProps {
  value: string;
  children: React.ReactNode;
}

export function TabPanel({ value, children }: TabPanelProps) {
  const { value: activeValue, baseId } = useTabsContext();
  const isActive = value === activeValue;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      hidden={!isActive}
      className={[
        'transition-opacity duration-200 ease-in-out',
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

const ChevronDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-4 h-4"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
      clipRule="evenodd"
    />
  </svg>
);

export function Select({
  options,
  value,
  onChange,
  placeholder,
  className = '',
  label,
}: SelectProps) {
  const id = useId();

  return (
    <div className={['flex flex-col gap-1', className].join(' ')}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            'w-full appearance-none rounded-xl border border-gray-200 bg-white',
            'px-4 py-2.5 pr-10 text-sm text-gray-800',
            'shadow-sm transition-all duration-150',
            'hover:border-gray-300',
            'focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30',
            !value && placeholder ? 'text-gray-400' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
          <ChevronDown />
        </span>
      </div>
    </div>
  );
}
