/**
 * ProfileScreen — Unifies Diário, Evolução, Campanha and Renascer
 * into a single page with a pixel-art RPG tab switcher.
 */
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

// ── Icons ──────────────────────────────────────────────────────────────────────
import {
  Scroll, BarChart3, RotateCcw, User,
  Calendar, ChevronDown, ChevronUp, Timer, Brain, Shield, Swords, Flame,
  Star, Zap, Award, TrendingUp, Castle, Trophy, Backpack,
  CheckSquare, Map as MapIcon, Gem, Coins, FileText, CheckCircle2,
} from "lucide-react";

// ── Data / hooks ───────────────────────────────────────────────────────────────
import { getTaskHistory, TaskHistoryEntry, getMissions, loadPlayerName, resetAllProgress, rebirthReset } from "../data/missions";
import { DIFFICULTY_INFO, calcTotalXP, getLevelInfo, getRank } from "../data/gameEngine";
import {
  getEconomy, CLASS_INFO, resetEconomy, resetBonusXP,
  getRebirthState, performRebirth, getPendingRebirthBonus, getRebirthGain,
  ACHIEVEMENTS, TIER_COLORS, RebirthState,
  selectClass, buyClass, type CharacterClass,
} from "../data/economy";
import { getActiveHabits, resetHabits } from "../data/habits";
import { getPower, formatPower, getPowerProgress, getNextPowerRank } from "../data/combatPower";
import { PowerSpiderChart } from "./ui/PowerSpiderChart";
import { forcePush } from "../data/syncService";
import { useAuth } from "../hooks/useAuth";
import { useCampaign } from "../hooks/useCampaign";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { audioManager } from "../hooks/audioManager";
import { PageShell } from "./ui/PageShell";
import { CardIn } from "./ui/CardIn";
import { ItemsTab } from "./ItemsTab";
import { PixelIcon } from "./ui/PixelIcon";
import { PixelTabs, PixelTabDef } from "./ui/PixelTabs";
import { RpgButton } from "./ui/RpgButton";
import imgAvatarGuerreiro from "figma:asset/97194cdd6dc3ec8040cc985dae2b65b2314dcf1e.png";
import imgAvatarMago from "figma:asset/5c09b71e009581d58103f7df9949281a05a710d1.png";
import {
  BG_DEEPEST, BG_CARD, BORDER_SUBTLE, BORDER_ELEVATED,
  ACCENT_GOLD, ACCENT_SHADOW, COLOR_MAGE, COLOR_WARRIOR, COLOR_ORANGE,
  COLOR_SUCCESS, COLOR_DANGER, COLOR_LEGENDARY, COLOR_WARNING,
  TEXT_INACTIVE, TEXT_MUTED, TEXT_BODY, TEXT_LIGHT,
  FONT_PIXEL, FONT_BODY, RADIUS_LG, RADIUS_XL,
  RANK_NOVATO,
} from "../data/tokens";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type ProfileTab = "diario" | "evolucao" | "campanha" | "renascer" | "itens";
type RebirthStage = "preview" | "confirm" | "animating" | "complete";

// ─────────────────────────────────────────────────────────────────────────────
// Shared card constants — use design tokens
// ─────────────────────────────────────────────────────────────────────────────
const CARD     = { background: BG_CARD, border: `1px solid ${BORDER_ELEVATED}88`, borderRadius: RADIUS_XL, overflow: "hidden" } as const;
const TOOLBAR  = { background: BG_DEEPEST, borderBottom: `1px solid ${BORDER_SUBTLE}`, padding: "8px 14px", display: "flex" as const, alignItems: "center" as const, gap: 8 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// DIÁRIO helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "HOJE";
  if (d.toDateString() === yesterday.toDateString()) return "ONTEM";
  const days = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function dateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const MODE_INFO: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  campaign:      { color: "#e39f64", label: "CAMPANHA", icon: <Swords size={10} /> },
  "time-attack": { color: "#FF6B35", label: "TEMPORAL", icon: <Timer size={10} /> },
  focus:         { color: "#c084fc", label: "FOCO",     icon: <Brain size={10} /> },
};

function DiffIcon({ difficulty }: { difficulty: string }) {
  const d = DIFFICULTY_INFO[difficulty ?? "medium"] ?? DIFFICULTY_INFO.medium;
  const iconMap: Record<string, React.ReactNode> = {
    easy:   <Shield size={14} color={d.color} />,
    medium: <Swords size={14} color={d.color} />,
    hard:   <Flame  size={14} color={d.color} />,
  };
  return (
    <div style={{ width: 28, height: 28, flexShrink: 0, background: d.color + "18", border: `1px solid ${d.color}55`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {iconMap[difficulty ?? "medium"] ?? iconMap.medium}
    </div>
  );
}

function TaskCard({ entry, index }: { entry: TaskHistoryEntry; index: number }) {
  const diff   = DIFFICULTY_INFO[entry.difficulty ?? "medium"] ?? DIFFICULTY_INFO.medium;
  const source = entry.source ?? "campaign";
  const mode   = MODE_INFO[source] ?? MODE_INFO.campaign;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#0a0c1a", border: `1px solid ${mode.color}33`, borderLeft: `3px solid ${mode.color}`, borderRadius: 6, padding: "8px 10px", animation: `cardIn 200ms cubic-bezier(0.22,1,0.36,1) ${Math.min(index * 35, 300)}ms both` }}>
      <DiffIcon difficulty={entry.difficulty ?? "medium"} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: TEXT_LIGHT, fontSize: 17, fontFamily: FONT_BODY, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3 }}>{entry.text}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: FONT_BODY, color: diff.color, fontSize: 14 }}>{diff.label}</span>
          {entry.missionName && <span style={{ color: TEXT_INACTIVE, fontSize: 13, fontFamily: FONT_BODY }}>· {entry.missionName}</span>}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: mode.color + "18", border: `1px solid ${mode.color}44`, padding: "2px 7px", borderRadius: 4 }}>
          <span style={{ color: mode.color, lineHeight: 1 }}>{mode.icon}</span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: mode.color }}>{mode.label}</span>
        </div>
        {entry.damageDealt !== undefined && <div style={{ color: COLOR_DANGER, fontSize: 14, fontFamily: FONT_BODY }}>-{entry.damageDealt}HP</div>}
        <div style={{ color: TEXT_INACTIVE, fontSize: 13, fontFamily: FONT_BODY }}>{formatTime(entry.completedAt)}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Rebirth helpers
