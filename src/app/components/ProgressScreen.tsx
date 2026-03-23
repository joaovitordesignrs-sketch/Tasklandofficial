import { useNavigate } from "react-router";
import imgAvatarGuerreiro from "figma:asset/97194cdd6dc3ec8040cc985dae2b65b2314dcf1e.png";
import imgAvatarMago      from "figma:asset/5c09b71e009581d58103f7df9949281a05a710d1.png";
import { audioManager } from "../hooks/audioManager";
import { getActiveHabits } from "../data/habits";
import { resetAllProgress, getMissions, loadPlayerName } from "../data/missions";
import { resetEconomy, resetBonusXP } from "../data/economy";
import { resetHabits } from "../data/habits";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { useTheme } from "../contexts/PreferencesContext";
import { getPower, formatCP, getCPProgress, getNextPowerRank, formatMultiplier } from "../data/combatPower";
import { calcTotalXP, getLevelInfo, getRank, DIFFICULTY_INFO } from "../data/gameEngine";
import { getEconomy, CLASS_INFO } from "../data/economy";
import { useAuth } from "../hooks/useAuth";
import { useCampaign } from "../hooks/useCampaign";
import { BarChart3, Star, Zap, Shield, Flame, Award, Swords, TrendingUp, Castle, Trophy, ChevronRight, Lock } from "lucide-react";
import { PowerSpiderChart } from "./ui/PowerSpiderChart";
import { PageShell } from "./ui/PageShell";
import { CardIn } from "./ui/CardIn";

