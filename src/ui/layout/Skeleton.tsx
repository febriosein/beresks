import type { CSSProperties } from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  borderRadius,
  className = '',
  style,
}: SkeletonProps) {
  const getDefaultDimensions = () => {
    switch (variant) {
      case 'circular':
        return {
          width: width ?? '40px',
          height: height ?? '40px',
          borderRadius: '50%',
        };
      case 'card':
        return {
          width: width ?? '100%',
          height: height ?? '96px',
          borderRadius: borderRadius ?? 'var(--md-sys-shape-corner-large, 16px)',
        };
      case 'rectangular':
        return {
          width: width ?? '100%',
          height: height ?? '48px',
          borderRadius: borderRadius ?? 'var(--md-sys-shape-corner-medium, 12px)',
        };
      case 'text':
      default:
        return {
          width: width ?? '100%',
          height: height ?? '16px',
          borderRadius: borderRadius ?? 'var(--md-sys-shape-corner-extra-small, 4px)',
        };
    }
  };

  const dims = getDefaultDimensions();

  return (
    <div
      aria-hidden="true"
      className={`bs-skeleton ${className}`.trim()}
      style={{
        ...dims,
        backgroundColor: 'var(--md-sys-color-surface-container-high)',
        opacity: 0.7,
        animation: 'bs-skeleton-pulse 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ lines = 2, style }: { lines?: number; style?: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      style={{
        backgroundColor: 'var(--md-sys-color-surface-container)',
        borderRadius: 'var(--md-sys-shape-corner-large, 16px)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        ...style,
      }}
    >
      <Skeleton width="45%" height="20px" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '70%' : '90%'} height="14px" />
      ))}
    </div>
  );
}
