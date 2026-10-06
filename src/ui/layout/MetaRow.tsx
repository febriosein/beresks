import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '../Icon.js';

export interface MetaItemProps {
  icon?: string;
  text: ReactNode;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

export function MetaItem({ icon, text, color, className = '', style }: MetaItemProps) {
  return (
    <span
      className={`bs-meta-item ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        color: color || 'var(--md-sys-color-on-surface-variant)',
        fontSize: 'var(--md-sys-typescale-body-small-size, 12px)',
        lineHeight: 1.3,
        ...style,
      }}
    >
      {icon && (
        <Icon
          name={icon}
          size="14px"
          color={color || 'var(--md-sys-color-on-surface-variant)'}
        />
      )}
      <span>{text}</span>
    </span>
  );
}

interface MetaRowProps {
  items?: Array<{ icon?: string; text: ReactNode; color?: string }>;
  children?: ReactNode;
  divider?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function MetaRow({
  items,
  children,
  divider = false,
  className = '',
  style,
}: MetaRowProps) {
  return (
    <div
      className={`bs-meta-row ${className}`.trim()}
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: divider ? '6px' : '10px',
        ...style,
      }}
    >
      {items ? (
        items.map((item, idx) => (
          <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <MetaItem icon={item.icon} text={item.text} color={item.color} />
            {divider && idx < items.length - 1 && (
              <span
                style={{
                  color: 'var(--md-sys-color-outline-variant)',
                  fontSize: '10px',
                  userSelect: 'none',
                }}
              >
                •
              </span>
            )}
          </span>
        ))
      ) : (
        children
      )}
    </div>
  );
}
