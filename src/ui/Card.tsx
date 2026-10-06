import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react';

export type CardVariant = 'elevated' | 'filled' | 'outlined';

interface CardProps {
  variant?: CardVariant;
  interactive?: boolean;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  className?: string;
  style?: CSSProperties;
  role?: string;
  tabIndex?: number;
  'aria-label'?: string;
}

export function Card({
  variant = 'filled',
  interactive,
  children,
  onClick,
  className = '',
  style,
  role,
  tabIndex,
  'aria-label': ariaLabel,
}: CardProps) {
  const isInteractive = interactive !== undefined ? interactive : Boolean(onClick);

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
          boxShadow: 'var(--bs-elev-1, 0 1px 3px 0 rgba(0, 0, 0, 0.1))',
        };
      case 'filled':
      default:
        return {
          backgroundColor: 'var(--md-sys-color-surface-container)',
          border: 'none',
        };
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive || !onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // synthesize mouse event or call directly
      onClick(e as unknown as MouseEvent<HTMLDivElement>);
    }
  };

  const baseStyle: CSSProperties = {
    borderRadius: 'var(--md-sys-shape-corner-large, 16px)',
    color: 'var(--md-sys-color-on-surface)',
    padding: '1rem',
    position: 'relative',
    overflow: 'hidden',
    ...getVariantStyles(),
    ...style,
  };

  const interactiveClass = isInteractive ? 'm3-card--interactive' : '';

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={role || (isInteractive ? 'button' : undefined)}
      tabIndex={tabIndex ?? (isInteractive ? 0 : undefined)}
      aria-label={ariaLabel}
      className={`m3-card ${interactiveClass} ${className}`.trim()}
      style={baseStyle}
    >
      {children}
    </div>
  );
}
