import type { CSSProperties, ReactNode } from 'react';

interface ScreenProps {
  children: ReactNode;
  size?: 'normal' | 'wide' | 'full';
  className?: string;
  style?: CSSProperties;
}

export function Screen({
  children,
  size = 'normal',
  className = '',
  style,
}: ScreenProps) {
  const getMaxWidth = () => {
    switch (size) {
      case 'wide':
        return '960px';
      case 'full':
        return '100%';
      case 'normal':
      default:
        return '680px';
    }
  };

  return (
    <div
      className={`bs-screen ${className}`.trim()}
      style={{
        width: '100%',
        maxWidth: getMaxWidth(),
        margin: '0 auto',
        padding: 'var(--bs-space-4, 16px)',
        paddingBottom: 'var(--bs-screen-pad-bottom, 174px)',
        boxSizing: 'border-box',
        minHeight: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
