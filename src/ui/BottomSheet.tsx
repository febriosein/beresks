import { Drawer } from 'vaul';
import type { CSSProperties, ReactNode } from 'react';
import { useKeyboardInset } from '../lib/useKeyboardInset.js';

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  snapPoints?: (number | string)[];
  activeSnapPoint?: number | string | null;
  setActiveSnapPoint?: (point: number | string | null) => void;
  style?: CSSProperties;
}

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  snapPoints,
  activeSnapPoint,
  setActiveSnapPoint,
  style,
}: BottomSheetProps) {
  const keyboardInset = useKeyboardInset();

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 100,
            backdropFilter: 'blur(2px)',
          }}
        />
        <Drawer.Content
          aria-describedby={description ? 'bottom-sheet-desc' : undefined}
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            color: 'var(--md-sys-color-on-surface)',
            borderTopLeftRadius: 'var(--md-sys-shape-corner-extra-large, 28px)',
            borderTopRightRadius: 'var(--md-sys-shape-corner-extra-large, 28px)',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '92dvh',
            zIndex: 101,
            display: 'flex',
            flexDirection: 'column',
            outline: 'none',
            boxShadow: 'var(--bs-elev-3, 0 -2px 10px rgba(0, 0, 0, 0.1))',
            ...style,
          }}
        >
          {/* M3 Drag Handle */}
          <div
            style={{
              padding: '14px 0 8px 0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              touchAction: 'none',
              flexShrink: 0,
            }}
          >
            <Drawer.Handle
              style={{
                width: '32px',
                height: '4px',
                borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                backgroundColor: 'var(--md-sys-color-outline-variant)',
              }}
            />
          </div>

          {title && (
            <Drawer.Title
              style={{
                fontFamily: 'var(--md-ref-typeface-brand)',
                fontSize: 'var(--md-sys-typescale-title-large-size)',
                fontWeight: 'var(--md-ref-typeface-weight-bold, 700)',
                padding: '0 20px 12px 20px',
                margin: 0,
                flexShrink: 0,
              }}
            >
              {title}
            </Drawer.Title>
          )}

          {description && (
            <Drawer.Description
              id="bottom-sheet-desc"
              style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: 0,
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: 0,
              }}
            >
              {description}
            </Drawer.Description>
          )}

          {/* Scrollable Content Body */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0 20px 16px 20px',
              paddingBottom: footer
                ? '16px'
                : `calc(24px + var(--bs-safe-bottom, 0px) + ${keyboardInset}px)`,
            }}
          >
            {children}
          </div>

          {/* Sticky Footer (if provided) */}
          {footer && (
            <div
              className="bs-bottom-sheet-footer"
              style={{
                flexShrink: 0,
                padding: '12px 20px',
                paddingBottom: `calc(12px + var(--bs-safe-bottom, 0px) + ${keyboardInset}px)`,
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderTop: '1px solid var(--md-sys-color-outline-variant, rgba(0, 0, 0, 0.08))',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 5,
              }}
            >
              {footer}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
