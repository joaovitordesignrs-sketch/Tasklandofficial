import { useState, useEffect, useCallback } from "react";
import TasklandLogotipo from "../../imports/TasklandLogotipo";
import { useTheme } from "../contexts/PreferencesContext";

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const { ACCENT_GOLD, COLOR_WARNING, BG_DEEPEST, FONT_PIXEL, FONT_BODY, alpha } = useTheme();

  const [ready, setReady] = useState(false);   // logo fully visible → show CTA
  const [leaving, setLeaving] = useState(false); // fade-out started

  const dismiss = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onFinish, 600);
  }, [leaving, onFinish]);

  // After short intro delay, show the CTA
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Keyboard (any key) or click → dismiss
  useEffect(() => {
    if (!ready) return;
    const handler = () => dismiss();
    window.addEventListener("keydown", handler);
    window.addEventListener("pointerdown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("pointerdown", handler);
    };
  }, [ready, dismiss]);

  return (
    <>
      <style>{`
        @keyframes splashFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes splashFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes logoIn {
          0%   { opacity: 0; transform: scale(0.88) translateY(16px); }
          60%  { opacity: 1; transform: scale(1.03) translateY(-4px); }
          100% { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes ctaIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%,100% { opacity: 1; }
          49%,51% { opacity: 0; }
        }
        @keyframes starTwinkle {
          0%,100% { opacity: 0.12; }
          50%     { opacity: 0.55; }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: BG_DEEPEST,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_BODY,
          cursor: ready ? "pointer" : "default",
          animation: leaving ? "splashFadeOut 0.6s ease forwards" : "splashFadeIn 0.5s ease forwards",
          overflow: "hidden",
        }}
      >
        {/* Subtle pixel grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              repeating-linear-gradient(0deg,  ${alpha(ACCENT_GOLD, "08")} 0px, transparent 1px, transparent 52px),
              repeating-linear-gradient(90deg, ${alpha(ACCENT_GOLD, "08")} 0px, transparent 1px, transparent 52px)
            `,
            pointerEvents: "none",
          }}
        />

        {/* Sparse stars */}
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(i * 137.5 + 11) % 100}%`,
              top: `${(i * 97.3 + 31) % 100}%`,
              width: (i % 3) === 0 ? 2 : 1,
              height: (i % 3) === 0 ? 2 : 1,
              background: ACCENT_GOLD,
              pointerEvents: "none",
              animation: `starTwinkle ${1.8 + (i % 7) * 0.3}s ease-in-out ${(i % 9) * 0.2}s infinite`,
            }}
          />
        ))}

        {/* Corner decorations */}
        {[
          { top: 20, left: 20 },
          { top: 20, right: 20 },
          { bottom: 20, left: 20 },
          { bottom: 20, right: 20 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 20,
              height: 20,
              border: `2px solid ${ACCENT_GOLD}`,
              opacity: 0.35,
              pointerEvents: "none",
              clipPath:
                i === 0 ? "polygon(0 0,100% 0,100% 35%,35% 35%,35% 100%,0 100%)"
                : i === 1 ? "polygon(0 0,100% 0,100% 100%,65% 100%,65% 35%,0 35%)"
                : i === 2 ? "polygon(0 0,35% 0,35% 65%,100% 65%,100% 100%,0 100%)"
                : "polygon(65% 0,100% 0,100% 100%,0 100%,0 65%,65% 65%)",
              ...pos,
            }}
          />
        ))}

        {/* Logo */}
        <div
          style={{
            width: "min(520px, 82vw)",
            aspectRatio: "725 / 378",
            animation: "logoIn 0.8s cubic-bezier(.22,.68,0,1.15) 0.2s both",
          }}
        >
          <TasklandLogotipo />
        </div>

        {/* Tagline + CTA — appear after logo settles */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            marginTop: 8,
            animation: ready ? "ctaIn 0.5s ease forwards" : "none",
            opacity: ready ? undefined : 0,
          }}
        >
          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, width: 320, maxWidth: "70vw" }}>
            <div style={{ flex: 1, height: 1, background: alpha(ACCENT_GOLD, "66") }} />
            <div style={{ width: 6, height: 6, background: ACCENT_GOLD, transform: "rotate(45deg)" }} />
            <div style={{ flex: 1, height: 1, background: alpha(ACCENT_GOLD, "66") }} />
          </div>

          {/* Tagline */}
          <div
            style={{
              fontFamily: FONT_PIXEL,
              color: ACCENT_GOLD,
              fontSize: "clamp(6px, 1.2vw, 10px)",
              letterSpacing: "0.2em",
              textShadow: "1px 1px 0 #000",
              textAlign: "center",
              lineHeight: 2,
            }}
          >
            COMPLETE MISSIONS AND<br />DEFEAT PROCRASTINATION
          </div>

          {/* CTA */}
          <div
            style={{
              fontFamily: FONT_PIXEL,
              color: COLOR_WARNING,
              fontSize: "clamp(8px, 1.5vw, 12px)",
              textShadow: "2px 2px 0 #000",
              letterSpacing: "0.12em",
              animation: ready ? "blink 1.2s step-end infinite" : "none",
            }}
          >
            ▶ CLICK TO START
          </div>
        </div>

        {/* Version */}
        <div
          style={{
            position: "absolute",
            bottom: 14,
            right: 18,
            fontFamily: FONT_BODY,
            color: "#232840",
            fontSize: 15,
            pointerEvents: "none",
          }}
        >
          v1.0 • PIXEL RPG EDITION
        </div>
      </div>
    </>
  );
}
