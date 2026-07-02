import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

// ─── types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// ─── constants ────────────────────────────────────────────────────────────────

const BORDER_COLORS: Record<ToastType, string> = {
  success: 'border-l-green-500',
  error:   'border-l-red-500',
  info:    'border-l-blue-500',
  warning: 'border-l-yellow-500',
};

const ICON_COLORS: Record<ToastType, string> = {
  success: 'text-green-500',
  error:   'text-red-500',
  info:    'text-blue-500',
  warning: 'text-yellow-500',
};

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
};

// ─── Toast ───────────────────────────────────────────────────────────────────

export function Toast({ id, type, message, duration = 4000 }: ToastProps) {
  const removeNotification = useAppStore((s) => s.removeNotification);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const dismiss = useCallback(() => {
    setLeaving(true);
    // wait for fade-out animation then remove from store
    setTimeout(() => removeNotification(id), 300);
  }, [id, removeNotification]);

  // slide in
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // auto-dismiss
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, dismiss]);

  const Icon = ICONS[type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        // base
        'flex items-start gap-3 w-full max-w-sm',
        'bg-white rounded-xl shadow-lg border-l-4 px-4 py-3',
        'transition-all duration-300 ease-in-out',
        // colored left border
        BORDER_COLORS[type],
        // slide-in / fade-out
        visible && !leaving
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-4',
      )}
    >
      <Icon
        className={cn('mt-0.5 shrink-0 h-5 w-5', ICON_COLORS[type])}
        aria-hidden="true"
      />

      <p className="flex-1 text-sm text-gray-800 leading-snug break-words">
        {message}
      </p>

      <button
        onClick={dismiss}
        aria-label="Fechar notificacao"
        className="shrink-0 mt-0.5 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── ToastContainer ──────────────────────────────────────────────────────────

export function ToastContainer() {
  const notifications = useAppStore((s) => s.notifications);

  if (notifications.length === 0) return null;

  return (
    <div
      aria-label="Notificacoes"
      className={cn(
        'fixed z-50 flex flex-col gap-2 pointer-events-none',
        // desktop: bottom-right
        'sm:bottom-6 sm:right-6 sm:left-auto sm:items-end',
        // mobile: bottom-center
        'bottom-4 left-4 right-4 items-center',
      )}
    >
      {notifications.map((n) => (
        <div key={n.id} className="pointer-events-auto w-full sm:w-auto">
          <Toast
            id={n.id}
            type={n.type}
            message={n.message}
            duration={n.duration}
          />
        </div>
      ))}
    </div>
  );
}

// ─── useToast ────────────────────────────────────────────────────────────────

export function useToast() {
  const addNotification = useAppStore((s) => s.addNotification);

  const success = useCallback(
    (message: string, duration?: number) =>
      addNotification({ type: 'success', message, duration }),
    [addNotification],
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      addNotification({ type: 'error', message, duration }),
    [addNotification],
  );

  const info = useCallback(
    (message: string, duration?: number) =>
      addNotification({ type: 'info', message, duration }),
    [addNotification],
  );

  const warning = useCallback(
    (message: string, duration?: number) =>
      addNotification({ type: 'warning', message, duration }),
    [addNotification],
  );

  return { success, error, info, warning };
}
