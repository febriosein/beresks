import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/button/elevated-button.js';
import { Icon } from './Icon.js';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';

export type ButtonVariant = 'filled' | 'outlined' | 'text' | 'elevated';

interface ButtonProps {
  variant?: ButtonVariant;
  children?: ReactNode;
  icon?: string;
  trailingIcon?: string;
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  type?: 'button' | 'submit' | 'reset';
  onPointerDown?: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLElement>) => void;
}

export function Button({
  variant = 'filled',
  children,
  icon,
  trailingIcon,
  disabled,
  onClick,
  className,
  style,
  ariaLabel,
  type = 'button',
  onPointerDown,
  onPointerUp,
}: ButtonProps) {
  const content = (
    <>
      {icon && <Icon slot="icon" name={icon} />}
      {children}
      {trailingIcon && <Icon slot="trailing-icon" name={trailingIcon} />}
    </>
  );

  const commonProps = {
    disabled,
    onClick,
    onPointerDown,
    onPointerUp,
    class: className,
    style,
    'aria-label': ariaLabel,
    type,
  };

  switch (variant) {
    case 'outlined':
      return <md-outlined-button {...commonProps}>{content}</md-outlined-button>;
    case 'text':
      return <md-text-button {...commonProps}>{content}</md-text-button>;
    case 'elevated':
      return <md-elevated-button {...commonProps}>{content}</md-elevated-button>;
    case 'filled':
    default:
      return <md-filled-button {...commonProps}>{content}</md-filled-button>;
  }
}
