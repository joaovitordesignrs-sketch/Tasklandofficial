import React from "react";

/**
 * Pixel-art "rounded" card.
 *
 * Each corner is a 2-step staircase (12 px overall, 6 px per step), giving
 * the characteristic blocky rounded look of classic pixel-art UIs.
 *
 * Structure (3 layers):
 *   shadow-wrapper  →  drop-shadow follows the clipped shape
 *     border-layer  →  clip-path applied here; background = border color
 *       content     →  no clip-path needed (outer already clips everything)
 */

// 2-step staircase at every corner (6 px step × 2 = 12 px corner radius)
export const PIXEL_CLIP =
  "polygon(" +
  "12px 0px, calc(100% - 12px) 0px," +            // top edge
  "calc(100% - 6px) 0px," +                       // TR step-1 →
  "calc(100% - 6px) 6px," +                       // TR step-1 ↓
  "100% 6px," +                                   // TR step-2 →
  "100% 12px," +                                  // TR step-2 ↓ (onto right edge)
  "100% calc(100% - 12px)," +                     // right edge
  "100% calc(100% - 6px)," +                      // BR step-1 ↓
  "calc(100% - 6px) calc(100% - 6px)," +          // BR step-1 ←
  "calc(100% - 6px) 100%," +                      // BR step-2 ↓
  "calc(100% - 12px) 100%," +                     // BR step-2 ← (onto bottom edge)
  "12px 100%," +                                  // bottom edge
  "6px 100%," +                                   // BL step-1 ←
  "6px calc(100% - 6px)," +                       // BL step-1 ↑
  "0px calc(100% - 6px)," +                       // BL step-2 ←
  "0px calc(100% - 12px)," +                      // BL step-2 ↑ (onto left edge)
  "0px 12px," +                                   // left edge
  "0px 6px," +                                    // TL step-1 ↑
  "6px 6px," +                                    // TL step-1 →
  "6px 0px" +                                     // TL step-2 ↑
  ")";

interface PixelCardProps {
  /** Border / accent colour */
  borderColor?: string;
  /** Pixel-shadow colour (hard offset shadow) */
  shadowColor?: string;
  /** Card background colour */
  bg?: string;
  /** Inner padding */
  padding?: string | number;
  /** Extra styles on the outermost (shadow) wrapper */
  wrapperStyle?: React.CSSProperties;
  /** Extra styles on the content div */
  contentStyle?: React.CSSProperties;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  role?: string;
  tabIndex?: number;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
}

export function PixelCard({
  borderColor = "#e39f64",
  shadowColor = "#b07830",
  bg = "#0d1024",
  padding = "20px",
  wrapperStyle,
  contentStyle,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  role,
  tabIndex,
  onKeyDown,
  children,
}: PixelCardProps) {
  return (
    /* ── Shadow wrapper ─────────────────────────────────────────────────── */
    <div
      style={{
        filter: `drop-shadow(4px 4px 0 ${shadowColor})`,
        transition: "filter 0.15s, transform 0.15s",
        ...wrapperStyle,
      }}
      className={className}
    >
      {/* ── Border layer (clip applied here) ─────────────────────────── */}
      <div
        style={{
          clipPath: PIXEL_CLIP,
          background: borderColor,
          padding: "3px",
        }}
      >
        {/* ── Content ────────────────────────────────────────────────── */}
        <div
          role={role}
          tabIndex={tabIndex}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onKeyDown={onKeyDown}
          style={{
            background: bg,
            padding,
            cursor: onClick ? "pointer" : undefined,
            ...contentStyle,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
