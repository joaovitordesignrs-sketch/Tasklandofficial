/**
 * ProductPage — Landing page replicating the real in-game arena + demo task list.
 * Monsters cycle automatically when defeated. All text in English.
 */
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import { PreferencesProvider, useTheme } from "../contexts/PreferencesContext";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import { Swords, Check, Shield, Flame, Zap, Skull, Trophy, Heart, Dumbbell, BookOpen, Brain, Droplets } from "lucide-react";
import { RpgButton } from "./ui/RpgButton";

import imgSlime    from "../../assets/monsters/monster_slime.png";
import imgGoblin   from "../../assets/monsters/monster_goblin.png";
import imgCogu     from "../../assets/monsters/monster_cogu.png";
import imgSkeleton from "../../assets/monsters/monster_skeleton.png";
import imgDarkLord from "../../assets/monsters/monster_darklord.png";
import imgArena    from "../../assets/arena_background/arena_background_default.png";
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
  @keyframes victoryPop  { 0%{transform:scale(0.5);opacity:0} 50%{transform:scale(1.1);opacity:1} 100%{transform:scale(1);opacity:1} }
  @keyframes monsterIn   { 0%{opacity:0;transform:scaleX(-1) translateY(20px)} 100%{opacity:1;transform:scaleX(-1) translateY(0)} }
  @keyframes particleDrift {
    0%   { transform: translateY(0) rotate(45deg); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateY(-100vh) rotate(45deg); opacity: 0; }
  }
  @keyframes orbFloat1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(30px,-20px)} 66%{transform:translate(-20px,15px)} }
  @keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-25px,30px)} 66%{transform:translate(20px,-25px)} }
  @keyframes orbFloat3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,25px)} }
  @keyframes heroReveal { 0%{opacity:0;transform:translateY(30px) scale(0.97)} 100%{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes demoReveal { 0%{opacity:0;transform:translateY(60px) scale(0.95)} 100%{opacity:1;transform:translateY(0) scale(1)} }
  @media(max-width:700px) {
    .pp-row { flex-direction: column !important; }
    .pp-tasklist { width: 100% !important; }
    .pp-nav { display: none !important; }
  }
`;

// ── Floating pixel particles ────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i * 137.5 + 7) % 100}%`,
  size: i % 3 === 0 ? 4 : i % 2 === 0 ? 3 : 2,
  duration: 8 + (i % 7) * 2,
  delay: (i % 11) * 0.9,
  opacity: 0.15 + (i % 5) * 0.06,
}));

// ── Ambient orbs ────────────────────────────────────────────────────────────
const ORBS = [
  { x: "15%", y: "20%", size: 300, color: "rgba(235,176,55,0.06)", anim: "orbFloat1 12s ease-in-out infinite" },
  { x: "75%", y: "15%", size: 250, color: "rgba(96,165,250,0.05)", anim: "orbFloat2 15s ease-in-out infinite" },
  { x: "50%", y: "70%", size: 350, color: "rgba(168,85,247,0.04)", anim: "orbFloat3 18s ease-in-out infinite" },
  { x: "85%", y: "60%", size: 200, color: "rgba(230,57,70,0.04)", anim: "orbFloat1 14s ease-in-out infinite 3s" },
];

// ── Monster roster ──────────────────────────────────────────────────────────
interface MonsterDef {
  name: string;
  sprite: string;
  type: string;
  typeLabel: string;
  hp: number;
  height: string;
  bottom: string;
}

const MONSTERS: MonsterDef[] = [
  { name: "Slime of Laziness",       sprite: imgSlime,    type: "weak",     typeLabel: "WEAK",     hp: 110, height: "30%", bottom: "18%" },
  { name: "Procrastination Goblin",  sprite: imgGoblin,   type: "normal",   typeLabel: "NORMAL",   hp: 180, height: "48%", bottom: "15%" },
  { name: "Shroom of Distraction",   sprite: imgCogu,     type: "xp_bonus", typeLabel: "XP BONUS", hp: 140, height: "38%", bottom: "16%" },
  { name: "Skeleton of Burnout",     sprite: imgSkeleton, type: "strong",   typeLabel: "STRONG",   hp: 220, height: "58%", bottom: "12%" },
  { name: "Dark Lord of Chaos",      sprite: imgDarkLord, type: "boss",     typeLabel: "BOSS",     hp: 300, height: "88%", bottom: "5%"  },
];

const TYPE_COLORS: Record<string, string> = {
  weak: "#06ffa5", normal: "", xp_bonus: "#f59e0b", strong: "#e63946", boss: "#a855f7",
};

