import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';

interface ListProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function List({ children, className, style }: ListProps) {
  return (
    <md-list class={className} style={style}>
      {children}
    </md-list>
  );
}

interface ListItemProps {
  headline: ReactNode;
  supportingText?: ReactNode;
  trailingSupportingText?: ReactNode;
  start?: ReactNode;
  end?: ReactNode;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function ListItem({
  headline,
  supportingText,
  trailingSupportingText,
  start,
  end,
  onClick,
  disabled,
  className,
  style,
}: ListItemProps) {
  const isInteractive = Boolean(onClick);

  return (
    <md-list-item
      type={isInteractive ? 'button' : undefined}
      disabled={disabled}
      onClick={onClick}
      class={className}
      style={style}
    >
      {start && <div slot="start">{start}</div>}
      <div slot="headline">{headline}</div>
      {supportingText && <div slot="supporting-text">{supportingText}</div>}
      {trailingSupportingText && <div slot="trailing-supporting-text">{trailingSupportingText}</div>}
      {end && <div slot="end">{end}</div>}
    </md-list-item>
  );
}
