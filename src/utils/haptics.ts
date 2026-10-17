export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning';

/**
 * Triggers mobile haptic feedback using the Web Vibration API (navigator.vibrate).
 * Safely falls back on browsers/devices that do not support navigator.vibrate.
 */
export function triggerHaptic(style: HapticStyle = 'light'): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  if (typeof navigator.vibrate !== 'function') return;

  try {
    switch (style) {
      case 'light':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(24);
        break;
      case 'heavy':
        navigator.vibrate(40);
        break;
      case 'success':
        navigator.vibrate([18, 35, 30]);
        break;
      case 'warning':
        navigator.vibrate([30, 40, 30]);
        break;
      default:
        navigator.vibrate(12);
    }
  } catch {
    // Ignore vibration errors in restricted contexts
  }
}
