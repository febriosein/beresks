import { Icon } from './Icon.js';
import type { CSSProperties } from 'react';

export interface SegmentItem<T extends string = string> {
  value: T;
  label: string;
  icon?: string;
}

interface SegmentedButtonProps<T extends string = string> {
  segments: SegmentItem<T>[];
  selected: T;
  onChange: (value: T) => void;
  className?: string;
  style?: CSSProperties;
}

export function SegmentedButton<T extends string = string>({
  segments,
  selected,
  onChange,
  className = '',
  style,
}: SegmentedButtonProps<T>) {
  return (
    <div
      role="group"
      className={`m3-segmented-button-set ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid var(--md-sys-color-outline)',
        borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
        overflow: 'hidden',
        height: '40px',
        ...style,
      }}
    >
      {segments.map((segment, index) => {
        const isSelected = segment.value === selected;
        const isFirst = index === 0;
        const isLast = index === segments.length - 1;

        return (
          <button
            key={segment.value}
            type="button"
            onClick={() => onChange(segment.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '0 16px',
              height: '100%',
              minWidth: '48px',
              minHeight: '48px',
              border: 'none',
              borderLeft: isFirst ? 'none' : '1px solid var(--md-sys-color-outline)',
              background: isSelected
                ? 'var(--md-sys-color-secondary-container)'
                : 'transparent',
              color: isSelected
                ? 'var(--md-sys-color-on-secondary-container)'
                : 'var(--md-sys-color-on-surface)',
              fontFamily: 'var(--md-ref-typeface-plain)',
              fontSize: 'var(--md-sys-typescale-label-large-size)',
              fontWeight: isSelected
                ? 'var(--md-ref-typeface-weight-medium)'
                : 'var(--md-ref-typeface-weight-regular)',
              cursor: 'pointer',
              transition: 'background-color 150ms ease, color 150ms ease',
              borderRadius: isFirst
                ? 'var(--md-sys-shape-corner-full, 9999px) 0 0 var(--md-sys-shape-corner-full, 9999px)'
                : isLast
                ? '0 var(--md-sys-shape-corner-full, 9999px) var(--md-sys-shape-corner-full, 9999px) 0'
                : '0',
            }}
          >
            {isSelected && <Icon name={segment.icon || 'check'} size="18px" />}
            {!isSelected && segment.icon && <Icon name={segment.icon} size="18px" />}
            <span>{segment.label}</span>
          </button>
        );
      })}
    </div>
  );
}
