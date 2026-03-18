import { useState, useEffect, useRef } from "react";
import { calcTotalXP, getLevelInfo, getRank } from "../data/gameEngine";
import {
  getRebirthState, performRebirth, getPendingRebirthBonus,
  getRebirthGain, getEconomy, ACHIEVEMENTS, TIER_COLORS,
  RebirthState, resetBonusXP,
} from "../data/economy";
import { getMissions, rebirthReset } from "../data/missions";
import { forcePush } from "../data/syncService";
import { useNavigate } from "react-router";
import { RotateCcw, Swords, Star, Award, Flame, Shield, Zap, FileText, Trophy, CheckSquare, TrendingUp, Map, Gem, Timer, Coins, User } from "lucide-react";
import { audioManager } from "../hooks/audioManager";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { PageShell } from "./ui/PageShell";
import { PixelIcon } from "./ui/PixelIcon";

// ── Confirmation Stage ───────────────────────────────────────────────────────
type Stage = "preview" | "confirm" | "animating" | "complete";

// ── Run Report Animation ─────────────────────────────────────────────────────
interface RunSnapshot {
  level: number;
  rank: { label: string; color: string };
  totalXP: number;
  monstersDefeated: number;
  bossesDefeated: number;
  tasksCompleted: number;
  runNumber: number;
  gain: number;
  newAchievements: string[];
  pendingBonus: number;
  currentPerm: number;
}