// ── Task sets per monster ───────────────────────────────────────────────────
const TASK_SETS = [
  [
    { text: "Reply to pending emails",     diff: "easy",   xp: 30 },
    { text: "Organize project notes",      diff: "easy",   xp: 30 },
    { text: "Update task board",           diff: "easy",   xp: 30 },
    { text: "Review daily goals",          diff: "easy",   xp: 30 },
  ],
  [
    { text: "Study React for 30 min",      diff: "medium", xp: 50 },
    { text: "Review pull request",         diff: "hard",   xp: 75 },
    { text: "Plan the week's sprint",      diff: "medium", xp: 50 },
    { text: "Write unit tests",            diff: "medium", xp: 50 },
    { text: "Fix navigation bug",          diff: "hard",   xp: 75 },
  ],
  [
    { text: "Read 20 pages of a book",     diff: "easy",   xp: 30 },
    { text: "Practice typing for 15 min",  diff: "easy",   xp: 30 },
    { text: "Complete online lesson",      diff: "medium", xp: 50 },
    { text: "Summarize key takeaways",     diff: "medium", xp: 50 },
  ],
  [
    { text: "Refactor auth module",        diff: "hard",   xp: 75 },
    { text: "Deploy staging build",        diff: "medium", xp: 50 },
    { text: "Write API documentation",     diff: "hard",   xp: 75 },
    { text: "Optimize database queries",   diff: "hard",   xp: 75 },
    { text: "Set up monitoring alerts",    diff: "medium", xp: 50 },
    { text: "Code review teammate's PR",   diff: "medium", xp: 50 },
  ],
  [
    { text: "Design system architecture",  diff: "hard",   xp: 75 },
    { text: "Implement CI/CD pipeline",    diff: "hard",   xp: 75 },
    { text: "Write integration tests",     diff: "hard",   xp: 75 },
    { text: "Performance audit",           diff: "hard",   xp: 75 },
    { text: "Launch production deploy",    diff: "hard",   xp: 75 },
    { text: "Create post-mortem doc",      diff: "medium", xp: 50 },
    { text: "Team retrospective notes",    diff: "medium", xp: 50 },
    { text: "Celebrate the victory!",      diff: "easy",   xp: 30 },
  ],
];

const DIFF_STYLES: Record<string, { color: string; icon: typeof Shield }> = {
  easy:   { color: "#06ffa5", icon: Shield },
  medium: { color: "#e39f64", icon: Swords },
  hard:   { color: "#e63946", icon: Flame },
};

// ── Rive warrior ────────────────────────────────────────────────────────────
function DemoWarrior({ onAttack, paused }: { onAttack: () => void; paused: boolean }) {
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
    if (!riveReady || paused) return;
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
  }, [riveReady, onAttack, paused]);

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
function DemoTaskList({ tasks, completedCount, monsterIndex }: {
  tasks: typeof TASK_SETS[0]; completedCount: number; monsterIndex: number;
}) {
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
      alignSelf: "stretch",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        background: BG_DEEPEST, borderBottom: `1px solid ${BORDER_SUBTLE}`,
        padding: "6px 14px", display: "flex", alignItems: "center", gap: SP_SM,
      }}>
        <div style={{
          flexShrink: 0, minWidth: 24, height: 24,
          background: BG_CARD, border: `1px solid ${BORDER_ELEVATED}`,
          borderRadius: RADIUS_SM + 1,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: FONT_PIXEL, color: ACCENT_GOLD, fontSize: PX_2XS, lineHeight: 1 }}>
            #{monsterIndex + 1}
          </span>
        </div>
        <span style={{ fontFamily: FONT_PIXEL, color: TEXT_LIGHT, fontSize: PX_SM, textShadow: "1px 1px 0 #000", flex: 1 }}>
          TASKS
        </span>
        <span style={{ fontFamily: FONT_BODY, color: TEXT_MUTED, fontSize: VT_SM }}>
          {Math.min(completedCount, tasks.length)}/{tasks.length}
        </span>
      </div>

      <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4, flex: 1, overflowY: "auto" }}>
        {tasks.map((task, i) => {
          const done = i < completedCount;
          const ds = DIFF_STYLES[task.diff];
          const DiffIcon = ds.icon;
          return (
            <div key={`${monsterIndex}-${i}`} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 10px",
              background: done ? `${COLOR_SUCCESS}0c` : "transparent",
              border: `1px solid ${done ? `${COLOR_SUCCESS}33` : BORDER_SUBTLE}`,
              borderRadius: 6, transition: "all 0.3s ease",
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
                <span style={{ fontFamily: FONT_BODY, fontSize: 14, color: done ? TEXT_INACTIVE : TEXT_LIGHT, transition: "color 0.3s" }}>
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
                <span style={{ fontFamily: FONT_PIXEL, fontSize: 6, color: done ? TEXT_INACTIVE : ACCENT_GOLD }}>+{task.xp}XP</span>
              </div>
            </div>
          );
        })}
      </div>

      {completedCount > 0 && (
        <div style={{
          borderTop: `1px solid ${BORDER_SUBTLE}`, padding: "6px 12px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Zap size={12} color={ACCENT_GOLD} />
            <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: ACCENT_GOLD }}>TOTAL DAMAGE</span>
          </div>
          <span style={{ fontFamily: FONT_PIXEL, fontSize: VT_XS, color: COLOR_DANGER, textShadow: "1px 1px 0 #000" }}>
            -{Math.min(completedCount, tasks.length) * 35} HP
          </span>
        </div>
      )}
    </div>
  );
}

// ── Main inner ──────────────────────────────────────────────────────────────
// ── Demo habits data ────────────────────────────────────────────────────────
const DEMO_HABITS = [
  { name: "Drink water",        icon: Droplets,  streak: 12, checked: true,  medal: "Beginner" },
  { name: "Exercise 30 min",    icon: Dumbbell,  streak: 24, checked: true,  medal: "Habit Builder" },
  { name: "Read 20 pages",      icon: BookOpen,  streak: 67, checked: false, medal: "Habit Master" },
  { name: "Meditate",           icon: Brain,     streak: 5,  checked: true,  medal: "Beginner" },
  { name: "Healthy meal",       icon: Heart,     streak: 3,  checked: false, medal: null },
];

const STREAK_COLOR = (s: number) => s >= 66 ? "#FF6B35" : s >= 21 ? "#FFD700" : s >= 5 ? "#06ffa5" : "#5a6080";

