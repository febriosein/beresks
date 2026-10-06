import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/chips/assist-chip.js';
import '@material/web/chips/input-chip.js';
import { Icon } from './Icon.js';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';

interface ChipSetProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function ChipSet({ children, className, style }: ChipSetProps) {
  return (
    <md-chip-set class={className} style={style}>
      {children}
    </md-chip-set>
  );
}

interface FilterChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  className?: string;
  style?: CSSProperties;
}

export function FilterChip({
  label,
  selected,
  disabled,
  icon,
  onClick,
  className,
  style,
}: FilterChipProps) {
  return (
    <md-filter-chip
      label={label}
      selected={selected}
      disabled={disabled}
      onClick={onClick}
      class={className}
      style={style}
    >
      {icon && <Icon slot="icon" name={icon} />}
    </md-filter-chip>
  );
}

interface AssistChipProps {
  label: string;
  disabled?: boolean;
  icon?: string;
  elevated?: boolean;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  className?: string;
  style?: CSSProperties;
}

export function AssistChip({
  label,
  disabled,
  icon,
  elevated,
  onClick,
  className,
  style,
}: AssistChipProps) {
  return (
    <md-assist-chip
      label={label}
      disabled={disabled}
      elevated={elevated}
      onClick={onClick}
      class={className}
      style={style}
    >
      {icon && <Icon slot="icon" name={icon} />}
    </md-assist-chip>
  );
}

interface InputChipProps {
  label: string;
  icon?: string;
  onRemove?: () => void;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  className?: string;
  style?: CSSProperties;
}

export function InputChip({
  label,
  icon,
  onRemove,
  onClick,
  className,
  style,
}: InputChipProps) {
  return (
    <md-input-chip
      label={label}
      remove-only={!!onRemove}
      onClick={onClick}
      onRemove={onRemove}
      class={className}
      style={style}
    >
      {icon && <Icon slot="icon" name={icon} />}
    </md-input-chip>
  );
}
