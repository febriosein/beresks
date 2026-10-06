import { useEffect, useRef, useState } from 'react';
import '@material/web/dialog/dialog.js';
import { Icon } from './Icon.js';
import { BottomSheet } from './BottomSheet.js';
import type { CSSProperties, ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  headline: string;
  icon?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function useIsMobile(maxWidth = 640) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= maxWidth;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [maxWidth]);

  return isMobile;
}

export function Dialog({
  open,
  onClose,
  headline,
  icon,
  children,
  actions,
  className,
  style,
}: DialogProps) {
  const isMobile = useIsMobile();
  const ref = useRef<any>(null);

  useEffect(() => {
    if (isMobile) return;
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      onClose();
    };
    el.addEventListener('closed', handler);
    return () => el.removeEventListener('closed', handler);
  }, [onClose, isMobile]);

  useEffect(() => {
    if (isMobile) return;
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.show();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open, isMobile]);

  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) onClose();
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {icon && <Icon name={icon} size="24px" color="var(--md-sys-color-primary)" />}
            <span style={{ fontWeight: 700 }}>{headline}</span>
          </div>
        }
        footer={
          actions ? (
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px',
              }}
            >
              {actions}
            </div>
          ) : undefined
        }
        style={style}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {children}
        </div>
      </BottomSheet>
    );
  }

  return (
    <md-dialog
      ref={ref}
      class={className}
      style={{
        minWidth: 'min(540px, calc(100vw - 48px))',
        maxWidth: '580px',
        ...style,
      }}
    >
      {icon && <Icon slot="icon" name={icon} size="28px" color="var(--md-sys-color-primary)" />}
      <div
        slot="headline"
        style={{
          fontFamily: 'var(--md-ref-typeface-brand)',
          fontWeight: 700,
          fontSize: 'var(--md-sys-typescale-title-large-size)',
          letterSpacing: '-0.01em',
        }}
      >
        {headline}
      </div>
      <form
        slot="content"
        method="dialog"
        onSubmit={(e) => e.preventDefault()}
        style={{
          padding: '8px 0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </form>
      {actions && (
        <div
          slot="actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
          }}
        >
          {actions}
        </div>
      )}
    </md-dialog>
  );
}
