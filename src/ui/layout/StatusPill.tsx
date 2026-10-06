import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '../Icon.js';

export type StatusPillType = 'terlambat' | 'mendesak' | 'selesai' | 'netral' | 'info' | 'penting';

interface StatusPillProps {
  status: StatusPillType;
  label?: ReactNode;
  icon?: string;
  size?: 'small' | 'medium';
  className?: string;
  style?: CSSProperties;
}

export function StatusPill({
  status,
  label,
  icon,
  size = 'small',
  className = '',
  style,
}: StatusPillProps) {
  const getColors = () => {
    switch (status) {
      case 'terlambat':
        return {
          bg: 'var(--kk-status-terlambat-container)',
          color: 'var(--kk-status-on-terlambat-container)',
          defaultIcon: 'error',
          defaultLabel: 'Terlambat',
        };
      case 'mendesak':
        return {
          bg: 'var(--kk-status-mendesak-container)',
          color: 'var(--kk-status-on-mendesak-container)',
          defaultIcon: 'schedule',
          defaultLabel: 'Mendesak',
        };
      case 'selesai':
        return {
          bg: 'var(--kk-status-selesai-container)',
          color: 'var(--kk-status-on-selesai-container)',
          defaultIcon: 'check_circle',
          defaultLabel: 'Selesai',
        };
      case 'penting':
        return {
          bg: 'var(--md-sys-color-tertiary-container)',
          color: 'var(--md-sys-color-on-tertiary-container)',
          defaultIcon: 'flag',
          defaultLabel: 'Penting',
        };
      case 'info':
        return {
          bg: 'var(--md-sys-color-secondary-container)',
          color: 'var(--md-sys-color-on-secondary-container)',
          defaultIcon: 'info',
          defaultLabel: 'Info',
        };
      case 'netral':
      default:
        return {
          bg: 'var(--md-sys-color-surface-variant)',
          color: 'var(--md-sys-color-on-surface-variant)',
          defaultIcon: undefined,
          defaultLabel: '',
        };
    }
  };

  const config = getColors();
  const displayLabel = label ?? config.defaultLabel;
  const iconName = icon ?? config.defaultIcon;

  const isSmall = size === 'small';

  return (
    <span
      className={`bs-status-pill ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: isSmall ? '2px 8px' : '4px 10px',
        borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
        backgroundColor: config.bg,
        color: config.color,
        fontSize: isSmall ? 'var(--md-sys-typescale-label-small-size, 11px)' : 'var(--md-sys-typescale-label-medium-size, 12px)',
        fontWeight: 'var(--md-ref-typeface-weight-bold, 700)',
        lineHeight: 1.2,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {iconName && <Icon name={iconName} size={isSmall ? '12px' : '14px'} color={config.color} />}
      {displayLabel && <span>{displayLabel}</span>}
    </span>
  );
}
