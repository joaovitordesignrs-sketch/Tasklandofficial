/**
 * RpgTooltip — Pixel-art styled tooltip.
 * Hover on desktop, long-press on mobile.
 * Keyboard accessible via Tab + Enter.
 */
import { useState, useRef, useCallback, type ReactNode } from "react";
import { FONT_BODY, ACCENT_GOLD, BG_DEEPEST, BORDER_SUBTLE } from "../../data/tokens";

interface RpgTooltipProps {
  /** Tooltip content (text or JSX) */
  content: ReactNode;
  children: ReactNode;
  /** Max width in px (default 260) */
  maxWidth?: number;
}

export function RpgTooltip({ content, children, maxWidth = 260 }: RpgTooltipProps) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    timerRef.current = setTimeout(() => setOpen(false), 120);
  }, []);

  // Long-press for mobile
  const onTouchStart = useCallback(() => {
    longPressRef.current = setTimeout(show, 400);
  }, [show]);

  const onTouchEnd = useCallback(() => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
    if (open) hide();
  }, [open, hide]);

  return (
    <span
      style={{ position: "relative", display: "inline-flex", cursor: "help" }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onFocus={show}
      onBlur={hide}
      tabIndex={0}
      role="button"
      aria-label="Show tooltip"
    >
      {children}
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: BG_DEEPEST,
            border: `1px dashed ${ACCENT_GOLD}88`,
            borderRadius: 6,
            padding: "8px 12px",
            maxWidth,
            width: "max-content",
            fontFamily: FONT_BODY,
            fontSize: 15,
            color: "#c8d0f0",
            lineHeight: 1.4,
            textAlign: "left",
            boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 8px ${ACCENT_GOLD}22`,
            pointerEvents: "none",
            animation: "tooltipIn 0.15s ease-out",
          }}
        >
          {content}
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              bottom: -5,
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: 8,
              height: 8,
              background: BG_DEEPEST,
              borderRight: `1px dashed ${ACCENT_GOLD}88`,
              borderBottom: `1px dashed ${ACCENT_GOLD}88`,
            }}
          />
        </div>
      )}
    </span>
  );
}
