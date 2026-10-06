import type { CSSProperties } from 'react';
import { Icon } from '../Icon.js';
import { Button } from '../Button.js';
import { Card } from '../Card.js';

interface EmptyStateAction {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'filled' | 'outlined' | 'text' | 'elevated';
}

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  variant?: 'card' | 'plain';
  className?: string;
  style?: CSSProperties;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'card',
  className = '',
  style,
}: EmptyStateProps) {
  const innerContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: variant === 'card' ? '28px 16px' : '36px 16px',
        gap: 'var(--bs-space-3, 12px)',
      }}
    >
      {/* Icon with tonal circle background */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
          backgroundColor: 'var(--md-sys-color-surface-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--md-sys-color-primary)',
        }}
      >
        <Icon name={icon} size="28px" />
      </div>

      <div>
        <h3
          className="typescale-title-medium"
          style={{
            margin: 0,
            color: 'var(--md-sys-color-on-surface)',
            fontWeight: 'var(--md-ref-typeface-weight-bold, 700)',
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            className="typescale-body-medium"
            style={{
              margin: '6px 0 0 0',
              color: 'var(--md-sys-color-on-surface-variant)',
              maxWidth: '320px',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {action && (
        <div style={{ marginTop: 'var(--bs-space-2, 8px)' }}>
          <Button
            variant={action.variant || 'filled'}
            icon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <Card
        variant="outlined"
        className={`bs-empty-state ${className}`.trim()}
        style={{ borderStyle: 'dashed', ...style }}
      >
        {innerContent}
      </Card>
    );
  }

  return (
    <div
      className={`bs-empty-state ${className}`.trim()}
      style={style}
    >
      {innerContent}
    </div>
  );
}
