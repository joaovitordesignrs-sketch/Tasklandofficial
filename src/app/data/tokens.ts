/**
 * tokens.ts — Single source of truth for all TaskLand design tokens.
 *
 * Import this file instead of writing raw hex / font strings.
 * Every colour, font, spacing and radius used in the app should
 * live here so the whole UI stays visually consistent.
 */

// ── Colors ────────────────────────────────────────────────────────────────────

/** Background surfaces */
export const BG_DEEPEST        = "#0b0d1e"; // Deepest navy — nav, modal, scrollbar
export const BG_CARD            = "#0d1024"; // Card / panel surface
export const BG_PAGE            = "#15182d"; // Page background (PageShell)

/** Borders */
export const BORDER_SUBTLE      = "#1f254f"; // Subtle — card edges, nav border
export const BORDER_ELEVATED    = "#2a2e50"; // Elevated — inputs, inner dividers

/** Primary accent — gold / amber */
export const ACCENT_GOLD        = "#e39f64";
export const ACCENT_SHADOW      = "#b07830"; // Pixel drop-shadow on PixelCard
export const ACCENT_GOLD_DIM    = "rgba(227,159,100,0.18)"; // Active tab bg

/** Semantic */
export const COLOR_DANGER       = "#E63946"; // HP bar, hard difficulty, destructive
export const COLOR_SUCCESS      = "#06FFA5"; // Easy difficulty, gains, checkins
export const COLOR_WARNING      = "#f0c040"; // Medium difficulty, caution
export const COLOR_ORANGE       = "#FF6B35"; // Habits accent, temporal mode, Lendário rank

/** Class colours */
export const COLOR_MAGE         = "#c084fc"; // Mage class, focus mode
export const COLOR_WARRIOR      = "#60a5fa"; // Warrior class, temporal mode
export const COLOR_LEGENDARY    = "#FFD700"; // Legendary rank, collectibles

/** Text scale */
export const TEXT_INACTIVE      = "#3a4060"; // Inactive nav items, locked
export const TEXT_MUTED         = "#5a6080"; // Subtitles, secondary labels
export const TEXT_BODY          = "#94a3b8"; // Body copy, descriptions
export const TEXT_LIGHT         = "#c8d0f0"; // Primary readable text

/** Rank badge colours (matches getRank() in gameEngine.ts) */
export const RANK_NOVATO        = "#8a7a6a";
export const RANK_VETERANO      = "#8a9fba";
export const RANK_GUERREIRO     = ACCENT_GOLD;
export const RANK_RARO          = COLOR_SUCCESS;
export const RANK_MESTRE        = COLOR_WARRIOR;
export const RANK_EPICO         = COLOR_MAGE;
export const RANK_LENDARIO      = COLOR_ORANGE;

// ── Typography ────────────────────────────────────────────────────────────────

export const FONT_PIXEL  = "'Press Start 2P', monospace";
export const FONT_BODY   = "'VT323', monospace";

// ── Font sizes ────────────────────────────────────────────────────────────────
/** Press Start 2P sizes */
export const PX_XL       = 13; // Page title desktop
export const PX_MD       = 10; // Page title mobile / section headers
export const PX_SM       = 9;  // Sub-section headers
export const PX_XS       = 8;  // Labels, Volume slider label
export const PX_2XS      = 7;  // Tab labels, token tags, nav items
export const PX_3XS      = 6;  // Micro-labels, spec-tags
export const PX_4XS      = 5;  // Debug annotations

/** VT323 sizes */
export const VT_2XL      = 24; // Monster names, large stats
export const VT_XL       = 20; // Task names, HP values
export const VT_LG       = 18; // Button text, chip text, badge text
export const VT_MD       = 16; // Difficulty chips, descriptions
export const VT_SM       = 14; // Secondary info, small labels
export const VT_XS       = 13; // Micro info

// ── Spacing ───────────────────────────────────────────────────────────────────
export const SP_XS        = 4;
export const SP_SM        = 8;
export const SP_MD        = 12;
export const SP_LG        = 16;
export const SP_XL        = 20;
export const SP_2XL       = 24;

// ── Border radius ─────────────────────────────────────────────────────────────
export const RADIUS_SM    = 4;
export const RADIUS_MD    = 6;
export const RADIUS_LG    = 8;
export const RADIUS_XL    = 10;
export const RADIUS_PILL  = 20;

// ── Helper: semi-transparent version of any hex colour ───────────────────────
/** Append a 2-char hex opacity suffix. e.g. alpha(COLOR_MAGE, "22") */
export function alpha(color: string, hex2: string): string {
  return color + hex2;
}

// ── Theme token set ───────────────────────────────────────────────────────────

