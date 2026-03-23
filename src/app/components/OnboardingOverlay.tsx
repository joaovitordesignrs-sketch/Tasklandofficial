import { useState, useEffect, useCallback, useRef, type CSSProperties } from "react";
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import imgAvatarWarrior from '../../assets/profile_pic/profile_pic_warrior.webp';
import imgAvatarMage    from '../../assets/profile_pic/profile_pic_mage.webp';
import { useTheme } from "../contexts/PreferencesContext";
import { COLOR_WARNING as CSS_COLOR_WARNING } from "../data/tokens";

const ONBOARDING_KEY = "rpg_onboarding_v1";

// ─── Rive URLs (same as TaskCharacter / ClassPickerOverlay) ────────────────────
const RIV_URLS = {
  guerreiro: '/taskland_animations_warrior_base.riv',
  mago:      '/taskland_animations_mage_base.riv',
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
  @keyframes obBtnPulse { 0%,100% { box-shadow: 3px 3px 0 #000, 0 0 12px ${CSS_COLOR_WARNING}66 } 50% { box-shadow: 3px 3px 0 #000, 0 0 22px ${CSS_COLOR_WARNING}aa } }
  @keyframes obStarTwinkle { 0%,100% { opacity: 0.1 } 50% { opacity: 0.5 } }
`;

// ─── Decorative pixel star ─────────────────────────────────────────────────────
function PixelStar({ style }: { style: CSSProperties }) {
  const { ACCENT_GOLD } = useTheme();
  return (
    <div
      style={{
        position: "absolute",
        width: 4,
        height: 4,
        background: ACCENT_GOLD,
        boxShadow: `0 0 0 1px ${ACCENT_GOLD}40`,
        ...style,
      }}
    />
  );
}

// ─── Progress dots ─────────────────────────────────────────────────────────────
function ProgressDots({ total, current }: { total: number; current: number }) {
  const { COLOR_WARNING } = useTheme();
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 18 : 8,
            height: 8,
            background: i === current ? COLOR_WARNING : i < current ? "#7c5e28" : "#2a2e4a",
            border: i === current ? `2px solid ${COLOR_WARNING}` : "2px solid #3a3e5a",
            boxShadow: i === current ? `0 0 8px ${COLOR_WARNING}88` : "none",
            transition: "all 0.2s ease",
          }}
        />
      ))}
    </div>
  );
}

// ─── Slide illustrations ──────────────────────────────────────────────────────

function MonsterSlide() {
  const { FONT_PIXEL, FONT_BODY, PX_2XS, COLOR_DANGER, COLOR_WARNING } = useTheme();
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 2), 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {/* HP bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: COLOR_DANGER }}>HP</span>
        <div style={{ width: 120, height: 12, background: "#1a1f38", border: "2px solid #3a3e5a", position: "relative", overflow: "hidden" }}>
          <div style={{ width: "65%", height: "100%", background: COLOR_DANGER, boxShadow: `0 0 6px ${COLOR_DANGER}aa` }} />
        </div>
        <span style={{ fontFamily: FONT_BODY, fontSize: 14, color: COLOR_DANGER }}>65%</span>
      </div>

      {/* Battle scene: character vs monster */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4 }}>
        {/* Warrior Rive */}
        <OnboardingChar charClass="guerreiro" size={110} />

        {/* VS */}
        <div style={{ fontFamily: FONT_PIXEL, fontSize: 9, color: COLOR_WARNING, textShadow: "2px 2px 0 #000", paddingBottom: 16, flexShrink: 0 }}>
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
          <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: "#a97dff", marginTop: 2 }}>SLIME</div>
        </div>
      </div>
    </div>
  );
}

function XPSlide() {
  const { FONT_PIXEL, FONT_BODY, COLOR_WARNING, COLOR_WARRIOR } = useTheme();
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
        <div style={{ fontFamily: FONT_PIXEL, fontSize: 8, background: COLOR_WARNING, color: "#000", padding: "3px 7px", border: "2px solid #c8960a", boxShadow: "2px 2px 0 #000" }}>LV 7</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 16, color: "#7dd3fc" }}>→</div>
        <div style={{ fontFamily: FONT_PIXEL, fontSize: 8, background: COLOR_WARNING, color: "#000", padding: "3px 7px", border: "2px solid #c8960a", boxShadow: "2px 2px 0 #000", animation: "obLvPop 0.4s ease 0.9s both" }}>LV 8 ✦</div>
      </div>

      <div style={{ width: 180, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: FONT_PIXEL, fontSize: 6, color: COLOR_WARRIOR }}>XP</span>
          <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR_WARRIOR }}>{xpFill}%</span>
        </div>
        <div style={{ height: 14, background: "#1a1f38", border: "2px solid #3a3e5a", overflow: "hidden" }}>
          <div style={{ width: `${xpFill}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #60a5fa)", boxShadow: "0 0 8px #60a5faaa", transition: "width 0.8s cubic-bezier(.22,.68,0,1.15)" }} />
        </div>
      </div>
    </div>
  );
}

function HabitsSlide() {
  const { FONT_PIXEL, FONT_BODY, PX_2XS, COLOR_WARNING, TEXT_LIGHT, TEXT_MUTED, BG_CARD } = useTheme();
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
            <div style={{ fontFamily: FONT_PIXEL, fontSize: 8, color: COLOR_WARNING, textShadow: "1px 1px 0 #000" }}>×{i + 1}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5, width: 220 }}>
        {habits.map((h, i) => (
          <div key={h.name} style={{ display: "flex", alignItems: "center", gap: 8, background: BG_CARD, border: "2px solid #2a2e4a", padding: "5px 8px", animation: `obFriendIn 0.3s ease ${i * 0.1}s both` }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 20, color: COLOR_WARNING }}>🔥{h.streak}</div>
            <div style={{ flex: 1, fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: TEXT_LIGHT }}>{h.name}</div>
            <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: "#4ade80" }}>{h.bonus}</div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: TEXT_MUTED, textAlign: "center", maxWidth: 220 }}>
        Keep your <span style={{ color: COLOR_WARNING }}>streak</span> to multiply your damage!
      </div>
    </div>
  );
}

