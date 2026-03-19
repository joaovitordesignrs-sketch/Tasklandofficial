import { useState, useEffect, useCallback, type CSSProperties } from "react";
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import imgAvatarWarrior from '../../assets/profile_pic/profile_pic_warrior.png';
import imgAvatarMage    from '../../assets/profile_pic/profile_pic_mage.png';

const ONBOARDING_KEY = "rpg_onboarding_v1";

// ─── Rive URLs (same as TaskCharacter / ClassPickerOverlay) ────────────────────
const RIV_URLS = {
  guerreiro: 'https://raw.githubusercontent.com/joaovitordesignrs-sketch/taskland/main/taskland_animations_warrior_base.riv',
  mago:      'https://raw.githubusercontent.com/joaovitordesignrs-sketch/taskland/main/taskland_animations_mage_base.riv',
} as const;

const CLASS_SCALE = { guerreiro: 1.0, mago: 1.22 } as const;

// ─── Rive character preview for onboarding ─────────────────────────────────────
function OnboardingChar({
  charClass,
  size = 130,
}: {
  charClass: keyof typeof RIV_URLS;
  size?: number;
}) {
  const scale = CLASS_SCALE[charClass];
  const [riveReady, setRiveReady] = useState(false);
  const onLoad = useCallback(() => setRiveReady(true), []);

  const { RiveComponent } = useRive({
    src: RIV_URLS[charClass],
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.BottomCenter }),
    onLoad,
  });

  const fallbackSrc = charClass === 'mago' ? imgAvatarMage : imgAvatarWarrior;

  return (
    <div style={{
      width: size,
      height: size,
      flexShrink: 0,
      transform: `scale(${scale})`,
      transformOrigin: 'bottom center',
      position: 'relative',
    }}>
      {!riveReady && (
        <img
          src={fallbackSrc}
          alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'contain', imageRendering: 'pixelated', opacity: 0.75,
          }}
        />
      )}
      <RiveComponent style={{ width: size, height: size, imageRendering: 'pixelated', opacity: riveReady ? 1 : 0, transition: 'opacity 0.4s' }} />
    </div>
  );
}

// ─── Shared CSS ────────────────────────────────────────────────────────────────
const ONBOARDING_CSS = `
  @keyframes obFadeIn   { from { opacity: 0 } to { opacity: 1 } }
  @keyframes obFadeOut  { from { opacity: 1 } to { opacity: 0 } }
  @keyframes obSlideIn  { from { opacity: 0; transform: translateX(32px) } to { opacity: 1; transform: translateX(0) } }
  @keyframes obSlideOut { from { opacity: 1; transform: translateX(0) } to { opacity: 0; transform: translateX(-32px) } }
  @keyframes obBadgePop { from { opacity: 0; transform: scale(0.4) } to { opacity: 1; transform: scale(1) } }
  @keyframes obFriendIn { from { opacity: 0; transform: translateX(20px) } to { opacity: 1; transform: translateX(0) } }
  @keyframes obLvPop    { from { opacity: 0; transform: scale(0.3) } to { opacity: 1; transform: scale(1) } }
  @keyframes obBtnPulse { 0%,100% { box-shadow: 3px 3px 0 #000, 0 0 12px #f0c04066 } 50% { box-shadow: 3px 3px 0 #000, 0 0 22px #f0c040aa } }
  @keyframes obStarTwinkle { 0%,100% { opacity: 0.1 } 50% { opacity: 0.5 } }
`;

// ─── Decorative pixel star ─────────────────────────────────────────────────────
function PixelStar({ style }: { style: CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        width: 4,
        height: 4,
        background: "#e39f64",
        boxShadow: "0 0 0 1px #e39f6440",
        ...style,
      }}
    />
  );
}

// ─── Progress dots ─────────────────────────────────────────────────────────────
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 18 : 8,
            height: 8,
            background: i === current ? "#f0c040" : i < current ? "#7c5e28" : "#2a2e4a",
            border: i === current ? "2px solid #f0c040" : "2px solid #3a3e5a",
            boxShadow: i === current ? "0 0 8px #f0c04088" : "none",
            transition: "all 0.2s ease",
          }}
        />
      ))}
    </div>
  );
}

// ─── Slide illustrations ──────────────────────────────────────────────────────

