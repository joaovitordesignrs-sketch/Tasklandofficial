/**
 * ProductPage — Landing page replicating the real in-game arena + demo task list.
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
  @keyframes dmgFloat    { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-30px)} }
  @keyframes fadeUp      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ctaPulse    { 0%,100%{box-shadow:0 0 0 0 rgba(235,176,55,0.5)} 50%{box-shadow:0 0 0 12px rgba(235,176,55,0)} }
  @keyframes blink       { 0%,49%{opacity:1} 50%,100%{opacity:0} }
  @keyframes logoIn      { 0%{opacity:0;transform:scale(0.9)} 100%{opacity:1;transform:scale(1)} }
  @keyframes taskCheck   { 0%{transform:scale(0)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }
  @keyframes taskStrike  { from{width:0} to{width:100%} }
  @media(max-width:700px) {
    .pp-row { flex-direction: column !important; }
    .pp-tasklist { width: 100% !important; }
  }
`;

const DEMO_TASKS = [
  { text: "Estudar React por 30 min",   diff: "medium", xp: 50 },
  { text: "Responder emails pendentes",  diff: "easy",   xp: 30 },
  { text: "Revisar pull request",        diff: "hard",   xp: 75 },
  { text: "Planejar sprint da semana",   diff: "medium", xp: 50 },
  { text: "Organizar notas do projeto",  diff: "easy",   xp: 30 },
];

const DIFF_STYLES: Record<string, { color: string; icon: typeof Shield }> = {
  easy:   { color: "#06ffa5", icon: Shield },
  medium: { color: "#e39f64", icon: Swords },
  hard:   { color: "#e63946", icon: Flame },
};

const MONSTER_MAX_HP = 180;

// ── Rive warrior ────────────────────────────────────────────────────────────
function DemoWarrior({ onAttack }: { onAttack: () => void }) {
  const [riveReady, setRiveReady] = useState(false);
  const attackInputRef = useRef<any>(null);
  const onLoad = useCallback(() => setRiveReady(true), []);

  const { RiveComponent, rive } = useRive({
    src: WARRIOR_RIV, autoplay: true, layout: RIVE_LAYOUT, onLoad,
  });

  useEffect(() => {
    if (!rive || !riveReady) return;
    const sms: string[] = (rive as any).stateMachineNames ?? [];
    if (sms.length === 0) {
      const anims = rive.animationNames ?? [];
      if (anims.length > 0) try { rive.play(anims[0]); } catch (_) {}
      return;
    }
    try { rive.play(sms[0]); } catch (_) {}
    const inputs: any[] = (rive as any).stateMachineInputs?.(sms[0]) ?? [];
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
      if (typeof input.fire === "function") { input.fire(); }
      else { input.value = true; setTimeout(() => { input.value = false; }, 70); }
      onAttack();
    };
    const first = setTimeout(fire, 1400);
    const interval = setInterval(fire, 3000);
    return () => { clearTimeout(first); clearInterval(interval); };
  }, [riveReady, onAttack]);

  return (
    <div style={{
      position: "absolute", left: "4%", bottom: "4%", height: "85%", zIndex: 4,
      opacity: riveReady ? 1 : 0, transition: "opacity 0.4s",
    }}>
      <RiveComponent style={{ width: 360, height: "100%", imageRendering: "pixelated" }} />
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
    RADIUS_SM, RADIUS_XL, SP_SM,
    PX_2XS, PX_SM, VT_SM, VT_XS,
  } = useTheme();

  return (
    <div className="pp-tasklist" style={{
      width: 280, flexShrink: 0,
      background: alpha(BG_CARD, "e8"),
      border: `1px solid ${alpha(BORDER_ELEVATED, "b3")}`,
      borderRadius: RADIUS_XL,
      overflow: "hidden",
      animation: "fadeUp 0.5s 0.25s ease both",
      alignSelf: "stretch",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header — matches real toolbar */}
      <div style={{
        background: BG_DEEPEST,
        borderBottom: `1px solid ${BORDER_SUBTLE}`,
        padding: "6px 14px",
        display: "flex", alignItems: "center", gap: SP_SM,
      }}>
        <div style={{
          flexShrink: 0, minWidth: 24, height: 24,
          background: BG_CARD, border: `1px solid ${BORDER_ELEVATED}`,
          borderRadius: RADIUS_SM + 1,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: FONT_PIXEL, color: ACCENT_GOLD, fontSize: PX_2XS, lineHeight: 1 }}>#1</span>
        </div>
        <span style={{
          fontFamily: FONT_PIXEL, color: TEXT_LIGHT, fontSize: PX_SM,
          textShadow: "1px 1px 0 #000", flex: 1,
        }}>
          TAREFAS
        </span>
        <span style={{ fontFamily: FONT_BODY, color: TEXT_MUTED, fontSize: VT_SM }}>
          {Math.min(completedCount, DEMO_TASKS.length)}/{DEMO_TASKS.length}
        </span>
      </div>

      {/* Tasks */}
      <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
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
              <div style={{
                width: 18, height: 18, flexShrink: 0, borderRadius: 4,
                border: `2px solid ${done ? COLOR_SUCCESS : BORDER_ELEVATED}`,
                background: done ? COLOR_SUCCESS : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}>
                {done && <Check size={12} color={BG_DEEPEST} strokeWidth={3}
                  style={{ animation: "taskCheck 0.3s ease" }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                <span style={{
                  fontFamily: FONT_BODY, fontSize: 14,
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
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <DiffIcon size={11} color={done ? TEXT_INACTIVE : ds.color} />
                <span style={{
                  fontFamily: FONT_PIXEL, fontSize: 6,
                  color: done ? TEXT_INACTIVE : ACCENT_GOLD,
                }}>+{task.xp}XP</span>
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
            <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: ACCENT_GOLD }}>DANO TOTAL</span>
          </div>
          <span style={{
            fontFamily: FONT_PIXEL, fontSize: VT_XS, color: COLOR_DANGER,
            textShadow: "1px 1px 0 #000",
          }}>
            -{Math.min(completedCount, DEMO_TASKS.length) * 35} HP
          </span>
        </div>
      )}
    </div>
  );
}

