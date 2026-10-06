import '@material/web/iconbutton/icon-button.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import { Icon } from './Icon.js';
import type { CSSProperties, MouseEvent } from 'react';

export type IconButtonVariant = 'standard' | 'filled' | 'outlined';

interface IconButtonProps {
  icon: string;
  variant?: IconButtonVariant;
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  className?: string;
  style?: CSSProperties;
  ariaLabel: string;
}

export function IconButton({
  icon,
  variant = 'standard',
  disabled,
  onClick,
  className,
  style,
  ariaLabel,
}: IconButtonProps) {
  const commonProps = {
    disabled,
    onClick,
    class: className,
    style,
    'aria-label': ariaLabel,
  };

  const iconElement = <Icon name={icon} />;

  switch (variant) {
    case 'filled':
      return <md-filled-icon-button {...commonProps}>{iconElement}</md-filled-icon-button>;
    case 'outlined':
      return <md-outlined-icon-button {...commonProps}>{iconElement}</md-outlined-icon-button>;
    case 'standard':
    default:
      return <md-icon-button {...commonProps}>{iconElement}</md-icon-button>;
  }
}
