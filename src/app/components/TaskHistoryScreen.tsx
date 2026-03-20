/**
 * TaskHistoryScreen – Shows all completed tasks grouped by date
 * with pixel-art RPG styling.
 */
import { useState, useMemo, useEffect, useCallback } from "react";
import { getTaskHistory, TaskHistoryEntry, getTags, tagColor } from "../data/missions";
import { DIFFICULTY_INFO } from "../data/gameEngine";
import { Calendar, Scroll, ChevronDown, ChevronUp, Timer, Brain, Shield, Swords, Flame, Tag } from "lucide-react";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { audioManager } from "../hooks/audioManager";
import { PageShell } from "./ui/PageShell";
import { CardIn } from "./ui/CardIn";
import { useTheme } from "../contexts/PreferencesContext";
import type { ThemeTokens } from "../data/tokens";

function formatDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "HOJE";
  if (d.toDateString() === yesterday.toDateString()) return "ONTEM";

  const days   = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function dateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface DayGroup {
  key: string;
  label: string;
  tasks: TaskHistoryEntry[];
}

// Source/mode config — now a function that reads from theme tokens
function getModeInfo(tk: ThemeTokens): Record<string, { color: string; label: string; icon: React.ReactNode }> {
  return {
    campaign:      { color: tk.ACCENT_GOLD,   label: "CAMPAIGN", icon: <Swords size={10} /> },
    "time-attack": { color: tk.COLOR_ORANGE,   label: "TEMPORAL", icon: <Timer  size={10} /> },
    focus:         { color: tk.COLOR_MAGE,     label: "FOCUS",    icon: <Brain  size={10} /> },
  };
}

function DiffIcon({ difficulty }: { difficulty: string }) {
  const d = DIFFICULTY_INFO[difficulty ?? "medium"] ?? DIFFICULTY_INFO.medium;
  const iconMap: Record<string, React.ReactNode> = {
    easy:   <Shield size={14} color={d.color} />,
    medium: <Swords size={14} color={d.color} />,
    hard:   <Flame  size={14} color={d.color} />,
  };
  return (
    <div
      title={d.label}
      style={{
        width: 28, height: 28, flexShrink: 0,
        background: d.color + "18",
        border: `1px solid ${d.color}55`,
        borderRadius: 6,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {iconMap[difficulty ?? "medium"] ?? iconMap.medium}
    </div>
  );
}

function TaskCard({ entry, index }: { entry: TaskHistoryEntry; index: number }) {
  const tk     = useTheme();
  const diff   = DIFFICULTY_INFO[entry.difficulty ?? "medium"] ?? DIFFICULTY_INFO.medium;
  const source = entry.source ?? "campaign";
  const modeInfo = getModeInfo(tk);
  const mode   = modeInfo[source] ?? modeInfo.campaign;
  const tc     = entry.tag ? tagColor(entry.tag) : null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: tk.BG_DEEPEST,
      border: `1px solid ${mode.color}33`,
      borderLeft: `3px solid ${mode.color}`,
      borderRadius: 6, padding: "8px 10px",
      animation: `cardIn 200ms cubic-bezier(0.22,1,0.36,1) ${Math.min(index * 35, 300)}ms both`,
    }}>
      <DiffIcon difficulty={entry.difficulty ?? "medium"} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: tk.TEXT_LIGHT, fontSize: 17, fontFamily: tk.FONT_BODY,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3,
        }}>
          {entry.text}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: tk.FONT_BODY, color: diff.color, fontSize: 14 }}>
            {diff.label}
          </span>
          {entry.tag && tc && (
            <span style={{
              fontSize: 14, fontFamily: tk.FONT_BODY,
              color: tc, background: `${tc}22`,
              border: `1px solid ${tc}66`,
              padding: "1px 8px", borderRadius: 20, whiteSpace: "nowrap",
              fontWeight: "bold",
            }}>
              # {entry.tag}
            </span>
          )}
          {entry.missionName && (
            <span style={{ color: tk.TEXT_INACTIVE, fontSize: 13, fontFamily: tk.FONT_BODY }}>
              · {entry.missionName}
            </span>
          )}
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          background: mode.color + "18", border: `1px solid ${mode.color}44`,
          padding: "2px 7px", borderRadius: 4,
        }}>
          <span style={{ color: mode.color, lineHeight: 1 }}>{mode.icon}</span>
          <span style={{ fontFamily: tk.FONT_PIXEL, fontSize: 6, color: mode.color }}>
            {mode.label}
          </span>
        </div>
        {entry.damageDealt !== undefined && (
          <div style={{ color: tk.COLOR_DANGER, fontSize: 14, fontFamily: tk.FONT_BODY }}>
            -{entry.damageDealt}HP
          </div>
        )}
        <div style={{ color: tk.TEXT_INACTIVE, fontSize: 13, fontFamily: tk.FONT_BODY }}>
          {formatTime(entry.completedAt)}
        </div>
      </div>
    </div>
  );
}

