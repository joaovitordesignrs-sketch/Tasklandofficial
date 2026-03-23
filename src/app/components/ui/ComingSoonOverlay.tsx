import { Lock } from "lucide-react";
import { useTheme } from "../../contexts/PreferencesContext";

interface Props {
  children: React.ReactNode;
}

/**
 * Wraps content with a "Coming Soon" overlay that blocks interaction.
 * The underlying component still renders (no code deleted), but users
 * can't interact with it.
 */
export function ComingSoonOverlay({ children }: Props) {
  const { BG_DEEPEST, BORDER_ELEVATED, TEXT_MUTED, FONT_PIXEL, FONT_BODY, alpha } = useTheme();

  return (
    <div style={{ position: "relative" }}>
      {/* Render the real component beneath (grayed out) */}
      <div style={{ pointerEvents: "none", userSelect: "none", opacity: 0.35, filter: "grayscale(0.6)" }}>
        {children}
      </div>

      {/* Lock overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: alpha(BG_DEEPEST, "cc"),
          border: `2px dashed ${BORDER_ELEVATED}`,
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          cursor: "default",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          zIndex: 10,
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
    </div>
  );
}
