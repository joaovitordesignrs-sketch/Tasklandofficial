/**
 * PixelIcon — central Lucide icon resolver for the RPG app.
 * Maps string keys (and legacy emoji strings) to Lucide components.
 * Use this everywhere instead of raw emojis so the whole app stays
 * visually consistent with the pixel-art Lucide icon language.
 */
import React from "react";
import {
  Timer, Skull, Trophy, Star, Medal, RotateCcw, Brain, Swords,
  Shield, Volume2, User, Map, Gem, Coins, Castle, Flame, Droplets,
  BookOpen, Dumbbell, Apple, Moon, PenLine, Target, Music, Leaf,
  Hourglass, Pencil, Sword, Sprout, CalendarDays, Zap, Wand2,
  Award, Sparkles, Crown, Lock, Check, Heart, Coffee, Wind, Scroll,
  Activity, Sun, Lightbulb, type LucideIcon,
} from "lucide-react";

// ── Icon registry ──────────────────────────────────────────────────────────────
const ICON_REGISTRY: Record<string, LucideIcon> = {
  timer:           Timer,
  skull:           Skull,
  trophy:          Trophy,
  star:            Star,
  medal:           Medal,
  "rotate-ccw":    RotateCcw,
  brain:           Brain,
  swords:          Swords,
  shield:          Shield,
  volume2:         Volume2,
  user:            User,
  map:             Map,
  gem:             Gem,
  coins:           Coins,
  castle:          Castle,
  flame:           Flame,
  droplets:        Droplets,
  "book-open":     BookOpen,
  dumbbell:        Dumbbell,
  apple:           Apple,
  moon:            Moon,
  "pen-line":      PenLine,
  target:          Target,
  music:           Music,
  leaf:            Leaf,
  hourglass:       Hourglass,
  pencil:          Pencil,
  sword:           Sword,
  sprout:          Sprout,
  "calendar-days": CalendarDays,
  zap:             Zap,
  wand2:           Wand2,
  award:           Award,
  sparkles:        Sparkles,
  crown:           Crown,
  lock:            Lock,
  check:           Check,
  heart:           Heart,
  coffee:          Coffee,
  wind:            Wind,
  scroll:          Scroll,
  activity:        Activity,
  sun:             Sun,
  lightbulb:       Lightbulb,
};

// ── Emoji → icon-key mapping (backward compat for localStorage habits) ─────────
export const EMOJI_TO_ICON_KEY: Record<string, string> = {
  // Habit icons
  "💧": "droplets",
  "🏃": "dumbbell",
  "📚": "book-open",
  "🧘": "moon",
  "💪": "dumbbell",
  "🍎": "apple",
  "😴": "moon",
  "✍️": "pen-line",
  "🎯": "target",
  "🧠": "brain",
  "🎵": "music",
  "🌿": "leaf",
  // Attack / combat banners
  "⏱️": "timer",
  "⚡": "zap",
  "⚔️": "swords",
  "���": "zap",
  "✨": "sparkles",
  // Achievement icons
  "💀": "skull",
  "🔥": "flame",
  "🌱": "sprout",
  "📅": "calendar-days",
  "👊": "zap",
  "✏️": "pencil",
  "🗡️": "sword",
  "⭐": "star",
  "⏳": "hourglass",
  // UI
  "🏆": "trophy",
  "🏅": "medal",
  "🔄": "rotate-ccw",
  "🏰": "castle",
  "🗺️": "map",
  "💎": "gem",
  "💰": "coins",
  "👤": "user",
  "🛡️": "shield",
  "🔊": "volume2",
  "🔮": "wand2",
  "🐉": "flame",
};

// ── Habit icon categories ──────────────────────────────────────────────────────
export const HABIT_ICON_CATEGORIES: {
  key: string;
  label: string;
  color: string;
  tabIcon: string;
  icons: string[];
}[] = [
  {
    key:     "saude",
    label:   "SAÚDE",
    color:   "#FF6B35",
    tabIcon: "heart",
    icons:   ["heart", "dumbbell", "apple", "flame", "shield", "activity"],
  },
  {
    key:     "hidratacao",
    label:   "HIDRATAÇÃO",
    color:   "#22D3EE",
    tabIcon: "droplets",
    icons:   ["droplets", "leaf", "sprout", "coffee", "wind"],
  },
  {
    key:     "mindfulness",
    label:   "MINDFULNESS",
    color:   "#c084fc",
    tabIcon: "brain",
    icons:   ["brain", "moon", "sun", "sparkles", "wand2", "star"],
  },
  {
    key:     "leitura",
    label:   "LEITURA",
    color:   "#FFD700",
    tabIcon: "book-open",
    icons:   ["book-open", "scroll", "pen-line", "pencil", "music"],
  },
  {
    key:     "progresso",
    label:   "PROGRESSO",
    color:   "#06FFA5",
    tabIcon: "zap",
    icons:   ["zap", "target", "timer", "calendar-days", "lightbulb", "trophy"],
  },
];

// Flat list kept for backward compat
export const HABIT_ICON_EMOJIS = [
  "💧", "🏃", "📚", "🧘", "💪", "🍎", "😴", "✍️", "🎯", "🧠", "🎵", "🌿",
];

// ── PixelIcon component ────────────────────────────────────────────────────────
/**
 * Renders a named Lucide icon.
 * Accepts a Lucide key ("timer", "skull") or an emoji string ("⏱️", "💀").
 */
export function PixelIcon({
  name,
  size = 16,
  color = "currentColor",
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  // Direct key lookup
  const Direct = ICON_REGISTRY[name];
  if (Direct) return <Direct size={size} color={color} />;

  // Emoji → key lookup
  const key = EMOJI_TO_ICON_KEY[name];
  const Mapped = key ? ICON_REGISTRY[key] : null;
  if (Mapped) return <Mapped size={size} color={color} />;

  // Fallback: render raw string
  return <span style={{ fontSize: size * 0.85, lineHeight: 1 }}>{name}</span>;
}

/** Renders a habit icon (emoji or key) — same as PixelIcon, named for clarity */
export function HabitIcon({
  icon,
  size = 20,
  color,
}: {
  icon: string;
  size?: number;
  color?: string;
}) {
  return <PixelIcon name={icon} size={size} color={color} />;
}