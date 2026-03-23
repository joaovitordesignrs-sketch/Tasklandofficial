/**
 * ProductPage — Direct, punchy landing page for Taskland.
 * Shows the battle scene with a single CTA.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { PreferencesProvider, useTheme } from "../contexts/PreferencesContext";
import { Swords } from "lucide-react";

import imgWarrior from "../../assets/profile_pic/profile_pic_warrior.png";
import imgGoblin  from "../../assets/monsters/monster_goblin.png";
import imgArena   from "../../assets/arena_background/arena_background_default.png";
import TasklandLogotipo from "../../imports/TasklandLogotipo";

const CSS = `
  @keyframes heroIdle    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes monsterIdle { 0%,100%{transform:scaleX(-1) translateY(0)} 50%{transform:scaleX(-1) translateY(-4px)} }
  @keyframes slashIn     { 0%{opacity:0;transform:translate(-50%,-50%) scale(0.3) rotate(-15deg)} 40%{opacity:1;transform:translate(-50%,-50%) scale(1.2) rotate(5deg)} 100%{opacity:0;transform:translate(-50%,-50%) scale(0.8) rotate(0deg)} }
  @keyframes monsterHit  { 0%{filter:brightness(1)} 30%{filter:brightness(3)} 100%{filter:brightness(1)} }
  @keyframes fadeUp      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ctaPulse    { 0%,100%{box-shadow:0 0 0 0 rgba(235,176,55,0.5)} 50%{box-shadow:0 0 0 12px rgba(235,176,55,0)} }
  @keyframes blink       { 0%,49%{opacity:1} 50%,100%{opacity:0} }
  @keyframes logoIn      { 0%{opacity:0;transform:scale(0.9)} 100%{opacity:1;transform:scale(1)} }
`;

function LandingInner() {
  const navigate = useNavigate();
  const {
    BG_DEEPEST, BG_CARD, BORDER_SUBTLE, BORDER_ELEVATED,
    ACCENT_GOLD, COLOR_DANGER, COLOR_LEGENDARY, COLOR_WARNING,
    TEXT_MUTED, TEXT_LIGHT, TEXT_INACTIVE,
    FONT_PIXEL, FONT_BODY, alpha,
  } = useTheme();

  const [showSlash, setShowSlash] = useState(false);
  const [hitCount, setHitCount] = useState(0);

  // Periodic "attack" animation
  useEffect(() => {
    const interval = setInterval(() => {
      setShowSlash(true);
      setHitCount(c => c + 1);
      setTimeout(() => setShowSlash(false), 600);
    }, 2800);
    // First hit after a short delay
    const first = setTimeout(() => {
      setShowSlash(true);
      setHitCount(c => c + 1);
      setTimeout(() => setShowSlash(false), 600);
    }, 1200);
    return () => { clearInterval(interval); clearTimeout(first); };
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        minHeight: "100dvh",
        background: BG_DEEPEST,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle pixel grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            repeating-linear-gradient(0deg,  ${alpha(ACCENT_GOLD, "06")} 0px, transparent 1px, transparent 48px),
            repeating-linear-gradient(90deg, ${alpha(ACCENT_GOLD, "06")} 0px, transparent 1px, transparent 48px)
          `,
        }} />

        {/* Content */}
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", alignItems: "center",
          maxWidth: 480, width: "100%", gap: 28,
        }}>

          {/* Logo */}
          <div style={{
            width: "min(340px, 75vw)", aspectRatio: "725 / 378",
            animation: "logoIn 0.6s ease both",
          }}>
            <TasklandLogotipo />
          </div>

          {/* Battle scene */}
          <div style={{
            width: "100%", aspectRatio: "16 / 10",
            borderRadius: 12, overflow: "hidden",
            border: `2px solid ${BORDER_ELEVATED}`,
            position: "relative",
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 60px ${alpha(ACCENT_GOLD, "15")}`,
            animation: "fadeUp 0.5s 0.15s ease both",
          }}>
            {/* Arena background */}
            <img src={imgArena} alt="" style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", imageRendering: "pixelated",
            }} />

            {/* Vignette */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
              background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(5,7,18,0.6) 100%)",
            }} />

            {/* Warrior */}
            <img src={imgWarrior} alt="Warrior" style={{
              position: "absolute", left: "8%", bottom: "8%",
              height: "75%", imageRendering: "pixelated", zIndex: 3,
              animation: "heroIdle 2.5s ease-in-out infinite",
              filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.6))",
            }} />

            {/* Monster */}
            <img src={imgGoblin} alt="Monster" style={{
              position: "absolute", right: "8%", bottom: "8%",
              height: "65%", imageRendering: "pixelated", zIndex: 3,
              animation: `monsterIdle 3s ease-in-out infinite${showSlash ? ", monsterHit 0.4s ease" : ""}`,
              filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.6))",
            }} />

            {/* Slash effect */}
            {showSlash && (
              <div style={{
                position: "absolute", top: "40%", left: "58%", zIndex: 5,
                animation: "slashIn 0.5s ease forwards",
                pointerEvents: "none",
              }}>
                <Swords size={48} color={COLOR_WARNING} strokeWidth={2.5} style={{
                  filter: `drop-shadow(0 0 12px ${COLOR_WARNING})`,
                }} />
              </div>
            )}

            {/* Floating damage */}
            {showSlash && (
              <div key={hitCount} style={{
                position: "absolute", top: "22%", right: "12%", zIndex: 6,
                fontFamily: FONT_PIXEL, fontSize: 18, color: COLOR_DANGER,
                textShadow: "2px 2px 0 #000",
                animation: "fadeUp 0.6s ease forwards",
                pointerEvents: "none",
              }}>
                -{Math.floor(Math.random() * 30 + 25)}
              </div>
            )}

            {/* HP bar on monster */}
            <div style={{
              position: "absolute", top: 10, right: 10, zIndex: 5,
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(10,14,40,0.85)", borderRadius: 6,
              padding: "4px 10px", backdropFilter: "blur(4px)",
              border: `1px solid ${alpha(COLOR_DANGER, "55")}`,
            }}>
              <span style={{ fontFamily: FONT_PIXEL, fontSize: 7, color: COLOR_DANGER }}>
                PROCRASTINAÇÃO
              </span>
              <div style={{
                width: 60, height: 6, background: BG_DEEPEST,
                border: `1px solid ${alpha(COLOR_DANGER, "55")}`,
                borderRadius: 3, overflow: "hidden",
              }}>
                <div style={{
                  width: `${Math.max(15, 70 - hitCount * 12)}%`, height: "100%",
                  background: COLOR_DANGER, transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          </div>

          {/* Copy */}
          <div style={{
            textAlign: "center",
            animation: "fadeUp 0.5s 0.3s ease both",
          }}>
            <h1 style={{
              fontFamily: FONT_PIXEL,
              fontSize: "clamp(10px, 2.8vw, 16px)",
              color: ACCENT_GOLD,
              letterSpacing: 2,
              textShadow: "2px 2px 0 #000",
              margin: 0, lineHeight: 1.6,
            }}>
              DESTRUA O MONSTRO<br />DA PROCRASTINAÇÃO
            </h1>
            <p style={{
              fontFamily: FONT_BODY,
              fontSize: "clamp(14px, 3.5vw, 18px)",
              color: TEXT_MUTED,
              marginTop: 10,
              lineHeight: 1.5,
            }}>
              Transforme tarefas em batalhas.<br />
              Evolua seu personagem. Conquiste seus objetivos.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate("/")}
            style={{
              width: "100%", maxWidth: 340,
              padding: "16px 24px",
              background: ACCENT_GOLD,
              border: "none",
              borderRadius: 8,
              fontFamily: FONT_PIXEL,
              fontSize: "clamp(9px, 2vw, 12px)",
              color: BG_DEEPEST,
              letterSpacing: 2,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: `4px 4px 0 #000, 0 0 20px ${alpha(ACCENT_GOLD, "33")}`,
              animation: "fadeUp 0.5s 0.45s ease both, ctaPulse 2s 1.5s ease-in-out infinite",
              transition: "transform 0.1s, box-shadow 0.1s",
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translate(2px,2px)";
              e.currentTarget.style.boxShadow = `2px 2px 0 #000, 0 0 20px ${alpha(ACCENT_GOLD, "33")}`;
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = `4px 4px 0 #000, 0 0 20px ${alpha(ACCENT_GOLD, "33")}`;
            }}
          >
            <Swords size={16} />
            COMEÇAR AVENTURA
          </button>

          {/* Blink hint */}
          <span style={{
            fontFamily: FONT_PIXEL,
            fontSize: 7,
            color: TEXT_INACTIVE,
            letterSpacing: 1,
            animation: "blink 1.4s step-end infinite",
          }}>
            ▶ FREE TO PLAY
          </span>
        </div>

        {/* Version */}
        <div style={{
          position: "absolute", bottom: 12, right: 16,
          fontFamily: FONT_BODY, color: alpha(TEXT_INACTIVE, "44"), fontSize: 12,
        }}>
          v1.0
        </div>
      </div>
    </>
  );
}

export default function ProductPage() {
  return (
    <PreferencesProvider>
      <LandingInner />
    </PreferencesProvider>
  );
}
