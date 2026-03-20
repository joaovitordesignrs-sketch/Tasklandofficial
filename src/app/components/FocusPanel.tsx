/**
 * FocusPanel – Pomodoro/focus mode panel.
 * Same configuration logic as ChallengePanel (session presets, custom time).
 * Same task-adding UI as ChallengePanel (active inline input form).
 * Tasks completed during focus:
 *   • Deal normal damage to the monster (via onFocusStrike callback)
 *   • Call addFocusDamageBonus (no-op, kept for compatibility)
 *   • Are recorded in the task diary with source: "focus"
 */
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Brain, Play, Pause, Plus, X, Check, Trash2, Zap, CheckSquare,
} from "lucide-react";
import { TaskDifficulty } from "../data/missions";
import { DIFFICULTY_INFO, DIFFICULTY_DAMAGE } from "../data/gameEngine";
import {
  Challenge, ChallengeTask,
  getChallenges, createChallenge, updateChallenge, deleteChallenge,
} from "../data/challenges";
import { addChallengeTaskToHistory } from "../data/missions";
import { audioManager } from "../hooks/audioManager";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { MobileAddTaskModal } from "./ui/MobileAddTaskModal";
import { getPower } from "../data/combatPower";
import { DifficultyPicker } from "./ui/DifficultyPicker";
import { useTheme } from "../contexts/PreferencesContext";

