import { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Icon } from './Icon.js';
import { haptic } from '../lib/haptic.js';

interface ExtendedFabProps {
  icon: string;
  label: string;
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

export function ExtendedFab({
  icon,
  label,
  onClick,
  ariaLabel,
  className = '',
  style,
}: ExtendedFabProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;

          if (currentY < 60) {
            setIsExpanded(true);
          } else if (currentY > lastScrollY.current + 8) {
            // Scrolling down -> shrink to icon
            setIsExpanded(false);
          } else if (currentY < lastScrollY.current - 12) {
            // Scrolling up -> expand
            setIsExpanded(true);
          }

          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    haptic('medium');
    onClick();
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel || label}
      onClick={handleClick}
      className={`bs-extended-fab ${className}`.trim()}
      style={{
        position: 'fixed',
        bottom: 'var(--bs-fab-bottom, calc(80px + 16px))',
        right: '20px',
        zIndex: 45,
        height: '56px',
        minWidth: '56px',
        padding: isExpanded ? '0 20px 0 16px' : '0 16px',
        borderRadius: 'var(--md-sys-shape-corner-large, 16px)',
        backgroundColor: 'var(--md-sys-color-primary-container)',
        color: 'var(--md-sys-color-on-primary-container)',
        border: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isExpanded ? '10px' : '0',
        cursor: 'pointer',
        boxShadow: 'var(--bs-elev-3, 0 6px 16px rgba(0, 0, 0, 0.16))',
        transition: 'all var(--bs-dur-medium, 250ms) var(--bs-ease-emphasized, ease)',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        ...style,
      }}
    >
      <Icon name={icon} size="24px" color="var(--md-sys-color-on-primary-container)" />
      <span
        style={{
          fontFamily: 'var(--md-ref-typeface-brand)',
          fontSize: 'var(--md-sys-typescale-label-large-size, 14px)',
          fontWeight: 'var(--md-ref-typeface-weight-bold, 700)',
          letterSpacing: '0.1px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          maxWidth: isExpanded ? '180px' : '0px',
          opacity: isExpanded ? 1 : 0,
          transition: 'max-width var(--bs-dur-medium, 250ms) var(--bs-ease-emphasized), opacity var(--bs-dur-short, 150ms) ease',
        }}
      >
        {label}
      </span>
    </button>
  );
}