function MonsterSlide() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 2), 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {/* HP bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#e63946" }}>HP</span>
        <div style={{ width: 120, height: 12, background: "#1a1f38", border: "2px solid #3a3e5a", position: "relative", overflow: "hidden" }}>
          <div style={{ width: "65%", height: "100%", background: "#e63946", boxShadow: "0 0 6px #e63946aa" }} />
        </div>
        <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: "#e63946" }}>65%</span>
      </div>

      {/* Battle scene: character vs monster */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4 }}>
        {/* Warrior Rive */}
        <OnboardingChar charClass="guerreiro" size={110} />

        {/* VS */}
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#f0c040", textShadow: "2px 2px 0 #000", paddingBottom: 16, flexShrink: 0 }}>
          VS
        </div>

        {/* Slime monster SVG */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 10 }}>
          <svg width="72" height="64" viewBox="0 0 80 72" style={{ imageRendering: "pixelated" }}>
            <rect x="16" y="24" width="48" height="40" fill="#7c4dff" />
            <rect x="8"  y="32" width="64" height="24" fill="#7c4dff" />
            <rect x="12" y="60" width="56" height="8"  fill="#6a3de0" />
            <rect x="20" y="26" width="16" height="4" fill="#a97dff" />
            <rect x="16" y="30" width="4"  height="4" fill="#a97dff" />
            <rect x="24" y="36" width="10" height="10" fill="white" />
            <rect x="46" y="36" width="10" height="10" fill="white" />
            <rect x={frame === 0 ? "27" : "28"} y="38" width="6" height="6" fill="#1a0a30" />
            <rect x={frame === 0 ? "49" : "50"} y="38" width="6" height="6" fill="#1a0a30" />
            <rect x="29" y="39" width="2" height="2" fill="white" />
            <rect x="51" y="39" width="2" height="2" fill="white" />
            <rect x="30" y="50" width="20" height="4" fill="#1a0a30" />
            <rect x="8"  y={frame === 0 ? "56" : "58"} width="8" height="8" fill="#7c4dff" />
            <rect x="64" y={frame === 0 ? "56" : "58"} width="8" height="8" fill="#7c4dff" />
          </svg>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#a97dff", marginTop: 2 }}>SLIME</div>
        </div>
      </div>
    </div>
  );
}

