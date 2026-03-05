import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ─── Types ──────────────────────────────────────────────────────────────────
export type ToastType = 'loading' | 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms — 0 = never auto-dismiss
}

// ─── Icon helpers ────────────────────────────────────────────────────────────
const icons: Record<ToastType, React.ReactElement> = {
  loading: (
    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  success: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const colors: Record<ToastType, string> = {
  loading: 'bg-white border-black/10 text-slate-700',
  success: 'bg-white border-emerald-200 text-emerald-800',
  error:   'bg-white border-rose-200 text-rose-800',
  info:    'bg-white border-blue-200 text-blue-800',
};

const iconColors: Record<ToastType, string> = {
  loading: 'text-[color:var(--color-terracotta)]',
  success: 'text-emerald-500',
  error:   'text-rose-500',
  info:    'text-blue-500',
};

// ─── Global event bus ─────────────────────────────────────────────────────────
type ToastListener = (toast: Toast) => void;
type DismissListener = (id: string) => void;

const listeners: ToastListener[] = [];
const dismissListeners: DismissListener[] = [];

const subscribe = (fn: ToastListener) => { listeners.push(fn); return () => listeners.splice(listeners.indexOf(fn), 1); };
const subscribeDismiss = (fn: DismissListener) => { dismissListeners.push(fn); return () => dismissListeners.splice(dismissListeners.indexOf(fn), 1); };

const emit = (toast: Toast) => listeners.forEach((fn) => fn(toast));
const emitDismiss = (id: string) => dismissListeners.forEach((fn) => fn(id));

// ─── Public API hook ──────────────────────────────────────────────────────────
let counter = 0;
const mkId = () => `toast-${Date.now()}-${counter++}`;

export const useToast = () => {
  const show = useCallback((type: ToastType, message: string, duration?: number): string => {
    const id = mkId();
    emit({ id, type, message, duration: duration ?? (type === 'loading' ? 0 : type === 'error' ? 6000 : 4000) });
    return id;
  }, []);

  const dismiss = useCallback((id: string) => emitDismiss(id), []);

  return {
    toast: {
      loading: (msg: string) => show('loading', msg, 0),
      success: (msg: string, duration?: number) => show('success', msg, duration),
      error: (msg: string, duration?: number) => show('error', msg, duration),
      info: (msg: string, duration?: number) => show('info', msg, duration),
    },
    dismiss,
  };
};

// ─── Single toast item ────────────────────────────────────────────────────────
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));

    if (!toast.duration) return;
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, toast.duration);
    return () => clearTimeout(t);
  }, [toast.duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-lg text-sm max-w-sm w-full pointer-events-auto transition-all duration-300 ${colors[toast.type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <span className={`mt-0.5 flex-shrink-0 ${iconColors[toast.type]}`}>{icons[toast.type]}</span>
      <span className="flex-1 leading-snug">{toast.message}</span>
      {toast.type !== 'loading' && (
        <button
          onClick={handleClose}
          className="ml-1 flex-shrink-0 text-current opacity-40 hover:opacity-70 transition"
          aria-label="Cerrar"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── Toaster – drop into App.tsx ──────────────────────────────────────────────
export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsub = subscribe((t) => setToasts((prev) => [...prev, t]));
    const unsubDismiss = subscribeDismiss((id) =>
      setToasts((prev) => prev.filter((t) => t.id !== id))
    );
    return () => { unsub(); unsubDismiss(); };
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (!toasts.length) return null;

  return createPortal(
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
      ))}
    </div>,
    document.body
  );
}
