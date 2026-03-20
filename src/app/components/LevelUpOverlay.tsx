import { useEffect, useState } from "react";
import imgHero from "figma:asset/88db16de6cc4fac02e41af10e16775e8930dedaf.png";
import { audioManager } from "../hooks/audioManager";
import { Star } from "lucide-react";
import { useTheme } from "../contexts/PreferencesContext";

interface LevelUpOverlayProps {
  level: number;
  rank: string;
  rankColor: string;
  onClose: () => void;
}

const STARS = [
  { x: 12, y: 20, delay: 0.05, size: 8 },
  { x: 88, y: 15, delay: 0.10, size: 6 },
  { x: 5,  y: 60, delay: 0.15, size: 10 },
  { x: 92, y: 55, delay: 0.08, size: 7 },
  { x: 25, y: 85, delay: 0.20, size: 9 },
  { x: 75, y: 80, delay: 0.12, size: 8 },
  { x: 50, y: 5,  delay: 0.03, size: 7 },
  { x: 38, y: 90, delay: 0.18, size: 6 },
  { x: 62, y: 92, delay: 0.22, size: 9 },
  { x: 18, y: 45, delay: 0.07, size: 5 },
  { x: 82, y: 35, delay: 0.14, size: 6 },
  { x: 48, y: 75, delay: 0.09, size: 8 },
];

export function LevelUpOverlay({ level, rank, rankColor, onClose }: LevelUpOverlayProps) {
  const { BG_CARD, BG_DEEPEST, TEXT_LIGHT, TEXT_MUTED, FONT_PIXEL, FONT_BODY, alpha } = useTheme();
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    // Play celebratory level-up arpeggio
    audioManager.playLevelUp();
    const t1 = setTimeout(() => setPhase("hold"), 400);
    const t2 = setTimeout(() => setPhase("out"), 2800);
    const t3 = setTimeout(() => onClose(), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — som e timers disparam apenas uma vez ao montar

  const opacity = phase === "out" ? 0 : 1;
  const scale   = phase === "in" ? 0.5 : 1;

  return (
    <>
      <style>{`
        @keyframes lvlStarFloat {
          0%   { transform: translateY(0px) rotate(45deg); opacity: 1; }
          50%  { transform: translateY(-14px) rotate(45deg); opacity: 0.7; }
          100% { transform: translateY(0px) rotate(45deg); opacity: 1; }
        }
        @keyframes lvlShine {
          0%,100% { opacity: 0.5; }
          50%     { opacity: 1; }
        }
        @keyframes lvlRays {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes lvlHeroFloat {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes lvlBarFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes lvlBlink {
          0%,49% { opacity: 1; }
          50%,100% { opacity: 0; }
        }
      `}</style>

      {/* Dark overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          background: alpha(BG_DEEPEST, "e0"),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "opacity 0.5s ease",
          opacity,
          pointerEvents: phase === "out" ? "none" : "auto",
          cursor: "pointer",
        }}
        onClick={onClose}
      >
        {/* Rotating rays — thin pixel lines, no glow */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            animation: "lvlRays 8s linear infinite",
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 1,
                height: 240,
                background: rankColor,
                opacity: 0.15,
                transformOrigin: "0 0",
                transform: `rotate(${i * 30}deg) translateX(-1px)`,
              }}
            />
          ))}
        </div>

        {/* Floating pixel diamond stars — no box-shadow */}
        {STARS.map((s, i) => (
          <div
            key={i}
            style={{
              position: "fixed",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              background: rankColor,
              transform: "rotate(45deg)",
              animation: `lvlStarFloat ${1.4 + i * 0.1}s ease-in-out ${s.delay}s infinite`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Main card */}
        <div
          style={{
            position: "relative",
            background: BG_CARD,
            border: `4px solid ${rankColor}`,
            boxShadow: `6px 6px 0 #000`,
            padding: "40px 52px",
            textAlign: "center",
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease",
            transform: `scale(${scale})`,
            minWidth: 320,
            maxWidth: 440,
          }}
        >
          {/* Corner gems */}
          {[
            { top: -9, left: -9 },
            { top: -9, right: -9 },
            { bottom: -9, left: -9 },
            { bottom: -9, right: -9 },
          ].map((pos, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 14,
                height: 14,
                background: rankColor,
                ...pos,
              }}
            />
          ))}

          {/* Hero image — no filter glow */}
          <div
            style={{
              marginBottom: 16,
              animation: "lvlHeroFloat 2s ease-in-out infinite",
              display: "inline-block",
            }}
          >
            <img
              src={imgHero}
              alt="Herói"
              style={{
                width: 80,
                imageRendering: "pixelated",
              }}
            />
          </div>

          {/* "LEVEL UP!" label */}
          <div
            style={{
              fontFamily: FONT_PIXEL,
              fontSize: "11px",
              color: TEXT_LIGHT,
              letterSpacing: "4px",
              marginBottom: 8,
              textShadow: "2px 2px 0 #000",
              animation: "lvlShine 1s ease-in-out infinite",
            }}
          >
            ✦ LEVEL UP ✦
          </div>

          {/* Level number — hard pixel shadow only */}
          <div
            style={{
              fontFamily: FONT_PIXEL,
              fontSize: "56px",
              color: rankColor,
              lineHeight: 1,
              marginBottom: 12,
              textShadow: "4px 4px 0 #000",
            }}
          >
            {level}
          </div>

          {/* Rank badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: BG_DEEPEST,
              border: `2px solid ${rankColor}`,
              boxShadow: `0 0 40px ${rankColor}44, 0 0 80px ${rankColor}22`,
              padding: "6px 20px",
              marginBottom: 24,
            }}
          >
            <Star size={16} color={rankColor} />
            <span
              style={{
                fontFamily: FONT_BODY,
                color: rankColor,
                fontSize: 22,
                letterSpacing: 2,
                textShadow: "1px 1px 0 #000",
              }}
            >
              {rank}
            </span>
            <Star size={16} color={rankColor} />
          </div>

          {/* XP bar */}
          <div>
            <div
              style={{
                height: 12,
                background: BG_DEEPEST,
                border: `2px solid ${rankColor}`,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: rankColor,
                  animation: "lvlBarFill 0.8s ease-out 0.3s both",
                }}
              />
              {/* Pixel segment lines */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-linear-gradient(90deg, transparent 0px, transparent 10px, rgba(0,0,0,0.3) 10px, rgba(0,0,0,0.3) 11px)",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          {/* Dismiss hint */}
          <div
            style={{
              marginTop: 20,
              fontFamily: FONT_BODY,
              color: TEXT_MUTED,
              fontSize: 16,
              animation: "lvlBlink 1.2s step-end infinite",
            }}
          >
            Click to continue
          </div>
        </div>
      </div>
    </>
  );
}