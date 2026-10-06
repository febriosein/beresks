export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error';

const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  selection: 8,
  success: [15, 50, 20],
  warning: [25, 60, 25],
  error: [40, 70, 40],
};

/**
 * Trigger haptic vibration feedback safely.
 * Returns true if supported and triggered, false otherwise.
 */
export function haptic(type: HapticType = 'light'): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
    return false;
  }

  try {
    const pattern = HAPTIC_PATTERNS[type] ?? 10;
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}
