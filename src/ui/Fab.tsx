import '@material/web/fab/fab.js';
import { Icon } from './Icon.js';
import type { CSSProperties, MouseEvent } from 'react';

interface FabProps {
  icon: string;
  label?: string;
  variant?: 'surface' | 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  lowered?: boolean;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

export function Fab({
  icon,
  label,
  variant = 'primary',
  size = 'medium',
  lowered,
  onClick,
  className,
  style,
  ariaLabel,
}: FabProps) {
  return (
    <md-fab
      variant={variant}
      size={size}
      label={label}
      lowered={lowered}
      aria-label={ariaLabel || label || 'Aksi'}
      onClick={onClick}
      class={className}
      style={style}
    >
      <Icon slot="icon" name={icon} />
    </md-fab>
  );
}