function RankSlide() {
  const { FONT_PIXEL, FONT_BODY, PX_2XS, COLOR_WARNING, TEXT_MUTED, BG_CARD } = useTheme();
  const ranks = [
    { label: "F",  color: "#6b7280", bg: "#1f2937" },
    { label: "E",  color: "#84cc16", bg: "#1a2e05" },
    { label: "D",  color: "#22d3ee", bg: "#0a2535" },
    { label: "C",  color: "#a78bfa", bg: "#1e1b4b" },
    { label: "B",  color: COLOR_WARRIOR, bg: "#0f1f4a" },
    { label: "A",  color: "#fb923c", bg: "#2a1500" },
    { label: "S",  color: COLOR_WARNING, bg: "#2a1f00" },
    { label: "S+", color: COLOR_WARNING, bg: "#2a1f00" },
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
            fontFamily: FONT_PIXEL,
            fontSize: r.label === "S+" ? 9 : 12,
            color: r.color,
            textShadow: i >= 5 ? `0 0 8px ${r.color}` : "2px 2px 0 #000",
            animation: `obBadgePop 0.3s ease ${i * 0.08}s both`,
          }}>
            {r.label}
          </div>
        ))}
      </div>
      <div style={{ background: BG_CARD, border: "2px solid #2a2e4a", padding: "8px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: TEXT_MUTED }}>POWER = MH × MN × MC × MR</div>
        <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: COLOR_WARNING }}>Power = floor(75 × Total)</div>
      </div>
    </div>
  );
}