const FOCUS_BONUS = 0.01; // permanent dmg per task

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatMs(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function calcFocusTaskDamage(difficulty: string, level: number): number {
  const base  = DIFFICULTY_DAMAGE[difficulty] ?? 30;
  const power = getPower(level, "focus");
  return Math.max(1, Math.round(base * power.total));
}

// ── Timer tick hook ────────────────────────────────────────────────────────────
function useTimerTick(isRunning: boolean) {
  const lastSecRef = useRef(-1);
  useEffect(() => {
    if (!isRunning) { lastSecRef.current = -1; return; }
    const iv = setInterval(() => {
      const sec = Math.floor(Date.now() / 1000);
      if (sec !== lastSecRef.current) {
        lastSecRef.current = sec;
        audioManager.playTick();
      }
    }, 250);
    return () => clearInterval(iv);
  }, [isRunning]);
}

// ── Difficulty picker ──────────────────────────────────────────────────────────
function DiffPicker({ value, onChange }: { value: TaskDifficulty; onChange: (d: TaskDifficulty) => void }) {
  return <DifficultyPicker value={value} onChange={onChange} />;
}

// ── Types ──────────────────────────────────────────────────────────────────────
export interface FocusStrike {
  damage:     number;
  count:      number;
  focusBonus: number;
}

interface FocusPanelProps {
  playerLevel:   number;
  monsterAlive:  boolean;
  onFocusStrike: (strike: FocusStrike) => void;
  onSelectedCountChange?: (n: number) => void;
  attackCallbackRef?: { current: (() => void) | null };
}

// ── Session time presets (minutes) ─────────────────────────────────────────────
const SESSION_PRESETS = [15, 25, 30, 45, 60];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PANEL
// ══════════════════════════════════════════════════════════════════════════════
export function FocusPanel({ playerLevel, monsterAlive, onFocusStrike, onSelectedCountChange, attackCallbackRef }: FocusPanelProps) {
  const { COLOR_MAGE } = useTheme();
  const ACCENT      = COLOR_MAGE;
  const ACCENT_BG   = "rgba(192,132,252,0.10)";
  const ACCENT_BORD = COLOR_MAGE + "55";

  const [challenges, setChallenges] = useState(getChallenges());
  const [creating, setCreating]     = useState(false);
  const [sessionMin, setSessionMin] = useState(25);
  const [customMode, setCustomMode] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const isDesktop = useIsDesktop();

  // Creation task list
  const [newTasks, setNewTasks] = useState<ChallengeTask[]>([]);
  const [newText, setNewText]   = useState("");
  const [newDiff, setNewDiff]   = useState<TaskDifficulty>("easy");
  const inputRef = useRef<HTMLInputElement>(null);

  // Active session state
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [showAddInput, setShowAddInput] = useState(false);
  const [activeText, setActiveText]   = useState("");
  const [activeDiff, setActiveDiff]   = useState<TaskDifficulty>("easy");
  const activeInputRef = useRef<HTMLInputElement>(null);
  const [bonusGained, setBonusGained] = useState<number | null>(null);

  // Timer state (elapsed ms while running)
  const [elapsed, setElapsed]   = useState(0);
  const [running, setRunning]   = useState(false);
  const ivRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number | null>(null);

  function refresh() { setChallenges([...getChallenges()]); }

  const activeChallenge = challenges.find(
    c => c.type === "focus" && c.status === "active"
  );

  // Reset timer state when a session is loaded/cleared
  useEffect(() => {
    if (!activeChallenge) {
      if (ivRef.current) clearInterval(ivRef.current);
      setRunning(false);
      setElapsed(activeChallenge ? (activeChallenge as any).focusElapsedMs ?? 0 : 0);
    }
  }, [activeChallenge?.id]);

  // Cleanup on unmount
  useEffect(() => () => { if (ivRef.current) clearInterval(ivRef.current); }, []);

  // Tick sound while running
  useTimerTick(running);

  // ── Timer controls ──────────────────────────────────────────────────────────
  function startTimer() {
    startRef.current = Date.now();
    setRunning(true);
    ivRef.current = setInterval(() => {
      const now   = Date.now();
      const delta = now - (startRef.current ?? now);
      startRef.current = now;
      setElapsed(prev => prev + delta);
    }, 500);
  }

  function pauseTimer() {
    if (ivRef.current) clearInterval(ivRef.current);
    setRunning(false);
  }

  // ── Session presets & creation ──────────────────────────────────────────────
  function addNewTask() {
    if (!newText.trim()) return;
    setNewTasks(prev => [...prev, {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
      text: newText.trim(), completed: false, difficulty: newDiff,
    }]);
    setNewText("");
    setNewDiff("easy");
    inputRef.current?.focus();
  }

  function startSession() {
    createChallenge({
      name: `Focus ${sessionMin}min`,
      type: "focus",
      status: "active",
      sessionMinutes: sessionMin,
      focusDurationMinutes: sessionMin,
      focusElapsedMs: 0,
      tasks: newTasks,
    });
    setNewTasks([]);
    setNewText("");
    setCreating(false);
    setCustomMode(false);
    setElapsed(0);
    setRunning(false);
    audioManager.playClick("press");
    refresh();
  }

  // ── Active session: add task ────────────────────────────────────────────────
  function addTaskToActive(text: string, diff: TaskDifficulty) {
    if (!activeChallenge) return;
    const t: ChallengeTask = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
      text, completed: false, difficulty: diff,
    };
    updateChallenge({ ...activeChallenge, tasks: [...(activeChallenge.tasks ?? []), t] });
    refresh();
  }

  // ── Toggle task selection ───────────────────────────────────────────────────
  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const handleSelectAll = useCallback(() => {
    const tasks = activeChallenge?.tasks ?? [];
    const uc = tasks.filter(t => !t.completed).map(t => t.id);
    if (selected.size === uc.length && uc.length > 0) setSelected(new Set());
    else setSelected(new Set(uc));
  }, [activeChallenge, selected]);

  // ── Attack ──────────────────────────────────────────────────────────────────
  const handleAttack = useCallback(() => {
    if (!activeChallenge || !monsterAlive) return;
    const tasks = activeChallenge.tasks ?? [];
    const ids = Array.from(selected).filter(id =>
      tasks.find(t => t.id === id && !t.completed)
    );
    if (!ids.length) return;

    const now = Date.now();
    let totalDamage = 0;
    for (const id of ids) {
      const task = tasks.find(t => t.id === id);
      if (!task) continue;
      totalDamage += calcFocusTaskDamage(task.difficulty, playerLevel);
    }

    const gainedBonus = FOCUS_BONUS * ids.length;
    setBonusGained(gainedBonus);
    setTimeout(() => setBonusGained(null), 2000);

    const updatedTasks = tasks.map(t =>
      ids.includes(t.id) ? { ...t, completed: true, completedAt: now } : t
    );
    updateChallenge({ ...activeChallenge, tasks: updatedTasks });

    for (const id of ids) {
      const task = tasks.find(t => t.id === id);
      if (!task) continue;
      addChallengeTaskToHistory(task.id, task.text, task.difficulty, now, "focus", activeChallenge.name);
    }

    setSelected(new Set());
    refresh();

    onFocusStrike({
      damage:     totalDamage,
      count:      ids.length,
      focusBonus: 0,
    });
    audioManager.playClick("press");
  }, [activeChallenge, selected, playerLevel, monsterAlive, onFocusStrike]);

  function handleDelete() {
    if (!activeChallenge) return;
    pauseTimer();
    deleteChallenge(activeChallenge.id);
    setSelected(new Set());
    setElapsed(0);
    refresh();
  }

  // ── Sync selection count & attack callback to arena ─────────────────────────
  useEffect(() => {
    onSelectedCountChange?.(selected.size);
  }, [selected, onSelectedCountChange]);

  useEffect(() => {
    if (!attackCallbackRef) return;
    attackCallbackRef.current = handleAttack;
    return () => { if (attackCallbackRef) attackCallbackRef.current = null; };
  }, [handleAttack, attackCallbackRef]);

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER: No active session
  // ════════════════════════════════════════════════════════════════════════════
  if (!activeChallenge) {
    if (!creating) {
      return (
        <div style={{ borderTop: isDesktop ? undefined : "1px solid #1a1e37" }}>
          <button
            onClick={() => { audioManager.playClick("press"); setCreating(true); }}
            style={{
              width: "100%",
              background: "rgba(192,132,252,0.06)",
              border: isDesktop ? "1px solid rgba(192,132,252,0.45)" : "none",
              borderBottom: "1px solid rgba(192,132,252,0.25)",
              borderTop: isDesktop ? undefined : "1px solid rgba(192,132,252,0.35)",
              color: ACCENT,
              padding: "13px 16px",
              fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              letterSpacing: 0.5,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "background 0.15s, border-color 0.15s",
              borderRadius: isDesktop ? 8 : 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(192,132,252,0.13)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(192,132,252,0.06)"; }}
          >
            <Brain size={13} /> ACTIVATE FOCUS MODE
          </button>
        </div>
      );
    }

    // ── Creation form ──────────────────────────────────────────────────────────
    return (
      <div>
        <div style={{
          background: "#0d1024",
          border: isDesktop ? "1px solid #2a2e50" : "none",
          borderTop: `2px solid ${ACCENT}`,
          borderBottom: isDesktop ? undefined : "1px solid #1a1e37",
          borderRadius: isDesktop ? 10 : 0,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            background: "#0b0d1e", borderBottom: "1px solid #1f254f",
            padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
          }}>
            <Brain size={16} color={ACCENT} />
            <span style={{ fontFamily: "'Press Start 2P', monospace", color: ACCENT, fontSize: 10, flex: 1, textShadow: "1px 1px 0 #000" }}>
              CREATE FOCUS SESSION
            </span>
            <button onClick={() => { setCreating(false); setNewTasks([]); setCustomMode(false); }}
              style={{ background: "none", border: "none", color: "#5a6080", cursor: "pointer", padding: 4 }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: "16px 14px" }}>
            {/* Big session display */}
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 42, color: ACCENT,
                textShadow: `0 0 24px ${ACCENT}55`, letterSpacing: 4, lineHeight: 1,
              }}>
                {String(sessionMin).padStart(2, "0")}:00
              </div>
              <div style={{ fontFamily: "'VT323', monospace", color: "#5a6080", fontSize: 15, marginTop: 6 }}>
                session duration · each task +0.01x permanent damage
              </div>
            </div>

            {/* Presets */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center", marginBottom: 10 }}>
              {SESSION_PRESETS.map(m => {
                const isActive = !customMode && sessionMin === m;
                return (
                  <button key={m}
                    onClick={() => { audioManager.playClick("tap"); setSessionMin(m); setCustomMode(false); }}
                    style={{
                      padding: "6px 14px",
                      background: isActive ? ACCENT + "22" : "transparent",
                      border: `1px solid ${isActive ? ACCENT : "#2a2e50"}`,
                      color: isActive ? ACCENT : "#5a6080",
                      fontFamily: "'Press Start 2P', monospace", fontSize: 9, cursor: "pointer",
                      transition: "all 0.12s", borderRadius: 6,
                    }}
                  >
                    {m}min
                  </button>
                );
              })}
              <button
                onClick={() => { audioManager.playClick("tap"); setCustomMode(true); }}
                style={{
                  padding: "6px 14px",
                  background: customMode ? ACCENT + "22" : "transparent",
                  border: `1px solid ${customMode ? ACCENT : "#2a2e50"}`,
                  color: customMode ? ACCENT : "#5a6080",
                  fontFamily: "'Press Start 2P', monospace", fontSize: 9, cursor: "pointer",
                  borderRadius: 6,
                }}
              >
                CUSTOM
              </button>
            </div>

            {/* Custom time input */}
            {customMode && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                marginBottom: 16, padding: "12px", background: "#0b0d1e",
                border: `1px solid ${ACCENT}33`, borderRadius: 7,
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontFamily: "'VT323', monospace", color: "#5a6080", fontSize: 14 }}>MINUTES</span>
                  <input type="number" min={1} max={180} value={customMinutes}
                    onChange={e => {
                      const m = Math.max(1, Math.min(180, parseInt(e.target.value) || 1));
                      setCustomMinutes(m);
                      setSessionMin(m);
                    }}
                    style={{ width: 72, textAlign: "center", background: "#1b1e37", border: `1px solid ${ACCENT}`, color: ACCENT, padding: "8px 4px", fontFamily: "'Press Start 2P', monospace", fontSize: 18, outline: "none", borderRadius: 5 }}
                  />
                </div>
                <span style={{ fontFamily: "'VT323', monospace", color: ACCENT, fontSize: 16, marginTop: 18 }}>
                  = {sessionMin}min
                </span>
              </div>
            )}

            {!customMode && <div style={{ marginBottom: 16 }} />}

            <div style={{ borderTop: "1px solid #1a1e37", marginBottom: 12 }} />

            {/* Bonus info */}
            <div style={{
              background: ACCENT_BG, border: `1px solid ${ACCENT_BORD}`,
              padding: "8px 12px", marginBottom: 12,
              display: "flex", alignItems: "center", gap: 8, borderRadius: 6,
            }}>
              <Zap size={14} color="#FFD700" />
              <span style={{ fontFamily: "'VT323', monospace", color: "#FFD700", fontSize: 16 }}>
                Focus tasks: damage to monster + <span style={{ color: "#06FFA5" }}>+0.01x permanent DMG</span>
              </span>
            </div>

            {/* Task list for creation */}
            {newTasks.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                {newTasks.map(t => (
                  <div key={t.id} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 0", borderBottom: "1px solid #1a1e37",
                  }}>
                    <Brain size={12} color={ACCENT} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, color: "#fff", fontSize: 18, fontFamily: "'VT323', monospace" }}>{t.text}</span>
                    <span style={{
                      padding: "1px 6px", fontSize: 13, fontFamily: "'VT323', monospace",
                      color: DIFFICULTY_INFO[t.difficulty].color,
                      background: DIFFICULTY_INFO[t.difficulty].color + "18",
                      border: `1px solid ${DIFFICULTY_INFO[t.difficulty].color}40`, borderRadius: 4,
                    }}>
                      {DIFFICULTY_INFO[t.difficulty].short}
                    </span>
                    <button onClick={() => setNewTasks(newTasks.filter(x => x.id !== t.id))}
                      style={{ background: "none", border: "none", color: "#5a6080", cursor: "pointer", padding: 2 }}>
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add task input */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  ref={inputRef}
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addNewTask(); }}
                  placeholder="Add focus task..."
                  style={{
                    flex: 1, background: "#1b1e37", border: "1px solid #2a2e50",
                    color: "#fff", padding: "8px 12px", fontSize: 18,
                    fontFamily: "'VT323', monospace", outline: "none", borderRadius: 6,
                  }}
                  onFocus={e => (e.target.style.borderColor = ACCENT)}
                  onBlur={e => (e.target.style.borderColor = "#2a2e50")}
                />
                <button onClick={addNewTask} style={{
                  background: `${ACCENT}18`, border: `2px dashed ${ACCENT}`, color: ACCENT,
                  padding: "8px 14px", fontFamily: "'VT323', monospace", fontSize: 20, cursor: "pointer", borderRadius: 6,
                }}>
                  <Plus size={18} />
                </button>
              </div>
              <DiffPicker value={newDiff} onChange={setNewDiff} />
            </div>

            {/* Start button */}
            <button onClick={startSession}
              style={{
                width: "100%", background: ACCENT,
                border: "none", color: "#0d1024", padding: "14px",
                fontFamily: "'Press Start 2P', monospace", fontSize: 11,
                cursor: "pointer",
                borderRadius: 8,
                boxShadow: `0 0 18px ${ACCENT}55`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <Play size={14} /> START SESSION{newTasks.length > 0 ? ` (${newTasks.length} tasks)` : ""}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER: ACTIVE SESSION
  // ════════════════════════════════════════════════════════════════════════════
  const tasks           = activeChallenge.tasks ?? [];
  const uncompletedTasks = tasks.filter(t => !t.completed);
  const completedTasks   = tasks.filter(t => t.completed);
  const uncompletedCount = uncompletedTasks.length;
  const completedCount   = completedTasks.length;

  const sessionMs        = (activeChallenge.sessionMinutes ?? 25) * 60 * 1000;
  const sessionElapsed   = elapsed % sessionMs;
  const sessionPct       = (sessionElapsed / sessionMs) * 100;
  const sessionRemaining = sessionMs - sessionElapsed;
  const sessionsDone     = Math.floor(elapsed / sessionMs);

  const currentFocusBonus = 0;
  const allUncomplSelected = uncompletedCount > 0 && uncompletedTasks.every(t => selected.has(t.id));

  return (
    <div>
      <style>{`
        @keyframes focusBonusPop { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes focusGlow { 0%,100%{box-shadow:0 0 14px rgba(192,132,252,0.18)}50%{box-shadow:0 0 26px rgba(192,132,252,0.35)} }
      `}</style>

      <div style={{
        background: "#0d1024",
        border: isDesktop ? "1px solid #2a2e50" : "none",
        borderTop: `2px solid ${ACCENT}`,
        borderBottom: "1px solid #1a1e37",
        borderRadius: isDesktop ? 10 : 0,
        overflow: "hidden",
        animation: running ? "focusGlow 2.5s ease infinite" : "none",
      }}>

        {/* ── Timer header ── */}
        <div style={{
          background: ACCENT_BG,
          borderBottom: `1px solid ${ACCENT_BORD}`,
          padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Brain size={16} color={ACCENT} />

          {/* Countdown display */}
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 18, color: running ? "#06FFA5" : ACCENT,
            textShadow: "1px 1px 0 #000", letterSpacing: 2,
          }}>
            {formatMs(sessionRemaining)}
          </div>

          {/* Sessions counter */}
          {sessionsDone > 0 && (
            <span style={{
              fontFamily: "'VT323', monospace", fontSize: 14,
              color: "#06FFA5", background: "rgba(6,255,165,0.08)",
              border: "1px solid #06FFA533", padding: "2px 7px", borderRadius: 4,
            }}>
              🍅×{sessionsDone}
            </span>
          )}

          <div style={{ flex: 1 }} />

          {/* Focus bonus badge */}
          <span style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
            color: "#06FFA5", background: "rgba(6,255,165,0.08)",
            border: "1px solid #06FFA533", padding: "3px 7px", borderRadius: 4,
          }}>
            +{currentFocusBonus.toFixed(2)}x
          </span>

          {/* Play/Pause */}
          <button
            onClick={() => { audioManager.playClick("press"); running ? pauseTimer() : startTimer(); }}
            style={{
              background: running ? "#E63946" : ACCENT,
              border: `1px solid ${running ? "#E63946" : ACCENT}`,
              color: "#0d1024",
              boxShadow: `0 0 10px ${running ? "#E6394644" : ACCENT + "44"}`,
              padding: "4px 12px", cursor: "pointer",
              fontFamily: "'VT323', monospace", fontSize: 16,
              display: "flex", alignItems: "center", gap: 5,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.filter = ""; }}
          >
            {running ? <><Pause size={13} /> PAUSE</> : <><Play size={13} /> {elapsed > 0 ? "RESUME" : "START"}</>}
          </button>

          {/* Delete */}
          <button onClick={handleDelete}
            style={{ background: "none", border: "none", color: "#5a6080", cursor: "pointer", padding: 4 }}
            onMouseEnter={e => (e.currentTarget.style.color = "#E63946")}
            onMouseLeave={e => (e.currentTarget.style.color = "#5a6080")}
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* ── Session progress bar ── */}
        <div style={{ height: 4, background: "#0a0c1a" }}>
          <div style={{
            height: "100%", width: `${sessionPct}%`,
            background: running ? "#06FFA5" : ACCENT,
            transition: running ? "none" : "width 0.3s ease",
          }} />
        </div>

        {/* ── Bonus notification ── */}
        {bonusGained !== null && (
          <div style={{
            background: "rgba(6,255,165,0.08)", borderBottom: "1px solid #06FFA533",
            padding: "6px 14px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            animation: "focusBonusPop 0.4s ease-out",
          }}>
            <Zap size={13} color="#06FFA5" />
            <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#06FFA5", fontSize: 8 }}>
              +{bonusGained.toFixed(2)}x DMG PERMANENTE!
            </span>
          </div>
        )}

        {/* ── Toolbar (same as ChallengePanel) ── */}
        <div style={{
          background: "#0b0d1e", borderBottom: "1px solid #1f254f",
          padding: "8px 14px", display: "flex", alignItems: "center", gap: 10,
          flexWrap: "wrap",
        }}>
          <button onClick={() => { audioManager.playClick("tap"); handleSelectAll(); }}
            style={{ background: "none", border: "none", color: "#5a6080", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 15, fontFamily: "'VT323', monospace", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
            onMouseLeave={e => (e.currentTarget.style.color = "#5a6080")}
          >
            <CheckSquare size={14} />
            {allUncomplSelected && uncompletedCount > 0 ? "Deselect All" : "Select All"}
          </button>

          <div style={{ flex: 1 }} />

          <span style={{ fontFamily: "'VT323', monospace", color: "#FFD700", fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}>
            <Zap size={11} /> +0.01x/task
          </span>

          <span style={{ color: "#5a6080", fontSize: 15, fontFamily: "'VT323', monospace" }}>
            {completedCount}/{tasks.length}
          </span>

          {/* + Nova Task button (same as ChallengePanel) */}
          <button
            onClick={() => { audioManager.playClick("press"); setShowAddInput(v => !v); setTimeout(() => activeInputRef.current?.focus(), 50); }}
            style={{
              background: `${ACCENT}18`, border: `2px dashed ${ACCENT}`, color: ACCENT,
              padding: "5px 11px", fontFamily: "'VT323', monospace", fontSize: 17,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${ACCENT}30`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${ACCENT}18`; }}
          >
            <Plus size={14} /> New Task
          </button>
        </div>

        {/* ── Add task form — desktop inline only ── */}
        {showAddInput && isDesktop && (
          <div style={{ flexShrink: 0, borderLeft: `3px solid ${ACCENT}` }}>
            <div style={{
              background: "#0b0d1e", borderBottom: "1px solid #1f254f",
              padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <input
                ref={activeInputRef}
                value={activeText}
                onChange={e => setActiveText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && activeText.trim()) {
                    addTaskToActive(activeText.trim(), activeDiff);
                    setActiveText("");
                  }
                  if (e.key === "Escape") { setShowAddInput(false); setActiveText(""); }
                }}
                placeholder="Focus task name..."
                style={{
                  flex: 1, background: "#1b1e37", border: `1px solid ${ACCENT}55`,
                  color: "#fff", padding: "6px 10px", fontSize: 19,
                  fontFamily: "'VT323', monospace", outline: "none", borderRadius: 5,
                }}
              />
              <button
                onClick={() => { if (activeText.trim()) { addTaskToActive(activeText.trim(), activeDiff); setActiveText(""); } }}
                style={{
                  background: `${ACCENT}18`, border: `2px dashed ${ACCENT}`, color: ACCENT,
                  padding: "6px 14px", fontFamily: "'VT323', monospace", fontSize: 17,
                  cursor: "pointer", borderRadius: 5,
                }}
              >
                +
              </button>
              <button onClick={() => { setShowAddInput(false); setActiveText(""); }}
                style={{ background: "none", border: "none", color: "#5a6080", cursor: "pointer", padding: 4 }}>
                <X size={14} />
              </button>
            </div>
            <div style={{
              background: "#0b0d1e", borderBottom: "1px solid #1f254f",
              padding: "6px 14px 10px",
            }}>
              <div style={{ color: "#5a6080", fontSize: 13, fontFamily: "'VT323', monospace", marginBottom: 5 }}>DIFFICULTY</div>
              <DiffPicker value={activeDiff} onChange={setActiveDiff} />
            </div>
          </div>
        )}

        {/* ── Task items ── */}
        <div style={{ overflowY: "auto" }}>
          {tasks.length === 0 && (
            <div style={{ color: "#5a6080", textAlign: "center", padding: "30px 20px", fontSize: 20, fontFamily: "'VT323', monospace" }}>
              Add tasks to earn permanent bonus!
            </div>
          )}

          {/* Uncompleted tasks */}
          {uncompletedTasks.map(task => {
            const isSelected = selected.has(task.id);
            const diffInfo = DIFFICULTY_INFO[task.difficulty];
            const dmg = calcFocusTaskDamage(task.difficulty, playerLevel);
            return (
              <div
                key={task.id}
                onClick={() => toggleSelect(task.id)}
                style={{
                  background: isSelected ? ACCENT_BG : "transparent",
                  borderBottom: "1px solid rgba(31,37,79,0.7)",
                  borderLeft: isSelected ? `3px solid ${ACCENT}` : "3px solid transparent",
                  transition: "all 0.15s",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 px-3" style={{ minHeight: 56 }}>
                  <Brain size={13} color={ACCENT} style={{ flexShrink: 0, opacity: 0.5 }} />

                  <div style={{
                    flexShrink: 0, width: 22, height: 22,
                    background: isSelected ? ACCENT + "25" : "transparent",
                    border: `1px solid ${isSelected ? ACCENT : "#2a2e50"}`,
                    borderRadius: 5,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}>
                    {isSelected && <Check size={13} color={ACCENT} strokeWidth={2.5} />}
                  </div>

                  <div style={{ flex: 1, paddingTop: 6, paddingBottom: 6 }}>
                    <span style={{ color: "#fff", fontSize: 19, fontFamily: "'VT323', monospace" }}>{task.text}</span>
                  </div>

                  <span style={{
                    flexShrink: 0, padding: "1px 7px",
                    background: diffInfo.color + "15", border: `1px solid ${diffInfo.color}55`,
                    color: diffInfo.color, fontSize: 13, fontFamily: "'VT323', monospace", borderRadius: 4,
                  }}>
                    {diffInfo.short}
                  </span>

                  {monsterAlive && (
                    <span style={{ flexShrink: 0, color: "#c084fc", fontSize: 14, fontFamily: "'VT323', monospace", whiteSpace: "nowrap" }}>
                      -{dmg}HP
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Separator */}
          {completedCount > 0 && uncompletedCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "#0a0c1a" }}>
              <div style={{ flex: 1, height: 1, background: "#1f254f" }} />
              <span style={{ color: "#3a4060", fontSize: 13, fontFamily: "'VT323', monospace", whiteSpace: "nowrap" }}>
                COMPLETED ({completedCount})
              </span>
              <div style={{ flex: 1, height: 1, background: "#1f254f" }} />
            </div>
          )}

          {/* Completed tasks */}
          {completedTasks.map(task => (
            <div key={task.id} style={{
              background: "rgba(78,222,128,0.04)",
              borderBottom: "1px solid rgba(31,37,79,0.7)",
              borderLeft: "3px solid rgba(6,255,165,0.2)",
            }}>
              <div className="flex items-center gap-2 px-3" style={{ minHeight: 54 }}>
                <Brain size={13} color={ACCENT} style={{ flexShrink: 0, opacity: 0.25 }} />
                <div style={{
                  flexShrink: 0, width: 22, height: 22,
                  background: "rgba(6,255,165,0.12)", border: "1px solid rgba(6,255,165,0.4)",
                  borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Check size={13} color="#06FFA5" strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1, paddingTop: 6, paddingBottom: 6 }}>
                  <span style={{ color: "#4a5070", fontSize: 19, fontFamily: "'VT323', monospace", textDecoration: "line-through" }}>{task.text}</span>
                </div>
                <span style={{ color: "#06FFA5", fontSize: 14, fontFamily: "'VT323', monospace" }}>+0.01x ✓</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Attack button removed — handled by unified button in arena/modal ── */}
      </div>

      {/* Mobile add-task modal */}
      <MobileAddTaskModal
        open={showAddInput && !isDesktop}
        accent={ACCENT}
        title="NEW FOCUS TASK"
        placeholder="Focus task name..."
        onClose={() => setShowAddInput(false)}
        onAdd={(text, diff) => { addTaskToActive(text, diff); }}
      />
    </div>
  );
}