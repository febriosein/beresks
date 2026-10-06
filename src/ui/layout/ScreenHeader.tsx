import type { CSSProperties, ReactNode } from 'react';

interface ScreenHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  sticky?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function ScreenHeader({
  title,
  subtitle,
  leading,
  trailing,
  sticky = false,
  className = '',
  style,
}: ScreenHeaderProps) {
  const stickyStyle: CSSProperties = sticky
    ? {
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backgroundColor: 'var(--md-sys-color-surface)',
        backdropFilter: 'blur(8px)',
        paddingTop: 'var(--bs-space-2, 8px)',
        paddingBottom: 'var(--bs-space-3, 12px)',
      }
    : {
        marginBottom: 'var(--bs-space-4, 16px)',
      };

  return (
    <header
      className={`bs-screen-header ${className}`.trim()}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--bs-space-3, 12px)',
        ...stickyStyle,
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bs-space-3, 12px)', minWidth: 0, flex: 1 }}>
        {leading && <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{leading}</div>}
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1
            className="typescale-headline-small"
            style={{
              margin: 0,
              color: 'var(--md-sys-color-on-surface)',
              fontWeight: 'var(--md-ref-typeface-weight-bold, 700)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="typescale-body-small"
              style={{
                margin: '2px 0 0 0',
                color: 'var(--md-sys-color-on-surface-variant)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {trailing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bs-space-2, 8px)', flexShrink: 0 }}>
          {trailing}
        </div>
      )}
    </header>
  );
}
