import { useNavigate } from "react-router";
import imgAvatarGuerreiro from "figma:asset/97194cdd6dc3ec8040cc985dae2b65b2314dcf1e.png";
import imgAvatarMago      from "figma:asset/5c09b71e009581d58103f7df9949281a05a710d1.png";
import { audioManager } from "../hooks/audioManager";
import { getActiveHabits } from "../data/habits";
import { resetAllProgress, getMissions, loadPlayerName } from "../data/missions";
import { resetEconomy, resetBonusXP, getPendingRebirthBonus, getPowerMR } from "../data/economy";
import { resetHabits } from "../data/habits";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { getPower, formatCP, getCPProgress, getNextPowerRank, formatMultiplier } from "../data/combatPower";
import { calcTotalXP, getLevelInfo, getRank, DIFFICULTY_INFO } from "../data/gameEngine";
import { getEconomy, CLASS_INFO } from "../data/economy";
import { useAuth } from "../hooks/useAuth";
import { useCampaign } from "../hooks/useCampaign";
import { BarChart3, Star, Zap, Shield, Flame, Award, Swords, TrendingUp, Castle, Trophy, ChevronRight } from "lucide-react";
import { PowerSpiderChart } from "./ui/PowerSpiderChart";
import { PageShell } from "./ui/PageShell";
import { CardIn } from "./ui/CardIn";

const CARD = { background: "#0d1024", border: "1px solid rgba(42,46,80,0.8)", borderRadius: 10, overflow: "hidden" } as const;
const TOOLBAR = { background: "#0b0d1e", borderBottom: "1px solid #1f254f", padding: "8px 14px", display: "flex" as const, alignItems: "center" as const, gap: 8 } as const;

