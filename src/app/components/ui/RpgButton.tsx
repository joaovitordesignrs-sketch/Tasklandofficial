/**
 * RpgButton — Root button component for the TaskLand RPG UI.
 *
 * All interactive buttons in the app should originate from this
 * component so styling stays consistent across screens.
 *
 * Variants:
 *   primary  — filled bg + solid border (default gold, or any accentColor)
 *   ghost    — transparent bg, solid border (full-width add/action buttons)
 *   dashed   — transparent bg, dashed border (add new item CTA)
 *   toggle   — ON / OFF switch style (Settings)
 *   icon     — no bg, no border, just the icon (delete, close, etc.)
 */
import React from "react";
import {
  FONT_PIXEL, FONT_BODY, ACCENT_GOLD,
  BG_DEEPEST, TEXT_INACTIVE, BORDER_ELEVATED,
} from "../../data/tokens";

export type RpgButtonVariant = "primary" | "ghost" | "dashed" | "toggle" | "icon";

export interface RpgButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Visual variant — see module docs */
  variant?: RpgButtonVariant;
  /** Accent / theme colour. Defaults to ACCENT_GOLD */
  color?: string;
  /** Full-width block button */
  fullWidth?: boolean;
  disabled?: boolean;
  /** Used by the toggle variant — whether the toggle is ON */
  isOn?: boolean;
  /** Compact padding (icon variant ignores this) */
  small?: boolean;
  /** Extra inline styles */
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  title?: string;
  /** Use VT323 body font instead of pixel font */
  bodyFont?: boolean;
}

export function RpgButton({
  children,
  onClick,
  variant = "primary",
  color = ACCENT_GOLD,
  fullWidth = false,
  disabled = false,
  isOn,
  small = false,
  style,
  type = "button",
  title,
  bodyFont = false,
}: RpgButtonProps) {
  const font = bodyFont ? FONT_BODY : FONT_PIXEL;

  const base: React.CSSProperties = {
    cursor:      disabled ? "not-allowed" : "pointer",
    opacity:     disabled ? 0.45 : 1,
    width:       fullWidth ? "100%" : undefined,
    display:     "flex",
    alignItems:  "center",
    justifyContent: "center",
    gap:         6,
    transition:  "all 0.15s ease",
    fontFamily:  font,
    letterSpacing: bodyFont ? 0 : 0.5,
    lineHeight:  1.2,
  };

  let variantStyle: React.CSSProperties;

  switch (variant) {
    case "primary":
      variantStyle = {
        padding:      small ? "5px 12px" : "8px 16px",
        background:   disabled ? BORDER_ELEVATED + "44" : color + "22",
        border:       `1.5px solid ${disabled ? TEXT_INACTIVE : color}`,
        borderRadius: 6,
        color:        disabled ? TEXT_INACTIVE : color,
        fontSize:     bodyFont ? 16 : 7,
        textShadow:   disabled ? "none" : `0 0 6px ${color}66`,
        boxShadow:    disabled ? "none" : `inset 0 1px 0 ${color}18`,
      };
      break;

    case "ghost":
      variantStyle = {
        padding:      small ? "7px 14px" : "10px 16px",
        background:   "transparent",
        border:       `1.5px solid ${color}`,
        borderRadius: 6,
        color:        color,
        fontSize:     bodyFont ? 16 : 8,
      };
      break;

    case "dashed":
      variantStyle = {
        padding:      small ? "10px 0" : "14px 0",
        background:   color + "12",
        border:       `2px dashed ${color}`,
        borderRadius: 8,
        color:        color,
        fontSize:     bodyFont ? 18 : 9,
        fontWeight:   400,
      };
      break;

    case "toggle":
      // isOn controls the filled state
      variantStyle = {
        padding:      "5px 14px",
        background:   isOn ? color : BORDER_ELEVATED,
        border:       `2px solid ${isOn ? color : TEXT_INACTIVE}`,
        borderRadius: 4,
        color:        isOn ? BG_DEEPEST : TEXT_INACTIVE,
        fontSize:     bodyFont ? 16 : 8,
      };
      break;

    case "icon":
    default:
      variantStyle = {
        padding:    small ? 4 : 6,
        background: "none",
        border:     "none",
        borderRadius: 4,
        color:      color,
        fontSize:   bodyFont ? 16 : 7,
      };
      break;
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      title={title}
      style={{ ...base, ...variantStyle, ...style }}
    >
      {children}
    </button>
  );
}
