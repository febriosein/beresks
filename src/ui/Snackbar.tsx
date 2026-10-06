import { create } from 'zustand';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

export interface SnackbarItem {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface SnackbarState {
  queue: SnackbarItem[];
  enqueue: (item: Omit<SnackbarItem, 'id'>) => void;
  dequeue: () => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  queue: [],
  enqueue: (item) =>
    set((state) => ({
      queue: [...state.queue, { ...item, id: `${Date.now()}-${Math.random()}` }],
    })),
  dequeue: () =>
    set((state) => ({
      queue: state.queue.slice(1),
    })),
}));

export function showSnackbar(params: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}) {
  useSnackbarStore.getState().enqueue(params);
}

export function Snackbar(): ReactNode {
  const { queue, dequeue } = useSnackbarStore();
  const current = queue[0];

  useEffect(() => {
    if (!current) return;
    const duration = current.duration ?? 5000;
    const timer = setTimeout(() => {
      dequeue();
    }, duration);
    return () => clearTimeout(timer);
  }, [current, dequeue]);

  if (!current) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      key={current.id}
      style={{
        position: 'fixed',
        bottom: 'calc(var(--bs-fab-bottom, 96px) + 60px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '480px',
        backgroundColor: 'var(--md-sys-color-inverse-surface)',
        color: 'var(--md-sys-color-inverse-on-surface)',
        borderRadius: 'var(--md-sys-shape-corner-medium, 12px)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: 'var(--bs-elev-3, 0 4px 12px rgba(0, 0, 0, 0.2))',
        zIndex: 90,
        fontFamily: 'var(--md-ref-typeface-plain)',
        fontSize: 'var(--md-sys-typescale-body-medium-size)',
        animation: 'snackbar-appear var(--bs-dur-medium, 250ms) var(--bs-ease-emphasized, ease-out)',
      }}
    >
      <span style={{ flex: 1, lineHeight: 1.4 }}>{current.message}</span>
      {current.actionLabel && (
        <button
          type="button"
          onClick={() => {
            current.onAction?.();
            dequeue();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--md-sys-color-inverse-primary)',
            fontFamily: 'var(--md-ref-typeface-brand)',
            fontSize: 'var(--md-sys-typescale-label-large-size)',
            fontWeight: 'var(--md-ref-typeface-weight-bold, 700)',
            cursor: 'pointer',
            padding: '6px 10px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderRadius: 'var(--md-sys-shape-corner-small, 8px)',
          }}
        >
          {current.actionLabel}
        </button>
      )}
    </div>
  );
}