export interface ThemeTokens {
  BG_DEEPEST: string; BG_CARD: string; BG_PAGE: string;
  BORDER_SUBTLE: string; BORDER_ELEVATED: string;
  ACCENT_GOLD: string; ACCENT_SHADOW: string; ACCENT_GOLD_DIM: string;
  COLOR_DANGER: string; COLOR_SUCCESS: string; COLOR_WARNING: string;
  COLOR_ORANGE: string; COLOR_MAGE: string; COLOR_WARRIOR: string;
  COLOR_LEGENDARY: string;
  TEXT_INACTIVE: string; TEXT_MUTED: string; TEXT_BODY: string; TEXT_LIGHT: string;
  RANK_NOVATO: string; RANK_VETERANO: string; RANK_GUERREIRO: string;
  RANK_RARO: string; RANK_MESTRE: string; RANK_EPICO: string; RANK_LENDARIO: string;
  FONT_PIXEL: string; FONT_BODY: string;
  PX_XL: number; PX_MD: number; PX_SM: number; PX_XS: number;
  PX_2XS: number; PX_3XS: number; PX_4XS: number;
  VT_2XL: number; VT_XL: number; VT_LG: number; VT_MD: number;
  VT_SM: number; VT_XS: number;
  SP_XS: number; SP_SM: number; SP_MD: number; SP_LG: number;
  SP_XL: number; SP_2XL: number;
  RADIUS_SM: number; RADIUS_MD: number; RADIUS_LG: number;
  RADIUS_XL: number; RADIUS_PILL: number;
  alpha: (color: string, hex2: string) => string;
}

export const DARK_THEME: ThemeTokens = {
  BG_DEEPEST: "#0b0d1e", BG_CARD: "#0d1024", BG_PAGE: "#15182d",
  BORDER_SUBTLE: "#1f254f", BORDER_ELEVATED: "#2a2e50",
  ACCENT_GOLD: "#e39f64", ACCENT_SHADOW: "#b07830",
  ACCENT_GOLD_DIM: "rgba(227,159,100,0.18)",
  COLOR_DANGER: "#E63946", COLOR_SUCCESS: "#06FFA5",
  COLOR_WARNING: "#f0c040", COLOR_ORANGE: "#FF6B35",
  COLOR_MAGE: "#c084fc", COLOR_WARRIOR: "#60a5fa",
  COLOR_LEGENDARY: "#FFD700",
  TEXT_INACTIVE: "#3a4060", TEXT_MUTED: "#5a6080",
  TEXT_BODY: "#94a3b8", TEXT_LIGHT: "#c8d0f0",
  RANK_NOVATO: "#8a7a6a", RANK_VETERANO: "#8a9fba",
  RANK_GUERREIRO: "#e39f64", RANK_RARO: "#06FFA5",
  RANK_MESTRE: "#60a5fa", RANK_EPICO: "#c084fc",
  RANK_LENDARIO: "#FF6B35",
  FONT_PIXEL: "'Press Start 2P', monospace",
  FONT_BODY: "'VT323', monospace",
  PX_XL: 13, PX_MD: 10, PX_SM: 9, PX_XS: 8,
  PX_2XS: 7, PX_3XS: 6, PX_4XS: 5,
  VT_2XL: 24, VT_XL: 20, VT_LG: 18, VT_MD: 16, VT_SM: 14, VT_XS: 13,
  SP_XS: 4, SP_SM: 8, SP_MD: 12, SP_LG: 16, SP_XL: 20, SP_2XL: 24,
  RADIUS_SM: 4, RADIUS_MD: 6, RADIUS_LG: 8, RADIUS_XL: 10, RADIUS_PILL: 20,
  alpha: (c, h) => c + h,
};

export const LIGHT_THEME: ThemeTokens = {
  BG_DEEPEST: "#dde3f5", BG_CARD: "#edf1fb", BG_PAGE: "#f4f6ff",
  BORDER_SUBTLE: "#b8c2e0", BORDER_ELEVATED: "#c8d0e8",
  ACCENT_GOLD: "#e39f64", ACCENT_SHADOW: "#b07830",
  ACCENT_GOLD_DIM: "rgba(227,159,100,0.18)",
  COLOR_DANGER: "#E63946", COLOR_SUCCESS: "#06C97F",
  COLOR_WARNING: "#d4a017", COLOR_ORANGE: "#FF6B35",
  COLOR_MAGE: "#9b59f0", COLOR_WARRIOR: "#3b82f6",
  COLOR_LEGENDARY: "#b8860b",
  TEXT_INACTIVE: "#9aa5c8", TEXT_MUTED: "#6070a0",
  TEXT_BODY: "#3a4068", TEXT_LIGHT: "#1a1d3a",
  RANK_NOVATO: "#8a7a6a", RANK_VETERANO: "#6a80aa",
  RANK_GUERREIRO: "#b07830", RANK_RARO: "#00a066",
  RANK_MESTRE: "#2563eb", RANK_EPICO: "#7c3aed",
  RANK_LENDARIO: "#c2440d",
  FONT_PIXEL: "'Press Start 2P', monospace",
  FONT_BODY: "'VT323', monospace",
  PX_XL: 13, PX_MD: 10, PX_SM: 9, PX_XS: 8,
  PX_2XS: 7, PX_3XS: 6, PX_4XS: 5,
  VT_2XL: 24, VT_XL: 20, VT_LG: 18, VT_MD: 16, VT_SM: 14, VT_XS: 13,
  SP_XS: 4, SP_SM: 8, SP_MD: 12, SP_LG: 16, SP_XL: 20, SP_2XL: 24,
  RADIUS_SM: 4, RADIUS_MD: 6, RADIUS_LG: 8, RADIUS_XL: 10, RADIUS_PILL: 20,
  alpha: (c, h) => c + h,
};
