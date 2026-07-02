import React, { useEffect, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';

// ---------------------------------------------------------------------------
// Size map
// ---------------------------------------------------------------------------
const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[95vw] h-[95vh]',
};

// ---------------------------------------------------------------------------
// Inline keyframe injection (no Tailwind plugin required)
// ---------------------------------------------------------------------------
const STYLE_ID = 'modal-keyframes';

function ensureKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes modal-backdrop-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes modal-backdrop-out {
      from { opacity: 1; }
      to   { opacity: 0; }
    }
    @keyframes modal-panel-in {
      from { opacity: 0; transform: scale(0.93) translateY(-8px); }
      to   { opacity: 1; transform: scale(1)    translateY(0);    }
    }
    @keyframes modal-panel-out {
      from { opacity: 1; transform: scale(1)    translateY(0);    }
      to   { opacity: 0; transform: scale(0.93) translateY(-8px); }
    }
    .modal-backdrop-enter { animation: modal-backdrop-in  220ms cubic-bezier(0.16,1,0.3,1) forwards; }
    .modal-backdrop-exit  { animation: modal-backdrop-out 180ms cubic-bezier(0.4,0,1,1)     forwards; }
    .modal-panel-enter    { animation: modal-panel-in     260ms cubic-bezier(0.16,1,0.3,1) forwards; }
    .modal-panel-exit     { animation: modal-panel-out    180ms cubic-bezier(0.4,0,1,1)     forwards; }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: ReactNode;
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

type ModalPhase = 'entering' | 'visible' | 'exiting' | 'hidden';

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  footer,
  closeOnBackdrop = true,
  showCloseButton = true,
}) => {
  ensureKeyframes();

  const [phase, setPhase] = React.useState<ModalPhase>('hidden');

  // Transition in/out
  useEffect(() => {
    if (open) {
      setPhase('entering');
      const t = setTimeout(() => setPhase('visible'), 10);
      return () => clearTimeout(t);
    } else {
      if (phase === 'hidden') return;
      setPhase('exiting');
      const t = setTimeout(() => setPhase('hidden'), 200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ESC key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (phase !== 'hidden') {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [phase, handleKeyDown]);

  if (phase === 'hidden') return null;

  const isEntering = phase === 'entering' || phase === 'visible';
  const backdropClass = isEntering ? 'modal-backdrop-enter' : 'modal-backdrop-exit';
  const panelClass    = isEntering ? 'modal-panel-enter'    : 'modal-panel-exit';

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnBackdrop) onClose();
  };

  const isFull = size === 'full';

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${backdropClass}`}
      style={{
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Panel */}
      <div
        className={`
          relative flex flex-col w-full ${SIZE_CLASSES[size]}
          ${isFull ? '' : 'max-h-[90vh]'}
          bg-white rounded-2xl overflow-hidden
          ${panelClass}
        `}
        style={{
          boxShadow:
            '0 4px 6px -1px rgba(0,0,0,0.08), 0 20px 60px -10px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-4 flex-shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-gray-900 leading-tight tracking-tight"
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 leading-snug">{subtitle}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="
                  flex-shrink-0 flex items-center justify-center
                  w-8 h-8 rounded-xl
                  text-gray-400 hover:text-gray-700
                  bg-transparent hover:bg-gray-100
                  transition-colors duration-150
                  focus:outline-none focus:ring-2 focus:ring-gray-300
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Divider below header when header exists */}
        {(title || showCloseButton) && (
          <div className="h-px bg-gray-100 flex-shrink-0 mx-6" />
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <>
            <div className="h-px bg-gray-100 flex-shrink-0 mx-6" />
            <div className="px-6 py-4 flex-shrink-0 bg-gray-50/60">{footer}</div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

// ---------------------------------------------------------------------------
// ConfirmModal
// ---------------------------------------------------------------------------
export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

const CONFIRM_BUTTON_STYLES: Record<NonNullable<ConfirmModalProps['variant']>, string> = {
  danger:
    'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
  primary:
    'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white',
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'primary',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnBackdrop={false}
      showCloseButton={false}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="
              px-4 py-2 rounded-xl text-sm font-medium
              text-gray-700 bg-white border border-gray-200
              hover:bg-gray-50 hover:border-gray-300
              focus:outline-none focus:ring-2 focus:ring-gray-300
              transition-colors duration-150
            "
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-offset-2
              transition-colors duration-150
              ${CONFIRM_BUTTON_STYLES[variant]}
            `}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
    </Modal>
  );
};

export default Modal;