export default function TaskHistoryScreen() {
  const isDesktop = useIsDesktop();
  const tk = useTheme();
  const modeInfo = getModeInfo(tk);

  const [history, setHistory] = useState(() => getTaskHistory());
  const refreshHistory = useCallback(() => setHistory(getTaskHistory()), []);
  useEffect(() => {
    window.addEventListener("rpg:data-updated", refreshHistory);
    return () => window.removeEventListener("rpg:data-updated", refreshHistory);
  }, [refreshHistory]);

  const [allTags, setAllTags] = useState<string[]>(() => getTags());
  useEffect(() => {
    setAllTags(getTags());
  }, [history]);

  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "campaign" | "time-attack" | "focus">("all");
  const [tagFilter, setTagFilter]   = useState<string>("");
  const [showTagFilter, setShowTagFilter] = useState(false);

  const groups: DayGroup[] = useMemo(() => {
    let filtered = filter === "all"
      ? history
      : history.filter(e => (e.source ?? "campaign") === filter);
    if (tagFilter) filtered = filtered.filter(e => e.tag === tagFilter);

    const map = new Map<string, TaskHistoryEntry[]>();
    const sorted = [...filtered].sort((a, b) => b.completedAt - a.completedAt);
    for (const entry of sorted) {
      const key = dateKey(entry.completedAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return Array.from(map.entries()).map(([key, tasks]) => ({
      key, label: formatDate(tasks[0].completedAt), tasks,
    }));
  }, [history, filter, tagFilter]);

  const totalTasks       = history.length;
  const totalDays        = groups.length;
  const timeAttackCount  = history.filter(e => e.source === "time-attack").length;
  const focusCount       = history.filter(e => e.source === "focus").length;

  function toggleDay(key: string) {
    audioManager.playClick("tap");
    setCollapsedDays(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }

  return (
    <PageShell icon={<Scroll size={16} />} title="DIÁRIO DE MISSÕES" accentColor={tk.ACCENT_GOLD}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Stats + filter bar */}
        <CardIn style={{ background: tk.BG_CARD, border: `1px solid ${tk.BORDER_ELEVATED}cc`, borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: tk.COLOR_SUCCESS, fontSize: 20, fontFamily: tk.FONT_BODY }}>{totalTasks}</span>
              <span style={{ color: tk.TEXT_MUTED, fontSize: 15, fontFamily: tk.FONT_BODY }}>tasks completed</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={13} color={tk.COLOR_MAGE} />
              <span style={{ color: tk.COLOR_MAGE, fontSize: 20, fontFamily: tk.FONT_BODY }}>{totalDays}</span>
              <span style={{ color: tk.TEXT_MUTED, fontSize: 15, fontFamily: tk.FONT_BODY }}>active days</span>
            </div>
            {timeAttackCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Timer size={12} color={tk.COLOR_ORANGE} />
                <span style={{ color: tk.COLOR_ORANGE, fontSize: 20, fontFamily: tk.FONT_BODY }}>{timeAttackCount}</span>
                <span style={{ color: tk.TEXT_MUTED, fontSize: 15, fontFamily: tk.FONT_BODY }}>temporal</span>
              </div>
            )}
            {focusCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Brain size={12} color={tk.COLOR_MAGE} />
                <span style={{ color: tk.COLOR_MAGE, fontSize: 20, fontFamily: tk.FONT_BODY }}>{focusCount}</span>
                <span style={{ color: tk.TEXT_MUTED, fontSize: 15, fontFamily: tk.FONT_BODY }}>focus</span>
              </div>
            )}
          </div>

          {/* Mode filter tabs */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: allTags.length > 0 ? 10 : 0 }}>
            {([
              { key: "all",         label: "ALL",      accent: tk.ACCENT_GOLD, Icon: null   },
              { key: "campaign",    label: "CAMPAIGN", accent: tk.ACCENT_GOLD, Icon: Swords  },
              { key: "time-attack", label: "TEMPORAL", accent: tk.COLOR_ORANGE, Icon: Timer   },
              { key: "focus",       label: "FOCUS",    accent: tk.COLOR_MAGE, Icon: Brain   },
            ] as const).map(({ key, label, accent, Icon }) => (
              <button
                key={key}
                onClick={() => { audioManager.playClick("tap"); setFilter(key); }}
                style={{
                  padding: "6px 10px",
                  background: filter === key ? accent + "18" : "transparent",
                  border: `1px solid ${filter === key ? accent : tk.BORDER_SUBTLE}`,
                  color: filter === key ? accent : tk.TEXT_MUTED,
                  fontFamily: tk.FONT_BODY, fontSize: 15,
                  cursor: "pointer", borderRadius: 5, transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                {Icon && <Icon size={13} />}
                {label}
              </button>
            ))}

            {/* Tag filter toggle */}
            {allTags.length > 0 && (
              <button
                onClick={() => { audioManager.playClick("tap"); setShowTagFilter(v => !v); if (showTagFilter) setTagFilter(""); }}
                style={{
                  padding: "6px 10px", marginLeft: "auto",
                  background: showTagFilter ? "rgba(124,77,255,0.18)" : "transparent",
                  border: `1px solid ${showTagFilter ? "#7c4dff" : tk.BORDER_SUBTLE}`,
                  color: showTagFilter ? "#a78bfa" : tk.TEXT_MUTED,
                  fontFamily: tk.FONT_BODY, fontSize: 15,
                  cursor: "pointer", borderRadius: 5, transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <Tag size={13} />
                {tagFilter ? <span style={{ color: tagColor(tagFilter) }}>{tagFilter}</span> : "TAG"}
              </button>
            )}
          </div>

          {/* Tag filter chips */}
          {allTags.length > 0 && showTagFilter && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingTop: 6, borderTop: `1px solid ${tk.BORDER_SUBTLE}` }}>
              <button
                onClick={() => setTagFilter("")}
                style={{
                  padding: "3px 12px", borderRadius: 20,
                  background: !tagFilter ? `${tk.BORDER_ELEVATED}44` : "transparent",
                  border: `1px solid ${!tagFilter ? tk.TEXT_MUTED : tk.BORDER_ELEVATED}`,
                  color: !tagFilter ? tk.TEXT_LIGHT : "#4a5070",
                  fontFamily: tk.FONT_BODY, fontSize: 15, cursor: "pointer",
                }}
              >
                All
              </button>
              {allTags.map(tag => {
                const c = tagColor(tag);
                const active = tagFilter === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(active ? "" : tag)}
                    style={{
                      padding: "3px 12px", borderRadius: 20,
                      background: active ? `${c}22` : "transparent",
                      border: `1px solid ${active ? c : tk.BORDER_ELEVATED}`,
                      color: active ? c : "#5a6070",
                      fontFamily: tk.FONT_BODY, fontSize: 15, cursor: "pointer",
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </CardIn>

        {/* Empty state */}
        {groups.length === 0 && (
          <CardIn index={1} style={{ background: tk.BG_CARD, border: `1px solid ${tk.BORDER_ELEVATED}cc`, borderRadius: 10, padding: "40px 20px", textAlign: "center", opacity: 0.5 }}>
            <Scroll size={36} color={tk.TEXT_INACTIVE} style={{ margin: "0 auto 12px" }} />
            <div style={{ fontFamily: tk.FONT_PIXEL, color: tk.TEXT_INACTIVE, fontSize: 8 }}>
              {filter === "all" && !tagFilter ? "NO TASKS COMPLETED" : "NO TASKS IN THIS CATEGORY"}
            </div>
          </CardIn>
        )}

        {/* Day groups */}
        {groups.map((group, gIdx) => {
          const collapsed = collapsedDays.has(group.key);
          return (
            <CardIn
              key={group.key}
              index={gIdx + 1}
              style={{ background: tk.BG_CARD, border: `1px solid ${tk.BORDER_ELEVATED}b3`, borderRadius: 10, overflow: "hidden" }}
            >
              {/* Day header */}
              <button
                onClick={() => toggleDay(group.key)}
                style={{
                  width: "100%", background: tk.BG_DEEPEST,
                  borderTop: "none", borderLeft: "none", borderRight: "none",
                  borderBottom: collapsed ? "none" : `1px solid ${tk.BORDER_SUBTLE}`,
                  padding: "10px 14px",
                  display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                }}
              >
                <Calendar size={13} color={tk.ACCENT_GOLD} />
                <span style={{ fontFamily: tk.FONT_PIXEL, color: tk.ACCENT_GOLD, fontSize: 9, flex: 1, textAlign: "left", textShadow: "1px 1px 0 #000" }}>
                  {group.label}
                </span>
                <span style={{ color: tk.TEXT_MUTED, fontSize: 15, fontFamily: tk.FONT_BODY }}>
                  {group.tasks.length} task{group.tasks.length !== 1 ? "s" : ""}
                </span>
                {collapsed ? <ChevronDown size={14} color={tk.TEXT_MUTED} /> : <ChevronUp size={14} color={tk.TEXT_MUTED} />}
              </button>

              {/* Tasks */}
              {!collapsed && (
                <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {group.tasks.map((entry, eIdx) => (
                    <TaskCard key={entry.id} entry={entry} index={eIdx} />
                  ))}
                </div>
              )}
            </CardIn>
          );
        })}
      </div>
    </PageShell>
  );
}
