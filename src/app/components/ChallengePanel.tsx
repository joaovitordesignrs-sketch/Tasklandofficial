import { useState, useEffect, useRef, useCallback } from "react";
import { DIFFICULTY_INFO, DIFFICULTY_DAMAGE } from "../data/gameEngine";
import {
  Challenge, ChallengeTask,
  getChallenges, createChallenge, updateChallenge, deleteChallenge,
} from "../data/challenges";
import { addChallengeTaskToHistory } from "../data/missions";
import { Timer, Brain, Zap, Clock, CheckCircle2, XCircle, Trophy, Skull, Plus, Play, Pause, Trash2, X, CheckSquare, Swords, Check } from "lucide-react";
import { audioManager } from "../hooks/audioManager";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { MobileAddTaskModal } from "./ui/MobileAddTaskModal";
import { getPower } from "../data/combatPower";
import { DifficultyPicker } from "./ui/DifficultyPicker";
import { useTheme } from "../contexts/PreferencesContext";

// ── Helpers ───────────────────────────────────────────────────────────────────
type TaskDifficulty = "easy" | "medium" | "hard";

function formatMs(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Roll temporal multiplier 1.0–1.5x */
export function rollTemporalMultiplier(): number {
  return parseFloat((1 + Math.random() * 0.5).toFixed(2));
}

/** Calc damage for a single challenge task using the new Power system (temporal mode) */
export function calcChallengTaskDamage(
  difficulty: string,
  level: number,
  temporalMult: number,
): number {
  const base  = DIFFICULTY_DAMAGE[difficulty] ?? 30;
  const power = getPower(level, "temporal");
  return Math.max(1, Math.round(base * power.total * temporalMult));
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface TemporalStrike {
  damage: number;
  multiplier: number;
  count: number;
  isCritical: boolean;
}

interface ChallengePanelProps {
  playerLevel: number;
  monsterAlive: boolean;
  onTemporalStrike: (strike: TemporalStrike) => void;
  onChallengeFailed?: () => void;
  onSelectedCountChange?: (n: number) => void;
  attackCallbackRef?: { current: (() => void) | null };
}

// ── Difficulty picker ─────────────────────────────────────────────────────────
function DiffPicker({ value, onChange }: { value: TaskDifficulty; onChange: (d: TaskDifficulty) => void }) {
  return <DifficultyPicker value={value} onChange={onChange} />;
}

// ── Timer tick effect — plays once per second when challenge is running ────────
function useTimerTick(isRunning: boolean) {
  const lastSecRef = useRef<number>(-1);
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

// ═════════════════════════════════════════════════════════════════════════════
// CHALLENGE PANEL
// ══════════════════════════════════════════════════════════════════════════════
export function ChallengePanel({ playerLevel, monsterAlive, onTemporalStrike, onChallengeFailed, onSelectedCountChange, attackCallbackRef }: ChallengePanelProps) {
  const { COLOR_ORANGE } = useTheme();
  const ACCENT        = COLOR_ORANGE;
  const ACCENT_BG     = "rgba(255,107,53,0.10)";
  const ACCENT_BORDER = COLOR_ORANGE + "55";

  const [challenges, setChallenges] = useState(getChallenges());
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const isDesktop = useIsDesktop();

  // Creation state
  const [duration, setDuration] = useState(25);
  const [customMode, setCustomMode] = useState(false);
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [newTasks, setNewTasks] = useState<ChallengeTask[]>([]);
  const [newText, setNewText] = useState("");
  const [newDiff, setNewDiff] = useState<TaskDifficulty>("easy");
  const [showAddInput, setShowAddInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeInputRef = useRef<HTMLInputElement>(null);

  // Timer
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const PRESETS = [10, 15, 25, 30, 45, 60];

  function refresh() { setChallenges([...getChallenges()]); }

  // Find active time-attack challenge
  const activeChallenge = challenges.find(
    (c) => c.type === "time-attack" && c.status === "active",
  );

  // ── Tick sound while timer is counting ──
  const tickActive = !!activeChallenge && !activeChallenge.paused;
  useTimerTick(tickActive);

  // ── Timer tick ──
  useEffect(() => {
    if (!activeChallenge) { setTimeLeft(null); return; }
    if (activeChallenge.paused) {
      setTimeLeft(activeChallenge.pausedRemainingMs ?? 0);
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, (activeChallenge.endsAt ?? 0) - Date.now());
      setTimeLeft(remaining);
    };
    tick();
    const iv = setInterval(tick, 500);
    return () => clearInterval(iv);
  }, [activeChallenge?.id, activeChallenge?.endsAt, activeChallenge?.paused]);

  // ── Auto-fail when time runs out (only if not paused, and timer has been properly initialised) ──
  useEffect(() => {
    if (!activeChallenge || activeChallenge.paused) return;
    // Direct check against endsAt, not against timeLeft state (avoids race condition)
    const remaining = (activeChallenge.endsAt ?? 0) - Date.now();
    if (remaining <= 0) {
      updateChallenge({ ...activeChallenge, status: "failed" });
      refresh();
      onChallengeFailed?.();
    }
  }, [timeLeft]); // triggered by each timer tick

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATION LOGIC
  // ═══════════════════════════════════════════════════════════════════════════
  function addNewTask() {
    if (!newText.trim()) return;
    setNewTasks((prev) => [...prev, {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
      text: newText.trim(), completed: false, difficulty: newDiff,
    }]);
    setNewText("");
    setNewDiff("easy");
    inputRef.current?.focus();
  }

  function startChallenge() {
    if (newTasks.length === 0) return;
    const now = Date.now();
    const durationMs = duration * 60 * 1000;
    createChallenge({
      name: `Tempo ${duration >= 60 ? `${Math.floor(duration / 60)}h${duration % 60 > 0 ? duration % 60 + "m" : ""}` : duration + "min"}`,
      type: "time-attack",
      status: "active",
      durationMinutes: duration,
      endsAt: now + durationMs,
      tasks: newTasks,
      paused: false,
    });
    setNewTasks([]);
    setNewText("");
    setCreating(false);
    setShowAddInput(false);
    audioManager.playClick("press");
    refresh();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAUSE / RESUME
  // ═══════════════════════════════════════════════════════════════════════════
  function pauseChallenge() {
    if (!activeChallenge) return;
    const remaining = Math.max(0, (activeChallenge.endsAt ?? 0) - Date.now());
    updateChallenge({ ...activeChallenge, paused: true, pausedRemainingMs: remaining, endsAt: undefined });
    audioManager.playClick("press");
    refresh();
  }

  function resumeChallenge() {
    if (!activeChallenge) return;
    const remaining = activeChallenge.pausedRemainingMs ?? 0;
    if (remaining <= 0) return;
    updateChallenge({
      ...activeChallenge,
      paused: false,
      pausedRemainingMs: undefined,
      endsAt: Date.now() + remaining,
    });
    audioManager.playClick("press");
    refresh();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TASK SELECTION & ATTACK
  // ═══════════════════════════════════════════════════════════════════════════
  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const handleSelectAll = useCallback(() => {
    const tasks = activeChallenge?.tasks ?? [];
    const uc = tasks.filter((t) => !t.completed).map((t) => t.id);
    if (selected.size === uc.length && uc.length > 0) setSelected(new Set());
    else setSelected(new Set(uc));
  }, [activeChallenge, selected]);

  const handleAttack = useCallback(() => {
    if (!activeChallenge || !monsterAlive) return;
    const tasks = activeChallenge.tasks ?? [];
    const ids = Array.from(selected).filter((id) =>
      tasks.find((t) => t.id === id && !t.completed),
    );
    if (!ids.length) return;

    const now = Date.now();
    let totalDamage = 0;
    let maxMult = 0;

    for (const id of ids) {
      const task = tasks.find((t) => t.id === id);
      if (!task) continue;
      const mult = rollTemporalMultiplier();
      const dmg = calcChallengTaskDamage(task.difficulty, playerLevel, mult);
      totalDamage += dmg;
      if (mult > maxMult) maxMult = mult;
    }

    const updatedTasks = tasks.map((t) =>
      ids.includes(t.id) ? { ...t, completed: true, completedAt: now } : t,
    );
    const allDone = updatedTasks.filter((t) => !t.completed).length === 0;
    const status = allDone ? "completed" as const : activeChallenge.status;
    updateChallenge({ ...activeChallenge, tasks: updatedTasks, status });

    // ── Register completed tasks in diary ──
    for (const id of ids) {
      const task = tasks.find((t) => t.id === id);
      if (!task) continue;
      addChallengeTaskToHistory(
        task.id, task.text, task.difficulty, now,
        "time-attack", activeChallenge.name,
      );
    }

    setSelected(new Set());
    refresh();

    onTemporalStrike({
      damage: totalDamage,
      multiplier: maxMult,
      count: ids.length,
      isCritical: maxMult >= 1.3,
    });
    audioManager.playClick("press");
  }, [activeChallenge, selected, playerLevel, monsterAlive, onTemporalStrike]);

  function handleDeleteChallenge() {
    if (!activeChallenge) return;
    deleteChallenge(activeChallenge.id);
    setSelected(new Set());
    refresh();
  }

  function addTaskToActive(text: string, diff: TaskDifficulty) {
    if (!activeChallenge) return;
    const t: ChallengeTask = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
      text, completed: false, difficulty: diff,
    };
    updateChallenge({ ...activeChallenge, tasks: [...(activeChallenge.tasks ?? []), t] });
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

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: No active challenge
  // ═══════════════════════════════════════════════════════════════════════════
  if (!activeChallenge) {
    if (!creating) {
      return (
        <div style={{ borderTop: isDesktop ? undefined : "1px solid #1a1e37" }}>
          <button
            onClick={() => { audioManager.playClick("press"); setCreating(true); }}
            style={{
              width: "100%",
              background: "rgba(255,107,53,0.06)",
              border: isDesktop ? "1px solid rgba(255,107,53,0.45)" : "none",
              borderBottom: "1px solid rgba(255,107,53,0.25)",
              borderTop: isDesktop ? undefined : "1px solid rgba(255,107,53,0.35)",
              color: ACCENT,
              padding: "13px 16px",
              fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              letterSpacing: 0.5,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "background 0.15s, border-color 0.15s",
              borderRadius: isDesktop ? 8 : 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,107,53,0.13)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,107,53,0.06)"; }}
          >
            <Timer size={13} /> ATIVAR DESAFIO TEMPORAL
          </button>
        </div>
      );
    }

    // ── Creation form ─────────────────────────────────────────────────────
    return (
      <div>
        <div style={{
          background: "#0d1024",
          border: isDesktop ? `1px solid #2a2e50` : "none",
          borderTop: `2px solid ${ACCENT}`,
          borderBottom: isDesktop ? undefined : `1px solid #1a1e37`,
          borderRadius: isDesktop ? 10 : 0,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            background: "#0b0d1e", borderBottom: `1px solid #1f254f`,
            padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
          }}>
            <Timer size={16} color={ACCENT} />
            <span style={{ fontFamily: "'Press Start 2P', monospace", color: ACCENT, fontSize: 10, flex: 1, textShadow: "1px 1px 0 #000" }}>
              CRIAR DESAFIO TEMPORAL
            </span>
            <button onClick={() => { setCreating(false); setNewTasks([]); }} style={{ background: "none", border: "none", color: "#5a6080", cursor: "pointer", padding: 4 }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: "16px 14px" }}>
            {/* Timer display */}
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 36, color: ACCENT,
                textShadow: `0 0 20px ${ACCENT}55`, letterSpacing: 4, lineHeight: 1,
              }}>
                {duration >= 60
                  ? `${String(Math.floor(duration / 60)).padStart(2, "0")}:${String(duration % 60).padStart(2, "0")}:00`
                  : `${String(duration).padStart(2, "0")}:00`}
              </div>
              <div style={{ fontFamily: "'VT323', monospace", color: "#5a6080", fontSize: 16, marginTop: 6 }}>
                Complete as tasks antes do tempo acabar!
              </div>
            </div>

            {/* Presets */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center", marginBottom: 10 }}>
              {PRESETS.map((m) => {
                const isActive = !customMode && duration === m;
                return (
                  <button key={m}
                    onClick={() => { audioManager.playClick("tap"); setDuration(m); setCustomMode(false); }}
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
                onClick={() => { audioManager.playClick("tap"); setCustomMode(true); const t = customHours * 60 + customMinutes; if (t > 0) setDuration(t); }}
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
                  <span style={{ fontFamily: "'VT323', monospace", color: "#5a6080", fontSize: 14 }}>HORAS</span>
                  <input type="number" min={0} max={23} value={customHours}
                    onChange={(e) => { const h = Math.max(0, Math.min(23, parseInt(e.target.value) || 0)); setCustomHours(h); const t = h * 60 + customMinutes; if (t > 0) setDuration(t); }}
                    style={{ width: 64, textAlign: "center", background: "#1b1e37", border: `1px solid ${ACCENT}`, color: ACCENT, padding: "8px 4px", fontFamily: "'Press Start 2P', monospace", fontSize: 18, outline: "none", borderRadius: 5 }}
                  />
                </div>
                <span style={{ fontFamily: "'Press Start 2P', monospace", color: ACCENT, fontSize: 24, marginTop: 18 }}>:</span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontFamily: "'VT323', monospace", color: "#5a6080", fontSize: 14 }}>MINUTOS</span>
                  <input type="number" min={0} max={59} value={customMinutes}
                    onChange={(e) => { const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0)); setCustomMinutes(m); const t = customHours * 60 + m; if (t > 0) setDuration(t); }}
                    style={{ width: 64, textAlign: "center", background: "#1b1e37", border: `1px solid ${ACCENT}`, color: ACCENT, padding: "8px 4px", fontFamily: "'Press Start 2P', monospace", fontSize: 18, outline: "none", borderRadius: 5 }}
                  />
                </div>
                <span style={{ fontFamily: "'VT323', monospace", color: ACCENT, fontSize: 16, marginTop: 18 }}>
                  = {duration}min
                </span>
              </div>
            )}

            {!customMode && <div style={{ marginBottom: 16 }} />}

            <div style={{ borderTop: "1px solid #1a1e37", marginBottom: 12 }} />

            {/* Bonus info */}
            <div style={{
              background: "rgba(255,107,53,0.06)", border: "1px solid #FF6B3533",
              padding: "8px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, borderRadius: 6,
            }}>
              <Zap size={14} color="#FFD700" />
              <span style={{ fontFamily: "'VT323', monospace", color: "#FFD700", fontSize: 16 }}>
                Tasks temporais causam 1.0x~1.5x dano ao monstro!
              </span>
            </div>

            {/* Task list for creation */}
            {newTasks.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                {newTasks.map((t) => (
                  <div key={t.id} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 0", borderBottom: "1px solid #1a1e37",
                  }}>
                    <Timer size={12} color={ACCENT} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, color: "#fff", fontSize: 18, fontFamily: "'VT323', monospace" }}>{t.text}</span>
                    <span style={{
                      padding: "1px 6px", fontSize: 13, fontFamily: "'VT323', monospace",
                      color: DIFFICULTY_INFO[t.difficulty].color,
                      background: DIFFICULTY_INFO[t.difficulty].color + "18",
                      border: `1px solid ${DIFFICULTY_INFO[t.difficulty].color}40`, borderRadius: 4,
                    }}>
                      {DIFFICULTY_INFO[t.difficulty].short}
                    </span>
                    <button onClick={() => setNewTasks(newTasks.filter((x) => x.id !== t.id))}
                      style={{ background: "none", border: "none", color: "#5a6080", cursor: "pointer", padding: 2 }}>
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add task */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input ref={inputRef} value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addNewTask(); }}
                  placeholder="Adicionar tarefa temporal..."
                  style={{
                    flex: 1, background: "#1b1e37", border: "1px solid #2a2e50",
                    color: "#fff", padding: "8px 12px", fontSize: 18,
                    fontFamily: "'VT323', monospace", outline: "none", borderRadius: 6,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2e50")}
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

            {/* Start */}
            <button onClick={startChallenge} disabled={newTasks.length === 0}
              style={{
                width: "100%", background: newTasks.length > 0 ? ACCENT : "#333",
                border: "none", color: "#0d1024", padding: "14px",
                fontFamily: "'Press Start 2P', monospace", fontSize: 11,
                cursor: newTasks.length > 0 ? "pointer" : "not-allowed",
                borderRadius: 8,
                boxShadow: newTasks.length > 0 ? `0 0 18px ${ACCENT}55` : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: newTasks.length > 0 ? 1 : 0.5,
              }}
              onMouseDown={(e) => newTasks.length > 0 && ((e.currentTarget as HTMLButtonElement).style.transform = "translate(2px,2px)")}
              onMouseUp={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "")}
            >
              <Play size={14} /> INICIAR DESAFIO ({newTasks.length} tasks)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: ACTIVE CHALLENGE  (mirrors TaskList design with orange/red theme)
  // ═══════════════════════════════════════════════════════════════════════════

  const tasks = activeChallenge.tasks ?? [];
  const uncompletedTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const completedCount = completedTasks.length;
  const uncompletedCount = uncompletedTasks.length;
  const isPaused = activeChallenge.paused === true;
  const isExpired = !isPaused && timeLeft !== null && timeLeft <= 0;
  const challengeComplete = activeChallenge.status === "completed";
  const challengeFailed = activeChallenge.status === "failed" || (isExpired && activeChallenge.status === "active");

  const totalMs = (activeChallenge.durationMinutes ?? 0) * 60 * 1000;
  const currentTimeLeft = timeLeft ?? 0;
  const urgency = totalMs > 0 ? currentTimeLeft / totalMs : 1;
  const timerColor = challengeComplete ? "#06FFA5" : challengeFailed ? "#E63946" : isPaused ? "#FFD700" : urgency < 0.15 ? "#E63946" : urgency < 0.35 ? "#FF6B35" : "#06FFA5";

  const canInteract = !challengeComplete && !challengeFailed && !isPaused;
  const borderColor = challengeComplete ? "#06FFA5" : challengeFailed ? "#E63946" : ACCENT;

  return (
    <>
    <div>
      <style>{`
        @keyframes timerPulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes challengeGlow { 0%,100%{box-shadow: 0 0 14px rgba(255,107,53,0.18)}50%{box-shadow: 0 0 26px rgba(255,107,53,0.36)} }
      `}</style>

      <div style={{
        background: "#0d1024",
        border: isDesktop ? `1px solid ${borderColor === ACCENT ? "#2a2e50" : borderColor}` : "none",
        borderTop: `2px solid ${borderColor}`,
        borderBottom: `1px solid ${borderColor === ACCENT ? "#1a1e37" : borderColor + "55"}`,
        borderRadius: isDesktop ? 10 : 0,
        overflow: "hidden",
        position: "relative", display: "flex", flexDirection: "column",
        animation: !challengeComplete && !challengeFailed && !isPaused ? "challengeGlow 2s ease infinite" : "none",
      }}>
        {/* ── Timer header ── */}
        <div style={{
          background: challengeComplete ? "rgba(6,255,165,0.06)" : challengeFailed ? "rgba(230,57,70,0.06)" : "rgba(255,107,53,0.06)",
          borderBottom: `1px solid ${borderColor}33`,
          padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Timer size={18} color={timerColor} style={{
            animation: !challengeComplete && !challengeFailed && !isPaused && urgency < 0.35 ? "timerPulse 0.6s step-end infinite" : "none",
          }} />

          {/* Timer value */}
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 18, color: timerColor,
            textShadow: "2px 2px 0 #000", letterSpacing: 2,
            animation: !challengeComplete && !challengeFailed && !isPaused && urgency < 0.15 ? "timerPulse 0.4s step-end infinite" : "none",
          }}>
            {challengeComplete ? "CONCLUÍDO!" : challengeFailed ? "EXPIRADO!" : isPaused ? `⏸ ${formatMs(currentTimeLeft)}` : formatMs(currentTimeLeft)}
          </div>

          <div style={{ flex: 1 }} />

          {/* Pause / Resume */}
          {!challengeComplete && !challengeFailed && (
            <button
              onClick={() => { isPaused ? resumeChallenge() : pauseChallenge(); }}
              style={{
                background: isPaused ? "#FFD700" : "transparent",
                border: `1px solid ${isPaused ? "#FFD700" : "#3a4060"}`,
                color: isPaused ? "#0d1024" : "#5a6080",
                boxShadow: isPaused ? "0 0 10px #FFD70044" : "none",
                padding: "4px 10px", cursor: "pointer",
                fontFamily: "'VT323', monospace", fontSize: 16,
                display: "flex", alignItems: "center", gap: 5,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { if (!isPaused) { e.currentTarget.style.borderColor = "#FFD700"; e.currentTarget.style.color = "#FFD700"; } }}
              onMouseLeave={(e) => { if (!isPaused) { e.currentTarget.style.borderColor = "#3a4060"; e.currentTarget.style.color = "#5a6080"; } }}
            >
              {isPaused ? <><Play size={13} /> RETOMAR</> : <><Pause size={13} /> PAUSAR</>}
            </button>
          )}

          {/* Delete */}
          <button onClick={handleDeleteChallenge}
            style={{ background: "none", border: "none", color: "#5a6080", cursor: "pointer", padding: 4 }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#E63946")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#5a6080")}
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ height: 4, background: "#0a0c1a" }}>
          <div style={{
            height: "100%",
            width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%`,
            background: challengeComplete ? "#06FFA5" : challengeFailed ? "#E63946" : ACCENT,
            transition: "width 0.4s ease",
          }} />
        </div>

        {/* ── Toolbar (mirrors TaskList) ── */}
        <div style={{
          background: "#0b0d1e", borderBottom: "1px solid #1f254f",
          padding: "8px 14px", display: "flex", alignItems: "center", gap: 10,
          flexShrink: 0, flexWrap: "wrap",
        }}>
          {canInteract && (
            <button onClick={() => { audioManager.playClick("tap"); handleSelectAll(); }}
              style={{ background: "none", border: "none", color: "#5a6080", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 15, fontFamily: "'VT323', monospace", transition: "color 0.15s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = ACCENT)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#5a6080")}
            >
              <CheckSquare size={14} />
              {selected.size === uncompletedCount && uncompletedCount > 0 ? "Desmarcar" : "Selecionar Tudo"}
            </button>
          )}

          {isPaused && (
            <span style={{ fontFamily: "'VT323', monospace", color: "#FFD700", fontSize: 16, display: "flex", alignItems: "center", gap: 5 }}>
              <Pause size={12} /> PAUSADO
            </span>
          )}

          <div style={{ flex: 1 }} />

          {/* Temporal bonus badge */}
          <span style={{ fontFamily: "'VT323', monospace", color: "#FFD700", fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}>
            <Zap size={11} /> 1.0x~1.5x
          </span>

          <span style={{ color: "#5a6080", fontSize: 15, fontFamily: "'VT323', monospace" }}>{completedCount}/{tasks.length}</span>

          {canInteract && (
            <button
              onClick={() => { audioManager.playClick("press"); setShowAddInput(true); setTimeout(() => activeInputRef.current?.focus(), 50); }}
              style={{
                background: `${ACCENT}18`, border: `2px dashed ${ACCENT}`, color: ACCENT,
                padding: "5px 11px", fontFamily: "'VT323', monospace", fontSize: 17,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${ACCENT}30`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${ACCENT}18`; }}
              onMouseDown={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "translate(2px,2px)")}
              onMouseUp={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "")}
            >
              <Plus size={14} /> Nova Task
            </button>
          )}
        </div>

        {/* ── Add task form (when active) ── */}
        {showAddInput && canInteract && isDesktop && (
          <div style={{ flexShrink: 0, borderLeft: `3px solid ${ACCENT}` }}>
            <div style={{
              background: "#0b0d1e", borderBottom: "1px solid #1f254f",
              padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <input ref={activeInputRef} value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newText.trim()) { addTaskToActive(newText.trim(), newDiff); setNewText(""); }
                  if (e.key === "Escape") { setShowAddInput(false); setNewText(""); }
                }}
                placeholder="Nome da tarefa temporal..."
                style={{ flex: 1, background: "#1b1e37", border: `1px solid ${ACCENT}55`, color: "#fff", padding: "6px 10px", fontSize: 19, fontFamily: "'VT323', monospace", outline: "none", borderRadius: 5 }}
              />
              <button onClick={() => { if (newText.trim()) { addTaskToActive(newText.trim(), newDiff); setNewText(""); } }}
                style={{ background: `${ACCENT}18`, border: `2px dashed ${ACCENT}`, color: ACCENT, padding: "6px 14px", fontFamily: "'VT323', monospace", fontSize: 17, cursor: "pointer", borderRadius: 5 }}>
                +
              </button>
              <button onClick={() => { setShowAddInput(false); setNewText(""); }}
                style={{ background: "none", border: "none", color: "#5a6080", cursor: "pointer", padding: 4 }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ background: "#0b0d1e", borderBottom: "1px solid #1f254f", padding: "6px 14px 10px" }}>
              <div style={{ color: "#5a6080", fontSize: 13, fontFamily: "'VT323', monospace", marginBottom: 5 }}>DIFICULDADE</div>
              <DiffPicker value={newDiff} onChange={setNewDiff} />
            </div>
          </div>
        )}

        {/* ── Task items ── */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {tasks.length === 0 && (
            <div style={{ color: "#5a6080", textAlign: "center", padding: "30px 20px", fontSize: 20, fontFamily: "'VT323', monospace" }}>
              Adicione tarefas ao desafio temporal!
            </div>
          )}

          {/* Uncompleted tasks */}
          {uncompletedTasks.map((task) => {
            const isSelected = selected.has(task.id);
            const diffInfo = DIFFICULTY_INFO[task.difficulty];
            const dmg = calcChallengTaskDamage(task.difficulty, playerLevel, 1);
            return (
              <div
                key={task.id}
                onClick={() => canInteract && toggleSelect(task.id)}
                style={{
                  background: isSelected ? ACCENT_BG : "transparent",
                  borderBottom: "1px solid rgba(31,37,79,0.7)",
                  borderLeft: isSelected ? `3px solid ${ACCENT}` : "3px solid transparent",
                  transition: "all 0.15s",
                  cursor: canInteract ? "pointer" : "default",
                  opacity: isPaused ? 0.6 : 1,
                }}
              >
                <div className="flex items-center gap-2 px-3" style={{ minHeight: 56 }}>
                  {/* Timer icon */}
                  <Timer size={13} color={ACCENT} style={{ flexShrink: 0, opacity: 0.5 }} />

                  {/* Checkbox */}
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

                  {/* Text */}
                  <div style={{ flex: 1, paddingTop: 6, paddingBottom: 6 }}>
                    <span style={{ color: "#fff", fontSize: 19, fontFamily: "'VT323', monospace" }}>{task.text}</span>
                  </div>

                  {/* Diff badge */}
                  <span style={{
                    flexShrink: 0, padding: "1px 7px",
                    background: diffInfo.color + "15", border: `1px solid ${diffInfo.color}55`,
                    color: diffInfo.color, fontSize: 13, fontFamily: "'VT323', monospace", borderRadius: 4,
                  }}>
                    {diffInfo.short}
                  </span>

                  {/* Damage */}
                  {monsterAlive && (
                    <span style={{ flexShrink: 0, color: "#E63946", fontSize: 14, fontFamily: "'VT323', monospace", whiteSpace: "nowrap" }}>
                      -{dmg}~{Math.round(dmg * 1.5)}HP
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
                CONCLUÍDAS ({completedCount})
              </span>
              <div style={{ flex: 1, height: 1, background: "#1f254f" }} />
            </div>
          )}

          {/* Completed tasks */}
          {completedTasks.map((task) => (
            <div key={task.id} style={{
              background: "rgba(78,222,128,0.04)",
              borderBottom: "1px solid rgba(31,37,79,0.7)",
              borderLeft: "3px solid rgba(6,255,165,0.2)",
            }}>
              <div className="flex items-center gap-2 px-3" style={{ minHeight: 54 }}>
                <Timer size={13} color={ACCENT} style={{ flexShrink: 0, opacity: 0.25 }} />
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
                <span style={{ color: "#06FFA5", fontSize: 14, fontFamily: "'VT323', monospace" }}>✓</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── End state buttons ── */}
        {(challengeComplete || challengeFailed) && (
          <div style={{
            padding: "12px 14px", borderTop: "1px solid #1f254f",
            background: challengeComplete ? "rgba(6,255,165,0.04)" : "rgba(230,57,70,0.04)",
          }}>
            {challengeFailed && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 12px", marginBottom: 10,
                background: "rgba(230,57,70,0.08)", border: "1px solid #E6394633", borderRadius: 6,
              }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <span style={{ fontFamily: "'VT323', monospace", color: "#E63946", fontSize: 16 }}>
                  Penalidade: -50% do progresso de XP do nível atual
                </span>
              </div>
            )}
            <button onClick={() => { deleteChallenge(activeChallenge.id); setSelected(new Set()); refresh(); }}
              style={{
                width: "100%", padding: "12px",
                background: challengeComplete ? "#06FFA5" : "#E63946",
                border: "none", color: "#0d1024",
                fontFamily: "'Press Start 2P', monospace", fontSize: 10,
                cursor: "pointer",
                borderRadius: 8,
                boxShadow: `0 0 18px ${challengeComplete ? "rgba(6,255,165,0.4)" : "rgba(230,57,70,0.4)"}`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {challengeComplete ? (
                <><Trophy size={14} /> DESAFIO CONCLUÍDO — FECHAR</>
              ) : (
                <><Skull size={14} /> TEMPO ESGOTADO — DESCARTAR</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Mobile add-task modal */}
    {showAddInput && canInteract && !isDesktop && (
      <MobileAddTaskModal
        open
        accent={ACCENT}
        title="NOVA TASK TEMPORAL"
        placeholder="Nome da tarefa temporal..."
        onClose={() => setShowAddInput(false)}
        onAdd={(text, diff) => { addTaskToActive(text, diff); }}
      />
    )}
    </>
  );
}