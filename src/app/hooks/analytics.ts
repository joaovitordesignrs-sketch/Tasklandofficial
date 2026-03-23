/**
 * analytics.ts — Lightweight wrapper for Microsoft Clarity custom events.
 *
 * Usage:
 *   import { track, identify } from "../hooks/analytics";
 *   track("task_completed", { difficulty: "hard", xp: 75 });
 *   identify("user_123", "nick");
 */

declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

/** Fire a custom event visible in Clarity dashboard → Custom Events */
export function track(event: string, data?: Record<string, string | number | boolean>) {
  try {
    window.clarity?.("event", event);
    if (data) {
      for (const [key, val] of Object.entries(data)) {
        window.clarity?.("set", `${event}_${key}`, String(val));
      }
    }
  } catch (_) {}
}

/** Identify user for Clarity session linking */
export function identify(userId: string, friendlyName?: string) {
  try {
    window.clarity?.("identify", userId, undefined, undefined, friendlyName);
  } catch (_) {}
}

/** Set a custom tag on the session (appears in Clarity filters) */
export function tag(key: string, value: string) {
  try {
    window.clarity?.("set", key, value);
  } catch (_) {}
}
