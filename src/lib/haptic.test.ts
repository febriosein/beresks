import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { haptic } from './haptic.js';

describe('haptic feedback helper', () => {
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it('safely handles environments without navigator.vibrate', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      configurable: true,
      writable: true,
    });

    const result = haptic('light');
    expect(result).toBe(false);
  });

  it('triggers navigator.vibrate when available', () => {
    const vibrateMock = vi.fn().mockReturnValue(true);
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: vibrateMock },
      configurable: true,
      writable: true,
    });

    const result = haptic('success');
    expect(result).toBe(true);
    expect(vibrateMock).toHaveBeenCalledWith([15, 50, 20]);
  });

  it('handles exceptions thrown by vibrate safely', () => {
    const vibrateMock = vi.fn().mockImplementation(() => {
      throw new Error('Not allowed');
    });
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: vibrateMock },
      configurable: true,
      writable: true,
    });

    const result = haptic('warning');
    expect(result).toBe(false);
  });
});