// ── Main inner ──────────────────────────────────────────────────────────────
function LandingInner() {
  const navigate = useNavigate();
  const {
    BG_DEEPEST, BG_CARD, BORDER_SUBTLE, BORDER_ELEVATED,
    ACCENT_GOLD, COLOR_DANGER, COLOR_WARNING, COLOR_SUCCESS,
    TEXT_MUTED, TEXT_INACTIVE, TEXT_LIGHT,
    FONT_PIXEL, FONT_BODY, alpha,
    RADIUS_SM, RADIUS_LG, RADIUS_XL,
    PX_2XS, PX_SM, PX_MD, VT_SM, VT_XS, SP_SM,
  } = useTheme();

  const [hitCount, setHitCount] = useState(0);
  const [showDmg, setShowDmg] = useState(false);
  const [dmgVal, setDmgVal] = useState(0);

  const hpPercent = Math.max(0, ((MONSTER_MAX_HP - hitCount * 35) / MONSTER_MAX_HP) * 100);
  const hpColor = hpPercent > 50 ? COLOR_SUCCESS : hpPercent > 25 ? COLOR_WARNING : COLOR_DANGER;
  const hpLabel = `${Math.max(0, MONSTER_MAX_HP - hitCount * 35)}/${MONSTER_MAX_HP}`;
  const monsterShake = showDmg;

  const handleAttack = useCallback(() => {
    const dmg = Math.floor(Math.random() * 15 + 28);
    setDmgVal(dmg);
    setShowDmg(true);
    setHitCount(c => c + 1);
    setTimeout(() => setShowDmg(false), 600);
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
          maxWidth: 860, width: "100%", gap: 24,
        }}>
          {/* Logo */}
          <div style={{
            width: "min(300px, 65vw)", aspectRatio: "725 / 378",
            animation: "logoIn 0.6s ease both",
          }}>
            <TasklandLogotipo />
          </div>

          {/* Arena + Task list */}
          <div className="pp-row" style={{
            display: "flex", gap: 12, width: "100%",
            alignItems: "stretch",
          }}>
            {/* Arena card — replicates the real ArenaCard */}
            <div style={{
              flex: 1, minWidth: 0,
              background: BG_CARD,
              border: `1px solid ${alpha(BORDER_ELEVATED, "b3")}`,
              borderRadius: RADIUS_XL,
              overflow: "hidden",
              animation: "fadeUp 0.5s 0.15s ease both",
              display: "flex", flexDirection: "column",
            }}>
              {/* Toolbar */}
              <div style={{
                background: BG_DEEPEST,
                borderBottom: `1px solid ${BORDER_SUBTLE}`,
                padding: "6px 14px",
                display: "flex", alignItems: "center", gap: SP_SM,
              }}>
                <div style={{
                  flexShrink: 0, minWidth: 24, height: 24,
                  background: BG_CARD, border: `1px solid ${BORDER_ELEVATED}`,
                  borderRadius: RADIUS_SM + 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: FONT_PIXEL, color: ACCENT_GOLD, fontSize: PX_2XS, lineHeight: 1 }}>#1</span>
                </div>
                <span style={{
                  fontFamily: FONT_PIXEL, color: TEXT_LIGHT, fontSize: PX_SM,
                  textShadow: "1px 1px 0 #000", flex: 1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  Goblin da Procrastinação
                </span>
              </div>

              {/* Battle area */}
              <div style={{
                position: "relative", width: "100%", aspectRatio: "16/9",
                overflow: "hidden", background: BG_DEEPEST,
              }}>
                <img src={imgArena} alt="" style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  objectFit: "cover", imageRendering: "pixelated", zIndex: 1,
                }} />
                {/* Vignette */}
                <div style={{
                  position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
                  background: `radial-gradient(ellipse at 50% 50%, transparent 55%, ${alpha(BG_DEEPEST, "73")} 100%)`,
                }} />

                {/* Warrior */}
                <DemoWarrior onAttack={handleAttack} />

                {/* Power badge */}
                <div style={{
                  position: "absolute", left: "4%", top: "6%", zIndex: 6,
                  display: "flex", alignItems: "center", gap: 6,
                  background: alpha(BG_DEEPEST, "e0"),
                  border: `1px solid ${COLOR_WARNING}88`,
                  borderRadius: RADIUS_LG - 1,
                  padding: "5px 11px",
                  backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
                  boxShadow: `0 0 16px ${COLOR_WARNING}55, inset 0 0 8px ${COLOR_WARNING}18`,
                  whiteSpace: "nowrap", pointerEvents: "none",
                }}>
                  <Zap size={12} color={COLOR_WARNING} strokeWidth={2.5} />
                  <span style={{
                    fontFamily: FONT_PIXEL, fontSize: PX_MD, color: COLOR_WARNING,
                    letterSpacing: 1, textShadow: `0 0 10px ${COLOR_WARNING}cc`,
                  }}>
                    1.35
                  </span>
                </div>

                {/* Monster */}
                <div style={{
                  position: "absolute", right: "8%", bottom: "15%",
                  height: "48%", zIndex: 2,
                  transform: monsterShake ? "scaleX(-1) translateX(-8px)" : "scaleX(-1)",
                  transition: monsterShake ? "transform 0.05s" : "transform 0.3s",
                  filter: hpPercent < 25 ? "brightness(1.4) saturate(1.2)" : "brightness(0.88) saturate(0.82)",
                  imageRendering: "pixelated",
                }}>
                  <img src={imgGoblin} alt="" style={{
                    height: "100%", width: "auto", objectFit: "contain",
                    imageRendering: "pixelated",
                  }} />
                </div>

                {/* Floating damage */}
                {showDmg && (
                  <div key={hitCount} style={{
                    position: "absolute", top: "25%", right: "15%", zIndex: 10,
                    fontFamily: FONT_PIXEL, fontSize: 22, color: COLOR_DANGER,
                    textShadow: "2px 2px 0 #000, 0 0 8px rgba(230,57,70,0.5)",
                    animation: "dmgFloat 0.8s ease forwards", pointerEvents: "none",
                  }}>
                    -{dmgVal}
                  </div>
                )}
              </div>

              {/* Footer — HP bar, same as real ArenaCard */}
              <div style={{
                background: BG_DEEPEST,
                borderTop: `1px solid ${BORDER_SUBTLE}`,
                padding: "7px 12px",
                display: "flex", alignItems: "center", gap: SP_SM,
              }}>
                <span style={{
                  fontFamily: FONT_PIXEL, fontSize: PX_2XS,
                  color: TEXT_INACTIVE, letterSpacing: 0.5,
                }}>NORMAL</span>

                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                  <div style={{
                    flex: 1, maxWidth: 140, height: 8,
                    background: BG_DEEPEST, border: `1px solid ${hpColor}55`,
                    borderRadius: RADIUS_SM, overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${hpPercent}%`, height: "100%",
                      background: hpColor, transition: "width 0.6s ease",
                    }} />
                  </div>
                  <span style={{
                    fontFamily: FONT_BODY, color: hpColor, fontSize: VT_XS,
                    whiteSpace: "nowrap", minWidth: 48, textAlign: "right",
                  }}>{hpLabel}</span>
                </div>
              </div>
            </div>

            {/* Task list */}
            <DemoTaskList completedCount={Math.min(hitCount, DEMO_TASKS.length)} />
          </div>

          {/* Copy */}
          <div style={{ textAlign: "center", animation: "fadeUp 0.5s 0.35s ease both" }}>
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
              width: "100%", maxWidth: 340, padding: "16px 24px",
              background: ACCENT_GOLD, border: "none", borderRadius: 8,
              fontFamily: FONT_PIXEL,
              fontSize: "clamp(9px, 2vw, 12px)",
              color: BG_DEEPEST, letterSpacing: 2, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: `4px 4px 0 #000, 0 0 20px ${alpha(ACCENT_GOLD, "33")}`,
              animation: "fadeUp 0.5s 0.5s ease both, ctaPulse 2s 1.5s ease-in-out infinite",
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
