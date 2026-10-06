import { create } from 'zustand';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

export interface SnackbarState {
  open: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
  show: (params: { message: string; actionLabel?: string; onAction?: () => void; duration?: number }) => void;
  hide: () => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  open: false,
  message: '',
  actionLabel: undefined,
  onAction: undefined,
  duration: 6000,
  show: ({ message, actionLabel, onAction, duration = 6000 }) => {
    set({
      open: true,
      message,
      actionLabel,
      onAction,
      duration,
    });
  },
  hide: () => set({ open: false }),
}));

export function showSnackbar(params: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}) {
  useSnackbarStore.getState().show(params);
}

export function Snackbar(): ReactNode {
  const { open, message, actionLabel, onAction, duration, hide } = useSnackbarStore();

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      hide();
    }, duration || 6000);
    return () => clearTimeout(timer);
  }, [open, duration, hide]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 'calc(92px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '480px',
        backgroundColor: 'var(--md-sys-color-inverse-surface)',
        color: 'var(--md-sys-color-inverse-on-surface)',
        borderRadius: 'var(--md-sys-shape-corner-extra-small, 4px)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2)',
        zIndex: 90,
        fontFamily: 'var(--md-ref-typeface-plain)',
        fontSize: 'var(--md-sys-typescale-body-medium-size)',
        animation: 'snackbar-appear 200ms cubic-bezier(0, 0, 0.2, 1)',
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      {actionLabel && (
        <button
          type="button"
          onClick={() => {
            onAction?.();
            hide();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--md-sys-color-inverse-primary)',
            fontFamily: 'var(--md-ref-typeface-brand)',
            fontSize: 'var(--md-sys-typescale-label-large-size)',
            fontWeight: 'var(--md-ref-typeface-weight-bold)',
            cursor: 'pointer',
            padding: '4px 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