function FriendsSlide() {
  const { FONT_PIXEL, FONT_BODY, PX_2XS, COLOR_WARNING, COLOR_WARRIOR, COLOR_MAGE, TEXT_LIGHT, TEXT_MUTED, BG_CARD } = useTheme();
  const friends = [
    { name: "ARIA", rank: "S", rankColor: COLOR_WARNING, cp: 840, rankBg: "#2a1f00", isYou: false },
    { name: "KAEL", rank: "B", rankColor: COLOR_WARRIOR, cp: 312, rankBg: "#0f1f4a", isYou: false },
    { name: "YOU",  rank: "C", rankColor: "#a78bfa", cp: 190, rankBg: "#1e1b4b", isYou: true  },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 240 }}>
        {friends.map((f, i) => (
          <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 8, background: f.isYou ? "#1a1f38" : BG_CARD, border: f.isYou ? `2px solid ${COLOR_MAGE}` : "2px solid #2a2e4a", boxShadow: f.isYou ? `0 0 8px ${COLOR_MAGE}44` : "none", padding: "6px 10px", animation: `obFriendIn 0.4s ease ${i * 0.12}s both` }}>
            <div style={{ width: 28, height: 28, background: f.rankBg, border: `2px solid ${f.rankColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_PIXEL, fontSize: 8, color: f.rankColor, flexShrink: 0 }}>{f.rank}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: f.isYou ? COLOR_MAGE : TEXT_LIGHT }}>{f.name} {f.isYou ? "◀" : ""}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: TEXT_MUTED, marginTop: 2 }}>POWER {f.cp}</div>
            </div>
            <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: TEXT_MUTED }}>#{i + 1}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 15, color: TEXT_MUTED, textAlign: "center", maxWidth: 220 }}>
        Go to <span style={{ color: COLOR_MAGE }}>Friends</span> in the menu and search by nick
      </div>
    </div>
  );
}

function FinalSlide() {
  const { FONT_PIXEL, FONT_BODY, COLOR_WARNING, TEXT_BODY } = useTheme();
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

      <div style={{ fontFamily: FONT_PIXEL, fontSize: "clamp(9px, 2vw, 13px)", color: COLOR_WARNING, textShadow: glow ? `2px 2px 0 #000, 0 0 20px ${COLOR_WARNING}88` : "2px 2px 0 #000", textAlign: "center", lineHeight: 1.8, transition: "text-shadow 0.6s ease" }}>
        YOUR ADVENTURE{"\n"}STARTS NOW!
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 16, color: TEXT_BODY, textAlign: "center", maxWidth: 240, lineHeight: 1.5 }}>
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
  const { BG_CARD, BORDER_ELEVATED, BORDER_SUBTLE, TEXT_MUTED, TEXT_INACTIVE, TEXT_BODY, TEXT_LIGHT, ACCENT_GOLD, COLOR_DANGER, COLOR_WARNING, COLOR_MAGE, COLOR_LEGENDARY, alpha, BG_DEEPEST, FONT_PIXEL, FONT_BODY, PX_2XS } = useTheme();
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
          background: alpha(BG_DEEPEST, "eb"),
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
          background: BG_CARD, border: `3px solid ${BORDER_ELEVATED}`,
          boxShadow: "6px 6px 0 #000, 0 0 40px rgba(122,100,255,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Top accent bar */}
          <div style={{ height: 4, background: `linear-gradient(90deg,#7c4dff,${COLOR_WARNING},${COLOR_DANGER},#4ade80,#60a5fa)`, opacity: 0.8 }} />

          {/* Corner ornaments */}
          {[
            { top: 10, left: 10, clip: "polygon(0 0,100% 0,100% 35%,35% 35%,35% 100%,0 100%)" },
            { top: 10, right: 10, clip: "polygon(0 0,100% 0,100% 100%,65% 100%,65% 35%,0 35%)" },
            { bottom: 10, left: 10, clip: "polygon(0 0,35% 0,35% 65%,100% 65%,100% 100%,0 100%)" },
            { bottom: 10, right: 10, clip: "polygon(65% 0,100% 0,100% 100%,0 100%,0 65%,65% 65%)" },
          ].map((c, i) => (
            <div key={i} style={{ position: "absolute", width: 18, height: 18, border: `2px solid ${ACCENT_GOLD}`, opacity: 0.4, pointerEvents: "none", clipPath: c.clip, top: c.top, bottom: c.bottom, left: c.left, right: c.right } as CSSProperties} />
          ))}

          {/* Header: step + skip */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 0" }}>
            <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: TEXT_INACTIVE }}>
              {step + 1}/{SLIDES.length}
            </div>
            <button
              onClick={() => { setLeaving(true); setTimeout(() => { localStorage.setItem(ONBOARDING_KEY, "done"); onFinish(); }, 400); }}
              style={{ background: "none", border: "none", fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: TEXT_INACTIVE, cursor: "pointer", padding: "2px 4px" }}
              onMouseEnter={e => (e.currentTarget.style.color = ACCENT_GOLD)}
              onMouseLeave={e => (e.currentTarget.style.color = TEXT_INACTIVE)}
            >
              SKIP ▶▶
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "16px 24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, scrollbarWidth: "none" }}>
            {/* Title */}
            <div key={`title-${animKey}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, animation: slideAnim }}>
              <div style={{ fontFamily: FONT_PIXEL, fontSize: "clamp(10px,2.5vw,14px)", color: COLOR_WARNING, textShadow: `3px 3px 0 #000, 0 0 20px ${COLOR_WARNING}66`, textAlign: "center", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {slide.title}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "80%" }}>
                <div style={{ flex: 1, height: 1, background: `${ACCENT_GOLD}33` }} />
                <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: `${ACCENT_GOLD}aa`, textAlign: "center" }}>{slide.subtitle}</div>
                <div style={{ flex: 1, height: 1, background: `${ACCENT_GOLD}33` }} />
              </div>
            </div>

            {/* Illustration — rendered as a component so hooks work correctly */}
            <div key={`illus-${animKey}`} style={{ animation: slideAnim, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140 }}>
              <Illustration />
            </div>

            {/* Body */}
            <div key={`body-${animKey}`} style={{ fontFamily: FONT_BODY, fontSize: "clamp(15px,3vw,18px)", color: TEXT_BODY, textAlign: "center", lineHeight: 1.6, maxWidth: 340, animation: slideAnim }}>
              {slide.body}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 24px 18px", display: "flex", flexDirection: "column", gap: 12, borderTop: `2px solid ${BORDER_SUBTLE}` }}>
            <ProgressDots total={SLIDES.length} current={step} />
            <div style={{ display: "flex", gap: 10 }}>
              {step > 0 && (
                <button onClick={goBack} style={{ flex: 1, maxWidth: 120, padding: "10px 0", background: BG_CARD, border: `2px solid ${BORDER_ELEVATED}`, color: TEXT_MUTED, fontFamily: FONT_PIXEL, fontSize: 8, cursor: "pointer", boxShadow: "2px 2px 0 rgba(0,0,0,0.15)" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = ACCENT_GOLD)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER_ELEVATED)}
                >
                  ◀ BACK
                </button>
              )}
              <button onClick={goNext} style={{ flex: 1, padding: "12px 0", background: isLast ? COLOR_MAGE : BG_CARD, border: `2px solid ${isLast ? alpha(COLOR_MAGE, "cc") : ACCENT_GOLD}`, color: isLast ? TEXT_LIGHT : COLOR_WARNING, fontFamily: FONT_PIXEL, fontSize: 9, cursor: "pointer", boxShadow: isLast ? `3px 3px 0 rgba(0,0,0,0.2), 0 0 14px ${alpha(COLOR_MAGE, "88")}` : "3px 3px 0 rgba(0,0,0,0.15)", animation: isLast ? "obBtnPulse 1.8s ease-in-out infinite" : "none", letterSpacing: "0.08em" }}
                onMouseEnter={e => { e.currentTarget.style.background = isLast ? alpha(COLOR_MAGE, "dd") : BORDER_ELEVATED; }}
                onMouseLeave={e => { e.currentTarget.style.background = isLast ? COLOR_MAGE : BG_CARD; }}
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

