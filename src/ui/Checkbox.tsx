import { useEffect, useRef } from 'react';
import '@material/web/checkbox/checkbox.js';
import type { CSSProperties } from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

export function Checkbox({
  checked,
  onChange,
  indeterminate,
  disabled,
  ariaLabel,
  className,
  style,
}: CheckboxProps) {
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      onChange(el.checked);
    };
    el.addEventListener('change', handler);
    return () => el.removeEventListener('change', handler);
  }, [onChange]);

  useEffect(() => {
    if (ref.current && ref.current.checked !== checked) {
      ref.current.checked = checked;
    }
  }, [checked]);

  useEffect(() => {
    if (ref.current && typeof indeterminate === 'boolean') {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <md-checkbox
      ref={ref}
      checked={checked}
      indeterminate={indeterminate}
      disabled={disabled}
      aria-label={ariaLabel}
      class={className}
      style={style}
    />
  );
}
