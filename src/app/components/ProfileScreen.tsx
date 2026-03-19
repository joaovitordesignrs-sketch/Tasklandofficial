/**
 * ProfileScreen — Unifies Diário, Evolução, Campanha and Renascer
 * into a single page with a pixel-art RPG tab switcher.
 */
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";

// ── Icons ──────────────────────────────────────────────────────────────────────
import {
  Scroll, BarChart3, User,
  Calendar, ChevronDown, ChevronUp, Timer, Brain, Shield, Swords, Flame,
  Star, Zap, Castle, Trophy, Backpack,
} from "lucide-react";

// ── Data / hooks ───────────────────────────────────────────────────────────────
import { getTaskHistory, TaskHistoryEntry, getMissions, loadPlayerName, resetAllProgress } from "../data/missions";
import { DIFFICULTY_INFO, calcTotalXP, getLevelInfo, getRank } from "../data/gameEngine";
import {
  getEconomy, CLASS_INFO, resetEconomy, resetBonusXP,
  selectClass, buyClass, type CharacterClass,
} from "../data/economy";
import { getActiveHabits, resetHabits } from "../data/habits";
import { getPower, formatPower, getPowerProgress, getNextPowerRank } from "../data/combatPower";
import { PowerSpiderChart } from "./ui/PowerSpiderChart";
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
type ProfileTab = "diario" | "evolucao" | "campanha" | "itens";

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
            <div style={{ fontFamily: FONT_BODY, fontSize: 16, color: TEXT_MUTED, marginTop: 4 }}>MH × MN × MC</div>
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
// Tab definitions
// ─────────────────────────────────────────────────────────────────────────────
const TABS: PixelTabDef<ProfileTab>[] = [
  { key: "evolucao", label: "EVOLUÇÃO", Icon: BarChart3, color: "#06FFA5" },
  { key: "diario",   label: "DIÁRIO",   Icon: Scroll,    color: "#e39f64" },
  { key: "campanha", label: "CAMPANHA", Icon: Castle,    color: "#e39f64" },
  { key: "itens",    label: "ITENS",    Icon: Backpack,  color: "#e39f64" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main ProfileScreen
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("evolucao");

  const activeColor = TABS.find(t => t.key === activeTab)?.color ?? "#e39f64";

  return (
    <>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.75}}`}</style>

      <PageShell
        icon={<User size={16} />}
        title="PERFIL"
        accentColor={activeColor}
      >
        <PixelTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} style={{ marginBottom: 20 }} />

        {activeTab === "diario"   && <DiarioTab />}
        {activeTab === "evolucao" && <EvolucaoTab />}
        {activeTab === "campanha" && <CampanhaTab />}
        {activeTab === "itens"    && <ItemsTab />}
      </PageShell>
    </>
  );
}
