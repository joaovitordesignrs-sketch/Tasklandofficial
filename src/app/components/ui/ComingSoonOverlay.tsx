import { Lock } from "lucide-react";
import { useTheme } from "../../contexts/PreferencesContext";

interface Props {
  children?: React.ReactNode;
  /** Minimum height for the placeholder when children are not rendered */
  minHeight?: number;
}

/**
 * Shows a "Coming Soon" overlay. Children are NOT rendered to avoid
 * wasting CPU/memory on hidden components. A minHeight placeholder
 * preserves the visual space.
 */
export function ComingSoonOverlay({ minHeight = 120 }: Props) {
  const { BG_DEEPEST, BORDER_ELEVATED, TEXT_MUTED, FONT_PIXEL, FONT_BODY, alpha } = useTheme();

  return (
    <div
      style={{
        position: "relative",
        minHeight,
        background: alpha(BG_DEEPEST, "cc"),
        border: `2px dashed ${BORDER_ELEVATED}`,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: "default",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Lock size={22} color={TEXT_MUTED} strokeWidth={1.5} />
      <span
        style={{
          fontFamily: FONT_PIXEL,
          fontSize: 9,
          color: TEXT_MUTED,
          letterSpacing: 2,
          textShadow: "1px 1px 0 #000",
        }}
      >
        COMING SOON
      </span>
      <span
        style={{
          fontFamily: FONT_BODY,
          fontSize: 12,
          color: TEXT_MUTED,
          opacity: 0.7,
        }}
      >
        Em breve
      </span>
    </div>
  );
}