function XPSlide() {
  const [xpFill, setXpFill] = useState(40);
  useEffect(() => {
    const t = setTimeout(() => setXpFill(78), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {/* Warrior Rive animation */}
      <OnboardingChar charClass="guerreiro" size={130} />

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, background: "#f0c040", color: "#000", padding: "3px 7px", border: "2px solid #c8960a", boxShadow: "2px 2px 0 #000" }}>LV 7</div>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: "#7dd3fc" }}>→</div>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, background: "#f0c040", color: "#000", padding: "3px 7px", border: "2px solid #c8960a", boxShadow: "2px 2px 0 #000", animation: "obLvPop 0.4s ease 0.9s both" }}>LV 8 ✦</div>
      </div>

      <div style={{ width: 180, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#60a5fa" }}>XP</span>
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: "#60a5fa" }}>{xpFill}%</span>
        </div>
        <div style={{ height: 14, background: "#1a1f38", border: "2px solid #3a3e5a", overflow: "hidden" }}>
          <div style={{ width: `${xpFill}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #60a5fa)", boxShadow: "0 0 8px #60a5faaa", transition: "width 0.8s cubic-bezier(.22,.68,0,1.15)" }} />
        </div>
      </div>
    </div>
  );
}

function HabitsSlide() {
  const habits = [
    { name: "Exercise",  streak: 7,  bonus: "+14%" },
    { name: "Reading",   streak: 3,  bonus: "+6%"  },
    { name: "Meditation",streak: 14, bonus: "+21%" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 4 }}>
        {["🔥", "💥", "⚡"].map((e, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 28 }}>{e}</span>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: "#f0c040", textShadow: "1px 1px 0 #000" }}>×{i + 1}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5, width: 220 }}>
        {habits.map((h, i) => (
          <div key={h.name} style={{ display: "flex", alignItems: "center", gap: 8, background: "#0d1021", border: "2px solid #2a2e4a", padding: "5px 8px", animation: `obFriendIn 0.3s ease ${i * 0.1}s both` }}>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 20, color: "#f0c040" }}>🔥{h.streak}</div>
            <div style={{ flex: 1, fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#c8d0f0" }}>{h.name}</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#4ade80" }}>{h.bonus}</div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: "#5a6080", textAlign: "center", maxWidth: 220 }}>
        Keep your <span style={{ color: "#f0c040" }}>streak</span> to multiply your damage!
      </div>
    </div>
  );
}

function RankSlide() {
  const ranks = [
    { label: "F",  color: "#6b7280", bg: "#1f2937" },
    { label: "E",  color: "#84cc16", bg: "#1a2e05" },
    { label: "D",  color: "#22d3ee", bg: "#0a2535" },
    { label: "C",  color: "#a78bfa", bg: "#1e1b4b" },
    { label: "B",  color: "#60a5fa", bg: "#0f1f4a" },
    { label: "A",  color: "#fb923c", bg: "#2a1500" },
    { label: "S",  color: "#f0c040", bg: "#2a1f00" },
    { label: "S+", color: "#f0c040", bg: "#2a1f00" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", maxWidth: 260 }}>
        {ranks.map((r, i) => (
          <div key={r.label} style={{
            width: 44, height: 44, background: r.bg,
            border: `2px solid ${r.color}`,
            boxShadow: i >= 6 ? `0 0 10px ${r.color}88` : "2px 2px 0 #000",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: r.label === "S+" ? 9 : 12,
            color: r.color,
            textShadow: i >= 5 ? `0 0 8px ${r.color}` : "2px 2px 0 #000",
            animation: `obBadgePop 0.3s ease ${i * 0.08}s both`,
          }}>
            {r.label}
          </div>
        ))}
      </div>
      <div style={{ background: "#0d1021", border: "2px solid #2a2e4a", padding: "8px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: "#5a6080" }}>POWER = MH × MN × MC × MR</div>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#f0c040" }}>Power = floor(75 × Total)</div>
      </div>
    </div>
  );
}

function FriendsSlide() {
  const friends = [
    { name: "ARIA", rank: "S", rankColor: "#f0c040", cp: 840, rankBg: "#2a1f00", isYou: false },
    { name: "KAEL", rank: "B", rankColor: "#60a5fa", cp: 312, rankBg: "#0f1f4a", isYou: false },
    { name: "YOU",  rank: "C", rankColor: "#a78bfa", cp: 190, rankBg: "#1e1b4b", isYou: true  },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 240 }}>
        {friends.map((f, i) => (
          <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 8, background: f.isYou ? "#1a1f38" : "#0d1021", border: f.isYou ? "2px solid #a78bfa" : "2px solid #2a2e4a", boxShadow: f.isYou ? "0 0 8px #a78bfa44" : "none", padding: "6px 10px", animation: `obFriendIn 0.4s ease ${i * 0.12}s both` }}>
            <div style={{ width: 28, height: 28, background: f.rankBg, border: `2px solid ${f.rankColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: f.rankColor, flexShrink: 0 }}>{f.rank}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: f.isYou ? "#a78bfa" : "#c8d0f0" }}>{f.name} {f.isYou ? "◀" : ""}</div>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: "#5a6080", marginTop: 2 }}>POWER {f.cp}</div>
            </div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#5a6080" }}>#{i + 1}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: "#5a6080", textAlign: "center", maxWidth: 220 }}>
        Go to <span style={{ color: "#a78bfa" }}>Friends</span> in the menu and search by nick
      </div>
    </div>
  );
}

function FinalSlide() {
  const [glow, setGlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGlow(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {/* Both characters side by side */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 0 }}>
        <OnboardingChar charClass="guerreiro" size={120} />
        <OnboardingChar charClass="mago" size={120} />
      </div>

      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "clamp(9px, 2vw, 13px)", color: "#f0c040", textShadow: glow ? "2px 2px 0 #000, 0 0 20px #f0c04088" : "2px 2px 0 #000", textAlign: "center", lineHeight: 1.8, transition: "text-shadow 0.6s ease" }}>
        YOUR ADVENTURE{"\n"}STARTS NOW!
      </div>
      <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: "#8090b0", textAlign: "center", maxWidth: 240, lineHeight: 1.5 }}>
        Create your first mission, defeat your first monster and climb the ranks, hero!
      </div>
    </div>
  );
}

// ─── Slide definitions (component TYPES, not elements) ─────────────────────────
// Storing component types (not React elements) avoids module-level JSX evaluation.

type SlideComponent = () => JSX.Element;

interface Slide {
  title: string;
  subtitle: string;
  Illustration: SlideComponent;
  body: string;
}