export default function ProgressScreen() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { nick } = useAuth();
  const { selectedClass } = useCampaign();
  const missions = getMissions();
  const player   = loadPlayerName();

  const totalXP  = calcTotalXP(missions);
  const lvInfo   = getLevelInfo(totalXP);
  const xpPct    = Math.round((lvInfo.currentXP / lvInfo.neededXP) * 100);
  const rank     = getRank(lvInfo.level);

  const nextLevel   = lvInfo.level + 1;
  const totalTasks     = missions.reduce((a, m) => a + m.tasks.length, 0);
  const completedTasks = missions.reduce((a, m) => a + m.tasks.filter((t) => t.completed).length, 0);

  const campaignMissions = missions
    .filter((m) => m.mode === "campaign")
    .sort((a, b) => (a.campaignOrder ?? 0) - (b.campaignOrder ?? 0));
  const defeatedBosses = campaignMissions.filter((m) => (m.monsterCurrentHp ?? 1) <= 0);

  const activeHabits = getActiveHabits();

  const cpData     = getPower(lvInfo.level);
  const cpProgress = getCPProgress(cpData.total);
  const nextRank   = getNextPowerRank(cpData.total);
  const economy    = getEconomy();
  const activeClass = selectedClass ? CLASS_INFO[selectedClass as keyof typeof CLASS_INFO] : null;
  const avatarSrc   = selectedClass === "mago" ? imgAvatarMago : imgAvatarGuerreiro;
  const displayName = nick || player;

  const damageMultiplier = cpData.total.toFixed(2);

  const diffDamage = {
    easy:   Math.max(1, Math.round(30 * cpData.total)),
    medium: Math.max(1, Math.round(50 * cpData.total)),
    hard:   Math.max(1, Math.round(75 * cpData.total)),
  };

  return (
    <>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.75}}`}</style>
      <PageShell icon={<BarChart3 size={16} />} title="EVOLUÇÃO" accentColor="#06FFA5">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* ── Character card (Task 2: standard card) ──────────────────────── */}
          <CardIn style={{ ...CARD, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ ...TOOLBAR }}>
              <Star size={14} color="#e39f64" />
              <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#e39f64", fontSize: 9, flex: 1, textShadow: "1px 1px 0 #000" }}>PERSONAGEM</span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#FFD700", fontSize: 9, textShadow: "1px 1px 0 #000" }}>LVL {lvInfo.level}</span>
            </div>
            <div style={{ display: "flex", alignItems: "stretch" }}>
              <div style={{ width: 100, flexShrink: 0, background: "#0a0c1a", borderRight: "2px solid #1f254f", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                <img
                  src={avatarSrc}
                  alt=""
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    imageRendering: "pixelated",
                  }}
                />
              </div>
              <div style={{ flex: 1, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", color: "#fff", fontSize: 12, textShadow: "1px 1px 0 #000" }}>{displayName}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Star size={13} color={rank.color} />
                  <span style={{ fontFamily: "'VT323', monospace", color: rank.color, fontSize: 20 }}>{rank.label}</span>
                </div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #1f254f", padding: "10px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ color: "#8a7a6a", fontSize: 16 }}>{lvInfo.currentXP}/{lvInfo.neededXP} XP</span>
                <span style={{ color: "#FFD700", fontSize: 16 }}>{xpPct}%</span>
              </div>
              <div style={{ height: 16, background: "#0b0d1e", border: "2px solid #2a2e50", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, width: `${xpPct}%`, background: "#FFD700", transition: "width 0.8s ease" }} />
                <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg,transparent 0px,transparent 10px,rgba(0,0,0,0.2) 10px,rgba(0,0,0,0.2) 11px)", pointerEvents: "none" }} />
              </div>
              <div style={{ color: "#4a5070", fontSize: 14, marginTop: 4 }}>
                {lvInfo.neededXP - lvInfo.currentXP} XP para Nível {nextLevel}
              </div>
            </div>
          </CardIn>

          {/* ── POWER PANEL ───────────────────────────────────────────── */}
          <CardIn index={1} style={{ ...CARD, marginBottom: 16, overflow: "hidden", position: "relative" }}>
            {/* Glow bg */}
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 30% 20%, ${cpData.rank.glow} 0%, transparent 60%)`, pointerEvents: "none", opacity: 0.15 }} />
            {/* Toolbar */}
            <div style={{ ...TOOLBAR, position: "relative", zIndex: 1 }}>
              <Zap size={14} color={cpData.rank.color} />
              <span style={{ fontFamily: "'Press Start 2P', monospace", color: cpData.rank.color, fontSize: 9, flex: 1, textShadow: "1px 1px 0 #000" }}>POWER</span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: cpData.rank.color, background: `${cpData.rank.color}22`, border: `1px solid ${cpData.rank.color}44`, padding: "2px 8px" }}>
                {cpData.rank.tier} — {cpData.rank.label}
              </span>
            </div>
            <div style={{ padding: "16px 18px", position: "relative", zIndex: 1 }}>
              {/* Big multiplier */}
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 36, color: cpData.rank.color, textShadow: `3px 3px 0 #000, 0 0 20px ${cpData.rank.glow}`, letterSpacing: 3, lineHeight: 1 }}>
                  {formatCP(cpData.total)}
                </div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: "#5a6080", marginTop: 4 }}>
                  MH × MN × MC × MR
                </div>
              </div>

              {/* Rank progress bar */}
              {cpProgress && nextRank && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: cpData.rank.color, fontSize: 14 }}>{cpData.rank.tier}</span>
                    <span style={{ color: nextRank.color, fontSize: 14 }}>{nextRank.tier} — {nextRank.label}</span>
                  </div>
                  <div style={{ height: 10, background: "#0b0d1e", border: "2px solid #2a2e50", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0, width: `${cpProgress.percent}%`, background: `linear-gradient(90deg, ${cpData.rank.color}, ${nextRank.color})`, transition: "width 0.8s ease" }} />
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg,transparent 0px,transparent 10px,rgba(0,0,0,0.2) 10px,rgba(0,0,0,0.2) 11px)", pointerEvents: "none" }} />
                  </div>
                  <div style={{ fontFamily: "'VT323', monospace", color: "#4a5070", fontSize: 14, marginTop: 3 }}>
                    Faltam {cpProgress.remainingCP} Power para rank {nextRank.tier}
                  </div>
                </div>
              )}

              {/* ── Spider Chart ── */}
              <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 14px" }}>
                <PowerSpiderChart
                  sources={cpData.sources}
                  accentColor={cpData.rank.color}
                  size={240}
                />
              </div>

              {/* Multiplicators breakdown list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
                {cpData.sources.map((src) => (
                  <div key={src.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: src.active ? `${src.color}08` : "transparent", border: `1px solid ${src.active ? src.color + "33" : "#1a1e37"}`, borderRadius: 6, opacity: src.active ? 1 : 0.5 }}>
                    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: src.color, width: 50, flexShrink: 0 }}>{src.label}</span>
                    <span style={{ fontFamily: "'VT323', monospace", color: "#8a9fba", fontSize: 14, flex: 1 }}>{src.desc}</span>
                    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: src.active ? src.color : "#3a4060" }}>{formatMultiplier(src.value)}</span>
                  </div>
                ))}
                {/* Total */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: `${cpData.rank.color}12`, border: `2px solid ${cpData.rank.color}55`, borderRadius: 6, marginTop: 4 }}>
                  <Zap size={12} color={cpData.rank.color} />
                  <span style={{ flex: 1, fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: cpData.rank.color }}>COMBAT POWER</span>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: cpData.rank.color, textShadow: `0 0 8px ${cpData.rank.color}` }}>{cpData.combatPower}</span>
                </div>
              </div>

              {/* Conquistas pendentes (congeladas) */}
              {(() => {
                const pending = getPendingRebirthBonus();
                const mr      = getPowerMR();
                if (pending <= 0) return null;
                return (
                  <div style={{ borderTop: "1px solid #1f254f", paddingTop: 10, marginBottom: 12 }}>
                    <div style={{ fontFamily: "'VT323', monospace", color: "#5a6080", fontSize: 16, marginBottom: 6 }}>
                      ❄️ Conquistas congeladas (desbloqueiam no Rebirth)
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "rgba(6,255,165,0.06)", border: "1px solid #06FFA533", borderRadius: 6 }}>
                      <span style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: "#06FFA5", flex: 1 }}>
                        MR após rebirth: ×{(1.0 + pending).toFixed(2)}
                      </span>
                      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#06FFA5" }}>
                        +{(pending - (mr - 1)).toFixed(2)} ganho
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Damage per difficulty */}
              <div style={{ borderTop: "1px solid #1f254f", paddingTop: 12 }}>
                <div style={{ color: "#5a6080", fontSize: 14, marginBottom: 6 }}>
                  Dano por Dificuldade (Power ×{damageMultiplier})
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["easy","medium","hard"] as const).map((d) => {
                    const info = DIFFICULTY_INFO[d];
                    const dmg  = diffDamage[d];
                    return (
                      <div key={d} style={{ flex: 1, background: "#0b0d1e", border: `1px solid ${info.color}44`, padding: "6px 8px", textAlign: "center" }}>
                        <div style={{ color: info.color, fontSize: 14 }}>{info.label}</div>
                        <div style={{ fontFamily: "'Press Start 2P', monospace", color: info.color, fontSize: 12, textShadow: "1px 1px 0 #000" }}>{dmg}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardIn>

          {/* ── Stats (Task 2: standard card) ─────────────────────────────── */}
          <CardIn index={2} style={{ ...CARD, marginBottom: 16 }}>
            <div style={{ ...TOOLBAR }}>
              <span style={{ fontSize: 14 }}>📊</span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#5a6080", fontSize: 9 }}>ESTATÍSTICAS</span>
            </div>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "XP Total",   val: totalXP,           color: "#FFD700" },
                  { label: "Nível",      val: lvInfo.level,       color: "#f0c040" },
                  { label: "Tarefas",    val: `${completedTasks}/${totalTasks}`, color: "#06FFA5" },
                  { label: "Monstros",   val: `${defeatedBosses.length}/${campaignMissions.length}`, color: "#E63946" },
                  { label: "Hábitos",    val: `${activeHabits.length}/5`, color: "#FF6B35" },
                  { label: "Power",      val: formatCP(cpData.total), color: cpData.rank.color },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ background: "#0b0d1e", border: "1px solid #1f254f", padding: "10px 14px" }}>
                    <div style={{ color: "#5a6080", fontSize: 14 }}>{label}</div>
                    <div style={{ color, fontSize: 26, textShadow: "1px 1px 0 #000" }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardIn>

          {/* ── Campaign history (Task 2: standard card) ──────────────────── */}
          <CardIn>
            <div style={{ ...TOOLBAR }}>
              <Castle size={14} color="#5a6080" />
              <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#5a6080", fontSize: 9 }}>CAMPANHA</span>
            </div>
            <div style={{ padding: "8px 0" }}>
              {campaignMissions.map((m, i) => {
                const done    = (m.monsterCurrentHp ?? 1) <= 0;
                const active  = !done && m.unlocked;
                const locked  = !m.unlocked;
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: done ? "rgba(6,255,165,0.06)" : active ? "rgba(227,159,100,0.08)" : "transparent", borderBottom: "1px solid #1f254f" }}>
                    <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", background: done ? "#06FFA5" : active ? "#e39f64" : "#1f254f", flexShrink: 0 }}>
                      <span style={{ fontFamily: "'VT323', monospace", color: "#000", fontSize: 16 }}>
                        {done ? "✓" : locked ? "🔒" : `${i+1}`}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: done ? "#06FFA5" : active ? "#fff" : "#3a4060", fontSize: 18 }}>{m.name}</div>
                      <div style={{ color: "#3a4060", fontSize: 13 }}>
                        {done ? `Derrotado — ${m.monsterMaxHp}HP` : locked ? "Bloqueado" : `${m.monsterCurrentHp}/${m.monsterMaxHp} HP restante`}
                      </div>
                    </div>
                    <Shield size={13} color={done ? "#06FFA5" : active ? "#E63946" : "#3a4060"} />
                  </div>
                );
              })}
            </div>
          </CardIn>

          {/* Navigation */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button
              onClick={() => { audioManager.playClick("navigate"); navigate("/conquistas"); }}
              style={{ flex: 1, padding: "14px 0", ...CARD, border: "1px solid #c084fc55", color: "#c084fc", fontFamily: "'Press Start 2P', monospace", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Trophy size={12} /> CONQUISTAS
            </button>
            <button
              onClick={() => { audioManager.playClick("navigate"); navigate("/classe"); }}
              style={{
                flex: 1, padding: "14px 0", ...CARD,
                border: `1px solid ${activeClass ? activeClass.color + "55" : "#e39f6455"}`,
                color: activeClass ? activeClass.color : "#e39f64",
                fontFamily: "'Press Start 2P', monospace", fontSize: 9, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Swords size={12} />
              {activeClass ? activeClass.label.toUpperCase() : "CLASSE"}
              <ChevronRight size={10} />
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={() => {
              if (confirm("ATENÇÃO: Isso vai resetar TODO o seu progresso (nível, missões, hábitos, conquistas). Tem certeza?")) {
                resetAllProgress();
                resetBonusXP(); // bonusXP lives in economy, not affected by resetAllProgress
                resetEconomy();
                resetHabits();
                audioManager.playClick("press");
                navigate("/");
                setTimeout(() => window.location.reload(), 100);
              }
            }}
            style={{ width: "100%", padding: "12px 0", background: "#0d1024", border: "2px solid #E63946", color: "#E63946", fontFamily: "'VT323', monospace", fontSize: 18, cursor: "pointer", marginBottom: 24, opacity: 0.6 }}
          >
            RESETAR PROGRESSO
          </button>
        </div>
      </PageShell>
    </>
  );
}