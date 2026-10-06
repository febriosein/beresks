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

  const mergedStyle: CSSProperties = {
    fontFamily: 'var(--md-ref-typeface-brand)',
    fontWeight: 'var(--md-ref-typeface-weight-bold, 700)',
    padding: variant === 'text' ? '6px 12px' : '10px 20px',
    borderRadius: 'var(--md-sys-shape-corner-medium, 16px)',
    // @ts-expect-error - CSS custom properties for Material Web Button
    '--md-filled-button-label-text-weight': '700',
    '--md-outlined-button-label-text-weight': '700',
    '--md-text-button-label-text-weight': '700',
    '--md-elevated-button-label-text-weight': '700',
    '--md-filled-button-container-shape': '16px',
    '--md-outlined-button-container-shape': '16px',
    '--md-elevated-button-container-shape': '16px',
    '--md-filled-button-container-height': '44px',
    '--md-outlined-button-container-height': '44px',
    '--md-elevated-button-container-height': '44px',
    '--md-filled-button-label-text-size': '14px',
    '--md-outlined-button-label-text-size': '14px',
    '--md-elevated-button-label-text-size': '14px',
    '--md-filled-button-leading-space': '20px',
    '--md-filled-button-trailing-space': '20px',
    '--md-filled-button-with-leading-icon-leading-space': '16px',
    '--md-filled-button-with-leading-icon-trailing-space': '20px',
    '--md-outlined-button-leading-space': '20px',
    '--md-outlined-button-trailing-space': '20px',
    '--md-outlined-button-with-leading-icon-leading-space': '16px',
    '--md-outlined-button-with-leading-icon-trailing-space': '20px',
    ...style,
  };

  const commonProps = {
    disabled,
    onClick,
    onPointerDown,
    onPointerUp,
    class: className,
    style: mergedStyle,
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