const SLIDES: Slide[] = [
  {
    title: "WELCOME TO\nTASKLAND!",
    subtitle: "The RPG of your productivity",
    Illustration: MonsterSlide,
    body: "In TaskLand, your daily tasks turn into attacks against monsters! Complete missions to defeat creatures and level up your character.",
  },
  {
    title: "COMPLETE\nTASKS",
    subtitle: "Each task is an attack",
    Illustration: XPSlide,
    body: "Create tasks and mark them as done to deal damage to the current monster. Earn XP and level up — the harder the task, the more XP you gain!",
  },
  {
    title: "HABITS &\nSTREAKS",
    subtitle: "Consistency multiplies your power",
    Illustration: HabitsSlide,
    body: "Log daily habits to build streaks 🔥. The longer your streak, the greater your damage bonus on attacks!",
  },
  {
    title: "POWER &\nRANK",
    subtitle: "From novice F to legendary S+",
    Illustration: RankSlide,
    body: "Your Power is calculated from defeated monsters, level, and achievements. Keep evolving to reach the top!",
  },
  {
    title: "FRIENDS &\nCOMPETITION",
    subtitle: "Compare your rank with other players",
    Illustration: FriendsSlide,
    body: "Add friends by nick in the Friends tab and see who has the highest Power. Healthy rivalry boosts motivation!",
  },
  {
    title: "READY,\nHERO!",
    subtitle: "Your journey begins now",
    Illustration: FinalSlide,
    body: "Choose your class (Warrior or Mage), create your first mission and start defeating monsters. Good luck on your adventure!",
  },
];

// ─── Main Onboarding Overlay ───────────────────────────────────────────────────

interface OnboardingOverlayProps {
  onFinish: () => void;
}

