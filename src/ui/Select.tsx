import { useEffect, useRef } from 'react';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import { Icon } from './Icon.js';
import type { CSSProperties } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  supportingText?: string;
  icon?: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  supportingText?: string;
  error?: boolean;
  errorText?: string;
  className?: string;
  style?: CSSProperties;
}

export function Select({
  label,
  value,
  options,
  onChange,
  disabled,
  required,
  supportingText,
  error,
  errorText,
  className,
  style,
}: SelectProps) {
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      onChange(el.value);
    };
    el.addEventListener('change', handler);
    return () => el.removeEventListener('change', handler);
  }, [onChange]);

  useEffect(() => {
    if (ref.current && ref.current.value !== value) {
      ref.current.value = value;
    }
  }, [value]);

  return (
    <md-outlined-select
      ref={ref}
      label={label}
      value={value}
      disabled={disabled}
      required={required}
      supporting-text={supportingText}
      error={error}
      error-text={errorText}
      class={className}
      style={style}
    >
      {options.map((opt) => (
        <md-select-option
          key={opt.value}
          value={opt.value}
          selected={opt.value === value}
        >
          {opt.icon && <Icon slot="start" name={opt.icon} />}
          <div slot="headline">{opt.label}</div>
          {opt.supportingText && <div slot="supporting-text">{opt.supportingText}</div>}
        </md-select-option>
      ))}
    </md-outlined-select>
  );
}