// ── Demo friends data ───────────────────────────────────────────────────────
const DEMO_FRIENDS = [
  { name: "DragonSlayer42",  level: 18, rank: "Veteran",   rankColor: "#06ffa5",  streak: 15, status: "online"  },
  { name: "QuestMasterX",   level: 24, rank: "Elite",     rankColor: "#FFD700",  streak: 32, status: "online"  },
  { name: "PixelKnight",    level: 11, rank: "Apprentice", rankColor: "#60a5fa",  streak: 7,  status: "offline" },
  { name: "RuneCaster99",   level: 31, rank: "Legend",     rankColor: "#a855f7",  streak: 45, status: "online"  },
  { name: "TaskNinja",      level: 8,  rank: "Novice",    rankColor: "#5a6080",  streak: 2,  status: "offline" },
];

// ── Feature card with scroll reveal ─────────────────────────────────────────
function FeatureCard({ children, label, labelColor, icon, delay = 0 }: {
  children: React.ReactNode; label: string; labelColor: string;
  icon: React.ReactNode; delay?: number;
}) {
  const {
    BG_CARD, BG_DEEPEST, BORDER_SUBTLE, BORDER_ELEVATED,
    TEXT_LIGHT, FONT_PIXEL, SP_SM, RADIUS_SM, RADIUS_XL, PX_2XS, PX_SM, alpha,
  } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      flex: 1, minWidth: 280,
      background: BG_CARD,
      border: `1px solid ${alpha(BORDER_ELEVATED, "b3")}`,
      borderRadius: RADIUS_XL,
      overflow: "hidden",
      boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 60px ${alpha(labelColor, "08")}`,
      display: "flex", flexDirection: "column",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(50px)",
      transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
    }}>
      <div style={{
        background: BG_DEEPEST, borderBottom: `1px solid ${BORDER_SUBTLE}`,
        padding: "8px 14px", display: "flex", alignItems: "center", gap: SP_SM,
      }}>
        <div style={{
          width: 24, height: 24, background: `${labelColor}22`, border: `1px solid ${labelColor}55`,
          borderRadius: RADIUS_SM + 1, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
        <span style={{
          fontFamily: FONT_PIXEL, color: TEXT_LIGHT, fontSize: PX_SM,
          textShadow: "1px 1px 0 #000", flex: 1,
        }}>
          {label}
        </span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

// ── Features section ────────────────────────────────────────────────────────
// ── SVG area chart for habits (no Recharts dependency) ──────────────────────
const CHART_BASELINE = [2, 3, 1, 4, 3, 5, 4, 3, 5, 4, 2, 3, 4, 5];

function HabitChart({ checkedCount, color }: { checkedCount: number; color: string }) {
  const { BG_DEEPEST, BORDER_SUBTLE, TEXT_INACTIVE, FONT_BODY } = useTheme();
  const max = 5;
  const data = useMemo(() => {
    const d = [...CHART_BASELINE];
    // Last few values react to current check-in count
    d[d.length - 1] = Math.min(max, checkedCount);
    d[d.length - 2] = Math.min(max, Math.max(checkedCount - 1, d[d.length - 2]));
    return d;
  }, [checkedCount]);

  const w = 280, h = 100, px = 8, py = 8;
  const innerW = w - px * 2, innerH = h - py * 2;
  const points = data.map((v, i) => {
    const x = px + (i / (data.length - 1)) * innerW;
    const y = py + innerH - (v / max) * innerH;
    return `${x},${y}`;
  });
  const line = points.join(" ");
  const area = `${px},${py + innerH} ${line} ${px + innerW},${py + innerH}`;

  const labels = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  return (
    <div style={{ padding: "12px 12px 6px", background: BG_DEEPEST, borderRadius: 8, margin: "0 10px 10px" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block" }}>
        <defs>
          <linearGradient id="hcGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4, 5].map(v => {
          const y = py + innerH - (v / max) * innerH;
          return <line key={v} x1={px} x2={px + innerW} y1={y} y2={y} stroke={BORDER_SUBTLE} strokeWidth={0.5} strokeDasharray="3 3" />;
        })}
        {/* Area fill */}
        <polygon points={area} fill="url(#hcGrad)" style={{ transition: "all 0.6s ease" }} />
        {/* Line */}
        <polyline points={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ transition: "all 0.6s ease" }} />
        {/* Dots */}
        {data.map((v, i) => {
          const x = px + (i / (data.length - 1)) * innerW;
          const y = py + innerH - (v / max) * innerH;
          return <circle key={i} cx={x} cy={y} r={i === data.length - 1 ? 4 : 2.5} fill={color} style={{ transition: "all 0.6s ease" }} />;
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 4px 0" }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 10, color: TEXT_INACTIVE }}>{labels[0]}</span>
        <span style={{ fontFamily: FONT_BODY, fontSize: 10, color: TEXT_INACTIVE }}>{labels[6]}</span>
        <span style={{ fontFamily: FONT_BODY, fontSize: 10, color: TEXT_INACTIVE }}>{labels[13]}</span>
      </div>
    </div>
  );
}

function FeaturesSection() {
  const {
    BG_CARD, BG_DEEPEST, BORDER_SUBTLE, BORDER_ELEVATED,
    ACCENT_GOLD, COLOR_SUCCESS, COLOR_DANGER, COLOR_WARNING, COLOR_LEGENDARY,
    TEXT_MUTED, TEXT_INACTIVE, TEXT_LIGHT,
    FONT_PIXEL, FONT_BODY, alpha,
    RADIUS_SM, RADIUS_LG, RADIUS_XL,
    PX_2XS, PX_SM, VT_SM, VT_XS, SP_SM,
  } = useTheme();

  const [habitTick, setHabitTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setHabitTick(c => c + 1), 2000);
    return () => clearInterval(t);
  }, []);

  // How many habits are checked (cycles through them)
  const checkedIndices = useMemo(() => {
    const base = DEMO_HABITS.map((h, i) => h.checked ? i : -1).filter(i => i >= 0);
    const cycleIdx = habitTick % DEMO_HABITS.length;
    const extra = DEMO_HABITS[cycleIdx]?.checked ? -1 : cycleIdx;
    return extra >= 0 ? [...base, extra] : base;
  }, [habitTick]);

  return (
    <section id="pp-features" style={{
      position: "relative", zIndex: 1,
      padding: "60px 24px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 40,
    }}>
      {/* Section title */}
      <div style={{ textAlign: "center" }}>
        <h2 style={{
          fontFamily: FONT_PIXEL, fontSize: "clamp(9px, 2vw, 14px)",
          color: TEXT_LIGHT, margin: 0, letterSpacing: 2,
          textShadow: "2px 2px 0 #000",
        }}>
          EVERYTHING YOU NEED TO <span style={{ color: ACCENT_GOLD }}>WIN THE DAY</span>
        </h2>
        <p style={{
          fontFamily: FONT_BODY, fontSize: "clamp(14px, 2vw, 18px)",
          color: TEXT_MUTED, marginTop: 8,
        }}>
          Tasks, habits, and friends — all gamified.
        </p>
      </div>

      {/* ── ROW 1: TASKS (full width) ── */}
      <div style={{ width: "100%", maxWidth: 920 }}>
        <FeatureCard
          label="CAMPAIGN TASKS"
          labelColor={ACCENT_GOLD}
          icon={<Swords size={12} color={ACCENT_GOLD} />}
          delay={0}
        >
          <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
            {[
              { text: "Ship landing page v2",        diff: "hard",   xp: 75, done: true },
              { text: "Fix mobile responsive bugs",  diff: "medium", xp: 50, done: true },
              { text: "Write API documentation",     diff: "hard",   xp: 75, done: false },
              { text: "Update onboarding flow",      diff: "medium", xp: 50, done: false },
              { text: "Clean up unused imports",     diff: "easy",   xp: 30, done: false },
            ].map((task, i) => {
              const ds = DIFF_STYLES[task.diff];
              const DiffIcon = ds.icon;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px",
                  background: task.done ? `${COLOR_SUCCESS}0c` : "transparent",
                  border: `1px solid ${task.done ? `${COLOR_SUCCESS}33` : BORDER_SUBTLE}`,
                  borderRadius: 6,
                }}>
                  <div style={{
                    width: 18, height: 18, flexShrink: 0, borderRadius: 4,
                    border: `2px solid ${task.done ? COLOR_SUCCESS : BORDER_ELEVATED}`,
                    background: task.done ? COLOR_SUCCESS : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {task.done && <Check size={12} color={BG_DEEPEST} strokeWidth={3} />}
                  </div>
                  <span style={{
                    flex: 1, fontFamily: FONT_BODY, fontSize: 14,
                    color: task.done ? TEXT_INACTIVE : TEXT_LIGHT,
                    textDecoration: task.done ? "line-through" : "none",
                  }}>
                    {task.text}
                  </span>
                  <DiffIcon size={11} color={task.done ? TEXT_INACTIVE : ds.color} />
                  <span style={{ fontFamily: FONT_PIXEL, fontSize: 6, color: task.done ? TEXT_INACTIVE : ACCENT_GOLD }}>
                    +{task.xp}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{
            marginTop: "auto",
            borderTop: `1px solid ${BORDER_SUBTLE}`, padding: "8px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: VT_SM, color: TEXT_MUTED }}>
              2 completed — monster takes damage!
            </span>
            <span style={{ fontFamily: FONT_PIXEL, fontSize: VT_XS, color: COLOR_DANGER, textShadow: "1px 1px 0 #000" }}>
              -70 HP
            </span>
          </div>
        </FeatureCard>
      </div>

      {/* ── ROW 2: HABITS + CHART (side by side) ── */}
      <div className="pp-row" style={{
        display: "flex", gap: 16, width: "100%", maxWidth: 920,
        alignItems: "stretch",
      }}>
        {/* Habits list */}
        <FeatureCard
          label="DAILY HABITS"
          labelColor={COLOR_SUCCESS}
          icon={<Flame size={12} color={COLOR_SUCCESS} />}
          delay={0}
        >
          <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
            {DEMO_HABITS.map((habit, i) => {
              const isChecked = checkedIndices.includes(i);
              const HIcon = habit.icon;
              const streakColor = STREAK_COLOR(habit.streak);
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px",
                  background: isChecked ? `${COLOR_SUCCESS}08` : "transparent",
                  borderLeft: `3px solid ${isChecked ? COLOR_SUCCESS : BORDER_ELEVATED}`,
                  borderRadius: 6,
                  transition: "all 0.3s ease",
                }}>
                  <div style={{
                    width: 32, height: 32, flexShrink: 0, borderRadius: 6,
                    background: isChecked ? COLOR_SUCCESS : BG_DEEPEST,
                    border: `2px solid ${isChecked ? COLOR_SUCCESS : BORDER_ELEVATED}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}>
                    {isChecked
                      ? <Check size={16} color={BG_DEEPEST} strokeWidth={3} />
                      : <HIcon size={14} color={TEXT_INACTIVE} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: FONT_BODY, fontSize: 15,
                      color: isChecked ? COLOR_SUCCESS : TEXT_LIGHT,
                      transition: "color 0.2s",
                    }}>
                      {habit.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <Flame size={10} color={streakColor} />
                      <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: streakColor }}>
                        {habit.streak} days
                      </span>
                      {habit.medal && (
                        <span style={{
                          fontFamily: FONT_PIXEL, fontSize: 5,
                          color: streakColor, background: `${streakColor}18`,
                          border: `1px solid ${streakColor}44`,
                          padding: "1px 5px", borderRadius: 3,
                        }}>
                          {habit.medal.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{
            marginTop: "auto",
            borderTop: `1px solid ${BORDER_SUBTLE}`, padding: "8px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: VT_SM, color: TEXT_MUTED }}>
              Active habits boost your power
            </span>
            <span style={{ fontFamily: FONT_PIXEL, fontSize: VT_XS, color: COLOR_SUCCESS, textShadow: "1px 1px 0 #000" }}>
              +10% DMG
            </span>
          </div>
        </FeatureCard>

        {/* Chart card */}
        <FeatureCard
          label="COMPLETION · 14 DAYS"
          labelColor={COLOR_SUCCESS}
          icon={<Zap size={12} color={COLOR_SUCCESS} />}
          delay={0.15}
        >
          <div style={{ padding: "12px 0 0", flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: COLOR_SUCCESS, letterSpacing: 1, padding: "0 14px 8px" }}>
              HABITS COMPLETED · LAST 14 DAYS
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <HabitChart checkedCount={checkedIndices.length} color={COLOR_SUCCESS} />
            </div>
            {/* Stats row */}
            <div style={{
              borderTop: `1px solid ${BORDER_SUBTLE}`, padding: "8px 14px",
              display: "flex", gap: 16,
            }}>
              {[
                { label: "TODAY", val: `${checkedIndices.length}/5`, color: COLOR_SUCCESS },
                { label: "BEST STREAK", val: "67d", color: "#FF6B35" },
                { label: "AVG/DAY", val: "3.4", color: ACCENT_GOLD },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontFamily: FONT_PIXEL, fontSize: 5, color: TEXT_INACTIVE, letterSpacing: 0.5 }}>{s.label}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 18, color: s.color, marginTop: 2 }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </FeatureCard>
      </div>

      {/* ── ROW 3: FRIENDS (full width) ── */}
      <div style={{ width: "100%", maxWidth: 920 }}>
        <FeatureCard
          label="FRIENDS & LEADERBOARD"
          labelColor={COLOR_LEGENDARY}
          icon={<Trophy size={12} color={COLOR_LEGENDARY} />}
          delay={0.1}
        >
          <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
            {DEMO_FRIENDS.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px",
                background: i === 0 ? `${ACCENT_GOLD}08` : "transparent",
                border: `1px solid ${i === 0 ? `${ACCENT_GOLD}33` : BORDER_SUBTLE}`,
                borderRadius: 6,
              }}>
                <span style={{
                  fontFamily: FONT_PIXEL, fontSize: 9, color: i < 3 ? ACCENT_GOLD : TEXT_INACTIVE,
                  width: 20, textAlign: "center", flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <div style={{
                  width: 32, height: 32, flexShrink: 0, borderRadius: 8,
                  background: BG_DEEPEST, border: `1px solid ${BORDER_ELEVATED}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: FONT_PIXEL, fontSize: 8, color: f.rankColor }}>
                    {f.name.charAt(0)}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: FONT_BODY, fontSize: 15, color: TEXT_LIGHT }}>
                      {f.name}
                    </span>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: f.status === "online" ? COLOR_SUCCESS : TEXT_INACTIVE,
                    }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
                    <span style={{ fontFamily: FONT_PIXEL, fontSize: 6, color: COLOR_LEGENDARY }}>LVL {f.level}</span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: f.rankColor }}>{f.rank}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <Flame size={10} color={STREAK_COLOR(f.streak)} />
                  <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: STREAK_COLOR(f.streak) }}>{f.streak}d</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: "auto",
            borderTop: `1px solid ${BORDER_SUBTLE}`, padding: "8px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: VT_SM, color: TEXT_MUTED }}>
              Compete with friends and climb the ranks
            </span>
            <span style={{ fontFamily: FONT_PIXEL, fontSize: VT_XS, color: COLOR_LEGENDARY, textShadow: "1px 1px 0 #000" }}>
              5 ONLINE
            </span>
          </div>
        </FeatureCard>
      </div>
    </section>
  );
}

function LandingInner() {
  const navigate = useNavigate();
  const {
    BG_DEEPEST, BG_CARD, BORDER_SUBTLE, BORDER_ELEVATED,
    ACCENT_GOLD, COLOR_DANGER, COLOR_WARNING, COLOR_SUCCESS, COLOR_LEGENDARY,
    TEXT_MUTED, TEXT_INACTIVE, TEXT_LIGHT,
    FONT_PIXEL, FONT_BODY, alpha,
    RADIUS_SM, RADIUS_LG, RADIUS_XL,
    PX_2XS, PX_SM, PX_MD, VT_SM, VT_XS, VT_LG, SP_SM,
  } = useTheme();

  const [monsterIdx, setMonsterIdx] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [showDmg, setShowDmg] = useState(false);
  const [dmgVal, setDmgVal] = useState(0);
  const [defeated, setDefeated] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [totalDefeated, setTotalDefeated] = useState(0);

  const monster = MONSTERS[monsterIdx % MONSTERS.length];
  const tasks = TASK_SETS[monsterIdx % TASK_SETS.length];
  const currentHp = Math.max(0, monster.hp - hitCount * 35);
  const hpPercent = (currentHp / monster.hp) * 100;
  const hpColor = hpPercent > 50 ? COLOR_SUCCESS : hpPercent > 25 ? COLOR_WARNING : COLOR_DANGER;
  const hpLabel = `${currentHp}/${monster.hp}`;
  const typeColor = TYPE_COLORS[monster.type] || "";

  // Detect defeat
  useEffect(() => {
    if (currentHp <= 0 && !defeated) {
      setDefeated(true);
      setShowVictory(true);
      setTotalDefeated(c => c + 1);
    }
  }, [currentHp, defeated]);

  // Auto-advance to next monster after victory
  useEffect(() => {
    if (!showVictory) return;
    const t = setTimeout(() => {
      setShowVictory(false);
      setDefeated(false);
      setHitCount(0);
      setMonsterIdx(i => i + 1);
    }, 2500);
    return () => clearTimeout(t);
  }, [showVictory]);

  const handleAttack = useCallback(() => {
    if (defeated) return;
    const dmg = Math.floor(Math.random() * 15 + 28);
    setDmgVal(dmg);
    setShowDmg(true);
    setHitCount(c => c + 1);
    setTimeout(() => setShowDmg(false), 600);
  }, [defeated]);

  // ── Mouse-tracking glow ──────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 50, y: 30 });
  const mouseRef = useRef(mouse);

  useEffect(() => {
    let raf: number;
    const handleMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      mouseRef.current = { x, y };
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setMouse({ x, y }));
    };
    window.addEventListener("mousemove", handleMove);
    return () => { window.removeEventListener("mousemove", handleMove); cancelAnimationFrame(raf); };
  }, []);

  // ── Scroll-triggered demo reveal ────────────────────────────────────────
  const demoRef = useRef<HTMLElement>(null);
  const [demoVisible, setDemoVisible] = useState(false);

  useEffect(() => {
    const el = demoRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setDemoVisible(true); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div ref={containerRef} style={{
        minHeight: "100dvh", background: BG_DEEPEST,
        display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
      }}>
        {/* ── Interactive background layers ── */}

        {/* Pixel grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            repeating-linear-gradient(0deg,  ${alpha(ACCENT_GOLD, "06")} 0px, transparent 1px, transparent 48px),
            repeating-linear-gradient(90deg, ${alpha(ACCENT_GOLD, "06")} 0px, transparent 1px, transparent 48px)
          `,
        }} />

        {/* Mouse-following radial glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: `radial-gradient(600px circle at ${mouse.x}% ${mouse.y}%, ${alpha(ACCENT_GOLD, "0a")}, transparent 60%)`,
          transition: "background 0.3s ease-out",
        }} />

        {/* Ambient floating orbs */}
        {ORBS.map((orb, i) => (
          <div key={i} style={{
            position: "absolute", left: orb.x, top: orb.y,
            width: orb.size, height: orb.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            pointerEvents: "none", zIndex: 0,
            animation: orb.anim,
            filter: "blur(40px)",
          }} />
        ))}

        {/* Rising pixel particles */}
        {PARTICLES.map((p, i) => (
          <div key={i} style={{
            position: "absolute", bottom: -10, left: p.left,
            width: p.size, height: p.size,
            background: ACCENT_GOLD,
            opacity: p.opacity,
            pointerEvents: "none", zIndex: 0,
            animation: `particleDrift ${p.duration}s linear ${p.delay}s infinite`,
          }} />
        ))}

        {/* ═══ STICKY HEADER ═══ */}
        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          display: "flex", alignItems: "center",
          padding: "10px 24px",
          background: alpha(BG_DEEPEST, "e8"),
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${alpha(BORDER_ELEVATED, "44")}`,
        }}>
          {/* Logo left */}
          <div style={{ width: 100, aspectRatio: "725 / 378", flexShrink: 0 }}>
            <TasklandLogotipo />
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Nav links */}
          <nav className="pp-nav" style={{ display: "flex", alignItems: "center", gap: 20, marginRight: 16 }}>
            {[
              { label: "Arena", target: "pp-hero" },
              { label: "Tasks", target: "pp-features" },
              { label: "Habits", target: "pp-features" },
              { label: "Friends", target: "pp-features" },
            ].map(link => (
              <button
                key={link.label}
                onClick={() => document.getElementById(link.target)?.scrollIntoView({ behavior: "smooth" })}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: FONT_BODY, fontSize: 15, color: TEXT_MUTED,
                  padding: "4px 0", transition: "color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = TEXT_LIGHT; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_MUTED; }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <RpgButton
            color={ACCENT_GOLD}
            onClick={() => navigate("/")}
            small
            style={{ fontSize: 7, letterSpacing: 1, padding: "7px 16px" }}
          >
            <Swords size={10} /> START
          </RpgButton>
        </header>

        {/* ═══ HERO + DEMO — all above the fold ═══ */}
        <section id="pp-hero" style={{
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center",
          padding: "clamp(16px, 3vh, 32px) 24px 0",
          gap: 12,
          animation: "heroReveal 0.8s cubic-bezier(0.22,1,0.36,1) both",
          minHeight: "calc(100dvh - 52px)",
        }}>
          {/* Headline + subtitle + CTA — compact */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}>

            {/* Headline — tighter */}
            <h1 style={{
              fontFamily: FONT_PIXEL,
              fontSize: "clamp(10px, 2.2vw, 18px)",
              color: TEXT_LIGHT,
              margin: 0, lineHeight: 1.8,
              letterSpacing: 2,
              textShadow: "2px 2px 0 #000",
              animation: "fadeUp 0.4s 0.1s ease both",
            }}>
              SLAY THE MONSTER <span style={{ color: ACCENT_GOLD }}>OF PROCRASTINATION</span>
            </h1>

            {/* Subtitle — one line */}
            <p style={{
              fontFamily: FONT_BODY,
              fontSize: "clamp(13px, 1.8vw, 17px)",
              color: TEXT_MUTED,
              margin: 0, lineHeight: 1.4,
              animation: "fadeUp 0.4s 0.15s ease both",
            }}>
              Complete tasks. Deal damage. Defeat bosses. Level up.
            </p>

            {/* CTA row — compact */}
            <div style={{
              display: "flex", gap: 10, alignItems: "center",
              flexWrap: "wrap", justifyContent: "center",
              animation: "fadeUp 0.4s 0.2s ease both",
            }}>
              <RpgButton
                color={ACCENT_GOLD}
                onClick={() => navigate("/")}
                style={{ padding: "10px 22px", fontSize: 8, letterSpacing: 2 }}
              >
                <Swords size={12} /> START FOR FREE
              </RpgButton>
              <span style={{
                fontFamily: FONT_PIXEL, fontSize: 6,
                color: TEXT_INACTIVE, letterSpacing: 1,
              }}>
                ▶ FREE TO PLAY
              </span>
            </div>
          </div>

          {/* ═══ PRODUCT DEMO — directly below, still above fold ═══ */}
          <div ref={demoRef} id="pp-demo" style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            width: "100%", paddingBottom: 40,
            opacity: demoVisible ? 1 : 0,
            transform: demoVisible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)",
            transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)",
          }}>
          {/* Demo container with shadow/glow to give depth like the Notion screenshot */}
          <div style={{
            width: "100%", maxWidth: 920,
            borderRadius: 16,
            overflow: "visible",
            position: "relative",
          }}>
            {/* Glow behind the demo */}
            <div style={{
              position: "absolute", top: -40, left: "10%", right: "10%", height: 80,
              background: `radial-gradient(ellipse at 50% 100%, ${alpha(ACCENT_GOLD, "18")} 0%, transparent 70%)`,
              pointerEvents: "none", zIndex: 0,
            }} />

            <div className="pp-row" style={{
              display: "flex", gap: 12, width: "100%",
              alignItems: "stretch", position: "relative", zIndex: 1,
            }}>
              {/* ── Arena card ── */}
              <div style={{
                flex: 1, minWidth: 0, background: BG_CARD,
                border: `1px solid ${alpha(BORDER_ELEVATED, "b3")}`,
                borderRadius: RADIUS_XL, overflow: "hidden",
                display: "flex", flexDirection: "column",
                boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 80px ${alpha(ACCENT_GOLD, "08")}`,
              }}>
                {/* Toolbar */}
                <div style={{
                  background: BG_DEEPEST, borderBottom: `1px solid ${BORDER_SUBTLE}`,
                  padding: "6px 14px", display: "flex", alignItems: "center", gap: SP_SM,
                }}>
                  <div style={{
                    flexShrink: 0, minWidth: 24, height: 24,
                    background: BG_CARD, border: `1px solid ${BORDER_ELEVATED}`,
                    borderRadius: RADIUS_SM + 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontFamily: FONT_PIXEL, color: ACCENT_GOLD, fontSize: PX_2XS, lineHeight: 1 }}>
                      #{(monsterIdx % MONSTERS.length) + 1}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: FONT_PIXEL, color: TEXT_LIGHT, fontSize: PX_SM,
                    textShadow: "1px 1px 0 #000", flex: 1,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {monster.name}
                  </span>
                  {totalDefeated > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Skull size={11} color={COLOR_DANGER} />
                      <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: COLOR_DANGER }}>{totalDefeated}</span>
                    </div>
                  )}
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
                  <div style={{
                    position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
                    background: `radial-gradient(ellipse at 50% 50%, transparent 55%, ${alpha(BG_DEEPEST, "73")} 100%)`,
                  }} />

                  <DemoWarrior onAttack={handleAttack} paused={defeated} />

                  {/* Power badge */}
                  <div style={{
                    position: "absolute", left: "4%", top: "6%", zIndex: 6,
                    display: "flex", alignItems: "center", gap: 6,
                    background: alpha(BG_DEEPEST, "e0"),
                    border: `1px solid ${COLOR_WARNING}88`,
                    borderRadius: RADIUS_LG - 1, padding: "5px 11px",
                    backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
                    boxShadow: `0 0 16px ${COLOR_WARNING}55, inset 0 0 8px ${COLOR_WARNING}18`,
                    whiteSpace: "nowrap", pointerEvents: "none",
                  }}>
                    <Zap size={12} color={COLOR_WARNING} strokeWidth={2.5} />
                    <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_MD, color: COLOR_WARNING, letterSpacing: 1, textShadow: `0 0 10px ${COLOR_WARNING}cc` }}>
                      1.35
                    </span>
                  </div>

                  {/* Monster */}
                  <div key={monsterIdx} style={{
                    position: "absolute", right: "8%", bottom: monster.bottom,
                    height: monster.height, zIndex: 2,
                    transform: showDmg ? "scaleX(-1) translateX(-8px)" : "scaleX(-1)",
                    transition: showDmg ? "transform 0.05s" : "transform 0.3s",
                    filter: defeated ? "brightness(0.3) grayscale(1)" : hpPercent < 25 ? "brightness(1.4) saturate(1.2)" : "brightness(0.88) saturate(0.82)",
                    imageRendering: "pixelated",
                    animation: defeated ? "none" : "monsterIn 0.4s ease both",
                  }}>
                    <img src={monster.sprite} alt="" style={{
                      height: "100%", width: "auto", objectFit: "contain",
                      imageRendering: "pixelated",
                      opacity: defeated ? 0.2 : 1, transition: "opacity 0.5s",
                    }} />
                    {defeated && (
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: COLOR_DANGER }}>
                        <Skull size={44} />
                      </div>
                    )}
                  </div>

                  {/* Floating damage */}
                  {showDmg && (
                    <div key={`dmg-${hitCount}`} style={{
                      position: "absolute", top: "25%", right: "15%", zIndex: 10,
                      fontFamily: FONT_PIXEL, fontSize: 22, color: COLOR_DANGER,
                      textShadow: "2px 2px 0 #000, 0 0 8px rgba(230,57,70,0.5)",
                      animation: "dmgFloat 0.8s ease forwards", pointerEvents: "none",
                    }}>
                      -{dmgVal}
                    </div>
                  )}

                  {/* Victory overlay */}
                  {showVictory && (
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 15,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      background: "rgba(5,7,18,0.6)",
                      animation: "victoryPop 0.4s ease both",
                    }}>
                      <Trophy size={36} color={COLOR_WARNING} />
                      <span style={{
                        fontFamily: FONT_PIXEL, fontSize: PX_SM, color: COLOR_WARNING,
                        textShadow: "2px 2px 0 #000", marginTop: 8,
                      }}>VICTORY!</span>
                      <span style={{
                        fontFamily: FONT_PIXEL, fontSize: 14, color: COLOR_LEGENDARY,
                        textShadow: "1px 1px 0 #000", marginTop: 4,
                      }}>+{tasks.reduce((a, t) => a + t.xp, 0)} XP</span>
                      <span style={{
                        fontFamily: FONT_BODY, fontSize: VT_SM, color: TEXT_MUTED, marginTop: 8,
                      }}>Next monster incoming...</span>
                    </div>
                  )}
                </div>

                {/* Footer — type tag + HP bar */}
                <div style={{
                  background: BG_DEEPEST, borderTop: `1px solid ${BORDER_SUBTLE}`,
                  padding: "7px 12px", display: "flex", alignItems: "center", gap: SP_SM,
                }}>
                  {typeColor ? (
                    <span style={{
                      background: typeColor + "22", border: `1px solid ${typeColor}66`,
                      color: typeColor, fontFamily: FONT_PIXEL, fontSize: PX_2XS,
                      padding: "2px 6px", borderRadius: RADIUS_SM - 1,
                      whiteSpace: "nowrap", letterSpacing: 0.5,
                    }}>
                      {monster.typeLabel}
                    </span>
                  ) : (
                    <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: TEXT_INACTIVE, letterSpacing: 0.5 }}>
                      {monster.typeLabel}
                    </span>
                  )}
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                    <div style={{
                      flex: 1, maxWidth: 140, height: 8,
                      background: BG_DEEPEST, border: `1px solid ${hpColor}55`,
                      borderRadius: RADIUS_SM, overflow: "hidden",
                    }}>
                      <div style={{ width: `${hpPercent}%`, height: "100%", background: hpColor, transition: "width 0.6s ease" }} />
                    </div>
                    <span style={{
                      fontFamily: FONT_BODY, color: hpColor, fontSize: VT_XS,
                      whiteSpace: "nowrap", minWidth: 48, textAlign: "right",
                    }}>{hpLabel}</span>
                  </div>
                </div>
              </div>

              {/* ── Task list ── */}
              <DemoTaskList
                tasks={tasks}
                completedCount={Math.min(hitCount, tasks.length)}
                monsterIndex={monsterIdx % MONSTERS.length}
              />
            </div>

            {/* Bottom fade-out */}
            <div style={{
              position: "absolute", bottom: -1, left: 0, right: 0, height: 80,
              background: `linear-gradient(to bottom, transparent, ${BG_DEEPEST})`,
              pointerEvents: "none", zIndex: 2, borderRadius: "0 0 16px 16px",
            }} />
          </div>
          </div>
        </section>

        {/* ═══ FEATURES SECTION ═══ */}
        <FeaturesSection />

        {/* ═══ FINAL CTA ═══ */}
        <section style={{
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", padding: "60px 24px 80px", gap: 16,
        }}>
          <h2 style={{
            fontFamily: FONT_PIXEL, fontSize: "clamp(9px, 2vw, 14px)",
            color: TEXT_LIGHT, margin: 0, letterSpacing: 2,
            textShadow: "2px 2px 0 #000",
          }}>
            READY TO <span style={{ color: ACCENT_GOLD }}>LEVEL UP</span>?
          </h2>
          <p style={{
            fontFamily: FONT_BODY, fontSize: "clamp(14px, 2vw, 18px)",
            color: TEXT_MUTED, margin: 0,
          }}>
            Join thousands of players conquering their goals.
          </p>
          <RpgButton
            color={ACCENT_GOLD}
            onClick={() => navigate("/")}
            style={{ padding: "12px 28px", fontSize: 9, letterSpacing: 2, marginTop: 8 }}
          >
            <Swords size={14} /> START YOUR ADVENTURE
          </RpgButton>
        </section>

        {/* Version */}
        <div style={{
          position: "relative", zIndex: 1, textAlign: "center",
          padding: "0 0 20px",
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