export function OnboardingOverlay({ onFinish }: OnboardingOverlayProps) {
  const [step, setStep]       = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [slideOut, setSlideOut] = useState(false);

  const isLast = step === SLIDES.length - 1;
  const slide  = SLIDES[step];
  const { Illustration } = slide;

  const goNext = useCallback(() => {
    if (leaving) return;
    if (isLast) {
      setLeaving(true);
      setTimeout(() => {
        localStorage.setItem(ONBOARDING_KEY, "done");
        onFinish();
      }, 500);
      return;
    }
    setSlideOut(true);
    setTimeout(() => {
      setStep(s => s + 1);
      setSlideOut(false);
      setAnimKey(k => k + 1);
    }, 180);
  }, [leaving, isLast, onFinish]);

  const goBack = useCallback(() => {
    if (step === 0) return;
    setSlideOut(true);
    setTimeout(() => {
      setStep(s => s - 1);
      setSlideOut(false);
      setAnimKey(k => k + 1);
    }, 180);
  }, [step]);

  const slideAnim = slideOut ? "obSlideOut 0.18s ease forwards" : "obSlideIn 0.22s ease forwards";

  return (
    <>
      <style>{ONBOARDING_CSS}</style>

      {/* Backdrop */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 9800,
          background: "rgba(8, 12, 26, 0.92)",
          backdropFilter: "blur(2px)",
          animation: leaving ? "obFadeOut 0.5s ease forwards" : "obFadeIn 0.35s ease forwards",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px", boxSizing: "border-box",
        }}
      >
        {/* Stars */}
        {Array.from({ length: 20 }, (_, i) => (
          <PixelStar key={i} style={{
            left: `${(i * 137.5 + 11) % 100}%`,
            top: `${(i * 97.3 + 31) % 100}%`,
            opacity: 0.1,
            animation: `obStarTwinkle ${2 + (i % 5) * 0.4}s ease-in-out ${(i % 7) * 0.3}s infinite`,
          }} />
        ))}

        {/* Modal */}
        <div style={{
          position: "relative", width: "100%", maxWidth: 440, maxHeight: "90dvh",
          background: "#0f1221", border: "3px solid #2a2e4a",
          boxShadow: "6px 6px 0 #000, 0 0 40px rgba(122,100,255,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Top accent bar */}
          <div style={{ height: 4, background: "linear-gradient(90deg,#7c4dff,#f0c040,#e63946,#4ade80,#60a5fa)", opacity: 0.8 }} />

          {/* Corner ornaments */}
          {[
            { top: 10, left: 10, clip: "polygon(0 0,100% 0,100% 35%,35% 35%,35% 100%,0 100%)" },
            { top: 10, right: 10, clip: "polygon(0 0,100% 0,100% 100%,65% 100%,65% 35%,0 35%)" },
            { bottom: 10, left: 10, clip: "polygon(0 0,35% 0,35% 65%,100% 65%,100% 100%,0 100%)" },
            { bottom: 10, right: 10, clip: "polygon(65% 0,100% 0,100% 100%,0 100%,0 65%,65% 65%)" },
          ].map((c, i) => (
            <div key={i} style={{ position: "absolute", width: 18, height: 18, border: "2px solid #e39f64", opacity: 0.4, pointerEvents: "none", clipPath: c.clip, top: c.top, bottom: c.bottom, left: c.left, right: c.right } as CSSProperties} />
          ))}

          {/* Header: step + skip */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 0" }}>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#3a3e5a" }}>
              {step + 1}/{SLIDES.length}
            </div>
            <button
              onClick={() => { setLeaving(true); setTimeout(() => { localStorage.setItem(ONBOARDING_KEY, "done"); onFinish(); }, 400); }}
              style={{ background: "none", border: "none", fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#3a3e5a", cursor: "pointer", padding: "2px 4px" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#e39f64")}
              onMouseLeave={e => (e.currentTarget.style.color = "#3a3e5a")}
            >
              SKIP ▶▶
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "16px 24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, scrollbarWidth: "none" }}>
            {/* Title */}
            <div key={`title-${animKey}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, animation: slideAnim }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "clamp(10px,2.5vw,14px)", color: "#f0c040", textShadow: "3px 3px 0 #000, 0 0 20px #f0c04066", textAlign: "center", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {slide.title}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "80%" }}>
                <div style={{ flex: 1, height: 1, background: "#e39f6433" }} />
                <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: "#e39f64aa", textAlign: "center" }}>{slide.subtitle}</div>
                <div style={{ flex: 1, height: 1, background: "#e39f6433" }} />
              </div>
            </div>

            {/* Illustration — rendered as a component so hooks work correctly */}
            <div key={`illus-${animKey}`} style={{ animation: slideAnim, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140 }}>
              <Illustration />
            </div>

            {/* Body */}
            <div key={`body-${animKey}`} style={{ fontFamily: "'VT323', monospace", fontSize: "clamp(15px,3vw,18px)", color: "#8090b0", textAlign: "center", lineHeight: 1.6, maxWidth: 340, animation: slideAnim }}>
              {slide.body}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 24px 18px", display: "flex", flexDirection: "column", gap: 12, borderTop: "2px solid #1a1f38" }}>
            <ProgressDots total={SLIDES.length} current={step} />
            <div style={{ display: "flex", gap: 10 }}>
              {step > 0 && (
                <button onClick={goBack} style={{ flex: 1, maxWidth: 120, padding: "10px 0", background: "#1a1f38", border: "2px solid #2a2e4a", color: "#5a6080", fontFamily: "'Press Start 2P', monospace", fontSize: 8, cursor: "pointer", boxShadow: "2px 2px 0 #000" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "#e39f64")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2e4a")}
                >
                  ◀ BACK
                </button>
              )}
              <button onClick={goNext} style={{ flex: 1, padding: "12px 0", background: isLast ? "#7c4dff" : "#1a1f38", border: `2px solid ${isLast ? "#a97dff" : "#e39f64"}`, color: isLast ? "#fff" : "#f0c040", fontFamily: "'Press Start 2P', monospace", fontSize: 9, cursor: "pointer", boxShadow: isLast ? "3px 3px 0 #000, 0 0 14px #7c4dff88" : "3px 3px 0 #000", animation: isLast ? "obBtnPulse 1.8s ease-in-out infinite" : "none", letterSpacing: "0.08em" }}
                onMouseEnter={e => { e.currentTarget.style.background = isLast ? "#9a6dff" : "#252d4a"; }}
                onMouseLeave={e => { e.currentTarget.style.background = isLast ? "#7c4dff" : "#1a1f38"; }}
              >
                {isLast ? "⚔ START ADVENTURE!" : "NEXT ▶"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Hook to control visibility ───────────────────────────────────────────────
export function useOnboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem(ONBOARDING_KEY);
      if (!done) {
        const t = setTimeout(() => setShow(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage not available — skip onboarding
    }
  }, []);

  const finish = useCallback(() => setShow(false), []);
  return { show, finish };
}