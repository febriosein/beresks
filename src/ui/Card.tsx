import type { CSSProperties, MouseEvent, ReactNode } from 'react';

export type CardVariant = 'elevated' | 'filled' | 'outlined';

interface CardProps {
  variant?: CardVariant;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  className?: string;
  style?: CSSProperties;
  role?: string;
  tabIndex?: number;
}

export function Card({
  variant = 'filled',
  children,
  onClick,
  className = '',
  style,
  role,
  tabIndex,
}: CardProps) {
  const isInteractive = Boolean(onClick);

  const getVariantStyles = (): CSSProperties => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'var(--md-sys-color-surface)',
          border: '1px solid var(--md-sys-color-outline-variant)',
        };
      case 'elevated':
        return {
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        };
      case 'filled':
      default:
        return {
          backgroundColor: 'var(--md-sys-color-surface-container)',
          border: 'none',
        };
    }
  };

  const baseStyle: CSSProperties = {
    borderRadius: 'var(--md-sys-shape-corner-large, 16px)',
    color: 'var(--md-sys-color-on-surface)',
    padding: '1rem',
    position: 'relative',
    overflow: 'hidden',
    transition: 'background-color 200ms ease, box-shadow 200ms ease, transform 150ms ease',
    cursor: isInteractive ? 'pointer' : 'default',
    ...getVariantStyles(),
    ...style,
  };

  return (
    <div
      onClick={onClick}
      role={role || (isInteractive ? 'button' : undefined)}
      tabIndex={tabIndex ?? (isInteractive ? 0 : undefined)}
      className={`m3-card ${className}`}
      style={baseStyle}
    >
      {children}
    </div>
  );
}
