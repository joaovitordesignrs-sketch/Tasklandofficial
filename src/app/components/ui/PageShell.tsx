/**
 * PageShell — Standard wrapper for all right-column route pages.
 * Provides: consistent background, page header card (icon + title),
 * and full-width content area that fills the right column.
 */
import { ReactNode } from "react";
import { useIsDesktop } from "../../hooks/useIsDesktop";

interface PageShellProps {
  icon: ReactNode;
  title: string;
  accentColor?: string;
  /** Optional badge element shown inline in the header (right side) */
  badge?: ReactNode;
  children: ReactNode;
}

export function PageShell({
  icon,
  title,
  accentColor = "#e39f64",
  badge,
  children,
}: PageShellProps) {
  const isDesktop = useIsDesktop();

  return (
    <div
      style={{
        background: "#15182d",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'VT323', monospace",
        paddingBottom: isDesktop ? 24 : 80,
      }}
    >
      {/* Subtle grid overlay (CSS only — no image) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg,rgba(255,255,255,0.012) 0px,transparent 1px,transparent 56px)," +
            "repeating-linear-gradient(90deg,rgba(255,255,255,0.012) 0px,transparent 1px,transparent 56px)",
        }}
      />

      {/* Page content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: isDesktop ? "20px 24px 0" : "12px 16px 0",
          width: "100%",
          maxWidth: isDesktop ? 860 : "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* ── Header card ─────────────────────────────────────────────────── */}
        <div
          style={{
            background: "#0d1024",
            border: "1px solid rgba(42,46,80,0.8)",
            borderLeft: `3px solid ${accentColor}`,
            borderRadius: 10,
            padding: "13px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
            flexShrink: 0,
          }}
        >
          <div style={{ color: accentColor, display: "flex", alignItems: "center" }}>
            {icon}
          </div>
          <h1
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: isDesktop ? 13 : 10,
              color: accentColor,
              textShadow: "2px 2px 0 #000",
              margin: 0,
              letterSpacing: 1,
              flex: 1,
            }}
          >
            {title}
          </h1>
          {badge && <div style={{ flexShrink: 0 }}>{badge}</div>}
        </div>

        {/* ── Page content ────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>
    </div>
  );
}