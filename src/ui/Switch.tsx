import { useEffect, useRef } from 'react';
import '@material/web/switch/switch.js';
import type { CSSProperties } from 'react';

interface SwitchProps {
  selected: boolean;
  onChange: (selected: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

export function Switch({
  selected,
  onChange,
  disabled,
  ariaLabel,
  className,
  style,
}: SwitchProps) {
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      onChange(el.selected);
    };
    el.addEventListener('change', handler);
    return () => el.removeEventListener('change', handler);
  }, [onChange]);

  useEffect(() => {
    if (ref.current && ref.current.selected !== selected) {
      ref.current.selected = selected;
    }
  }, [selected]);

  return (
    <md-switch
      ref={ref}
      selected={selected}
      disabled={disabled}
      aria-label={ariaLabel}
      class={className}
      style={style}
    />
  );
}
