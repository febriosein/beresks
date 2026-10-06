import type { CSSProperties, ReactNode } from 'react';

interface SectionProps {
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Section({
  title,
  subtitle,
  trailing,
  children,
  className = '',
  style,
}: SectionProps) {
  return (
    <section
      className={`bs-section ${className}`.trim()}
      style={{
        marginBottom: 'var(--bs-space-5, 20px)',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--bs-space-3, 12px)',
          gap: 'var(--bs-space-2, 8px)',
        }}
      >
        <div>
          <h2
            className="typescale-title-medium"
            style={{
              margin: 0,
              color: 'var(--md-sys-color-on-surface)',
              fontWeight: 'var(--md-ref-typeface-weight-bold, 700)',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="typescale-body-small"
              style={{
                margin: '2px 0 0 0',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {trailing && <div style={{ display: 'flex', alignItems: 'center' }}>{trailing}</div>}
      </div>

      <div>{children}</div>
    </section>
  );
}
