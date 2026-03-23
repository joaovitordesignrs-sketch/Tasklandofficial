/**
 * ProductPage — Direct, punchy landing page for Taskland.
 * Shows an animated battle scene (Rive warrior) + demo task list with a single CTA.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { PreferencesProvider, useTheme } from "../contexts/PreferencesContext";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import { Swords, Check, Shield, Flame, Zap } from "lucide-react";

import imgGoblin from "../../assets/monsters/monster_goblin.png";
import imgArena  from "../../assets/arena_background/arena_background_default.png";
import TasklandLogotipo from "../../imports/TasklandLogotipo";

const WARRIOR_RIV = "https://raw.githubusercontent.com/joaovitordesignrs-sketch/taskland/main/taskland_animations_warrior_base.riv";
const RIVE_LAYOUT = new Layout({ fit: Fit.Contain, alignment: Alignment.BottomCenter });

const CSS = `
  @keyframes monsterIdle { 0%,100%{transform:scaleX(-1) translateY(0)} 50%{transform:scaleX(-1) translateY(-4px)} }
  @keyframes slashIn     { 0%{opacity:0;transform:translate(-50%,-50%) scale(0.3) rotate(-15deg)} 40%{opacity:1;transform:translate(-50%,-50%) scale(1.2) rotate(5deg)} 100%{opacity:0;transform:translate(-50%,-50%) scale(0.8) rotate(0deg)} }
  @keyframes monsterHit  { 0%{filter:brightness(1)} 30%{filter:brightness(3)} 100%{filter:brightness(1)} }
  @keyframes fadeUp      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes dmgFloat    { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-30px)} }
  @keyframes ctaPulse    { 0%,100%{box-shadow:0 0 0 0 rgba(235,176,55,0.5)} 50%{box-shadow:0 0 0 12px rgba(235,176,55,0)} }
  @keyframes blink       { 0%,49%{opacity:1} 50%,100%{opacity:0} }
  @keyframes logoIn      { 0%{opacity:0;transform:scale(0.9)} 100%{opacity:1;transform:scale(1)} }
  @keyframes taskCheck   { 0%{transform:scale(0)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }
  @keyframes taskStrike  { from{width:0} to{width:100%} }
`;

const DEMO_TASKS = [
  { text: "Estudar React por 30 min",     diff: "medium", xp: 50  },
  { text: "Responder emails pendentes",   diff: "easy",   xp: 30  },
  { text: "Revisar pull request",          diff: "hard",   xp: 75  },
  { text: "Planejar sprint da semana",     diff: "medium", xp: 50  },
  { text: "Organizar notas do projeto",    diff: "easy",   xp: 30  },
];

const DIFF_STYLES: Record<string, { color: string; icon: typeof Shield }> = {
  easy:   { color: "#06ffa5", icon: Shield },
  medium: { color: "#e39f64", icon: Swords },
  hard:   { color: "#e63946", icon: Flame },
};

// ── Rive warrior with periodic attacks ──────────────────────────────────────
function BattleWarrior() {
  const [riveReady, setRiveReady] = useState(false);
  const attackInputRef = useRef<any>(null);
  const onLoad = useCallback(() => setRiveReady(true), []);

  const { RiveComponent, rive } = useRive({
    src: WARRIOR_RIV,
    autoplay: true,
    layout: RIVE_LAYOUT,
    onLoad,
  });

  useEffect(() => {
    if (!rive || !riveReady) return;
    const sms: string[] = (rive as any).stateMachineNames ?? [];
    if (sms.length === 0) {
      const anims = rive.animationNames ?? [];
      if (anims.length > 0) try { rive.play(anims[0]); } catch (_) {}
      return;
    }
    const smName = sms[0];
    try { rive.play(smName); } catch (_) {}
    const inputs: any[] = (rive as any).stateMachineInputs?.(smName) ?? [];
    attackInputRef.current =
      inputs.find((i: any) => /attack/i.test(i.name)) ??
      inputs.find((i: any) => /trigger/i.test(i.name)) ??
      inputs[0] ?? null;
  }, [rive, riveReady]);

  useEffect(() => {
    if (!riveReady) return;
    const fire = () => {
      const input = attackInputRef.current;
      if (!input) return;
      if (typeof input.fire === "function") { input.fire(); return; }
      input.value = true;
      setTimeout(() => { input.value = false; }, 70);
    };
    const first = setTimeout(fire, 1400);
    const interval = setInterval(fire, 3000);
    return () => { clearTimeout(first); clearInterval(interval); };
  }, [riveReady]);

  return (
    <div style={{
      position: "absolute", left: "0%", bottom: "0%",
      width: "55%", height: "95%", zIndex: 3,
      opacity: riveReady ? 1 : 0, transition: "opacity 0.4s",
    }}>
      <RiveComponent style={{ width: "100%", height: "100%", imageRendering: "pixelated" }} />
    </div>
  );
}

// ── Demo task list ──────────────────────────────────────────────────────────
function DemoTaskList({ completedCount }: { completedCount: number }) {
  const {
    BG_CARD, BG_DEEPEST, BORDER_SUBTLE, BORDER_ELEVATED,
    ACCENT_GOLD, COLOR_SUCCESS, COLOR_DANGER,
    TEXT_MUTED, TEXT_INACTIVE, TEXT_LIGHT,
    FONT_PIXEL, FONT_BODY, alpha,
  } = useTheme();

  return (
    <div style={{
      background: alpha(BG_CARD, "e8"),
      border: `1px solid ${BORDER_ELEVATED}`,
      borderRadius: 10,
      overflow: "hidden",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      animation: "fadeUp 0.5s 0.25s ease both",
    }}>
      {/* Header */}
      <div style={{
        background: BG_DEEPEST,
        borderBottom: `1px solid ${BORDER_SUBTLE}`,
        padding: "8px 12px",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{
          width: 20, height: 20,
          background: `${ACCENT_GOLD}22`, border: `1px solid ${ACCENT_GOLD}55`,
          borderRadius: 4,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: FONT_PIXEL, color: ACCENT_GOLD, fontSize: 7 }}>#1</span>
        </div>
        <span style={{
          fontFamily: FONT_PIXEL, color: TEXT_LIGHT, fontSize: 8,
          textShadow: "1px 1px 0 #000", flex: 1,
        }}>
          MISSÃO DO DIA
        </span>
        <span style={{ fontFamily: FONT_BODY, color: TEXT_MUTED, fontSize: 12 }}>
          {completedCount}/{DEMO_TASKS.length}
        </span>
      </div>

      {/* Tasks */}
      <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
        {DEMO_TASKS.map((task, i) => {
          const done = i < completedCount;
          const ds = DIFF_STYLES[task.diff];
          const DiffIcon = ds.icon;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 10px",
              background: done ? `${COLOR_SUCCESS}0c` : "transparent",
              border: `1px solid ${done ? `${COLOR_SUCCESS}33` : BORDER_SUBTLE}`,
              borderRadius: 6,
              transition: "all 0.3s ease",
            }}>
              {/* Checkbox */}
              <div style={{
                width: 18, height: 18, flexShrink: 0,
                borderRadius: 4,
                border: `2px solid ${done ? COLOR_SUCCESS : BORDER_ELEVATED}`,
                background: done ? COLOR_SUCCESS : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}>
                {done && <Check size={12} color={BG_DEEPEST} strokeWidth={3}
                  style={{ animation: "taskCheck 0.3s ease" }} />}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                <span style={{
                  fontFamily: FONT_BODY,
                  fontSize: 14,
                  color: done ? TEXT_INACTIVE : TEXT_LIGHT,
                  transition: "color 0.3s",
                }}>
                  {task.text}
                </span>
                {done && <div style={{
                  position: "absolute", top: "50%", left: 0,
                  height: 1, background: TEXT_INACTIVE,
                  animation: "taskStrike 0.3s ease forwards",
                }} />}
              </div>

              {/* Difficulty + XP */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <DiffIcon size={11} color={done ? TEXT_INACTIVE : ds.color} />
                <span style={{
                  fontFamily: FONT_PIXEL, fontSize: 6,
                  color: done ? TEXT_INACTIVE : ACCENT_GOLD,
                }}>
                  +{task.xp}XP
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Damage footer */}
      {completedCount > 0 && (
        <div style={{
          borderTop: `1px solid ${BORDER_SUBTLE}`,
          padding: "6px 12px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Zap size={12} color={ACCENT_GOLD} />
            <span style={{ fontFamily: FONT_PIXEL, fontSize: 7, color: ACCENT_GOLD }}>
              DANO TOTAL
            </span>
          </div>
          <span style={{
            fontFamily: FONT_PIXEL, fontSize: 9, color: COLOR_DANGER,
            textShadow: "1px 1px 0 #000",
          }}>
            -{completedCount * 35} HP
          </span>
        </div>
      )}
    </div>
  );
}

// ── Main landing inner ──────────────────────────────────────────────────────
function LandingInner() {
  const navigate = useNavigate();
  const {
    BG_DEEPEST, BORDER_ELEVATED,
    ACCENT_GOLD, COLOR_DANGER, COLOR_WARNING,
    TEXT_MUTED, TEXT_INACTIVE,
    FONT_PIXEL, FONT_BODY, alpha,
  } = useTheme();

  const [showSlash, setShowSlash] = useState(false);
  const [hitCount, setHitCount] = useState(0);
  const [dmgVal, setDmgVal] = useState(0);

  useEffect(() => {
    const triggerSlash = () => {
      const dmg = Math.floor(Math.random() * 30 + 25);
      setDmgVal(dmg);
      setShowSlash(true);
      setHitCount(c => c + 1);
      setTimeout(() => setShowSlash(false), 600);
    };
    const first = setTimeout(triggerSlash, 1400);
    const interval = setInterval(triggerSlash, 3000);
    return () => { clearTimeout(first); clearInterval(interval); };
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
        {/* Pixel grid bg */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            repeating-linear-gradient(0deg,  ${alpha(ACCENT_GOLD, "06")} 0px, transparent 1px, transparent 48px),
            repeating-linear-gradient(90deg, ${alpha(ACCENT_GOLD, "06")} 0px, transparent 1px, transparent 48px)
          `,
        }} />

        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", alignItems: "center",
          maxWidth: 860, width: "100%", gap: 28,
        }}>
          {/* Logo */}
          <div style={{
            width: "min(320px, 70vw)", aspectRatio: "725 / 378",
            animation: "logoIn 0.6s ease both",
          }}>
            <TasklandLogotipo />
          </div>

          {/* Arena + Task List side by side */}
          <div style={{
            display: "flex", gap: 16, width: "100%",
            alignItems: "stretch",
            flexDirection: "row",
          }}>
            {/* Battle scene */}
            <div style={{
              flex: 1, minWidth: 0,
              aspectRatio: "16 / 10",
              borderRadius: 12, overflow: "hidden",
              border: `2px solid ${BORDER_ELEVATED}`,
              position: "relative",
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 60px ${alpha(ACCENT_GOLD, "15")}`,
              animation: "fadeUp 0.5s 0.15s ease both",
            }}>
              <img src={imgArena} alt="" style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover", imageRendering: "pixelated",
              }} />
              <div style={{
                position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
                background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(5,7,18,0.6) 100%)",
              }} />

              <BattleWarrior />

              <img src={imgGoblin} alt="Monster" style={{
                position: "absolute", right: "5%", bottom: "8%",
                height: "65%", imageRendering: "pixelated", zIndex: 3,
                animation: `monsterIdle 3s ease-in-out infinite${showSlash ? ", monsterHit 0.4s ease" : ""}`,
                filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.6))",
              }} />

              {showSlash && (
                <div style={{
                  position: "absolute", top: "40%", left: "62%", zIndex: 5,
                  animation: "slashIn 0.5s ease forwards", pointerEvents: "none",
                }}>
                  <Swords size={48} color={COLOR_WARNING} strokeWidth={2.5}
                    style={{ filter: `drop-shadow(0 0 12px ${COLOR_WARNING})` }} />
                </div>
              )}

              {showSlash && (
                <div key={hitCount} style={{
                  position: "absolute", top: "20%", right: "10%", zIndex: 6,
                  fontFamily: FONT_PIXEL, fontSize: 20, color: COLOR_DANGER,
                  textShadow: "2px 2px 0 #000, 0 0 8px rgba(230,57,70,0.5)",
                  animation: "dmgFloat 0.8s ease forwards", pointerEvents: "none",
                }}>
                  -{dmgVal}
                </div>
              )}

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
                    width: `${Math.max(10, 75 - hitCount * 10)}%`, height: "100%",
                    background: COLOR_DANGER, transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            </div>

            {/* Task list */}
            <div style={{ width: 280, flexShrink: 0 }}>
              <DemoTaskList completedCount={Math.min(hitCount, DEMO_TASKS.length)} />
            </div>
          </div>

          {/* Copy */}
          <div style={{ textAlign: "center", animation: "fadeUp 0.5s 0.3s ease both" }}>
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
              marginTop: 10, lineHeight: 1.5,
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

          <span style={{
            fontFamily: FONT_PIXEL, fontSize: 7,
            color: TEXT_INACTIVE, letterSpacing: 1,
            animation: "blink 1.4s step-end infinite",
          }}>
            ▶ FREE TO PLAY
          </span>
        </div>

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