export default function ProgressScreen() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { nick } = useAuth();
  const { BG_CARD, BG_DEEPEST, BORDER_SUBTLE, ACCENT_GOLD, COLOR_LEGENDARY, RANK_NOVATO, BORDER_ELEVATED, alpha, FONT_PIXEL, FONT_BODY, COLOR_SUCCESS, COLOR_DANGER, COLOR_WARNING, COLOR_ORANGE, COLOR_MAGE, TEXT_MUTED, TEXT_BODY, TEXT_LIGHT, TEXT_INACTIVE, ACCENT_SHADOW, RANK_VETERANO, PX_SM, PX_XS, PX_2XS, PX_MD, VT_XL, VT_LG, VT_MD, VT_SM, VT_XS } = useTheme();

  const CARD = { background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "cc")}`, borderRadius: 10, overflow: "hidden" } as const;
  const TOOLBAR = { background: BG_DEEPEST, borderBottom: `1px solid ${BORDER_SUBTLE}`, padding: "8px 14px", display: "flex" as const, alignItems: "center" as const, gap: 8 } as const;
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
      <PageShell icon={<BarChart3 size={16} />} title="EVOLUÇÃO" accentColor={COLOR_SUCCESS}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* ── Character card (Task 2: standard card) ──────────────────────── */}
          <CardIn style={{ ...CARD, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ ...TOOLBAR }}>
              <Star size={14} color={ACCENT_GOLD} />
              <span style={{ fontFamily: FONT_PIXEL, color: ACCENT_GOLD, fontSize: PX_SM, flex: 1, textShadow: "1px 1px 0 #000" }}>PERSONAGEM</span>
              <span style={{ fontFamily: FONT_PIXEL, color: COLOR_LEGENDARY, fontSize: PX_SM, textShadow: "1px 1px 0 #000" }}>LVL {lvInfo.level}</span>
            </div>
            <div style={{ display: "flex", alignItems: "stretch" }}>
              <div style={{ width: 100, flexShrink: 0, background: BG_DEEPEST, borderRight: `2px solid ${BORDER_SUBTLE}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
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
                <div style={{ fontFamily: FONT_PIXEL, color: "#fff", fontSize: 12, textShadow: "1px 1px 0 #000" }}>{displayName}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Star size={13} color={rank.color} />
                  <span style={{ fontFamily: FONT_BODY, color: rank.color, fontSize: VT_XL }}>{rank.label}</span>
                </div>
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${BORDER_SUBTLE}`, padding: "10px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ color: RANK_NOVATO, fontSize: VT_MD }}>{lvInfo.currentXP}/{lvInfo.neededXP} XP</span>
                <span style={{ color: COLOR_LEGENDARY, fontSize: VT_MD }}>{xpPct}%</span>
              </div>
              <div style={{ height: 16, background: BG_DEEPEST, border: `2px solid ${BORDER_ELEVATED}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, width: `${xpPct}%`, background: COLOR_LEGENDARY, transition: "width 0.8s ease" }} />
                <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg,transparent 0px,transparent 10px,rgba(0,0,0,0.2) 10px,rgba(0,0,0,0.2) 11px)", pointerEvents: "none" }} />
              </div>
              <div style={{ color: TEXT_MUTED, fontSize: VT_SM, marginTop: 4 }}>
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
              <span style={{ fontFamily: FONT_PIXEL, color: cpData.rank.color, fontSize: PX_SM, flex: 1, textShadow: "1px 1px 0 #000" }}>POWER</span>
              <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_XS, color: cpData.rank.color, background: `${cpData.rank.color}22`, border: `1px solid ${cpData.rank.color}44`, padding: "2px 8px" }}>
                {cpData.rank.tier} — {cpData.rank.label}
              </span>
            </div>
            <div style={{ padding: "16px 18px", position: "relative", zIndex: 1 }}>
              {/* Big multiplier */}
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontFamily: FONT_PIXEL, fontSize: 36, color: cpData.rank.color, textShadow: `3px 3px 0 #000, 0 0 20px ${cpData.rank.glow}`, letterSpacing: 3, lineHeight: 1 }}>
                  {formatCP(cpData.total)}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: VT_MD, color: TEXT_MUTED, marginTop: 4 }}>
                  MH × MN × MC × MR
                </div>
              </div>

              {/* Rank progress bar */}
              {cpProgress && nextRank && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: cpData.rank.color, fontSize: VT_SM }}>{cpData.rank.tier}</span>
                    <span style={{ color: nextRank.color, fontSize: VT_SM }}>{nextRank.tier} — {nextRank.label}</span>
                  </div>
                  <div style={{ height: 10, background: BG_DEEPEST, border: `2px solid ${BORDER_ELEVATED}`, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0, width: `${cpProgress.percent}%`, background: `linear-gradient(90deg, ${cpData.rank.color}, ${nextRank.color})`, transition: "width 0.8s ease" }} />
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg,transparent 0px,transparent 10px,rgba(0,0,0,0.2) 10px,rgba(0,0,0,0.2) 11px)", pointerEvents: "none" }} />
                  </div>
                  <div style={{ fontFamily: FONT_BODY, color: TEXT_MUTED, fontSize: VT_SM, marginTop: 3 }}>
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
                    <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: src.color, width: 50, flexShrink: 0 }}>{src.label}</span>
                    <span style={{ fontFamily: FONT_BODY, color: RANK_VETERANO, fontSize: VT_SM, flex: 1 }}>{src.desc}</span>
                    <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_SM, color: src.active ? src.color : TEXT_INACTIVE }}>{formatMultiplier(src.value)}</span>
                  </div>
                ))}
                {/* Total */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: `${cpData.rank.color}12`, border: `2px solid ${cpData.rank.color}55`, borderRadius: 6, marginTop: 4 }}>
                  <Zap size={12} color={cpData.rank.color} />
                  <span style={{ flex: 1, fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: cpData.rank.color }}>COMBAT POWER</span>
                  <span style={{ fontFamily: FONT_PIXEL, fontSize: 11, color: cpData.rank.color, textShadow: `0 0 8px ${cpData.rank.color}` }}>{cpData.combatPower}</span>
                </div>
              </div>


              {/* Damage per difficulty */}
              <div style={{ borderTop: `1px solid ${BORDER_SUBTLE}`, paddingTop: 12 }}>
                <div style={{ color: TEXT_MUTED, fontSize: VT_SM, marginBottom: 6 }}>
                  Dano por Dificuldade (Power ×{damageMultiplier})
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["easy","medium","hard"] as const).map((d) => {
                    const info = DIFFICULTY_INFO[d];
                    const dmg  = diffDamage[d];
                    return (
                      <div key={d} style={{ flex: 1, background: BG_DEEPEST, border: `1px solid ${info.color}44`, padding: "6px 8px", textAlign: "center" }}>
                        <div style={{ color: info.color, fontSize: VT_SM }}>{info.label}</div>
                        <div style={{ fontFamily: FONT_PIXEL, color: info.color, fontSize: 12, textShadow: "1px 1px 0 #000" }}>{dmg}</div>
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
              <span style={{ fontSize: VT_SM }}>📊</span>
              <span style={{ fontFamily: FONT_PIXEL, color: TEXT_MUTED, fontSize: PX_SM }}>ESTATÍSTICAS</span>
            </div>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "XP Total",   val: totalXP,           color: COLOR_LEGENDARY },
                  { label: "Nível",      val: lvInfo.level,       color: COLOR_WARNING },
                  { label: "Tarefas",    val: `${completedTasks}/${totalTasks}`, color: COLOR_SUCCESS },
                  { label: "Monstros",   val: `${defeatedBosses.length}/${campaignMissions.length}`, color: COLOR_DANGER },
                  { label: "Hábitos",    val: `${activeHabits.length}/5`, color: COLOR_ORANGE },
                  { label: "Power",      val: formatCP(cpData.total), color: cpData.rank.color },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ background: BG_DEEPEST, border: `1px solid ${BORDER_SUBTLE}`, padding: "10px 14px" }}>
                    <div style={{ color: TEXT_MUTED, fontSize: VT_SM }}>{label}</div>
                    <div style={{ color, fontSize: 26, textShadow: "1px 1px 0 #000" }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardIn>

          {/* ── Campaign history (Task 2: standard card) ──────────────────── */}
          <CardIn>
            <div style={{ ...TOOLBAR }}>
              <Castle size={14} color={TEXT_MUTED} />
              <span style={{ fontFamily: FONT_PIXEL, color: TEXT_MUTED, fontSize: PX_SM }}>CAMPAIGN</span>
            </div>
            <div style={{ padding: "8px 0" }}>
              {campaignMissions.map((m, i) => {
                const done    = (m.monsterCurrentHp ?? 1) <= 0;
                const active  = !done && m.unlocked;
                const locked  = !m.unlocked;
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: done ? "rgba(6,255,165,0.06)" : active ? "rgba(227,159,100,0.08)" : "transparent", borderBottom: `1px solid ${BORDER_SUBTLE}` }}>
                    <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", background: done ? COLOR_SUCCESS : active ? ACCENT_GOLD : BORDER_SUBTLE, flexShrink: 0 }}>
                      <span style={{ fontFamily: FONT_BODY, color: "#000", fontSize: VT_MD }}>
                        {done ? "✓" : locked ? "🔒" : `${i+1}`}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: done ? COLOR_SUCCESS : active ? "#fff" : TEXT_INACTIVE, fontSize: VT_LG }}>{m.name}</div>
                      <div style={{ color: TEXT_INACTIVE, fontSize: VT_XS }}>
                        {done ? `Defeated — ${m.monsterMaxHp}HP` : locked ? "Locked" : `${m.monsterCurrentHp}/${m.monsterMaxHp} HP remaining`}
                      </div>
                    </div>
                    <Shield size={13} color={done ? COLOR_SUCCESS : active ? COLOR_DANGER : TEXT_INACTIVE} />
                  </div>
                );
              })}
            </div>
          </CardIn>

          {/* Navigation */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button
              onClick={() => { audioManager.playClick("navigate"); navigate("/conquistas"); }}
              style={{ flex: 1, padding: "14px 0", ...CARD, border: `1px solid ${alpha(COLOR_MAGE, "55")}`, color: COLOR_MAGE, fontFamily: FONT_PIXEL, fontSize: PX_MD, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Trophy size={12} /> CONQUISTAS
            </button>
            <button
              disabled
              style={{
                flex: 1, padding: "14px 0", ...CARD,
                border: `1px solid rgba(90,96,128,0.3)`,
                color: "rgba(120,126,160,0.5)",
                fontFamily: FONT_PIXEL, fontSize: PX_SM, cursor: "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                opacity: 0.45,
              }}
            >
              <Swords size={12} />
              {activeClass ? activeClass.label.toUpperCase() : "CLASSE"}
              <Lock size={9} />
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
            style={{ width: "100%", padding: "12px 0", background: BG_CARD, border: `2px solid ${COLOR_DANGER}`, color: COLOR_DANGER, fontFamily: FONT_BODY, fontSize: VT_LG, cursor: "pointer", marginBottom: 24, opacity: 0.6 }}
          >
            RESETAR PROGRESSO
          </button>
        </div>
      </PageShell>
    </>
  );
}