// ═══════════════════════════════════════════════════════════════════════════════
// SPOTLIGHT ONBOARDING — 5-step tutorial using data-onboarding attributes
// ═══════════════════════════════════════════════════════════════════════════════

const SPOTLIGHT_KEY = "onboarding_complete";

interface SpotlightStep {
  target: string; // data-onboarding value
  title: string;
  text: string;
}

const SPOTLIGHT_STEPS: SpotlightStep[] = [
  {
    target: "monster-area",
    title: "YOUR ENEMY",
    text: "This is your enemy. Defeat it by completing tasks!",
  },
  {
    target: "add-task-btn",
    title: "CREATE TASKS",
    text: "Create a task. Each task deals damage to the monster when completed. Hard tasks deal more damage than Easy ones.",
  },
  {
    target: "power-badge",
    title: "YOUR POWER",
    text: "Your Power determines how much damage you deal. Increase it with habits, items, and leveling up.",
  },
  {
    target: "challenge-panel",
    title: "TEMPORAL CHALLENGE",
    text: "Activate the Temporal Challenge to complete tasks with a timer — damage is multiplied!",
  },
  {
    target: "bottom-nav",
    title: "EXPLORE",
    text: "Explore Habits, Achievements, and the Shop to evolve your character.",
  },
];

export function useSpotlightOnboarding() {
  const [show, setShow] = useState(() => {
    try { return !localStorage.getItem(SPOTLIGHT_KEY); } catch { return false; }
  });

  const finish = useCallback(() => {
    try { localStorage.setItem(SPOTLIGHT_KEY, "1"); } catch {}
    setShow(false);
  }, []);

  return { show, finish };
}

