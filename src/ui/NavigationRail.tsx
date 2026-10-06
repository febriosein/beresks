import { Icon } from './Icon.js';
import { haptic } from '../lib/haptic.js';
import type { NavigationItem } from './NavigationBar.js';
import type { CSSProperties } from 'react';

interface NavigationRailProps {
  items: NavigationItem[];
  activeId: string;
  onChange: (id: string) => void;
  onOpenSettings?: () => void;
  className?: string;
  style?: CSSProperties;
}

export function NavigationRail({
  items,
  activeId,
  onChange,
  onOpenSettings,
  className = '',
  style,
}: NavigationRailProps) {
  const handleClick = (item: NavigationItem, isActive: boolean) => {
    if (isActive) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      haptic('selection');
      onChange(item.id);
    }
  };

  return (
    <aside
      aria-label="Navigasi Samping"
      className={`bs-navigation-rail ${className}`.trim()}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 'var(--bs-rail-w, 88px)',
        backgroundColor: 'var(--md-sys-color-surface-container)',
        borderRight: '1px solid var(--md-sys-color-surface-variant)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 0',
        zIndex: 50,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* Top Brand Logo */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          marginBottom: '24px',
        }}
      >
        <img
          src="/logo.png"
          alt="BereSKS"
          style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }}
        />
        <span
          style={{
            fontFamily: 'var(--md-ref-typeface-brand)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '-0.2px',
            color: 'var(--md-sys-color-primary)',
          }}
        >
          BereSKS
        </span>
      </div>

      {/* Nav items */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flex: 1,
          width: '100%',
          alignItems: 'center',
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
              style={{
                width: '68px',
                height: '56px',
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
                borderRadius: '12px',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Active Pill Indicator */}
              <div
                style={{
                  width: '56px',
                  height: '32px',
                  borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                  backgroundColor: isActive
                    ? 'var(--md-sys-color-secondary-container)'
                    : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'background-color var(--bs-dur-medium, 200ms) var(--bs-ease-emphasized)',
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
                      right: '6px',
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
                  fontSize: 'var(--md-sys-typescale-label-small-size, 11px)',
                  fontWeight: isActive
                    ? 'var(--md-ref-typeface-weight-bold, 700)'
                    : 'var(--md-ref-typeface-weight-medium, 500)',
                  color: isActive
                    ? 'var(--md-sys-color-on-surface)'
                    : 'var(--md-sys-color-on-surface-variant)',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Settings at Bottom */}
      {onOpenSettings && (
        <button
          type="button"
          aria-label="Pengaturan"
          onClick={() => {
            haptic('selection');
            onOpenSettings();
          }}
          style={{
            width: '56px',
            height: '48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '12px',
            color: 'var(--md-sys-color-on-surface-variant)',
          }}
        >
          <Icon name="settings" size="24px" />
          <span
            style={{
              fontFamily: 'var(--md-ref-typeface-plain)',
              fontSize: '10px',
              marginTop: '2px',
            }}
          >
            Pengaturan
          </span>
        </button>
      )}
    </aside>
  );
}
