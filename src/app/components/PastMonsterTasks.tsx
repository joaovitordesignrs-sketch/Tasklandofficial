/**
 * PastMonsterTasks — collapsible panel showing tasks completed in previous monsters.
 * Shown on the HomeScreen below the active TaskList.
 * The show/hide state is persisted in localStorage.
 */
import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, History } from "lucide-react";
import { getTaskHistory, TaskHistoryEntry, tagColor } from "../data/missions";
import { DIFFICULTY_INFO } from "../data/gameEngine";
import { useTheme } from "../contexts/PreferencesContext";

const SHOW_KEY = "rpg_show_past_tasks_v1";

function loadShowState(): boolean {
  try { return localStorage.getItem(SHOW_KEY) !== "false"; } catch { return true; }
}
function saveShowState(v: boolean) {
  try { localStorage.setItem(SHOW_KEY, String(v)); } catch { /* noop */ }
}

// Group history entries by missionId (each monster = 1 group)
interface MonsterGroup {
  missionId:   string;
  monsterName: string;
  tasks:       TaskHistoryEntry[];
  lastAt:      number;
}

function buildGroups(history: TaskHistoryEntry[]): MonsterGroup[] {
  const map = new Map<string, MonsterGroup>();

  for (const entry of history) {
    if (entry.source !== "campaign" || !entry.monsterName) continue;
    const key = entry.missionId || entry.monsterName;
    if (!map.has(key)) {
      map.set(key, { missionId: key, monsterName: entry.monsterName, tasks: [], lastAt: 0 });
    }
    const g = map.get(key)!;
    g.tasks.push(entry);
    if (entry.completedAt > g.lastAt) g.lastAt = entry.completedAt;
  }

  return Array.from(map.values()).sort((a, b) => b.lastAt - a.lastAt);
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

// ── Single monster group card ─────────────────────────────────────────────────
function MonsterGroupCard({ group }: { group: MonsterGroup }) {
  const { BG_DEEPEST, BG_CARD, BORDER_SUBTLE, BORDER_ELEVATED, COLOR_SUCCESS, TEXT_INACTIVE, FONT_PIXEL, FONT_BODY } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: BG_DEEPEST,
      border: `1px solid ${BORDER_SUBTLE}`,
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 6,
    }}>
      {/* Header — click to expand */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%", background: "none", border: "none",
          padding: "9px 14px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 10,
          textAlign: "left",
        }}
      >
        {/* Skull icon */}
        <div style={{
          width: 28, height: 28, flexShrink: 0,
          background: BG_CARD, border: `1px solid ${BORDER_ELEVATED}`,
          borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 14 }}>💀</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: FONT_PIXEL, fontSize: 7,
            color: "#8a9fba", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {group.monsterName}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: TEXT_INACTIVE, marginTop: 2 }}>
            {group.tasks.length} task{group.tasks.length !== 1 ? "s" : ""} · {formatDate(group.lastAt)}
          </div>
        </div>

        <div style={{ color: TEXT_INACTIVE, flexShrink: 0 }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Expanded task list */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${BORDER_SUBTLE}` }}>
          {group.tasks
            .sort((a, b) => b.completedAt - a.completedAt)
            .map((entry) => {
              const diffInfo = DIFFICULTY_INFO[entry.difficulty] ?? DIFFICULTY_INFO.easy;
              return (
                <div
                  key={entry.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 14px", borderBottom: `1px solid ${BORDER_SUBTLE}`,
                  }}
                >
                  {/* Done indicator */}
                  <div style={{
                    width: 18, height: 18, flexShrink: 0,
                    background: "rgba(6,255,165,0.10)",
                    border: "1px solid rgba(6,255,165,0.3)",
                    borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ color: COLOR_SUCCESS, fontSize: 11 }}>✓</span>
                  </div>

                  {/* Task text + tag */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontFamily: FONT_BODY, fontSize: 17,
                      color: TEXT_INACTIVE, textDecoration: "line-through",
                    }}>
                      {entry.text}
                    </span>
                    {entry.tag && (() => {
                      const tc = tagColor(entry.tag);
                      return (
                        <span style={{
                          display: "inline-block", marginLeft: 7,
                          fontSize: 13, fontFamily: FONT_BODY,
                          color: tc, background: `${tc}18`,
                          border: `1px solid ${tc}44`,
                          padding: "0px 6px", borderRadius: 20, whiteSpace: "nowrap",
                          verticalAlign: "middle", opacity: 0.8,
                        }}>
                          {entry.tag}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Difficulty chip */}
                  <span style={{
                    flexShrink: 0, padding: "1px 7px",
                    background: diffInfo.color + "12",
                    border: `1px solid ${diffInfo.color}33`,
                    color: diffInfo.color + "88",
                    fontSize: 12, fontFamily: FONT_BODY, borderRadius: 4,
                  }}>
                    {diffInfo.short}
                  </span>

                  {/* Date */}
                  <span style={{ flexShrink: 0, fontFamily: FONT_BODY, fontSize: 13, color: TEXT_INACTIVE }}>
                    {formatDate(entry.completedAt)}
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
interface PastMonsterTasksProps {
  /** If provided, only show the toggle button + section label — content in a separate container */
  compact?: boolean;
}

export function PastMonsterTasks({ compact }: PastMonsterTasksProps) {
  const { BORDER_SUBTLE, TEXT_INACTIVE, FONT_PIXEL, FONT_BODY } = useTheme();
  const [show,    setShow]    = useState(loadShowState);
  const [groups,  setGroups]  = useState<MonsterGroup[]>(() => buildGroups(getTaskHistory()));

  // Reload when cloud sync fires the data-updated event OR when history is saved locally
  useEffect(() => {
    const reload = () => setGroups(buildGroups(getTaskHistory()));
    window.addEventListener("rpg:data-updated", reload);
    window.addEventListener("rpg:history-updated", reload);
    return () => {
      window.removeEventListener("rpg:data-updated", reload);
      window.removeEventListener("rpg:history-updated", reload);
    };
  }, []);

  const toggle = useCallback(() => {
    setShow(s => { const n = !s; saveShowState(n); return n; });
  }, []);

  if (groups.length === 0) return null;

  return (
    <div>
      {/* ── Section header with toggle ── */}
      <button
        onClick={toggle}
        style={{
          width: "100%", background: "none", border: "none",
          borderTop: `1px solid ${BORDER_SUBTLE}`,
          padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 8,
          cursor: "pointer", textAlign: "left",
        }}
      >
        <History size={13} color={TEXT_INACTIVE} style={{ flexShrink: 0 }} />
        <span style={{
          fontFamily: FONT_PIXEL, fontSize: 7,
          color: TEXT_INACTIVE, flex: 1,
        }}>
          PREVIOUS MONSTERS ({groups.length})
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: 14, color: TEXT_INACTIVE }}>
          {show ? "HIDE" : "SHOW"}
        </span>
        {show
          ? <ChevronUp size={13} color={TEXT_INACTIVE} />
          : <ChevronDown size={13} color={TEXT_INACTIVE} />}
      </button>

      {/* ── Group cards ── */}
      {show && (
        <div style={{ padding: "0 14px 14px" }}>
          {groups.map(g => (
            <MonsterGroupCard key={g.missionId} group={g} />
          ))}
        </div>
      )}
    </div>
  );
}