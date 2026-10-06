import { useEffect, useRef } from 'react';
import '@material/web/textfield/outlined-text-field.js';
import { Icon } from './Icon.js';
import type { CSSProperties, KeyboardEvent } from 'react';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'time' | 'date' | 'textarea';
  rows?: number;
  placeholder?: string;
  supportingText?: string;
  error?: boolean;
  errorText?: string;
  prefixText?: string;
  suffixText?: string;
  leadingIcon?: string;
  trailingIcon?: string;
  autoFocus?: boolean;
  required?: boolean;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  className?: string;
  style?: CSSProperties;
  onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
}

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  rows,
  placeholder,
  supportingText,
  error,
  errorText,
  prefixText,
  suffixText,
  leadingIcon,
  trailingIcon,
  autoFocus,
  required,
  disabled,
  min,
  max,
  step,
  className,
  style,
  onKeyDown,
}: TextFieldProps) {
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      onChange(el.value ?? '');
    };
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
    return () => {
      el.removeEventListener('input', handler);
      el.removeEventListener('change', handler);
    };
  }, [onChange]);

  useEffect(() => {
    if (ref.current && ref.current.value !== value) {
      ref.current.value = value;
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && ref.current) {
      // Small timeout ensures web component is attached and ready
      const t = setTimeout(() => {
        ref.current?.focus();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  return (
    <md-outlined-text-field
      ref={ref}
      label={label}
      value={value}
      type={type}
      rows={rows}
      placeholder={placeholder}
      supporting-text={supportingText}
      error={error}
      error-text={errorText}
      prefix-text={prefixText}
      suffix-text={suffixText}
      required={required}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      class={className}
      style={style}
      onKeyDown={onKeyDown}
      onInput={(e: any) => onChange(e.target.value ?? '')}
      onChange={(e: any) => onChange(e.target.value ?? '')}
    >
      {leadingIcon && <Icon slot="leading-icon" name={leadingIcon} />}
      {trailingIcon && <Icon slot="trailing-icon" name={trailingIcon} />}
    </md-outlined-text-field>
  );
}
