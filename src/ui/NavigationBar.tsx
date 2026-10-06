import { Icon } from './Icon.js';
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
  return (
    <nav
      role="navigation"
      aria-label="Navigasi Utama"
      className={`m3-navigation-bar ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        height: '80px',
        backgroundColor: 'var(--md-sys-color-surface-container)',
        borderTop: '1px solid var(--md-sys-color-surface-variant)',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
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
            role="tab"
            aria-selected={isActive}
            aria-label={item.label}
            onClick={() => onChange(item.id)}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 0',
              outline: 'none',
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
                transition: 'background-color 200ms ease',
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
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '12px',
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
                marginTop: '4px',
                transition: 'color 200ms ease',
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
