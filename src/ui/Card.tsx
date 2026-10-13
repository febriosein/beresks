import { forwardRef } from 'react';
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import '@material/web/labs/card/elevated-card.js';
import '@material/web/labs/card/filled-card.js';
import '@material/web/labs/card/outlined-card.js';
import '@material/web/ripple/ripple.js';
import '@material/web/focus/md-focus-ring.js';

export type CardVariant = 'elevated' | 'filled' | 'outlined';

export interface CardProps {
  variant?: CardVariant;
  interactive?: boolean;
  children?: ReactNode;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  className?: string;
  style?: CSSProperties;
  role?: string;
  tabIndex?: number;
  'aria-label'?: string;
  disabled?: boolean;
  onPointerDown?: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLElement>) => void;
  id?: string;
}

export interface CardHeaderProps {
  headline?: ReactNode;
  subhead?: ReactNode;
  avatar?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function CardHeader({
  headline,
  subhead,
  avatar,
  action,
  children,
  className = '',
  style,
}: CardHeaderProps) {
  return (
    <div
      className={`m3-card-header ${className}`.trim()}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '12px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        {avatar && <div className="m3-card-avatar" style={{ flexShrink: 0 }}>{avatar}</div>}
        <div style={{ minWidth: 0, flex: 1 }}>
          {headline && (
            <div
              className="typescale-title-medium"
              style={{
                fontFamily: 'var(--md-ref-typeface-brand, var(--md-ref-typeface-plain))',
                fontWeight: 700,
                color: 'var(--md-sys-color-on-surface)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {headline}
            </div>
          )}
          {subhead && (
            <div
              className="typescale-body-medium"
              style={{
                color: 'var(--md-sys-color-on-surface-variant)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {subhead}
            </div>
          )}
          {children}
        </div>
      </div>
      {action && <div className="m3-card-header-action" style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

export interface CardContentProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function CardContent({ children, className = '', style }: CardContentProps) {
  return (
    <div
      className={`m3-card-content ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        color: 'var(--md-sys-color-on-surface-variant)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export interface CardActionsProps {
  children?: ReactNode;
  align?: 'start' | 'end' | 'space-between';
  className?: string;
  style?: CSSProperties;
}

export function CardActions({
  children,
  align = 'end',
  className = '',
  style,
}: CardActionsProps) {
  const justify =
    align === 'start'
      ? 'flex-start'
      : align === 'space-between'
        ? 'space-between'
        : 'flex-end';

  return (
    <div
      className={`m3-card-actions ${className}`.trim()}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: justify,
        gap: '8px',
        marginTop: '12px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export interface CardMediaProps {
  src?: string;
  alt?: string;
  aspectRatio?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function CardMedia({
  src,
  alt = '',
  aspectRatio = '16 / 9',
  children,
  className = '',
  style,
}: CardMediaProps) {
  return (
    <div
      className={`m3-card-media ${className}`.trim()}
      style={{
        width: 'calc(100% + 2rem)',
        margin: '-1rem -1rem 1rem -1rem',
        aspectRatio,
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 'inherit',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        ...style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        children
      )}
    </div>
  );
}

interface CardComponent
  extends React.ForwardRefExoticComponent<
    CardProps & React.RefAttributes<HTMLElement>
  > {
  Header: typeof CardHeader;
  Content: typeof CardContent;
  Actions: typeof CardActions;
  Media: typeof CardMedia;
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  {
    variant = 'filled',
    interactive,
    children,
    onClick,
    className = '',
    style,
    role,
    tabIndex,
    'aria-label': ariaLabel,
    disabled = false,
    onPointerDown,
    onPointerUp,
    id,
    ...restProps
  },
  ref
) {
  const isInteractive = (interactive !== undefined ? interactive : Boolean(onClick)) && !disabled;

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!isInteractive || !onClick) return;
    const target = e.target as HTMLElement | null;
    if (
      target &&
      target !== e.currentTarget &&
      (target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'A' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName.startsWith('MD-'))
    ) {
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(e as unknown as MouseEvent<HTMLElement>);
    }
  };

  const isFlex = style?.display === 'flex';
  const flexDirection = style?.flexDirection ?? (isFlex ? 'row' : 'column');

  const containerShape = style?.borderRadius ?? 'var(--md-sys-shape-corner-large, 16px)';
  const containerColor =
    style?.backgroundColor ??
    (variant === 'outlined'
      ? 'var(--md-sys-color-surface)'
      : variant === 'elevated'
        ? 'var(--md-sys-color-surface-container-low)'
        : 'var(--md-sys-color-surface-container)');

  const outlineColor =
    style?.borderColor ?? 'var(--md-sys-color-outline-variant)';

  const hasCustomBorder = Boolean(style?.border || style?.borderStyle || style?.borderWidth);

  const cardStyle: CSSProperties & Record<string, any> = {
    // Custom Material Web Tokens
    '--md-elevated-card-container-shape': containerShape,
    '--md-filled-card-container-shape': containerShape,
    '--md-outlined-card-container-shape': containerShape,

    '--md-elevated-card-container-color': containerColor,
    '--md-filled-card-container-color': containerColor,
    '--md-outlined-card-container-color': containerColor,

    '--md-outlined-card-outline-color': hasCustomBorder ? 'transparent' : outlineColor,
    ...(hasCustomBorder ? { '--md-outlined-card-outline-width': '0px' } : {}),

    // Ripple state tokens
    '--md-ripple-hover-color': 'var(--md-sys-color-on-surface)',
    '--md-ripple-pressed-color': 'var(--md-sys-color-on-surface)',

    // Focus ring token
    '--md-focus-ring-color': 'var(--md-sys-color-primary)',
    '--md-focus-ring-shape': containerShape,

    // Layout & Surface Defaults
    fontFamily: 'var(--md-ref-typeface-plain)',
    color: 'var(--md-sys-color-on-surface)',
    padding: style?.padding ?? '1rem',
    display: style?.display ?? 'flex',
    flexDirection,
    position: 'relative',
    boxSizing: 'border-box',
    ...(isInteractive
      ? {
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }
      : {}),
    ...style,
  };

  const interactiveClass = isInteractive ? 'm3-card--interactive' : '';

  const commonProps = {
    ref,
    id,
    class: `m3-card ${interactiveClass} ${className}`.trim(),
    style: cardStyle,
    onClick: isInteractive ? onClick : undefined,
    onKeyDown: isInteractive ? handleKeyDown : undefined,
    onPointerDown,
    onPointerUp,
    role: role || (isInteractive ? 'button' : undefined),
    tabIndex: tabIndex ?? (isInteractive ? 0 : undefined),
    'aria-label': ariaLabel,
    'aria-disabled': disabled ? true : undefined,
    ...restProps,
  };

  const content = (
    <>
      {isInteractive && (
        <>
          <md-ripple aria-hidden="true" disabled={disabled} />
          <md-focus-ring aria-hidden="true" />
        </>
      )}
      {children}
    </>
  );

  switch (variant) {
    case 'elevated':
      return <md-elevated-card {...commonProps}>{content}</md-elevated-card>;
    case 'outlined':
      return <md-outlined-card {...commonProps}>{content}</md-outlined-card>;
    case 'filled':
    default:
      return <md-filled-card {...commonProps}>{content}</md-filled-card>;
  }
}) as CardComponent;

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Actions = CardActions;
Card.Media = CardMedia;
