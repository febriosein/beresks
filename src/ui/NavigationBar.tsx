import { Icon } from './Icon.js';
import { haptic } from '../lib/haptic.js';
import type { CSSProperties } from 'react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  activeIcon?: string;
  badge?: number | string;
}

interface NavigationBarProps {
  items: NavigationItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export function NavigationBar({
  items,
  activeId,
  onChange,
  className = '',
  style,
}: NavigationBarProps) {
  const handleClick = (item: NavigationItem, isActive: boolean) => {
    if (isActive) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      haptic('selection');
      onChange(item.id);
    }
  };

  return (
    <nav
      aria-label="Navigasi Utama"
      className={`m3-navigation-bar ${className}`.trim()}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        height: 'var(--bs-nav-h, calc(64px + min(env(safe-area-inset-bottom, 0px), 14px)))',
        boxSizing: 'border-box',
        backgroundColor: 'var(--md-sys-color-surface-container)',
        borderTop: '1px solid var(--md-sys-color-surface-variant)',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        paddingTop: '6px',
        paddingBottom: 'calc(6px + var(--bs-safe-bottom, 0px))',
        ...style,
      }}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        const iconName = isActive ? item.activeIcon || item.icon : item.icon;

        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
            onClick={() => handleClick(item, isActive)}
            className="bs-nav-button"
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              position: 'relative',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Active Pill Indicator */}
            <div
              style={{
                width: '64px',
                height: '32px',
                borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                backgroundColor: isActive
                  ? 'var(--md-sys-color-secondary-container)'
                  : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'background-color var(--bs-dur-medium, 200ms) var(--bs-ease-emphasized, ease)',
              }}
            >
              <Icon
                name={iconName}
                color={
                  isActive
                    ? 'var(--md-sys-color-on-secondary-container)'
                    : 'var(--md-sys-color-on-surface-variant)'
                }
                size="24px"
              />

              {/* Badge */}
              {item.badge !== undefined && item.badge !== 0 && (
                <span
                  className="tabular"
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '10px',
                    backgroundColor: 'var(--md-sys-color-error)',
                    color: 'var(--md-sys-color-on-error)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    lineHeight: '14px',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              style={{
                fontFamily: 'var(--md-ref-typeface-plain)',
                fontSize: 'var(--md-sys-typescale-label-medium-size)',
                fontWeight: isActive
                  ? 'var(--md-ref-typeface-weight-bold)'
                  : 'var(--md-ref-typeface-weight-medium)',
                color: isActive
                  ? 'var(--md-sys-color-on-surface)'
                  : 'var(--md-sys-color-on-surface-variant)',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                textAlign: 'center',
                transition: 'color var(--bs-dur-medium, 200ms) ease',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
