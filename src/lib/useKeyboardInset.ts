import { useEffect, useState } from 'react';

/**
 * Hook to detect virtual keyboard inset height on mobile devices
 * using window.visualViewport.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const vv = window.visualViewport;

    const handleResize = () => {
      // If layout viewport is larger than visual viewport, keyboard is open
      const keyboardHeight = Math.max(0, window.innerHeight - vv.height);
      // Small threshold (e.g. 80px) to avoid false positives from browser address bars
      setInset(keyboardHeight > 80 ? keyboardHeight : 0);
    };

    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);

    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
    };
  }, []);

  return inset;
}
