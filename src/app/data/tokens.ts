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