interface SpotlightOnboardingProps {
  onFinish: () => void;
}

export function SpotlightOnboarding({ onFinish }: SpotlightOnboardingProps) {
  const { FONT_PIXEL, FONT_BODY, ACCENT_GOLD, BG_DEEPEST, TEXT_MUTED, BORDER_ELEVATED } = useTheme();
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const target = document.querySelector(`[data-onboarding="${SPOTLIGHT_STEPS[step].target}"]`);
    if (target) {
      const r = target.getBoundingClientRect();
      setRect(r);
      rectRef.current = r;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setRect(null);
      rectRef.current = null;
    }
  }, [step]);

  const next = useCallback(() => {
    if (step < SPOTLIGHT_STEPS.length - 1) setStep(s => s + 1);
    else onFinish();
  }, [step, onFinish]);

  const current = SPOTLIGHT_STEPS[step];
  const isLast = step === SPOTLIGHT_STEPS.length - 1;

  // Position tooltip: above or below the spotlight area
  const tooltipBelow = rect ? rect.bottom < window.innerHeight * 0.6 : false;
  const tooltipTop = rect
    ? tooltipBelow
      ? rect.bottom + 16
      : Math.max(20, rect.top - 180)
    : 80;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000 }}>
      {/* Dark overlay with cutout */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - 8}
                y={rect.top - 8}
                width={rect.width + 16}
                height={rect.height + 16}
                rx={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.78)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight dashed border */}
      {rect && (
        <div style={{
          position: "absolute",
          left: rect.left - 8,
          top: rect.top - 8,
          width: rect.width + 16,
          height: rect.height + 16,
          border: `2px dashed ${ACCENT_GOLD}`,
          borderRadius: 12,
          pointerEvents: "none",
          boxShadow: `0 0 20px ${ACCENT_GOLD}44`,
        }} />
      )}

      {/* Tooltip card */}
      <div style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: tooltipTop,
        width: "calc(100% - 40px)",
        maxWidth: 380,
        background: BG_DEEPEST,
        border: `1px solid ${ACCENT_GOLD}66`,
        borderTop: `3px solid ${ACCENT_GOLD}`,
        borderRadius: 10,
        padding: "20px 24px",
        zIndex: 10001,
        boxSizing: "border-box" as const,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontFamily: FONT_PIXEL, fontSize: 10, color: ACCENT_GOLD, letterSpacing: 1 }}>
            {current.title}
          </span>
          <span style={{ fontFamily: FONT_BODY, fontSize: 14, color: TEXT_MUTED, marginLeft: "auto" }}>
            {step + 1}/{SPOTLIGHT_STEPS.length}
          </span>
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 18, color: "#c8d0f0", lineHeight: 1.4, marginBottom: 20 }}>
          {current.text}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onFinish}
            style={{
              background: "transparent", border: `1px solid ${BORDER_ELEVATED}`,
              color: TEXT_MUTED, fontFamily: FONT_BODY, fontSize: 16,
              padding: "8px 16px", borderRadius: 6, cursor: "pointer",
            }}
          >
            Skip tutorial
          </button>
          <button
            onClick={next}
            style={{
              background: ACCENT_GOLD, border: "none",
              color: BG_DEEPEST, fontFamily: FONT_PIXEL, fontSize: 9,
              padding: "8px 20px", borderRadius: 6, cursor: "pointer",
              letterSpacing: 0.5,
            }}
          >
            {isLast ? "START!" : "NEXT →"}
          </button>
        </div>
      </div>
    </div>
  );
}