function RunReportAnimation({ snapshot, onDone }: { snapshot: RunSnapshot; onDone: () => void }) {
  // Reveal sections step by step
  const [step, setStep] = useState(0);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const delays = [200, 700, 1200, 1700, 2200, 2900];
    delays.forEach((d, i) => {
      const t = setTimeout(() => setStep(i + 1), d);
      timeouts.current.push(t);
    });
    const done = setTimeout(onDone, 3400);
    timeouts.current.push(done);
    return () => timeouts.current.forEach(clearTimeout);
  }, []);

  const rows: { icon: React.ReactNode; label: string; value: string; color: string }[] = [
    { icon: <TrendingUp size={14} />, label: "NÍVEL ALCANÇADO",  value: `${snapshot.level}`,               color: "#FFD700" },
    { icon: <Star size={14} />,       label: "RANK",             value: snapshot.rank.label,                color: snapshot.rank.color },
    { icon: <Zap size={14} />,        label: "XP TOTAL",         value: snapshot.totalXP.toLocaleString("pt-BR"), color: "#f0c040" },
    { icon: <Swords size={14} />,     label: "MONSTROS ABATIDOS",value: `${snapshot.monstersDefeated}`,     color: "#E63946" },
    { icon: <Trophy size={14} />,     label: "BOSSES DERROTADOS",value: `${snapshot.bossesDefeated}`,       color: "#FF6B35" },
    { icon: <CheckSquare size={14} />,label: "TAREFAS CONCLUÍDAS",value: `${snapshot.tasksCompleted}`,      color: "#06FFA5" },
  ];

  return (
    <>
      <style>{`
        @keyframes scanIn   { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
        @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes scanline { 0%{top:-10%} 100%{top:110%} }
        @keyframes flashIn  { 0%{opacity:0} 60%{opacity:1} 100%{opacity:0.85} }
      `}</style>

      <div style={{
        background: "#060810", minHeight: "100vh", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "'VT323', monospace", padding: "20px 16px", position: "relative",
        overflow: "hidden",
      }}>
        {/* Grid overlay */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg,rgba(255,255,255,0.025) 0px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,rgba(255,255,255,0.025) 0px,transparent 1px,transparent 32px)" }} />

        {/* Slow scanline */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: "4px",
          background: "linear-gradient(transparent, rgba(255,215,0,0.08), transparent)",
          animation: "scanline 3s linear infinite", pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 500 }}>

          {/* Header */}
          {step >= 1 && (
            <div style={{ textAlign: "center", marginBottom: 28, animation: "scanIn 0.4s ease-out" }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 11,
                color: "#5a6080", marginBottom: 8, letterSpacing: 3,
              }}>
                ── RELATÓRIO DE MISSÃO ──
              </div>
              <div style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 16,
                color: "#FFD700", textShadow: "0 0 20px rgba(255,215,0,0.6)",
                letterSpacing: 2,
              }}>
                RUN #{snapshot.runNumber}
              </div>
              <div style={{ color: "#3a4060", fontSize: 14, marginTop: 4, animation: "blink 1s step-end infinite" }}>
                ▌COMPILANDO DADOS...
              </div>
            </div>
          )}

          {/* Stats rows */}
          <div style={{
            background: "#0a0c1a", border: "2px solid #1f254f",
            padding: "16px 20px", marginBottom: 16,
          }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 8,
              color: "#2a3050", marginBottom: 14, letterSpacing: 2,
            }}>
              ESTATÍSTICAS FINAIS
            </div>
            {rows.map((row, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "7px 0",
                borderBottom: i < rows.length - 1 ? "1px solid #0f1222" : "none",
                opacity: step >= 2 + Math.floor(i / 2) ? 1 : 0.1,
                transition: "opacity 0.3s ease",
                animation: step >= 2 + Math.floor(i / 2) ? "scanIn 0.35s ease-out" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#3a4060" }}>
                  {row.icon}
                  <span style={{ fontSize: 15, color: "#5a6080" }}>{row.label}</span>
                </div>
                <span style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 10,
                  color: row.color, textShadow: `0 0 10px ${row.color}66`,
                }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Bonus gained */}
          {step >= 5 && (
            <div style={{
              background: snapshot.gain > 0 ? "rgba(6,255,165,0.06)" : "rgba(255,215,0,0.04)",
              border: `2px solid ${snapshot.gain > 0 ? "#06FFA533" : "#FFD70022"}`,
              padding: "14px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              animation: "scanIn 0.4s ease-out",
              marginBottom: 16,
            }}>
              <div>
                <div style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                  color: "#3a4060", marginBottom: 6,
                }}>
                  BÔNUS CRISTALIZADO
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <span style={{ color: "#5a6080", fontSize: 18, textDecoration: "line-through" }}>
                    +{snapshot.currentPerm.toFixed(2)}x
                  </span>
                  <span style={{ fontSize: 22, color: "#3a4060" }}>→</span>
                  <span style={{
                    fontFamily: "'Press Start 2P', monospace",
                    color: snapshot.gain > 0 ? "#06FFA5" : "#FFD700", fontSize: 14,
                    textShadow: `0 0 16px ${snapshot.gain > 0 ? "rgba(6,255,165,0.5)" : "rgba(255,215,0,0.4)"}`,
                  }}>
                    +{snapshot.pendingBonus.toFixed(2)}x
                  </span>
                </div>
              </div>
              {snapshot.gain > 0 && (
                <div style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                  color: "#06FFA5", background: "rgba(6,255,165,0.1)",
                  border: "1px solid #06FFA544", padding: "6px 10px",
                  textAlign: "center",
                }}>
                  +{snapshot.gain.toFixed(2)}x<br />
                  <span style={{ fontSize: 7, color: "#06FFA566" }}>NOVO</span>
                </div>
              )}
            </div>
          )}

          {/* Processing indicator */}
          {step >= 6 && (
            <div style={{
              textAlign: "center", animation: "flashIn 0.5s ease-out",
              fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              color: "#FFD700", letterSpacing: 2,
            }}>
              ▶ INICIANDO RENASCIMENTO...
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function RebirthScreen() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [stage, setStage] = useState<Stage>("preview");
  const [rebirthResult, setRebirthResult] = useState<RebirthState | null>(null);
  const [prevBonus, setPrevBonus] = useState(0);
  const [runSnapshot, setRunSnapshot] = useState<RunSnapshot | null>(null);

  const missions = getMissions();
  const totalXP = calcTotalXP(missions);
  const lvInfo = getLevelInfo(totalXP);
  const rank = getRank(lvInfo.level);
  const rebirth = getRebirthState();
  const econ = getEconomy();

  // Stats
  let monstersDefeated = 0;
  let bossesDefeated = 0;
  let tasksCompleted = 0;
  for (const m of missions) {
    if ((m.monsterCurrentHp ?? 1) <= 0) {
      monstersDefeated++;
      if (m.monsterType === "boss") bossesDefeated++;
    }
    for (const t of m.tasks) { if (t.completed) tasksCompleted++; }
  }

  const pendingBonus = getPendingRebirthBonus();
  const gain = getRebirthGain();
  const currentPerm = rebirth.permanentDamageBonus;
  const unlockedAchs = econ.unlockedAchievements.length;
  const totalAchs = ACHIEVEMENTS.length;

  const newAchsThisRun = econ.unlockedAchievements.filter(
    id => !rebirth.permanentAchievements.includes(id)
  );

  function handleRebirth() {
    const snap: RunSnapshot = {
      level: lvInfo.level,
      rank,
      totalXP,
      monstersDefeated,
      bossesDefeated,
      tasksCompleted,
      runNumber: rebirth.runNumber,
      gain,
      newAchievements: newAchsThisRun,
      pendingBonus,
      currentPerm,
    };
    setPrevBonus(currentPerm);
    setRunSnapshot(snap);
    setStage("animating");
    audioManager.playClick("press");
  }

  function finishAnimation() {
    const stats = rebirthReset();
    resetBonusXP(); // bonusXP is run-scoped XP; reset it for the new run
    const result = performRebirth(lvInfo.level, stats.monstersDefeated, stats.tasksCompleted);
    setRebirthResult(result);
    setStage("complete");
    // Force-push the clean post-rebirth state immediately so cloud has the
    // new empty missions before any Realtime event can fire with old data.
    forcePush().catch(() => {});
  }

  // ── ANIMATING screen ───────────────────────────────────────────────────────
  if (stage === "animating" && runSnapshot) {
    return <RunReportAnimation snapshot={runSnapshot} onDone={finishAnimation} />;
  }

  // ── COMPLETE screen ────────────────────────────────────────────────────────
  if (stage === "complete" && rebirthResult) {
    return (
      <>
        <style>{`
          @keyframes rebirthGlow   { 0%,100%{text-shadow:2px 2px 0 #000,0 0 20px rgba(255,215,0,0.5)} 50%{text-shadow:2px 2px 0 #000,0 0 40px rgba(255,215,0,0.9)} }
          @keyframes rebirthFadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          @keyframes rebirthPulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
          @keyframes rebirthStars  { 0%{opacity:0} 50%{opacity:1} 100%{opacity:0} }
        `}</style>
        <div style={{
          background: "#0a0c1a", minHeight: "100vh", display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          fontFamily: "'VT323', monospace", padding: 20, position: "relative",
          overflow: "hidden",
        }}>
          {/* Radial glow */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse at center, rgba(255,215,0,0.08) 0%, transparent 60%)",
          }} />
          {/* Stars */}
          {[...Array(14)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              top: `${8 + (i * 7) % 85}%`,
              left: `${4 + (i * 13) % 92}%`,
              width: 4, height: 4, background: i % 3 === 0 ? "#c084fc" : "#FFD700",
              animation: `rebirthStars ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${(i * 0.3) % 2}s`,
              opacity: 0.6,
            }} />
          ))}

          <div style={{
            textAlign: "center", position: "relative", zIndex: 10,
            animation: "rebirthFadeIn 0.8s ease-out", maxWidth: 420, width: "100%",
          }}>
            {/* Title */}
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 10,
              color: "#5a6080", marginBottom: 10, letterSpacing: 3,
            }}>
              ── RENASCIMENTO COMPLETO ──
            </div>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 20,
              color: "#FFD700", marginBottom: 6,
              animation: "rebirthGlow 2s ease infinite",
            }}>
              CICLO #{rebirthResult.runNumber}
            </div>
            <div style={{ color: "#c084fc", fontSize: 20, marginBottom: 4 }}>
              Iniciado com sucesso
            </div>
            <div style={{ color: "#3a4060", fontSize: 16, marginBottom: 30 }}>
              Renascimentos totais: {rebirthResult.totalRebirths}
            </div>

            {/* Bonus Card */}
            <div style={{
              background: "#0d1024", border: "1px solid rgba(42,46,80,0.8)",
              borderRadius: 10, padding: "22px 24px",
              marginBottom: 16,
              animation: "rebirthFadeIn 0.8s ease-out 0.4s both",
            }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                color: "#5a6080", marginBottom: 14,
              }}>
                BÔNUS PERMANENTE DE DANO
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 14 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#5a6080", fontSize: 14 }}>ANTES</div>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 16,
                    color: "#E63946", textShadow: "2px 2px 0 #000",
                  }}>
                    +{prevBonus.toFixed(2)}x
                  </div>
                </div>
                <div style={{ fontSize: 28, color: "#FFD700" }}>→</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#5a6080", fontSize: 14 }}>AGORA</div>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 20,
                    color: "#06FFA5", textShadow: "2px 2px 0 #000",
                    animation: "rebirthGlow 2s ease infinite",
                  }}>
                    +{rebirthResult.permanentDamageBonus.toFixed(2)}x
                  </div>
                </div>
              </div>
              {gain > 0 && (
                <div style={{
                  background: "rgba(6,255,165,0.08)", border: "1px solid #06FFA533",
                  padding: "8px 12px", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8,
                }}>
                  <Zap size={16} color="#FFD700" />
                  <span style={{ color: "#06FFA5", fontSize: 18 }}>
                    +{gain.toFixed(2)}x dano cristalizado!
                  </span>
                </div>
              )}
            </div>

            {/* Legacy Stats */}
            <div style={{
              background: "#0d1024", border: "1px solid rgba(42,46,80,0.8)",
              borderRadius: 10, padding: "16px 20px",
              marginBottom: 28,
              animation: "rebirthFadeIn 0.8s ease-out 0.7s both",
            }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                color: "#5a6080", marginBottom: 12,
              }}>
                LEGADO ACUMULADO
              </div>
              <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
                <StatBox label="NÍVEL MAX"  value={String(rebirthResult.highestLevelEver)}   color="#FFD700" />
                <StatBox label="MONSTROS"   value={String(rebirthResult.totalMonstersEver)}  color="#E63946" />
                <StatBox label="TAREFAS"    value={String(rebirthResult.totalTasksEver)}     color="#06FFA5" />
              </div>
            </div>

            <button
              onClick={() => { audioManager.playClick("press"); window.location.href = "/"; }}
              style={{
                background: "#FFD700", border: "none", color: "#0d1024",
                padding: "16px 40px", fontFamily: "'Press Start 2P', monospace",
                fontSize: 11, cursor: "pointer",
                borderRadius: 8,
                boxShadow: "0 0 24px rgba(255,215,0,0.4)",
                animation: "rebirthFadeIn 0.8s ease-out 1s both",
                width: "100%",
              }}
              onMouseDown={e => (e.currentTarget.style.transform = "translate(2px,2px)")}
              onMouseUp={e => (e.currentTarget.style.transform = "")}
            >
              COMEÇAR NOVA JORNADA ▶
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── PREVIEW / CONFIRM ──────────────────────────────────────────────────────
  return (
    <PageShell icon={<RotateCcw size={16} />} title="RENASCIMENTO" accentColor="#c084fc">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Run Identity Card — no avatar */}
          <div style={{
            background: "#0d1024", border: "1px solid rgba(42,46,80,0.8)",
            borderRadius: 10, padding: "20px",
          }}>
            {/* Top row: Run # + cycle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ color: "#3a4060", fontSize: 14, marginBottom: 2 }}>Ciclo atual</div>
                <div style={{
                  fontFamily: "'Press Start 2P', monospace", color: "#c084fc",
                  fontSize: 14, textShadow: "1px 1px 0 #000",
                }}>
                  RUN #{rebirth.runNumber}
                </div>
              </div>
              {rebirth.totalRebirths > 0 && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#3a4060", fontSize: 14, marginBottom: 2 }}>Renascimentos</div>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace", color: "#FFD700",
                    fontSize: 14, textShadow: "1px 1px 0 #000",
                  }}>
                    ×{rebirth.totalRebirths}
                  </div>
                </div>
              )}
            </div>

            {/* Level + rank inline */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#0a0c1a", border: "1px solid #1f254f",
              padding: "10px 14px", borderRadius: 6,
            }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                color: "#FFD700", fontSize: 13,
                textShadow: "1px 1px 0 #000",
              }}>
                LVL {lvInfo.level}
              </div>
              <div style={{ width: 1, height: 20, background: "#1f254f" }} />
              <Star size={12} color={rank.color} />
              <span style={{ color: rank.color, fontSize: 20 }}>{rank.label}</span>
            </div>
          </div>

          {/* Current Run Stats */}
          <div style={{
            background: "#0d1024", border: "1px solid rgba(42,46,80,0.8)",
            borderRadius: 10, padding: "18px 20px",
          }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              color: "#5a6080", marginBottom: 14,
            }}>
              ESTATÍSTICAS DESTA RUN
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <StatBox label="NÍVEL"    value={String(lvInfo.level)}      color="#FFD700" />
              <StatBox label="XP"       value={totalXP.toLocaleString("pt-BR")} color="#f0c040" />
              <StatBox label="TAREFAS"  value={String(tasksCompleted)}    color="#06FFA5" />
              <StatBox label="MONSTROS" value={String(monstersDefeated)}  color="#E63946" />
              <StatBox label="BOSSES"   value={String(bossesDefeated)}    color="#FF6B35" />
              <StatBox label="CONQUISTAS" value={`${unlockedAchs}/${totalAchs}`} color="#c084fc" />
            </div>
          </div>

          {/* What will happen */}
          <div style={{
            background: "#0d1024", border: "1px solid rgba(42,46,80,0.8)",
            borderRadius: 10, padding: "18px 20px",
          }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              color: "#E63946", marginBottom: 14,
            }}>
              O QUE SERÁ RESETADO
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: <Swords size={18} color="#E63946" />, text: "Nível volta para 1" },
                { icon: <Map    size={18} color="#E63946" />, text: "Campanha reinicia do primeiro monstro" },
                { icon: <Gem    size={18} color="#E63946" />, text: "Progresso de XP é zerado" },
                { icon: <Timer  size={18} color="#E63946" />, text: "Desafios temporais são limpos" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.icon}</span>
                  <span style={{ color: "#E63946", fontSize: 18 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: "#0d1024", border: "1px solid rgba(42,46,80,0.8)",
            borderRadius: 10, padding: "18px 20px",
          }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              color: "#06FFA5", marginBottom: 14,
            }}>
              O QUE SERÁ MANTIDO
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: <Trophy size={18} color="#06FFA5" />, text: "Todas as conquistas desbloqueadas" },
                { icon: <Flame  size={18} color="#06FFA5" />, text: "Hábitos e streaks" },
                { icon: <Coins  size={18} color="#06FFA5" />, text: "Moedas, classes e pets" },
                { icon: <User   size={18} color="#06FFA5" />, text: "Nome do personagem" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.icon}</span>
                  <span style={{ color: "#06FFA5", fontSize: 18 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Damage Bonus Preview */}
          <div style={{
            background: "#0d1024", border: "1px solid #FFD70033",
            borderTop: "2px solid #FFD700",
            borderRadius: 10, padding: "20px 20px",
          }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              color: "#FFD700", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <Shield size={14} /> BÔNUS PERMANENTE DE DANO
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ color: "#5a6080", fontSize: 14 }}>Bônus atual</div>
                <div style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 16,
                  color: currentPerm > 0 ? "#E63946" : "#3a4060",
                  textShadow: "1px 1px 0 #000",
                }}>
                  +{currentPerm.toFixed(2)}x
                </div>
              </div>
              <div style={{ fontSize: 24, color: "#FFD700" }}>→</div>
              <div>
                <div style={{ color: "#5a6080", fontSize: 14 }}>Após renascer</div>
                <div style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 16,
                  color: "#06FFA5", textShadow: "1px 1px 0 #000",
                }}>
                  +{pendingBonus.toFixed(2)}x
                </div>
              </div>
            </div>

            {gain > 0 && (
              <div style={{
                background: "rgba(6,255,165,0.08)", border: "1px solid #06FFA533",
                padding: "8px 12px", display: "flex", alignItems: "center", gap: 8,
                marginBottom: 12, borderRadius: 6,
              }}>
                <Zap size={16} color="#FFD700" />
                <span style={{ color: "#06FFA5", fontSize: 18 }}>
                  +{gain.toFixed(2)}x dano novo será cristalizado!
                </span>
              </div>
            )}

            {gain === 0 && (
              <div style={{
                background: "rgba(255,215,0,0.06)", border: "1px solid #FFD70033",
                padding: "8px 12px", display: "flex", alignItems: "center", gap: 8,
                marginBottom: 12, borderRadius: 6,
              }}>
                <Award size={16} color="#FFD700" />
                <span style={{ color: "#FFD700", fontSize: 16 }}>
                  Desbloqueie mais conquistas para ganhar bônus extra!
                </span>
              </div>
            )}

            {/* New achievements this run */}
            {newAchsThisRun.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ color: "#5a6080", fontSize: 14, marginBottom: 6 }}>
                  Conquistas novas nesta run ({newAchsThisRun.length}):
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {newAchsThisRun.map(id => {
                    const ach = ACHIEVEMENTS.find(a => a.id === id);
                    if (!ach) return null;
                    return (
                      <div key={id} style={{
                        background: TIER_COLORS[ach.tier] + "15",
                        border: `1px solid ${TIER_COLORS[ach.tier]}44`,
                        padding: "4px 10px", display: "flex", alignItems: "center", gap: 6,
                        borderRadius: 4,
                      }}>
                        <span style={{ display: "flex", alignItems: "center" }}><PixelIcon name={ach.icon} size={16} color={TIER_COLORS[ach.tier]} /></span>
                        <span style={{ color: TIER_COLORS[ach.tier], fontSize: 15 }}>{ach.name}</span>
                        <span style={{ color: "#E63946", fontSize: 13 }}>+{ach.reward.damageBonus.toFixed(2)}x</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* How it works */}
          <div style={{
            background: "#0d1024", border: "1px solid rgba(42,46,80,0.8)",
            borderRadius: 10, padding: "16px 18px",
          }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              color: "#c084fc", marginBottom: 10,
            }}>
              COMO FUNCIONA
            </div>
            <div style={{ color: "#8a9fba", fontSize: 17, lineHeight: 1.5 }}>
              O Renascimento transforma suas conquistas em <span style={{ color: "#FFD700" }}>poder permanente</span>.
              Cada ciclo começa do nível 1, mas com dano base maior graças aos bônus cristalizados.
              Quanto mais conquistas desbloqueadas, mais poderoso você renasce!
            </div>
            <div style={{
              marginTop: 10, padding: "8px 12px",
              background: "rgba(192,132,252,0.08)", border: "1px solid #c084fc33",
              color: "#c084fc", fontSize: 15, borderRadius: 5,
            }}>
              Dica: Conquiste tudo que puder antes de renascer para maximizar o bônus!
            </div>
          </div>

          {/* Action Buttons */}
          {stage === "preview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 16 }}>
              <button
                onClick={() => { audioManager.playClick("press"); setStage("confirm"); }}
                style={{
                  width: "100%", background: "#FFD700", border: "none",
                  color: "#0d1024", padding: "16px",
                  fontFamily: "'Press Start 2P', monospace", fontSize: 11,
                  cursor: "pointer", boxShadow: "4px 4px 0 #b8860b",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  borderRadius: 8,
                }}
                onMouseDown={e => (e.currentTarget.style.transform = "translate(2px,2px)")}
                onMouseUp={e => (e.currentTarget.style.transform = "")}
              >
                <RotateCcw size={16} /> RENASCER
              </button>
              <button
                onClick={() => { audioManager.playClick("navigate"); navigate("/"); }}
                style={{
                  width: "100%", background: "#1b1e37", border: "2px solid #2a2e50",
                  color: "#5a6080", padding: "12px",
                  fontFamily: "'VT323', monospace", fontSize: 20,
                  cursor: "pointer", borderRadius: 8,
                }}
              >
                Cancelar
              </button>
            </div>
          )}

          {stage === "confirm" && (
            <div style={{
              background: "#0d1024", border: "1px solid #E6394644",
              borderTop: "2px solid #E63946",
              borderRadius: 10,
              boxShadow: "0 0 30px rgba(230,57,70,0.15)",
              padding: "24px 20px", marginBottom: 16, textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
              <div style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 12,
                color: "#E63946", marginBottom: 12, textShadow: "1px 1px 0 #000",
              }}>
                TEM CERTEZA?
              </div>
              <div style={{ color: "#8a9fba", fontSize: 18, marginBottom: 20, lineHeight: 1.4 }}>
                Seu nível, campanha e XP serão zerados.
                {gain > 0
                  ? <><br />Você ganhará <span style={{ color: "#06FFA5" }}>+{gain.toFixed(2)}x dano</span> permanente.</>
                  : <><br />Nenhum bônus novo será cristalizado.</>
                }
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { audioManager.playClick("tap"); setStage("preview"); }}
                  style={{
                    flex: 1, background: "#1b1e37", border: "2px solid #2a2e50",
                    color: "#5a6080", padding: "14px",
                    fontFamily: "'VT323', monospace", fontSize: 20, cursor: "pointer",
                    borderRadius: 6,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRebirth}
                  style={{
                    flex: 1, background: "#E63946", border: "none",
                    color: "#fff", padding: "14px",
                    fontFamily: "'Press Start 2P', monospace", fontSize: 10,
                    cursor: "pointer", boxShadow: "3px 3px 0 #900",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    borderRadius: 6,
                  }}
                  onMouseDown={e => (e.currentTarget.style.transform = "translate(2px,2px)")}
                  onMouseUp={e => (e.currentTarget.style.transform = "")}
                >
                  <RotateCcw size={14} /> CONFIRMAR
                </button>
              </div>
            </div>
          )}
      </div>
    </PageShell>
  );
}

// ── Stat Box helper ──────────────────────────────────────────────────────────
function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ color: "#5a6080", fontSize: 12, fontFamily: "'VT323', monospace" }}>{label}</span>
      <span style={{
        fontFamily: "'VT323', monospace", color, fontSize: 26,
        lineHeight: 1, textShadow: "1px 1px 0 #000",
      }}>
        {value}
      </span>
    </div>
  );
}