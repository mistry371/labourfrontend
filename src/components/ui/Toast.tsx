'use client';
import { create } from 'zustand';
import { clsx } from 'clsx';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  exiting?: boolean;
}

interface ToastStore {
  toasts: ToastItem[];
  add: (type: ToastType, message: string) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  add: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts.slice(-4), { id, type, message }] }));
    setTimeout(() => get().dismiss(id), 4500);
  },
  dismiss: (id) => {
    // Mark as exiting first for animation
    set((s) => ({ toasts: s.toasts.map((t) => t.id === id ? { ...t, exiting: true } : t) }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 250);
  },
}));

export const toast = {
  success: (msg: string) => useToastStore.getState().add('success', msg),
  error:   (msg: string) => useToastStore.getState().add('error',   msg),
  info:    (msg: string) => useToastStore.getState().add('info',    msg),
  warning: (msg: string) => useToastStore.getState().add('warning', msg),
};

const CONFIG: Record<ToastType, { icon: string; bar: string; bg: string; text: string }> = {
  success: { icon: '✓', bar: 'bg-green-500',  bg: 'bg-white border-green-100',  text: 'text-gray-900' },
  error:   { icon: '✕', bar: 'bg-red-500',    bg: 'bg-white border-red-100',    text: 'text-gray-900' },
  info:    { icon: 'i', bar: 'bg-blue-500',   bg: 'bg-white border-blue-100',   text: 'text-gray-900' },
  warning: { icon: '!', bar: 'bg-amber-500',  bg: 'bg-white border-amber-100',  text: 'text-gray-900' },
};

const ICON_BG: Record<ToastType, string> = {
  success: 'bg-green-100 text-green-700',
  error:   'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
};

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
    >
      {toasts.map((t) => {
        const cfg = CONFIG[t.type];
        return (
          <div
            key={t.id}
            role="alert"
            className={clsx(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-lg',
              cfg.bg,
              t.exiting ? 'animate-slide-right opacity-0 transition-all duration-200' : 'animate-slide-right',
            )}
          >
            {/* Coloured icon */}
            <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5', ICON_BG[t.type])}>
              {cfg.icon}
            </div>
            <p className={clsx('flex-1 text-sm font-medium leading-snug', cfg.text)}>{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-gray-300 hover:text-gray-500 transition text-lg leading-none mt-0.5"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