// ─────────────────────────────────────────────────────────────────────────────
interface RunSnapshot {
  level: number; rank: { label: string; color: string };
  totalXP: number; monstersDefeated: number; bossesDefeated: number;
  tasksCompleted: number; runNumber: number; gain: number;
  newAchievements: string[]; pendingBonus: number; currentPerm: number;
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: "#0a0c1a", border: `1px solid ${color}33`, padding: "10px 12px", borderRadius: 6, textAlign: "center" }}>
      <div style={{ color: TEXT_MUTED, fontSize: 13, fontFamily: FONT_BODY, marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: FONT_PIXEL, color, fontSize: 12, textShadow: `1px 1px 0 #000, 0 0 8px ${color}66` }}>{value}</div>
    </div>
  );
}

function RunReportAnimation({ snapshot, onDone }: { snapshot: RunSnapshot; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const delays = [200, 700, 1200, 1700, 2200, 2900];
    delays.forEach((d, i) => { const t = setTimeout(() => setStep(i + 1), d); timeouts.current.push(t); });
    const done = setTimeout(onDone, 3400);
    timeouts.current.push(done);
    return () => timeouts.current.forEach(clearTimeout);
  }, []); // eslint-disable-line
  const rows = [
    { icon: <TrendingUp size={14} />, label: "NÍVEL ALCANÇADO",   value: `${snapshot.level}`,                        color: "#FFD700" },
    { icon: <Star size={14} />,       label: "RANK",              value: snapshot.rank.label,                        color: snapshot.rank.color },
    { icon: <Zap size={14} />,        label: "XP TOTAL",          value: snapshot.totalXP.toLocaleString("pt-BR"),   color: "#f0c040" },
    { icon: <Swords size={14} />,     label: "MONSTROS ABATIDOS", value: `${snapshot.monstersDefeated}`,             color: "#E63946" },
    { icon: <Trophy size={14} />,     label: "BOSSES DERROTADOS", value: `${snapshot.bossesDefeated}`,               color: "#FF6B35" },
    { icon: <CheckSquare size={14} />,label: "TAREFAS CONCLUÍDAS",value: `${snapshot.tasksCompleted}`,               color: "#06FFA5" },
  ];
  return (
    <>
      <style>{`
        @keyframes scanIn   { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
        @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes scanline { 0%{top:-10%} 100%{top:110%} }
        @keyframes flashInR  { 0%{opacity:0} 60%{opacity:1} 100%{opacity:0.85} }
      `}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "#060810", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'VT323', monospace", padding: "20px 16px", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg,rgba(255,255,255,0.025) 0px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,rgba(255,255,255,0.025) 0px,transparent 1px,transparent 32px)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, height: "4px", background: "linear-gradient(transparent,rgba(255,215,0,0.08),transparent)", animation: "scanline 3s linear infinite", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 500 }}>
          {step >= 1 && (
            <div style={{ textAlign: "center", marginBottom: 28, animation: "scanIn 0.4s ease-out" }}>
              <div style={{ fontFamily: FONT_PIXEL, fontSize: 11, color: TEXT_MUTED, marginBottom: 8, letterSpacing: 3 }}>── RELATÓRIO DE MISSÃO ──</div>
              <div style={{ fontFamily: FONT_PIXEL, fontSize: 16, color: COLOR_LEGENDARY, textShadow: "0 0 20px rgba(255,215,0,0.6)", letterSpacing: 2 }}>RUN #{snapshot.runNumber}</div>
              <div style={{ color: TEXT_INACTIVE, fontSize: 14, marginTop: 4, animation: "blink 1s step-end infinite" }}>▌COMPILANDO DADOS...</div>
            </div>
          )}
          <div style={{ background: "#0a0c1a", border: `2px solid ${BORDER_SUBTLE}`, padding: "16px 20px", marginBottom: 16 }}>
            <div style={{ fontFamily: FONT_PIXEL, fontSize: 8, color: "#2a3050", marginBottom: 14, letterSpacing: 2 }}>ESTATÍSTICAS FINAIS</div>
            {rows.map((row, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: i < rows.length - 1 ? "1px solid #0f1222" : "none", opacity: step >= 2 + Math.floor(i / 2) ? 1 : 0.1, transition: "opacity 0.3s ease", animation: step >= 2 + Math.floor(i / 2) ? "scanIn 0.35s ease-out" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: TEXT_INACTIVE }}>
                  {row.icon}
                  <span style={{ fontSize: 15, color: TEXT_MUTED }}>{row.label}</span>
                </div>
                <span style={{ fontFamily: FONT_PIXEL, fontSize: 10, color: row.color, textShadow: `0 0 10px ${row.color}66` }}>{row.value}</span>
              </div>
            ))}
          </div>
          {step >= 5 && (
            <div style={{ background: snapshot.gain > 0 ? "rgba(6,255,165,0.06)" : "rgba(255,215,0,0.04)", border: `2px solid ${snapshot.gain > 0 ? "#06FFA533" : "#FFD70022"}`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", animation: "scanIn 0.4s ease-out", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: FONT_PIXEL, fontSize: 8, color: TEXT_INACTIVE, marginBottom: 6 }}>MR CRISTALIZADO</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <span style={{ color: TEXT_MUTED, fontSize: 18, textDecoration: "line-through" }}>×{(1 + snapshot.currentPerm).toFixed(2)}</span>
                  <span style={{ fontSize: 22, color: TEXT_INACTIVE }}>→</span>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", color: snapshot.gain > 0 ? "#06FFA5" : "#FFD700", fontSize: 14, textShadow: `0 0 16px ${snapshot.gain > 0 ? "rgba(6,255,165,0.5)" : "rgba(255,215,0,0.4)"}` }}>×{(1 + snapshot.pendingBonus).toFixed(2)}</span>
                </div>
              </div>
              {snapshot.gain > 0 && (
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#06FFA5", background: "rgba(6,255,165,0.1)", border: "1px solid #06FFA544", padding: "6px 10px", textAlign: "center" }}>
                  +{snapshot.gain.toFixed(2)}<br /><span style={{ fontSize: 7, color: "#06FFA566" }}>GANHO</span>
                </div>
              )}
            </div>
          )}
          {step >= 6 && (
            <div style={{ textAlign: "center", animation: "flashInR 0.5s ease-out", fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#FFD700", letterSpacing: 2 }}>
              ▶ INICIANDO RENASCIMENTO...
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: DIÁRIO
// ─────────────────────────────────────────────────────────────────────────────
function DiarioTab() {
  const history = useMemo(() => getTaskHistory(), []);
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "campaign" | "time-attack" | "focus">("all");

  const groups = useMemo(() => {
    const filtered = filter === "all" ? history : history.filter(e => (e.source ?? "campaign") === filter);
    const map = new Map<string, TaskHistoryEntry[]>();
    const sorted = [...filtered].sort((a, b) => b.completedAt - a.completedAt);
    for (const entry of sorted) {
      const key = dateKey(entry.completedAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return Array.from(map.entries()).map(([key, tasks]) => ({ key, label: formatDate(tasks[0].completedAt), tasks }));
  }, [history, filter]);

  const totalTasks      = history.length;
  const totalDays       = groups.length;
  const timeAttackCount = history.filter(e => e.source === "time-attack").length;
  const focusCount      = history.filter(e => e.source === "focus").length;

  function toggleDay(key: string) {
    audioManager.playClick("tap");
    setCollapsedDays(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Stats + filter */}
      <CardIn style={{ background: BG_CARD, border: "1px solid rgba(42,46,80,0.8)", borderRadius: RADIUS_XL, padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: COLOR_SUCCESS, fontSize: 20, fontFamily: FONT_BODY }}>{totalTasks}</span>
            <span style={{ color: TEXT_MUTED, fontSize: 15, fontFamily: FONT_BODY }}>tarefas concluídas</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={13} color={COLOR_MAGE} />
            <span style={{ color: COLOR_MAGE, fontSize: 20, fontFamily: FONT_BODY }}>{totalDays}</span>
            <span style={{ color: TEXT_MUTED, fontSize: 15, fontFamily: FONT_BODY }}>dias ativos</span>
          </div>
          {timeAttackCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Timer size={12} color={COLOR_ORANGE} />
              <span style={{ color: COLOR_ORANGE, fontSize: 20, fontFamily: FONT_BODY }}>{timeAttackCount}</span>
              <span style={{ color: TEXT_MUTED, fontSize: 15, fontFamily: FONT_BODY }}>temporais</span>
            </div>
          )}
          {focusCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Brain size={12} color={COLOR_MAGE} />
              <span style={{ color: COLOR_MAGE, fontSize: 20, fontFamily: FONT_BODY }}>{focusCount}</span>
              <span style={{ color: TEXT_MUTED, fontSize: 15, fontFamily: FONT_BODY }}>foco</span>
            </div>
          )}
        </div>
        {/* Filter chips */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {([
            { key: "all",         label: "TODAS",    accent: ACCENT_GOLD,  Icon: null   },
            { key: "campaign",    label: "CAMPANHA", accent: ACCENT_GOLD,  Icon: Swords  },
            { key: "time-attack", label: "TEMPORAL", accent: COLOR_ORANGE, Icon: Timer   },
            { key: "focus",       label: "FOCO",     accent: COLOR_MAGE,   Icon: Brain   },
          ] as const).map(({ key, label, accent, Icon }) => (
            <button key={key} onClick={() => { audioManager.playClick("tap"); setFilter(key); }} style={{ padding: "6px 10px", background: filter === key ? accent + "18" : "transparent", border: `1px solid ${filter === key ? accent : BORDER_SUBTLE}`, color: filter === key ? accent : TEXT_MUTED, fontFamily: FONT_BODY, fontSize: 15, cursor: "pointer", borderRadius: 5, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
              {Icon && <Icon size={13} />}{label}
            </button>
          ))}
        </div>
      </CardIn>

      {groups.length === 0 && (
        <CardIn index={1} style={{ background: BG_CARD, border: "1px solid rgba(42,46,80,0.8)", borderRadius: RADIUS_XL, padding: "40px 20px", textAlign: "center", opacity: 0.5 }}>
          <Scroll size={36} color={TEXT_INACTIVE} style={{ margin: "0 auto 12px" }} />
          <div style={{ fontFamily: FONT_PIXEL, color: TEXT_INACTIVE, fontSize: 8 }}>
            {filter === "all" ? "NENHUMA TAREFA CONCLUÍDA" : "NENHUMA TAREFA NESTA CATEGORIA"}
          </div>
        </CardIn>
      )}

      {groups.map((group, gIdx) => {
        const collapsed = collapsedDays.has(group.key);
        return (
          <CardIn key={group.key} index={gIdx + 1} style={{ background: BG_CARD, border: "1px solid rgba(42,46,80,0.7)", borderRadius: RADIUS_XL, overflow: "hidden" }}>
            <button onClick={() => toggleDay(group.key)} style={{ width: "100%", background: BG_DEEPEST, borderTop: "none", borderLeft: "none", borderRight: "none", borderBottom: collapsed ? "none" : `1px solid ${BORDER_SUBTLE}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <Calendar size={13} color={ACCENT_GOLD} />
              <span style={{ fontFamily: FONT_PIXEL, color: ACCENT_GOLD, fontSize: 9, flex: 1, textAlign: "left", textShadow: "1px 1px 0 #000" }}>{group.label}</span>
              <span style={{ color: TEXT_MUTED, fontSize: 15, fontFamily: FONT_BODY }}>{group.tasks.length} tarefa{group.tasks.length !== 1 ? "s" : ""}</span>
              {collapsed ? <ChevronDown size={14} color={TEXT_MUTED} /> : <ChevronUp size={14} color={TEXT_MUTED} />}
            </button>
            {!collapsed && (
              <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                {group.tasks.map((entry, eIdx) => <TaskCard key={entry.id} entry={entry} index={eIdx} />)}
              </div>
            )}
          </CardIn>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Class colors helper (shared between EvolucaoTab)
// ─────────────────────────────────────────────────────────────────────────────
const CLASS_COLORS: Record<CharacterClass, { color: string; glow: string }> = {
  mago:      { color: "#60a5fa", glow: "rgba(96,165,250,0.35)"  },
  guerreiro: { color: "#E63946", glow: "rgba(230,57,70,0.35)"   },
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: EVOLUÇÃO
// ─────────────────────────────────────────────────────────────────────────────
function EvolucaoTab() {
  const navigate = useNavigate();
  const { nick } = useAuth();
  const { selectedClass } = useCampaign();
  const missions = getMissions();
  const player   = loadPlayerName();

  const totalXP  = calcTotalXP(missions);
  const lvInfo   = getLevelInfo(totalXP);
  const xpPct    = Math.round((lvInfo.currentXP / lvInfo.neededXP) * 100);
  const rank     = getRank(lvInfo.level);

  const nextLevel        = lvInfo.level + 1;

  const totalTasks     = missions.reduce((a, m) => a + m.tasks.length, 0);
  const completedTasks = missions.reduce((a, m) => a + m.tasks.filter(t => t.completed).length, 0);

  const campaignMissions = missions.filter(m => m.mode === "campaign").sort((a, b) => (a.campaignOrder ?? 0) - (b.campaignOrder ?? 0));
  const defeatedBosses   = campaignMissions.filter(m => (m.monsterCurrentHp ?? 1) <= 0);

  const activeHabits     = getActiveHabits();

  const cpData     = getPower(lvInfo.level);
  const cpProgress = getPowerProgress(cpData.total);
  const nextRank   = getNextPowerRank(cpData.total);

  const damageMultiplier = cpData.total.toFixed(2);

  const diffDamage = {
    easy:   Math.max(1, Math.round(30 * cpData.total)),
    medium: Math.max(1, Math.round(50 * cpData.total)),
    hard:   Math.max(1, Math.round(75 * cpData.total)),
  };
  const economy    = getEconomy(); void economy;
  const avatarSrc  = selectedClass === "mago" ? imgAvatarMago : imgAvatarGuerreiro;
  const displayName = nick || player;

  const activeClass       = selectedClass ? CLASS_INFO[selectedClass as keyof typeof CLASS_INFO] : null;
  const activeClassColors = selectedClass ? CLASS_COLORS[selectedClass as CharacterClass] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Character card + inline class selection ── */}
      <CardIn style={{ ...CARD, marginBottom: 0, overflow: "hidden" }}>
        <div style={{ ...TOOLBAR }}>
          <Star size={14} color={ACCENT_GOLD} />
          <span style={{ fontFamily: FONT_PIXEL, color: ACCENT_GOLD, fontSize: 9, flex: 1, textShadow: "1px 1px 0 #000" }}>PERSONAGEM</span>
          <span style={{ fontFamily: FONT_PIXEL, color: COLOR_LEGENDARY, fontSize: 9, textShadow: "1px 1px 0 #000" }}>LVL {lvInfo.level}</span>
        </div>

        {/* Avatar + info row */}
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <div style={{ width: 100, flexShrink: 0, background: "#0a0c1a", borderRight: `2px solid ${BORDER_SUBTLE}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
            <img src={avatarSrc} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
          </div>
          <div style={{ flex: 1, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontFamily: FONT_PIXEL, color: "#fff", fontSize: 12, textShadow: "1px 1px 0 #000" }}>{displayName}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Star size={13} color={rank.color} />
              <span style={{ fontFamily: FONT_BODY, color: rank.color, fontSize: 20 }}>{rank.label}</span>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div style={{ borderTop: `1px solid ${BORDER_SUBTLE}`, padding: "10px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ color: RANK_NOVATO, fontSize: 16, fontFamily: FONT_BODY }}>{lvInfo.currentXP}/{lvInfo.neededXP} XP</span>
            <span style={{ color: COLOR_LEGENDARY, fontSize: 16, fontFamily: FONT_BODY }}>{xpPct}%</span>
          </div>
          <div style={{ height: 16, background: BG_DEEPEST, border: `2px solid ${BORDER_ELEVATED}`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, width: `${xpPct}%`, background: COLOR_LEGENDARY, transition: "width 0.8s ease" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg,transparent 0px,transparent 10px,rgba(0,0,0,0.2) 10px,rgba(0,0,0,0.2) 11px)", pointerEvents: "none" }} />
          </div>
          <div style={{ color: TEXT_INACTIVE, fontSize: 14, marginTop: 4, fontFamily: FONT_BODY }}>{lvInfo.neededXP - lvInfo.currentXP} XP para Nível {nextLevel}</div>
        </div>

        {/* ── Botão para página de seleção de classe ── */}
        <div style={{ borderTop: `1px solid ${BORDER_SUBTLE}`, padding: "10px 14px" }}>
          <button
            onClick={() => { audioManager.playClick("navigate"); navigate("/classe"); }}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px",
              background: activeClassColors ? `${activeClassColors.color}0d` : "#09091f",
              border: `1px solid ${activeClassColors ? activeClassColors.color + "44" : BORDER_ELEVATED}`,
              borderRadius: 8, cursor: "pointer", transition: "all 0.18s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: activeClassColors ? `${activeClassColors.color}18` : "#1a1e37", border: `1px solid ${activeClassColors ? activeClassColors.color + "55" : BORDER_ELEVATED}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Swords size={16} color={activeClassColors?.color ?? TEXT_MUTED} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: FONT_PIXEL, fontSize: 8, color: activeClassColors?.color ?? TEXT_MUTED, letterSpacing: 0.5 }}>
                  {activeClass ? activeClass.label.toUpperCase() : "SEM CLASSE"}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: TEXT_INACTIVE, marginTop: 2 }}>
                  {activeClass ? activeClass.desc : "Toque para escolher sua classe"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: FONT_PIXEL, fontSize: 7, color: activeClassColors?.color ?? TEXT_INACTIVE }}>MUDAR</span>
              <span style={{ color: activeClassColors?.color ?? TEXT_INACTIVE, fontSize: 20, fontFamily: FONT_BODY }}>▶</span>
            </div>
          </button>
        </div>
      </CardIn>

      {/* POWER panel */}
      <CardIn index={1} style={{ ...CARD, marginBottom: 0, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 30% 20%, ${cpData.rank.glow} 0%, transparent 60%)`, pointerEvents: "none", opacity: 0.15 }} />
        <div style={{ ...TOOLBAR, position: "relative", zIndex: 1 }}>
          <Zap size={14} color={cpData.rank.color} />
          <span style={{ fontFamily: "'Press Start 2P', monospace", color: cpData.rank.color, fontSize: 9, flex: 1, textShadow: "1px 1px 0 #000" }}>POWER</span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: cpData.rank.color, background: `${cpData.rank.color}22`, border: `1px solid ${cpData.rank.color}44`, padding: "2px 8px" }}>{cpData.rank.tier} - {cpData.rank.label}</span>
        </div>
        <div style={{ padding: "16px 18px", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 36, color: cpData.rank.color, textShadow: `3px 3px 0 #000, 0 0 20px ${cpData.rank.glow}`, letterSpacing: 3, lineHeight: 1 }}>{formatPower(cpData.total)}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 16, color: TEXT_MUTED, marginTop: 4 }}>MH × MN × MC × MR</div>
          </div>
          {cpProgress && nextRank && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: "'VT323', monospace" }}>
                <span style={{ color: cpData.rank.color, fontSize: 14 }}>{cpData.rank.tier}</span>
                <span style={{ color: nextRank.color, fontSize: 14 }}>{nextRank.tier} — {nextRank.label}</span>
              </div>
              <div style={{ height: 10, background: BG_DEEPEST, border: `2px solid ${BORDER_ELEVATED}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, width: `${cpProgress.percent}%`, background: `linear-gradient(90deg, ${cpData.rank.color}, ${nextRank.color})`, transition: "width 0.8s ease" }} />
                <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg,transparent 0px,transparent 10px,rgba(0,0,0,0.2) 10px,rgba(0,0,0,0.2) 11px)", pointerEvents: "none" }} />
              </div>
              <div style={{ color: TEXT_INACTIVE, fontSize: 13, marginTop: 3, fontFamily: FONT_BODY }}>Faltam {cpProgress.remaining.toFixed(2)}× para rank {nextRank.tier}</div>
            </div>
          )}
          {/* ── Spider Chart ── */}
          <div style={{ display: "flex", justifyContent: "center", margin: "4px 0 16px" }}>
            <PowerSpiderChart
              sources={cpData.sources}
              accentColor={cpData.rank.color}
              size={240}
            />
          </div>

          {/* Multiplicators breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
            {cpData.sources.map(src => (
              <div key={src.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: src.active ? `${src.color}08` : "transparent", border: `1px solid ${src.active ? src.color + "33" : "#1a1e37"}`, borderRadius: 6, opacity: src.active ? 1 : 0.5 }}>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: src.color, width: 24, textAlign: "center", flexShrink: 0 }}>{src.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: src.active ? src.color : "#3a4060", marginBottom: 1 }}>{src.label}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: TEXT_INACTIVE }}>{src.desc}</div>
                </div>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: src.color, flexShrink: 0 }}>{src.value.toFixed(2)}×</span>
              </div>
            ))}
            {/* Total row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: `${cpData.rank.color}12`, border: `2px solid ${cpData.rank.color}55`, borderRadius: 6, marginTop: 4 }}>
              <Zap size={12} color={cpData.rank.color} />
              <span style={{ flex: 1, fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: cpData.rank.color }}>POWER TOTAL</span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: cpData.rank.color, textShadow: `0 0 8px ${cpData.rank.color}` }}>{formatPower(cpData.total)}</span>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${BORDER_SUBTLE}`, paddingTop: 12 }}>
            <div style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 6, fontFamily: FONT_BODY }}>Dano por Dificuldade (Power ×{damageMultiplier})</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["easy", "medium", "hard"] as const).map(d => {
                const info = DIFFICULTY_INFO[d];
                return (
                  <div key={d} style={{ flex: 1, background: BG_DEEPEST, border: `1px solid ${info.color}44`, padding: "6px 8px", textAlign: "center" }}>
                    <div style={{ color: info.color, fontSize: 14, fontFamily: FONT_BODY }}>{info.label}</div>
                    <div style={{ fontFamily: FONT_PIXEL, color: info.color, fontSize: 12, textShadow: "1px 1px 0 #000" }}>{diffDamage[d]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardIn>

      {/* Stats grid */}
      <CardIn index={2} style={{ ...CARD, marginBottom: 0 }}>
        <div style={{ ...TOOLBAR }}>
          <BarChart3 size={14} color={TEXT_MUTED} />
          <span style={{ fontFamily: FONT_PIXEL, color: TEXT_MUTED, fontSize: 9 }}>ESTATÍSTICAS</span>
        </div>
        <div style={{ padding: "12px 14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "XP Total",  val: totalXP,                              color: COLOR_LEGENDARY },
              { label: "Nível",     val: lvInfo.level,                         color: COLOR_WARNING   },
              { label: "Tarefas",   val: `${completedTasks}/${totalTasks}`,    color: COLOR_SUCCESS   },
              { label: "Monstros",  val: `${defeatedBosses.length}/${campaignMissions.length}`, color: COLOR_DANGER },
              { label: "Hábitos",   val: `${activeHabits.length}/5`,           color: COLOR_ORANGE    },
              { label: "Power",     val: formatPower(cpData.total),            color: cpData.rank.color },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: BG_DEEPEST, border: `1px solid ${BORDER_SUBTLE}`, padding: "10px 14px" }}>
                <div style={{ color: TEXT_MUTED, fontSize: 14, fontFamily: FONT_BODY }}>{label}</div>
                <div style={{ color, fontSize: 26, fontFamily: FONT_BODY, textShadow: "1px 1px 0 #000" }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </CardIn>

      {/* Reset */}
      <button
        onClick={() => {
          if (confirm("ATENÇÃO: Isso vai resetar TODO o seu progresso (nível, missões, hábitos, conquistas). Tem certeza?")) {
            resetAllProgress(); resetBonusXP(); resetEconomy(); resetHabits();
            audioManager.playClick("press");
            navigate("/");
            setTimeout(() => window.location.reload(), 100);
          }
        }}
        style={{ width: "100%", padding: "12px 0", background: BG_CARD, border: `2px solid ${COLOR_DANGER}`, color: COLOR_DANGER, fontFamily: FONT_BODY, fontSize: 18, cursor: "pointer", marginBottom: 8, opacity: 0.6, borderRadius: RADIUS_LG }}
      >
        RESETAR PROGRESSO
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: CAMPANHA
// ─────────────────────────────────────────────────────────────────────────────
function CampanhaTab() {
  const missions = getMissions();
  const campaignMissions = missions
    .filter(m => m.mode === "campaign")
    .sort((a, b) => (a.campaignOrder ?? 0) - (b.campaignOrder ?? 0));

  const defeated = campaignMissions.filter(m => (m.monsterCurrentHp ?? 1) <= 0).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <CardIn style={{ ...CARD }}>
        <div style={{ ...TOOLBAR }}>
          <Castle size={14} color={ACCENT_GOLD} />
          <span style={{ fontFamily: FONT_PIXEL, color: ACCENT_GOLD, fontSize: 9, flex: 1 }}>PROGRESSO DA CAMPANHA</span>
          <span style={{ fontFamily: FONT_BODY, color: TEXT_MUTED, fontSize: 16 }}>{defeated}/{campaignMissions.length}</span>
        </div>

        {campaignMissions.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", opacity: 0.5 }}>
            <Castle size={36} color={TEXT_INACTIVE} style={{ margin: "0 auto 12px" }} />
            <div style={{ fontFamily: FONT_PIXEL, color: TEXT_INACTIVE, fontSize: 8 }}>NENHUMA MISSÃO ENCONTRADA</div>
          </div>
        ) : (
          <div style={{ padding: "4px 0" }}>
            {campaignMissions.map((m, i) => {
              const done   = (m.monsterCurrentHp ?? 1) <= 0;
              const active = !done && m.unlocked;
              const hpPct  = done ? 0 : m.monsterMaxHp ? Math.round(((m.monsterCurrentHp ?? m.monsterMaxHp) / m.monsterMaxHp) * 100) : 100;
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: done ? "rgba(6,255,165,0.06)" : active ? "rgba(227,159,100,0.08)" : "transparent", borderBottom: "1px solid #1f254f" }}>
                  {/* Number/status badge */}
                  <div style={{ width: 28, height: 28, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: done ? "#06FFA5" : active ? "#e39f64" : "#1f254f", borderRadius: 4 }}>
                    <span style={{ fontFamily: "'VT323', monospace", color: "#000", fontSize: 18, lineHeight: 1 }}>
                      {done ? "✓" : !m.unlocked ? "🔒" : `${i + 1}`}
                    </span>
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: done ? "#06FFA5" : active ? "#fff" : "#3a4060", fontSize: 18, fontFamily: "'VT323', monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.name}
                    </div>
                    {active && m.monsterMaxHp && (
                      <div style={{ marginTop: 4 }}>
                        <div style={{ height: 5, background: "#0b0d1e", border: "1px solid #2a2e50", borderRadius: 3, overflow: "hidden", marginBottom: 2 }}>
                          <div style={{ width: `${hpPct}%`, height: "100%", background: hpPct > 50 ? "#06FFA5" : hpPct > 25 ? "#f0c040" : "#E63946", transition: "width 0.5s" }} />
                        </div>
                        <div style={{ color: "#3a4060", fontSize: 13, fontFamily: "'VT323', monospace" }}>
                          {m.monsterCurrentHp}/{m.monsterMaxHp} HP restante
                        </div>
                      </div>
                    )}
                    {done && <div style={{ color: "#3a4060", fontSize: 13, fontFamily: "'VT323', monospace" }}>Derrotado — {m.monsterMaxHp}HP</div>}
                    {!m.unlocked && <div style={{ color: "#3a4060", fontSize: 13, fontFamily: "'VT323', monospace" }}>Bloqueado</div>}
                  </div>
                  <Shield size={13} color={done ? "#06FFA5" : active ? "#E63946" : "#3a4060"} />
                </div>
              );
            })}
          </div>
        )}

        {/* Progress dots footer */}
        <div style={{ background: "#0b0d1e", borderTop: "1px solid #1f254f", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'VT323', monospace", color: "#5a6080", fontSize: 16 }}>
            {defeated} de {campaignMissions.length} derrotados
          </span>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {campaignMissions.map(m => {
              const done   = (m.monsterCurrentHp ?? 1) <= 0;
              const active = !done && m.unlocked;
              return (
                <div
                  key={m.id}
                  style={{
                    width: 14, height: 7,
                    background: done ? "#06FFA5" : active ? "#e39f6455" : "#1f254f",
                    border: `1px solid ${done ? "#06FFA5" : active ? "#e39f64" : "#2a2e50"}`,
                    borderRadius: 2,
                  }}
                />
              );
            })}
          </div>
        </div>
      </CardIn>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: RENASCER
// ─────────────────────────────────────────────────────────────────────────────
function RenascerTab({ onStartAnimation }: { onStartAnimation: (snap: RunSnapshot) => void }) {
  const missions = getMissions();
  const totalXP  = calcTotalXP(missions);
  const lvInfo   = getLevelInfo(totalXP);
  const rank     = getRank(lvInfo.level);
  const rebirth  = getRebirthState();
  const econ     = getEconomy();

  let monstersDefeated = 0, bossesDefeated = 0, tasksCompleted = 0;
  for (const m of missions) {
    if ((m.monsterCurrentHp ?? 1) <= 0) { monstersDefeated++; if (m.monsterType === "boss") bossesDefeated++; }
    for (const t of m.tasks) { if (t.completed) tasksCompleted++; }
  }

  const pendingBonus  = getPendingRebirthBonus();
  const gain          = getRebirthGain();
  const currentPerm   = rebirth.permanentDamageBonus;
  const unlockedAchs  = econ.unlockedAchievements.length;
  const totalAchs     = ACHIEVEMENTS.length;
  const newAchsThisRun = econ.unlockedAchievements.filter(id => !rebirth.permanentAchievements.includes(id));

  function handleRebirth() {
    const snap: RunSnapshot = { level: lvInfo.level, rank, totalXP, monstersDefeated, bossesDefeated, tasksCompleted, runNumber: rebirth.runNumber, gain, newAchievements: newAchsThisRun, pendingBonus, currentPerm };
    audioManager.playClick("press");
    onStartAnimation(snap);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Run identity */}
      <div style={{ background: "#0d1024", border: "1px solid rgba(42,46,80,0.8)", borderRadius: 10, padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ color: "#3a4060", fontSize: 14, fontFamily: "'VT323', monospace", marginBottom: 2 }}>Ciclo atual</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", color: "#c084fc", fontSize: 14, textShadow: "1px 1px 0 #000" }}>RUN #{rebirth.runNumber}</div>
          </div>
          {rebirth.totalRebirths > 0 && (
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#3a4060", fontSize: 14, fontFamily: "'VT323', monospace", marginBottom: 2 }}>Renascimentos</div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", color: "#FFD700", fontSize: 14, textShadow: "1px 1px 0 #000" }}>×{rebirth.totalRebirths}</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#0a0c1a", border: "1px solid #1f254f", padding: "10px 14px", borderRadius: 6 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", color: "#FFD700", fontSize: 13, textShadow: "1px 1px 0 #000" }}>LVL {lvInfo.level}</div>
          <div style={{ width: 1, height: 20, background: "#1f254f" }} />
          <Star size={12} color={rank.color} />
          <span style={{ color: rank.color, fontSize: 20, fontFamily: "'VT323', monospace" }}>{rank.label}</span>
        </div>
      </div>

      {/* Current run stats */}
      <div style={{ background: "#0d1024", border: "1px solid rgba(42,46,80,0.8)", borderRadius: 10, padding: "18px 20px" }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#5a6080", marginBottom: 14 }}>ESTATÍSTICAS DESTA RUN</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <StatBox label="NÍVEL"      value={String(lvInfo.level)}                    color="#FFD700" />
          <StatBox label="XP"         value={totalXP.toLocaleString("pt-BR")}         color="#f0c040" />
          <StatBox label="TAREFAS"    value={String(tasksCompleted)}                  color="#06FFA5" />
          <StatBox label="MONSTROS"   value={String(monstersDefeated)}                color="#E63946" />
          <StatBox label="BOSSES"     value={String(bossesDefeated)}                  color="#FF6B35" />
          <StatBox label="CONQUISTAS" value={`${unlockedAchs}/${totalAchs}`}          color="#c084fc" />
        </div>
      </div>

      {/* What resets */}
      <div style={{ background: "#0d1024", border: "1px solid rgba(42,46,80,0.8)", borderRadius: 10, padding: "18px 20px" }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#E63946", marginBottom: 14 }}>O QUE SERÁ RESETADO</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { icon: <Swords size={18} color="#E63946" />, text: "Nível volta para 1" },
            { icon: <MapIcon size={18} color="#E63946" />, text: "Campanha reinicia do primeiro monstro" },
            { icon: <Gem    size={18} color="#E63946" />, text: "Progresso de XP é zerado" },
            { icon: <Timer  size={18} color="#E63946" />, text: "Desafios temporais são limpos" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.icon}</span>
              <span style={{ color: "#E63946", fontSize: 18, fontFamily: "'VT323', monospace" }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What persists */}
      <div style={{ background: "#0d1024", border: "1px solid rgba(42,46,80,0.8)", borderRadius: 10, padding: "18px 20px" }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#06FFA5", marginBottom: 14 }}>O QUE SERÁ MANTIDO</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { icon: <Trophy size={18} color="#06FFA5" />, text: "Todas as conquistas desbloqueadas" },
            { icon: <Flame  size={18} color="#06FFA5" />, text: "Hábitos e streaks" },
            { icon: <Coins  size={18} color="#06FFA5" />, text: "Moedas, classes e pets" },
            { icon: <FileText size={18} color="#06FFA5" />, text: "Nome do personagem" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.icon}</span>
              <span style={{ color: "#06FFA5", fontSize: 18, fontFamily: "'VT323', monospace" }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bonus preview */}
      <div style={{ background: "#0d1024", border: "1px solid #FFD70033", borderTop: "2px solid #FFD700", borderRadius: 10, padding: "20px 20px" }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#FFD700", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={14} /> MULTIPLICADOR DE REBIRTH (MR)
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ color: "#5a6080", fontSize: 14, fontFamily: "'VT323', monospace" }}>MR atual</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: currentPerm > 0 ? "#E63946" : "#3a4060", textShadow: "1px 1px 0 #000" }}>×{(1 + currentPerm).toFixed(2)}</div>
          </div>
          <div style={{ fontSize: 24, color: "#FFD700" }}>→</div>
          <div>
            <div style={{ color: "#5a6080", fontSize: 14, fontFamily: "'VT323', monospace" }}>MR após renascer</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: "#06FFA5", textShadow: "1px 1px 0 #000" }}>×{(1 + pendingBonus).toFixed(2)}</div>
          </div>
        </div>
        {gain > 0 && (
          <div style={{ background: "rgba(6,255,165,0.08)", border: "1px solid #06FFA533", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, marginBottom: 12, borderRadius: 6 }}>
            <Zap size={16} color="#FFD700" />
            <span style={{ color: "#06FFA5", fontSize: 18, fontFamily: "'VT323', monospace" }}>MR sobe de ×{(1+currentPerm).toFixed(2)} para ×{(1+pendingBonus).toFixed(2)} (+{gain.toFixed(2)})!</span>
          </div>
        )}
        {gain === 0 && (
          <div style={{ background: "rgba(255,215,0,0.06)", border: "1px solid #FFD70033", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, marginBottom: 12, borderRadius: 6 }}>
            <Award size={16} color="#FFD700" />
            <span style={{ color: "#FFD700", fontSize: 16, fontFamily: "'VT323', monospace" }}>Desbloqueie mais conquistas para ganhar bônus extra!</span>
          </div>
        )}
        {newAchsThisRun.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ color: "#5a6080", fontSize: 14, fontFamily: "'VT323', monospace", marginBottom: 6 }}>Conquistas novas nesta run ({newAchsThisRun.length}):</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {newAchsThisRun.map(id => {
                const ach = ACHIEVEMENTS.find(a => a.id === id);
                if (!ach) return null;
                return (
                  <div key={id} style={{ background: TIER_COLORS[ach.tier] + "15", border: `1px solid ${TIER_COLORS[ach.tier]}44`, padding: "4px 10px", borderRadius: 4 }}>
                    <span style={{ color: TIER_COLORS[ach.tier], fontSize: 14, fontFamily: "'VT323', monospace" }}>{ach.icon} {ach.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Rebirth button */}
      <button
        onClick={handleRebirth}
        style={{ width: "100%", padding: "18px 0", background: "linear-gradient(135deg, #6b21a8, #c084fc)", border: "none", color: "#fff", fontFamily: "'Press Start 2P', monospace", fontSize: 12, cursor: "pointer", borderRadius: 10, boxShadow: "0 0 24px rgba(192,132,252,0.4)", letterSpacing: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}
        onMouseDown={e => (e.currentTarget.style.transform = "translate(2px,2px)")}
        onMouseUp={e => (e.currentTarget.style.transform = "")}
      >
        <RotateCcw size={16} />
        RENASCER AGORA
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Rebirth Complete screen (full-screen overlay)
// ─────────────────────────────────────────────────────────────────────────────
function RebirthComplete({ result, prevBonus, gain }: { result: RebirthState; prevBonus: number; gain: number }) {
  return (
    <>
      <style>{`
        @keyframes rebirthGlow   { 0%,100%{text-shadow:2px 2px 0 #000,0 0 20px rgba(255,215,0,0.5)} 50%{text-shadow:2px 2px 0 #000,0 0 40px rgba(255,215,0,0.9)} }
        @keyframes rebirthFadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rebirthStars  { 0%{opacity:0} 50%{opacity:1} 100%{opacity:0} }
      `}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "#0a0c1a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'VT323', monospace", padding: 20, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at center, rgba(255,215,0,0.08) 0%, transparent 60%)" }} />
        {[...Array(14)].map((_, i) => (
          <div key={i} style={{ position: "absolute", top: `${8 + (i * 7) % 85}%`, left: `${4 + (i * 13) % 92}%`, width: 4, height: 4, background: i % 3 === 0 ? "#c084fc" : "#FFD700", animation: `rebirthStars ${2 + (i % 3)}s ease-in-out infinite`, animationDelay: `${(i * 0.3) % 2}s`, opacity: 0.6 }} />
        ))}
        <div style={{ textAlign: "center", position: "relative", zIndex: 10, animation: "rebirthFadeIn 0.8s ease-out", maxWidth: 420, width: "100%" }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: "#5a6080", marginBottom: 10, letterSpacing: 3 }}>── RENASCIMENTO COMPLETO ──</div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 20, color: "#FFD700", marginBottom: 6, animation: "rebirthGlow 2s ease infinite" }}>CICLO #{result.runNumber}</div>
          <div style={{ color: "#c084fc", fontSize: 20, marginBottom: 4 }}>Iniciado com sucesso</div>
          <div style={{ color: "#3a4060", fontSize: 16, marginBottom: 30 }}>Renascimentos totais: {result.totalRebirths}</div>
          <div style={{ background: "#0d1024", border: "1px solid rgba(42,46,80,0.8)", borderRadius: 10, padding: "22px 24px", marginBottom: 16, animation: "rebirthFadeIn 0.8s ease-out 0.4s both" }}>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#5a6080", marginBottom: 14 }}>BÔNUS PERMANENTE DE DANO</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 14 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#5a6080", fontSize: 14 }}>ANTES</div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: "#E63946", textShadow: "2px 2px 0 #000" }}>+{prevBonus.toFixed(2)}x</div>
              </div>
              <div style={{ fontSize: 28, color: "#FFD700" }}>→</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#5a6080", fontSize: 14 }}>AGORA</div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 20, color: "#06FFA5", textShadow: "2px 2px 0 #000", animation: "rebirthGlow 2s ease infinite" }}>+{result.permanentDamageBonus.toFixed(2)}x</div>
              </div>
            </div>
            {gain > 0 && (
              <div style={{ background: "rgba(6,255,165,0.08)", border: "1px solid #06FFA533", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Zap size={16} color="#FFD700" />
                <span style={{ color: "#06FFA5", fontSize: 18 }}>+{gain.toFixed(2)}x dano cristalizado!</span>
              </div>
            )}
          </div>
          <div style={{ background: "#0d1024", border: "1px solid rgba(42,46,80,0.8)", borderRadius: 10, padding: "16px 20px", marginBottom: 28, animation: "rebirthFadeIn 0.8s ease-out 0.7s both" }}>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: "#5a6080", marginBottom: 12 }}>LEGADO ACUMULADO</div>
            <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
              <StatBox label="NÍVEL MAX" value={String(result.highestLevelEver)}  color="#FFD700" />
              <StatBox label="MONSTROS"  value={String(result.totalMonstersEver)} color="#E63946" />
              <StatBox label="TAREFAS"   value={String(result.totalTasksEver)}    color="#06FFA5" />
            </div>
          </div>
          <button
            onClick={() => { audioManager.playClick("press"); window.location.href = "/"; }}
            style={{ background: "#FFD700", border: "none", color: "#0d1024", padding: "16px 40px", fontFamily: "'Press Start 2P', monospace", fontSize: 11, cursor: "pointer", borderRadius: 8, boxShadow: "0 0 24px rgba(255,215,0,0.4)", animation: "rebirthFadeIn 0.8s ease-out 1s both", width: "100%" }}
          >
            COMEÇAR NOVA JORNADA ▶
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab definitions
// ─────────────────────────────────────────────────────────────────────────────
const TABS: PixelTabDef<ProfileTab>[] = [
  { key: "evolucao", label: "EVOLUÇÃO", Icon: BarChart3,  color: "#06FFA5" },
  { key: "diario",   label: "DIÁRIO",   Icon: Scroll,     color: "#e39f64" },
  { key: "campanha", label: "CAMPANHA", Icon: Castle,      color: "#e39f64" },
  { key: "renascer", label: "RENASCER", Icon: RotateCcw,   color: "#c084fc" },
  { key: "itens",    label: "ITENS",    Icon: Backpack,    color: "#e39f64" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main ProfileScreen
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [activeTab, setActiveTab]       = useState<ProfileTab>("evolucao");
  const [rebirthStage, setRebirthStage] = useState<RebirthStage>("preview");
  const [runSnapshot,  setRunSnapshot]  = useState<RunSnapshot | null>(null);
  const [rebirthResult, setRebirthResult] = useState<RebirthState | null>(null);
  const [prevBonus, setPrevBonus]       = useState(0);
  const [gainAmount, setGainAmount]     = useState(0);

  function handleStartAnimation(snap: RunSnapshot) {
    setPrevBonus(snap.currentPerm);
    setGainAmount(snap.gain);
    setRunSnapshot(snap);
    setRebirthStage("animating");
  }

  function finishAnimation() {
    const stats = rebirthReset();
    resetBonusXP();
    const result = performRebirth(runSnapshot?.level ?? 1, stats.monstersDefeated, stats.tasksCompleted);
    setRebirthResult(result);
    setRebirthStage("complete");
    forcePush().catch(() => {});
  }

  const activeColor = TABS.find(t => t.key === activeTab)?.color ?? "#e39f64";

  return (
    <>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.75}}`}</style>

      {/* Full-screen overlays for rebirth flow */}
      {rebirthStage === "animating" && runSnapshot && (
        <RunReportAnimation snapshot={runSnapshot} onDone={finishAnimation} />
      )}
      {rebirthStage === "complete" && rebirthResult && (
        <RebirthComplete result={rebirthResult} prevBonus={prevBonus} gain={gainAmount} />
      )}

      <PageShell
        icon={<User size={16} />}
        title="PERFIL"
        accentColor={activeColor}
      >
        <PixelTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} style={{ marginBottom: 20 }} />

        {activeTab === "diario"   && <DiarioTab />}
        {activeTab === "evolucao" && <EvolucaoTab />}
        {activeTab === "campanha" && <CampanhaTab />}
        {activeTab === "renascer" && (
          <RenascerTab onStartAnimation={handleStartAnimation} />
        )}
        {activeTab === "itens" && <ItemsTab />}
      </PageShell>
    </>
  );
}
