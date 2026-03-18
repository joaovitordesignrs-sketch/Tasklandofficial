/**
 * CardIn — Micro-animation wrapper for RPG card entrance.
 * Applies a subtle translateY + scale + fade on mount.
 *
 * Usage:
 *   <CardIn index={i}>...</CardIn>
 *
 * Or inline (no extra DOM node):
 *   style={{ ...cardInStyle(i) }}
 */
import type { ReactNode, CSSProperties } from "react";

const EASING  = "cubic-bezier(0.22, 1, 0.36, 1)";
const DURATION = 240; // ms
const MAX_DELAY = 380; // ms — cap so long lists don't feel sluggish

/** Returns the animation style for staggered entrance. index is 0-based. */
export function cardInStyle(index = 0, durationMs = DURATION): CSSProperties {
  const delay = Math.min(index * 48, MAX_DELAY);
  return {
    animation: `cardIn ${durationMs}ms ${EASING} ${delay}ms both`,
  };
}

/** Wrapper div that animates its children in on mount. */
export function CardIn({
  children,
  index = 0,
  style,
  className,
}: {
  children: ReactNode;
  index?: number;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{ ...cardInStyle(index), ...style }}
    >
      {children}
    </div>
  );
}
