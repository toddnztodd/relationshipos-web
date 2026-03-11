import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Haptic feedback utility — fires navigator.vibrate() with a safe capability check.
 * Falls back silently on unsupported browsers/devices.
 *
 * @param pattern - Duration in ms or an array of [vibrate, pause, vibrate, ...] ms values.
 */
export function haptic(pattern: number | number[] = 10): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Silently ignore — some browsers throw on vibrate
    }
  }
}

/** Preset haptic patterns for consistent feel across the app */
export const HapticPattern = {
  /** Light tap — checklist completion, minor actions */
  tap: 10,
  /** Medium tap — door knock result selection, voice start */
  knock: 15,
  /** Double-tap feel — referral registration */
  doubleTap: [10, 50, 10] as number[],
  /** Voice stop */
  voiceStop: 10,
  /** Voice start */
  voiceStart: 20,
} as const;
