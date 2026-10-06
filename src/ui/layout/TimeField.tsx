import type { CSSProperties, ChangeEvent } from 'react';
import { Icon } from '../Icon.js';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  icon?: string;
  error?: string;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

export function TimeField({
  label,
  value,
  onChange,
  required,
  disabled,
  icon = 'schedule',
  error,
  className = '',
  style,
  id,
}: InputFieldProps) {
  const inputId = id || `time-field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div
      className={`bs-time-field ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: '100%',
        ...style,
      }}
    >
      <label
        htmlFor={inputId}
        style={{
          fontFamily: 'var(--md-ref-typeface-plain)',
          fontSize: 'var(--md-sys-typescale-label-medium-size, 12px)',
          fontWeight: 'var(--md-ref-typeface-weight-medium, 500)',
          color: error ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface-variant)',
        }}
      >
        {label}
        {required && ' *'}
      </label>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--md-sys-color-surface-container-high)',
          borderRadius: 'var(--md-sys-shape-corner-small, 8px)',
          border: `1px solid ${error ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-outline-variant)'}`,
          minHeight: '48px',
          padding: '0 12px',
          boxSizing: 'border-box',
        }}
      >
        {icon && (
          <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
            <Icon
              name={icon}
              size="20px"
              color={error ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface-variant)'}
            />
          </span>
        )}
        <input
          id={inputId}
          type="time"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className="tabular"
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            color: 'var(--md-sys-color-on-surface)',
            fontFamily: 'var(--md-ref-typeface-brand)',
            fontSize: 'var(--md-sys-typescale-body-large-size, 16px)',
            fontWeight: 500,
            outline: 'none',
            minHeight: '44px',
            width: '100%',
          }}
        />
      </div>

      {error && (
        <span
          style={{
            fontSize: 'var(--md-sys-typescale-body-small-size, 12px)',
            color: 'var(--md-sys-color-error)',
            marginTop: '2px',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

export function DateField({
  label,
  value,
  onChange,
  required,
  disabled,
  icon = 'calendar_today',
  error,
  className = '',
  style,
  id,
}: InputFieldProps) {
  const inputId = id || `date-field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div
      className={`bs-date-field ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: '100%',
        ...style,
      }}
    >
      <label
        htmlFor={inputId}
        style={{
          fontFamily: 'var(--md-ref-typeface-plain)',
          fontSize: 'var(--md-sys-typescale-label-medium-size, 12px)',
          fontWeight: 'var(--md-ref-typeface-weight-medium, 500)',
          color: error ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface-variant)',
        }}
      >
        {label}
        {required && ' *'}
      </label>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--md-sys-color-surface-container-high)',
          borderRadius: 'var(--md-sys-shape-corner-small, 8px)',
          border: `1px solid ${error ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-outline-variant)'}`,
          minHeight: '48px',
          padding: '0 12px',
          boxSizing: 'border-box',
        }}
      >
        {icon && (
          <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
            <Icon
              name={icon}
              size="20px"
              color={error ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface-variant)'}
            />
          </span>
        )}
        <input
          id={inputId}
          type="date"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className="tabular"
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            color: 'var(--md-sys-color-on-surface)',
            fontFamily: 'var(--md-ref-typeface-brand)',
            fontSize: 'var(--md-sys-typescale-body-large-size, 16px)',
            fontWeight: 500,
            outline: 'none',
            minHeight: '44px',
            width: '100%',
          }}
        />
      </div>

      {error && (
        <span
          style={{
            fontSize: 'var(--md-sys-typescale-body-small-size, 12px)',
            color: 'var(--md-sys-color-error)',
            marginTop: '2px',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
