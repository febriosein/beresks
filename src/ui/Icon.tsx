import '@material/web/icon/icon.js';
import { ICONS_DATA } from './iconsData.js';
import type { CSSProperties } from 'react';

export interface IconProps {
  name: string;
  slot?: string;
  className?: string;
  style?: CSSProperties;
  size?: number | string;
  color?: string;
  'aria-hidden'?: boolean;
}

export function Icon({
  name,
  slot,
  className,
  style,
  size = '24px',
  color,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  const path = ICONS_DATA[name];
  const sizeValue = typeof size === 'number' ? `${size}px` : size;

  const customStyle: CSSProperties = {
    width: sizeValue,
    height: sizeValue,
    fontSize: sizeValue,
    color,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    verticalAlign: 'middle',
    userSelect: 'none',
    // @ts-expect-error - CSS variable for md-icon
    '--md-icon-size': sizeValue,
    ...style,
  };

  return (
    <md-icon
      slot={slot}
      class={className}
      style={customStyle}
      aria-hidden={ariaHidden}
    >
      {path ? (
        <svg
          viewBox="0 -960 960 960"
          width="100%"
          height="100%"
          fill="currentColor"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <path d={path} />
        </svg>
      ) : (
        name
      )}
    </md-icon>
  );
}
