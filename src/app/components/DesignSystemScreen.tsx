/**
 * DesignSystemScreen — Design Kit completo do TaskLand
 * Rota: /design_system
 *
 * Organizado por Design Atômico:
 *   Tokens → Atoms → Molecules → Organisms
 *
 * Cada componente está em um frame separado com:
 *  - Nome do componente
 *  - States anotados individualmente
 *  - Tokens utilizados (nome + valor + onde foi usado)
 *  - Padding interno e font-size indicados
 */

import React, { useState } from "react";
import {
  Palette, Atom, Layers, Box,
  Swords, Flame, Trophy, Star, Shield, Brain,
  Timer, Gem, Skull, RotateCcw, Award, Zap,
  Check, Heart, User, Map, Sparkles, Crown,
} from "lucide-react";
import { PageShell } from "./ui/PageShell";
import {
  BG_DEEPEST, BG_CARD, BG_PAGE, BORDER_SUBTLE, BORDER_ELEVATED,
  ACCENT_GOLD, ACCENT_SHADOW, ACCENT_GOLD_DIM,
  COLOR_DANGER, COLOR_SUCCESS, COLOR_WARNING, COLOR_ORANGE,
  COLOR_MAGE, COLOR_WARRIOR, COLOR_LEGENDARY,
  TEXT_INACTIVE, TEXT_MUTED, TEXT_BODY, TEXT_LIGHT,
  RANK_NOVATO, RANK_VETERANO, RANK_GUERREIRO, RANK_RARO,
  RANK_MESTRE, RANK_EPICO, RANK_LENDARIO,
  FONT_PIXEL, FONT_BODY,
} from "../data/tokens";

// ─── Token alias for showcase (maps token exports → T.* shorthand) ────────────
const T = {
  bgDeepest:      BG_DEEPEST,
  bgCard:         BG_CARD,
  bgPage:         BG_PAGE,
  borderSubtle:   BORDER_SUBTLE,
  borderElevated: BORDER_ELEVATED,
  accentGold:     ACCENT_GOLD,
  accentShadow:   ACCENT_SHADOW,
  accentGoldDim:  ACCENT_GOLD_DIM,
  danger:         COLOR_DANGER,
  dangerDim:      "rgba(230,57,70,0.18)",
  success:        COLOR_SUCCESS,
  successDim:     "rgba(6,255,165,0.15)",
  warning:        COLOR_WARNING,
  warningDim:     "rgba(240,192,64,0.15)",
  mage:           COLOR_MAGE,
  warrior:        COLOR_WARRIOR,
  legendary:      COLOR_LEGENDARY,
  orange:         COLOR_ORANGE,
  textInactive:   TEXT_INACTIVE,
  textMuted:      TEXT_MUTED,
  textBody:       TEXT_BODY,
  textLight:      TEXT_LIGHT,
  rankNovato:     RANK_NOVATO,
  rankVeterano:   RANK_VETERANO,
  rankGuerreiro:  RANK_GUERREIRO,
  rankRaro:       RANK_RARO,
  rankMestre:     RANK_MESTRE,
  rankEpico:      RANK_EPICO,
  rankLendario:   RANK_LENDARIO,
};

// FONT_PIXEL and FONT_BODY are now imported from tokens.ts above

// ─── Shared helpers ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: FONT_PIXEL, fontSize: 9, color: T.accentGold,
      letterSpacing: 1, textShadow: "2px 2px 0 #000",
      margin: "0 0 16px 0", paddingBottom: 8,
      borderBottom: `2px solid ${T.borderElevated}`,
    }}>
      {children}
    </h2>
  );
}

/** Coloured pill that labels a design token */
function TokenTag({
  name, value, color = T.accentGold, where,
}: { name: string; value: string; color?: string; where?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: color + "18", border: `1px solid ${color}55`,
        borderRadius: 4, padding: "2px 8px",
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: value, border: "1px solid #ffffff33", flexShrink: 0,
        }} />
        <span style={{ fontFamily: FONT_PIXEL, fontSize: 6, color: color }}>{name}</span>
        <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: T.textMuted }}>{value}</span>
      </div>
      {where && (
        <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: T.textMuted, paddingLeft: 8 }}>
          ↳ {where}
        </span>
      )}
    </div>
  );
}

/** Non-colour spec pill (padding, font-size, border-radius…) */
function SpecTag({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: T.borderSubtle + "88", border: `1px solid ${T.borderElevated}`,
      borderRadius: 4, padding: "2px 8px",
    }}>
      <span style={{ fontFamily: FONT_PIXEL, fontSize: 5, color: T.textMuted }}>{label}</span>
      <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: T.textLight }}>{value}</span>
    </div>
  );
}

/** A state label (Default / Hover / Active / Disabled…) */
function StateLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FONT_PIXEL, fontSize: 6, color: T.textMuted,
      textTransform: "uppercase", letterSpacing: 0.5,
      marginBottom: 8, textAlign: "center",
    }}>
      {children}
    </div>
  );
}

/** Frame wrapper for a single component showcase */
function ComponentFrame({
  name, tokens, specs, children, wide,
}: {
  name: string;
  tokens?: React.ReactNode;
  specs?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div style={{
      background: T.bgCard,
      border: `1px solid ${T.borderSubtle}`,
      borderTop: `3px solid ${T.accentGold}`,
      borderRadius: 10, overflow: "hidden",
      display: "flex", flexDirection: "column",
      width: wide ? "100%" : undefined,
    }}>
      {/* Header */}
      <div style={{
        background: T.bgDeepest, padding: "8px 14px",
        borderBottom: `1px solid ${T.borderSubtle}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontFamily: FONT_PIXEL, fontSize: 7, color: T.accentGold, letterSpacing: 0.5 }}>
          {name}
        </span>
      </div>

      {/* Preview area */}
      <div style={{
        padding: 20, display: "flex", flexWrap: "wrap",
        gap: 16, alignItems: "flex-start",
      }}>
        {children}
      </div>

      {/* Specs + tokens footer */}
      {(specs || tokens) && (
        <div style={{
          borderTop: `1px solid ${T.borderSubtle}`,
          padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8,
          background: T.bgDeepest + "88",
        }}>
          {specs && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{specs}</div>
          )}
          {tokens && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{tokens}</div>
          )}
        </div>
      )}
    </div>
  );
}

/** State sub-frame */
function StateFrame({ label, children, bg }: { label: string; children: React.ReactNode; bg?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <StateLabel>{label}</StateLabel>
      <div style={{
        background: bg ?? T.bgPage,
        border: `1px dashed ${T.borderElevated}`,
        borderRadius: 8, padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "center",
        minWidth: 90,
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── TAB: TOKENS ─────────────────────────────────────────────────────────────

const COLOR_TOKENS = [
  // Backgrounds
  { group: "Background",   name: "--rpg-bg-deepest",      value: T.bgDeepest,      usage: "Nav, modal bg, darkest surface" },
  { group: "Background",   name: "--rpg-bg-card",         value: T.bgCard,         usage: "Cards, drawers, panels" },
  { group: "Background",   name: "--rpg-bg-page",         value: T.bgPage,         usage: "Page background, PageShell" },
  // Borders
  { group: "Border",       name: "--rpg-border-subtle",   value: T.borderSubtle,   usage: "Card borders, nav border" },
  { group: "Border",       name: "--rpg-border-elevated", value: T.borderElevated, usage: "Inputs, elevated surfaces" },
  // Accent
  { group: "Accent",       name: "--rpg-accent-gold",     value: T.accentGold,     usage: "Primary accent, active states, CTA" },
  { group: "Accent",       name: "--rpg-accent-shadow",   value: T.accentShadow,   usage: "Pixel drop-shadow on cards" },
  // Semantic
  { group: "Semantic",     name: "--rpg-danger",          value: T.danger,         usage: "HP bar, hard difficulty, destructive" },
  { group: "Semantic",     name: "--rpg-success",         value: T.success,        usage: "Easy difficulty, gains" },
  { group: "Semantic",     name: "--rpg-warning",         value: T.warning,        usage: "Medium difficulty, caution" },
  // Class
  { group: "Class",        name: "--rpg-mage",            value: T.mage,           usage: "Mage class, focus mode" },
  { group: "Class",        name: "--rpg-warrior",         value: T.warrior,        usage: "Warrior class, temporal mode" },
  { group: "Class",        name: "--rpg-legendary",       value: T.legendary,      usage: "Legendary rank, gold collectibles" },
  { group: "Class",        name: "--rpg-orange",          value: T.orange,         usage: "Lendário rank, temporal banner" },
  // Text
  { group: "Text",         name: "--rpg-text-inactive",   value: T.textInactive,   usage: "Inactive nav items, dimmed" },
  { group: "Text",         name: "--rpg-text-muted",      value: T.textMuted,      usage: "Subtitles, secondary labels" },
  { group: "Text",         name: "--rpg-text-body",       value: T.textBody,       usage: "Body copy, descriptions" },
  { group: "Text",         name: "--rpg-text-light",      value: T.textLight,      usage: "Primary readable text" },
];

const TYPOGRAPHY_TOKENS = [
  { name: "Pixel Heading XL", font: FONT_PIXEL, size: "13px", weight: "400", usage: "Page titles (desktop)" },
  { name: "Pixel Heading MD", font: FONT_PIXEL, size: "10px", weight: "400", usage: "Page titles (mobile), headers" },
  { name: "Pixel Label",      font: FONT_PIXEL, size: "7px",  weight: "400", usage: "Tab labels, nav items" },
  { name: "Pixel XS",         font: FONT_PIXEL, size: "6px",  weight: "400", usage: "Token tags, micro-labels" },
  { name: "Pixel Nano",       font: FONT_PIXEL, size: "5px",  weight: "400", usage: "Debug annotations" },
  { name: "Body XL",          font: FONT_BODY,  size: "24px", weight: "400", usage: "Monster names, large stats" },
  { name: "Body LG",          font: FONT_BODY,  size: "20px", weight: "400", usage: "Task names, HP values" },
  { name: "Body MD",          font: FONT_BODY,  size: "16px", weight: "400", usage: "Buttons, difficulty chips" },
  { name: "Body SM",          font: FONT_BODY,  size: "14px", weight: "400", usage: "Descriptions, secondary info" },
];

function TokensTab() {
  const groups = [...new Set(COLOR_TOKENS.map(t => t.group))];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Color tokens */}
      <div>
        <SectionTitle>🎨 COLOR TOKENS</SectionTitle>
        {groups.map(group => (
          <div key={group} style={{ marginBottom: 20 }}>
            <div style={{
              fontFamily: FONT_PIXEL, fontSize: 7, color: T.textMuted,
              marginBottom: 10, textTransform: "uppercase", letterSpacing: 1,
            }}>
              {group}
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 8,
            }}>
              {COLOR_TOKENS.filter(t => t.group === group).map(token => (
                <div key={token.name} style={{
                  background: T.bgCard, border: `1px solid ${T.borderSubtle}`,
                  borderRadius: 8, overflow: "hidden", display: "flex",
                }}>
                  {/* Color swatch */}
                  <div style={{
                    width: 48, flexShrink: 0,
                    background: token.value,
                    borderRight: `1px solid ${T.borderSubtle}`,
                  }} />
                  {/* Info */}
                  <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontFamily: FONT_PIXEL, fontSize: 6, color: T.accentGold, letterSpacing: 0.3 }}>
                      {token.name}
                    </span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: 14, color: T.textLight }}>
                      {token.value}
                    </span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: T.textMuted }}>
                      {token.usage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Typography */}
      <div>
        <SectionTitle>✏️ TYPOGRAPHY TOKENS</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TYPOGRAPHY_TOKENS.map(t => (
            <div key={t.name} style={{
              background: T.bgCard, border: `1px solid ${T.borderSubtle}`,
              borderRadius: 8, padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            }}>
              {/* Live preview */}
              <div style={{
                fontFamily: t.font, fontSize: t.size, color: T.textLight,
                minWidth: 160, flexShrink: 0,
              }}>
                TaskLand
              </div>
              {/* Specs */}
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontFamily: FONT_PIXEL, fontSize: 6, color: T.accentGold }}>{t.name}</span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <SpecTag label="font" value={t.font.split(",")[0].replace(/'/g, "")} />
                  <SpecTag label="size" value={t.size} />
                  <SpecTag label="weight" value={t.weight} />
                </div>
                <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: T.textMuted }}>{t.usage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div>
        <SectionTitle>📐 SPACING SCALE</SectionTitle>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          {[4, 8, 12, 16, 20, 24, 32, 48].map(size => (
            <div key={size} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: size, height: size,
                background: T.accentGold + "55",
                border: `1px solid ${T.accentGold}`,
              }} />
              <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: T.textMuted }}>{size}px</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB: ATOMS ──────────────────────────────────────────────────────────────

/** RPG primary button */
function RpgButton({
  label, color = T.accentGold, disabled, ghost, outline,
}: {
  label: string; color?: string; disabled?: boolean; ghost?: boolean; outline?: boolean;
}) {
  const bg = ghost ? "transparent" : outline ? "transparent" : color + "22";
  const border = ghost ? "none" : `1.5px solid ${color}`;
  return (
    <button
      disabled={disabled}
      style={{
        fontFamily: FONT_PIXEL, fontSize: 7,
        color: disabled ? T.textInactive : color,
        background: disabled ? T.borderSubtle + "44" : bg,
        border: disabled ? `1.5px solid ${T.textInactive}` : border,
        borderRadius: 6, padding: "8px 16px", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        letterSpacing: 0.5, textShadow: disabled ? "none" : `0 0 6px ${color}66`,
        transition: "all 0.15s",
        boxShadow: disabled ? "none" : `inset 0 1px 0 ${color}22`,
      }}
    >
      {label}
    </button>
  );
}

/** Rank badge */
function RankBadge({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      fontFamily: FONT_PIXEL, fontSize: 7,
      color: color,
      background: color + "18",
      border: `1.5px solid ${color}`,
      borderRadius: 4, padding: "3px 8px",
      textShadow: `0 0 6px ${color}88`,
      letterSpacing: 0.5,
    }}>
      {label}
    </div>
  );
}

/** Difficulty chip */
function DiffChip({ label, color, active }: { label: string; color: string; active: boolean }) {
  return (
    <div style={{
      fontFamily: FONT_BODY, fontSize: 15,
      color: active ? color : T.textMuted,
      background: active ? color + "22" : "transparent",
      border: `1px solid ${active ? color : T.borderElevated}`,
      borderRadius: 5, padding: "3px 12px", cursor: "pointer",
      transition: "all 0.1s",
    }}>
      {label}
    </div>
  );
}

/** Tag chip */
function TagChip({ label, color, active }: { label: string; color: string; active: boolean }) {
  return (
    <div style={{
      fontFamily: FONT_BODY, fontSize: 14,
      color: active ? color : T.textMuted,
      background: active ? color + "25" : "transparent",
      border: `1px solid ${active ? color : T.borderElevated}`,
      borderRadius: 20, padding: "2px 10px",
    }}>
      {label}
    </div>
  );
}

/** Notification badge */
function NotifBadge({ count }: { count: number }) {
  return (
    <div style={{
      minWidth: 18, height: 18,
      background: T.danger, border: `2px solid ${T.bgDeepest}`,
      borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 9, fontFamily: FONT_PIXEL, color: "#fff",
      padding: "0 4px", lineHeight: 1,
    }}>
      {count > 9 ? "9+" : count}
    </div>
  );
}

/** Input field */
function RpgInput({ placeholder, focused }: { placeholder: string; focused?: boolean }) {
  return (
    <input
      readOnly
      placeholder={placeholder}
      style={{
        background: T.bgDeepest,
        border: `1.5px solid ${focused ? T.accentGold : T.borderElevated}`,
        borderRadius: 6,
        color: T.textLight,
        fontFamily: FONT_BODY, fontSize: 16,
        padding: "8px 12px", width: 200,
        outline: "none",
        boxShadow: focused ? `0 0 0 2px ${T.accentGold}33` : "none",
      }}
    />
  );
}

function AtomsTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle>⚛️ ATOMS</SectionTitle>

      {/* ── Buttons ── */}
      <ComponentFrame
        name="Button — RPG Style"
        specs={<>
          <SpecTag label="padding" value="8px 16px" />
          <SpecTag label="font" value="Press Start 2P" />
          <SpecTag label="font-size" value="7px" />
          <SpecTag label="border-radius" value="6px" />
          <SpecTag label="letter-spacing" value="0.5px" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-accent-gold" value={T.accentGold} where="color + border + glow" />
          <TokenTag name="--rpg-danger"      value={T.danger}     color={T.danger} where="Destructive variant" />
          <TokenTag name="--rpg-mage"        value={T.mage}       color={T.mage}   where="Mage / Focus variant" />
          <TokenTag name="--rpg-border-elevated" value={T.borderElevated} color={T.textMuted} where="Ghost border" />
        </>}
      >
        <StateFrame label="Default">
          <RpgButton label="ATACAR" />
        </StateFrame>
        <StateFrame label="Hover / Focus">
          <RpgButton label="ATACAR" />
        </StateFrame>
        <StateFrame label="Disabled">
          <RpgButton label="ATACAR" disabled />
        </StateFrame>
        <StateFrame label="Danger">
          <RpgButton label="DELETAR" color={T.danger} />
        </StateFrame>
        <StateFrame label="Mage">
          <RpgButton label="FOCO" color={T.mage} />
        </StateFrame>
        <StateFrame label="Warrior">
          <RpgButton label="TEMPORAL" color={T.warrior} />
        </StateFrame>
      </ComponentFrame>

      {/* ── Rank Badges ── */}
      <ComponentFrame
        name="Badge — Rank"
        specs={<>
          <SpecTag label="padding" value="3px 8px" />
          <SpecTag label="font" value="Press Start 2P" />
          <SpecTag label="font-size" value="7px" />
          <SpecTag label="border-radius" value="4px" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-rank-novato"    value={T.rankNovato}    color={T.rankNovato}    where="Lv 1–2" />
          <TokenTag name="--rpg-rank-veterano"  value={T.rankVeterano}  color={T.rankVeterano}  where="Lv 3–4" />
          <TokenTag name="--rpg-rank-guerreiro" value={T.rankGuerreiro} color={T.rankGuerreiro} where="Lv 5–9" />
          <TokenTag name="--rpg-rank-raro"      value={T.rankRaro}      color={T.rankRaro}      where="Lv 10–14" />
          <TokenTag name="--rpg-rank-mestre"    value={T.rankMestre}    color={T.rankMestre}    where="Lv 15–19" />
          <TokenTag name="--rpg-rank-epico"     value={T.rankEpico}     color={T.rankEpico}     where="Lv 20–29" />
          <TokenTag name="--rpg-rank-lendario"  value={T.rankLendario}  color={T.rankLendario}  where="Lv 30+" />
        </>}
      >
        {[
          { label: "NOVATO",     color: T.rankNovato    },
          { label: "VETERANO",   color: T.rankVeterano  },
          { label: "GUERREIRO",  color: T.rankGuerreiro },
          { label: "RARO",       color: T.rankRaro      },
          { label: "MESTRE",     color: T.rankMestre    },
          { label: "ÉPICO",      color: T.rankEpico     },
          { label: "LENDÁRIO",   color: T.rankLendario  },
        ].map(r => (
          <StateFrame key={r.label} label={r.label}>
            <RankBadge label={r.label} color={r.color} />
          </StateFrame>
        ))}
      </ComponentFrame>

      {/* ── Difficulty Chips ── */}
      <ComponentFrame
        name="Chip — Difficulty"
        specs={<>
          <SpecTag label="padding" value="3px 12px" />
          <SpecTag label="font" value="VT323" />
          <SpecTag label="font-size" value="15px" />
          <SpecTag label="border-radius" value="5px" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-success" value={T.success} color={T.success} where="Fácil — active color" />
          <TokenTag name="--rpg-warning" value={T.warning} color={T.warning} where="Médio — active color" />
          <TokenTag name="--rpg-danger"  value={T.danger}  color={T.danger}  where="Difícil — active color" />
          <TokenTag name="--rpg-border-elevated" value={T.borderElevated} color={T.textMuted} where="Inactive border" />
        </>}
      >
        <StateFrame label="Default (inactive)">
          <div style={{ display: "flex", gap: 6 }}>
            <DiffChip label="Fácil"   color={T.success} active={false} />
            <DiffChip label="Médio"   color={T.warning} active={false} />
            <DiffChip label="Difícil" color={T.danger}  active={false} />
          </div>
        </StateFrame>
        <StateFrame label="Fácil — Active">
          <DiffChip label="Fácil" color={T.success} active />
        </StateFrame>
        <StateFrame label="Médio — Active">
          <DiffChip label="Médio" color={T.warning} active />
        </StateFrame>
        <StateFrame label="Difícil — Active">
          <DiffChip label="Difícil" color={T.danger} active />
        </StateFrame>
      </ComponentFrame>

      {/* ── Tag Chips ── */}
      <ComponentFrame
        name="Chip — Tag"
        specs={<>
          <SpecTag label="padding" value="2px 10px" />
          <SpecTag label="font" value="VT323" />
          <SpecTag label="font-size" value="14px" />
          <SpecTag label="border-radius" value="20px (pill)" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-mage"    value={T.mage}    color={T.mage}    where="Trabalho — active" />
          <TokenTag name="--rpg-warning" value={T.warning} color={T.warning} where="Pessoal — active" />
          <TokenTag name="--rpg-success" value={T.success} color={T.success} where="Saúde — active" />
          <TokenTag name="--rpg-border-elevated" value={T.borderElevated} color={T.textMuted} where="Inactive border" />
        </>}
      >
        <StateFrame label="Inactive">
          <div style={{ display: "flex", gap: 6 }}>
            <TagChip label="Trabalho" color={T.mage}    active={false} />
            <TagChip label="Pessoal"  color={T.warning} active={false} />
          </div>
        </StateFrame>
        <StateFrame label="Active">
          <div style={{ display: "flex", gap: 6 }}>
            <TagChip label="Trabalho" color={T.mage}    active />
            <TagChip label="Saúde"    color={T.success} active />
          </div>
        </StateFrame>
      </ComponentFrame>

      {/* ── Notification Badge ── */}
      <ComponentFrame
        name="Badge — Notification"
        specs={<>
          <SpecTag label="size" value="18×18px" />
          <SpecTag label="border-radius" value="10px (pill)" />
          <SpecTag label="font" value="Press Start 2P" />
          <SpecTag label="font-size" value="9px" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-danger"    value={T.danger}    color={T.danger} where="Background" />
          <TokenTag name="--rpg-bg-deepest" value={T.bgDeepest} color={T.textMuted} where="Ring border" />
        </>}
      >
        <StateFrame label="Count: 1">
          <NotifBadge count={1} />
        </StateFrame>
        <StateFrame label="Count: 5">
          <NotifBadge count={5} />
        </StateFrame>
        <StateFrame label="Count: 9+">
          <NotifBadge count={12} />
        </StateFrame>
      </ComponentFrame>

      {/* ── Input ── */}
      <ComponentFrame
        name="Input — Text Field"
        specs={<>
          <SpecTag label="padding" value="8px 12px" />
          <SpecTag label="font" value="VT323" />
          <SpecTag label="font-size" value="16px" />
          <SpecTag label="border-radius" value="6px" />
          <SpecTag label="width" value="200px (fluid)" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-bg-deepest"      value={T.bgDeepest}     color={T.textMuted}  where="Background" />
          <TokenTag name="--rpg-border-elevated"  value={T.borderElevated} color={T.textMuted}  where="Default border" />
          <TokenTag name="--rpg-accent-gold"      value={T.accentGold}    color={T.accentGold} where="Focus border + ring" />
          <TokenTag name="--rpg-text-light"       value={T.textLight}     color={T.textLight}  where="Text color" />
        </>}
      >
        <StateFrame label="Default">
          <RpgInput placeholder="Nome da tarefa…" />
        </StateFrame>
        <StateFrame label="Focused">
          <RpgInput placeholder="Nome da tarefa…" focused />
        </StateFrame>
        <StateFrame label="Filled">
          <div style={{
            background: T.bgDeepest, border: `1.5px solid ${T.borderElevated}`,
            borderRadius: 6, color: T.textLight, fontFamily: FONT_BODY, fontSize: 16,
            padding: "8px 12px", width: 200,
          }}>
            Completar relatório
          </div>
        </StateFrame>
      </ComponentFrame>

      {/* ── Icons ── */}
      <ComponentFrame
        name="Icon — PixelIcon (Lucide)"
        specs={<>
          <SpecTag label="default-size" value="16px" />
          <SpecTag label="stroke-width" value="1.8 (inactive) / 2.5 (active)" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-accent-gold"   value={T.accentGold}   color={T.accentGold} where="Active icon color" />
          <TokenTag name="--rpg-text-inactive" value={T.textInactive}  color={T.textInactive} where="Inactive icon color" />
          <TokenTag name="--rpg-mage"          value={T.mage}          color={T.mage}   where="Focus/Mage icons" />
          <TokenTag name="--rpg-warrior"       value={T.warrior}       color={T.warrior} where="Temporal/Warrior icons" />
        </>}
      >
        <StateFrame label="Active (gold)">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[Swords, Flame, Trophy, Star, Shield, Brain, Timer, Gem, Skull].map((Icon, i) => (
              <Icon key={i} size={18} color={T.accentGold} strokeWidth={2.5} />
            ))}
          </div>
        </StateFrame>
        <StateFrame label="Inactive">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[Swords, Flame, Trophy, Star, Shield, Brain, Timer, Gem, Skull].map((Icon, i) => (
              <Icon key={i} size={18} color={T.textInactive} strokeWidth={1.8} />
            ))}
          </div>
        </StateFrame>
        <StateFrame label="Class — Mage">
          <div style={{ display: "flex", gap: 10 }}>
            {[Brain, Sparkles, RotateCcw].map((Icon, i) => (
              <Icon key={i} size={18} color={T.mage} strokeWidth={2} />
            ))}
          </div>
        </StateFrame>
        <StateFrame label="Class — Warrior">
          <div style={{ display: "flex", gap: 10 }}>
            {[Swords, Shield, Award].map((Icon, i) => (
              <Icon key={i} size={18} color={T.warrior} strokeWidth={2} />
            ))}
          </div>
        </StateFrame>
      </ComponentFrame>

      {/* ── Checkbox ── */}
      <ComponentFrame
        name="Checkbox — Task"
        specs={<>
          <SpecTag label="size" value="20×20px" />
          <SpecTag label="border-radius" value="4px" />
          <SpecTag label="border" value="2px solid" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-border-elevated" value={T.borderElevated} color={T.textMuted} where="Unchecked border" />
          <TokenTag name="--rpg-accent-gold"     value={T.accentGold}    color={T.accentGold} where="Checked fill + icon" />
          <TokenTag name="--rpg-bg-deepest"      value={T.bgDeepest}     color={T.textMuted}  where="Unchecked bg" />
        </>}
      >
        <StateFrame label="Unchecked">
          <div style={{
            width: 20, height: 20, border: `2px solid ${T.borderElevated}`,
            borderRadius: 4, background: T.bgDeepest,
          }} />
        </StateFrame>
        <StateFrame label="Checked">
          <div style={{
            width: 20, height: 20, border: `2px solid ${T.accentGold}`,
            borderRadius: 4, background: T.accentGold + "22",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Check size={12} color={T.accentGold} strokeWidth={3} />
          </div>
        </StateFrame>
        <StateFrame label="Hover">
          <div style={{
            width: 20, height: 20, border: `2px solid ${T.accentGold}88`,
            borderRadius: 4, background: T.accentGold + "11",
          }} />
        </StateFrame>
      </ComponentFrame>
    </div>
  );
}

// ─── TAB: MOLECULES ──────────────────────────────────────────────────────────

function ProgressBar({ percent, color, bg = T.borderElevated, height = 8 }:
  { percent: number; color: string; bg?: string; height?: number }) {
  return (
    <div style={{
      width: 200, height, background: bg, borderRadius: height,
      overflow: "hidden", position: "relative",
    }}>
      <div style={{
        width: `${percent}%`, height: "100%", background: color,
        borderRadius: height, transition: "width 0.4s ease",
        boxShadow: `0 0 6px ${color}88`,
      }} />
    </div>
  );
}

function AttackBanner({ text, sub, color }: { text: string; sub: string; color: string }) {
  return (
    <div style={{
      background: color + "18",
      border: `2px solid ${color}`,
      borderRadius: 8, padding: "8px 16px",
      textAlign: "center",
    }}>
      <div style={{ fontFamily: FONT_PIXEL, fontSize: 9, color, letterSpacing: 1, textShadow: `0 0 8px ${color}` }}>
        {text}
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 15, color: T.textBody, marginTop: 4 }}>
        {sub}
      </div>
    </div>
  );
}

function PixelCardPreview({ label, interactive }: { label: string; interactive?: boolean }) {
  // 2-step staircase clip-path
  const clip = "polygon(12px 0px,calc(100% - 12px) 0px,calc(100% - 6px) 0px,calc(100% - 6px) 6px,100% 6px,100% 12px,100% calc(100% - 12px),100% calc(100% - 6px),calc(100% - 6px) calc(100% - 6px),calc(100% - 6px) 100%,calc(100% - 12px) 100%,12px 100%,6px 100%,6px calc(100% - 6px),0px calc(100% - 6px),0px calc(100% - 12px),0px 12px,0px 6px,6px 6px,6px 0px)";
  return (
    <div style={{ filter: `drop-shadow(4px 4px 0 ${T.accentShadow})`, cursor: interactive ? "pointer" : undefined }}>
      <div style={{ clipPath: clip, background: T.accentGold, padding: 3 }}>
        <div style={{ background: T.bgCard, padding: 16, minWidth: 140 }}>
          <div style={{ fontFamily: FONT_PIXEL, fontSize: 7, color: T.accentGold }}>{label}</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: T.textBody, marginTop: 6 }}>
            Conteúdo interno
          </div>
        </div>
      </div>
    </div>
  );
}

function MoleculesTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle>🔬 MOLECULES</SectionTitle>

      {/* ── PixelCard ── */}
      <ComponentFrame
        name="PixelCard — Staircase border"
        specs={<>
          <SpecTag label="padding" value="20px (default)" />
          <SpecTag label="border-width" value="3px (clip-path)" />
          <SpecTag label="pixel-shadow" value="drop-shadow(4px 4px 0 ...)" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-accent-gold"   value={T.accentGold}   color={T.accentGold} where="Border / clip layer" />
          <TokenTag name="--rpg-accent-shadow" value={T.accentShadow} color={T.accentShadow} where="Pixel drop-shadow" />
          <TokenTag name="--rpg-bg-card"       value={T.bgCard}       color={T.textMuted}  where="Card background" />
        </>}
      >
        <StateFrame label="Default">
          <PixelCardPreview label="MISSÃO" />
        </StateFrame>
        <StateFrame label="Interactive (hover)">
          <PixelCardPreview label="MISSÃO" interactive />
        </StateFrame>
        <StateFrame label="Boss variant">
          <div style={{ filter: `drop-shadow(4px 4px 0 #7a0010)` }}>
            <div style={{
              clipPath: "polygon(12px 0px,calc(100% - 12px) 0px,calc(100% - 6px) 0px,calc(100% - 6px) 6px,100% 6px,100% 12px,100% calc(100% - 12px),100% calc(100% - 6px),calc(100% - 6px) calc(100% - 6px),calc(100% - 6px) 100%,calc(100% - 12px) 100%,12px 100%,6px 100%,6px calc(100% - 6px),0px calc(100% - 6px),0px calc(100% - 12px),0px 12px,0px 6px,6px 6px,6px 0px)",
              background: T.danger, padding: 3,
            }}>
              <div style={{ background: "#1a0810", padding: 16, minWidth: 140 }}>
                <div style={{ fontFamily: FONT_PIXEL, fontSize: 7, color: T.danger }}>BOSS</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: T.textBody, marginTop: 6 }}>
                  Chefe de fase
                </div>
              </div>
            </div>
          </div>
        </StateFrame>
      </ComponentFrame>

      {/* ── XP Progress Bar ── */}
      <ComponentFrame
        name="ProgressBar — XP"
        specs={<>
          <SpecTag label="height" value="8px" />
          <SpecTag label="border-radius" value="8px (pill)" />
          <SpecTag label="glow" value="0 0 6px {color}88" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-accent-gold"     value={T.accentGold}    color={T.accentGold} where="XP fill color" />
          <TokenTag name="--rpg-border-elevated"  value={T.borderElevated} color={T.textMuted}  where="Track background" />
        </>}
      >
        <StateFrame label="25%">
          <ProgressBar percent={25} color={T.accentGold} />
        </StateFrame>
        <StateFrame label="60%">
          <ProgressBar percent={60} color={T.accentGold} />
        </StateFrame>
        <StateFrame label="95%">
          <ProgressBar percent={95} color={T.accentGold} />
        </StateFrame>
      </ComponentFrame>

      {/* ── HP Bar ── */}
      <ComponentFrame
        name="ProgressBar — Monster HP"
        specs={<>
          <SpecTag label="height" value="14px" />
          <SpecTag label="border-radius" value="7px" />
          <SpecTag label="color-change" value="Dinâmica: &gt;50% red / &gt;25% orange / &lt;25% gold" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-danger"  value={T.danger}  color={T.danger}  where="HP &gt;50% — 'Saudável'" />
          <TokenTag name="--rpg-orange"  value={T.orange}  color={T.orange}  where="HP 25-50% — 'Ferido'" />
          <TokenTag name="--rpg-warning" value={T.warning} color={T.warning} where="HP &lt;25% — 'Crítico'" />
        </>}
      >
        <StateFrame label="HP alto (&gt;50%)">
          <ProgressBar percent={75} color={T.danger}  height={14} />
        </StateFrame>
        <StateFrame label="HP médio (25–50%)">
          <ProgressBar percent={40} color={T.orange}  height={14} />
        </StateFrame>
        <StateFrame label="HP crítico (&lt;25%)">
          <ProgressBar percent={15} color={T.warning} height={14} />
        </StateFrame>
      </ComponentFrame>

      {/* ── Attack Banner ── */}
      <ComponentFrame
        name="AttackBanner — Combat feedback"
        specs={<>
          <SpecTag label="padding" value="8px 16px" />
          <SpecTag label="border" value="2px solid {color}" />
          <SpecTag label="border-radius" value="8px" />
          <SpecTag label="font (title)" value="Press Start 2P 9px" />
          <SpecTag label="font (sub)" value="VT323 15px" />
          <SpecTag label="glow" value="text-shadow 0 0 8px {color}" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-accent-gold" value={T.accentGold} color={T.accentGold} where="Basic attack banner" />
          <TokenTag name="--rpg-orange"      value={T.orange}     color={T.orange}     where="Temporal / critical" />
          <TokenTag name="--rpg-mage"        value={T.mage}       color={T.mage}       where="Focus attack" />
          <TokenTag name="--rpg-danger"      value={T.danger}     color={T.danger}     where="Death blow" />
        </>}
        wide
      >
        <StateFrame label="Básico" bg={T.bgDeepest}>
          <AttackBanner text="GOLPE!" sub="-45HP · +1 task" color={T.accentGold} />
        </StateFrame>
        <StateFrame label="Combo" bg={T.bgDeepest}>
          <AttackBanner text="COMBO x3!" sub="-120HP · CRÍTICO" color={T.accentGold} />
        </StateFrame>
        <StateFrame label="Temporal" bg={T.bgDeepest}>
          <AttackBanner text="GOLPE TEMPORAL!" sub="x1.50 · -68HP" color={T.orange} />
        </StateFrame>
        <StateFrame label="Foco" bg={T.bgDeepest}>
          <AttackBanner text="FOCO ATIVADO!" sub="-52HP · +0.01x permanente" color={T.mage} />
        </StateFrame>
        <StateFrame label="Vitória" bg={T.bgDeepest}>
          <AttackBanner text="MONSTRO DERROTADO!" sub="+120 XP" color={T.success} />
        </StateFrame>
      </ComponentFrame>

      {/* ── Damage Number ── */}
      <ComponentFrame
        name="FloatingDamage — Number"
        specs={<>
          <SpecTag label="font" value="Press Start 2P" />
          <SpecTag label="font-size" value="18–24px" />
          <SpecTag label="animation" value="float up + fade out 1.4s" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-danger"  value={T.danger}  color={T.danger}  where="Damage number color" />
          <TokenTag name="--rpg-warning" value={T.warning} color={T.warning} where="Critical variant" />
        </>}
      >
        {[40, 100, 250].map((dmg, i) => (
          <StateFrame key={i} label={`-${dmg}HP`}>
            <div style={{
              fontFamily: FONT_PIXEL, fontSize: dmg > 150 ? 20 : 16,
              color: dmg > 100 ? T.warning : T.danger,
              textShadow: `2px 2px 0 #000, 0 0 8px ${dmg > 100 ? T.warning : T.danger}`,
              letterSpacing: 1,
            }}>
              -{dmg}
            </div>
          </StateFrame>
        ))}
      </ComponentFrame>

      {/* ── Difficulty Picker (molecule = atom group) ── */}
      <ComponentFrame
        name="DifficultyPicker — Molecule (3 chips + label)"
        specs={<>
          <SpecTag label="gap" value="4px" />
          <SpecTag label="layout" value="flex row" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-success"          value={T.success}       color={T.success}       where="Fácil active" />
          <TokenTag name="--rpg-warning"          value={T.warning}       color={T.warning}       where="Médio active" />
          <TokenTag name="--rpg-danger"           value={T.danger}        color={T.danger}        where="Difícil active" />
          <TokenTag name="--rpg-border-elevated"  value={T.borderElevated} color={T.textMuted}    where="Inactive borders" />
        </>}
      >
        <StateFrame label="Fácil selecionado">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontFamily: FONT_PIXEL, fontSize: 6, color: T.textMuted }}>DIFICULDADE</div>
            <div style={{ display: "flex", gap: 4 }}>
              <DiffChip label="Fácil"   color={T.success} active />
              <DiffChip label="Médio"   color={T.warning} active={false} />
              <DiffChip label="Difícil" color={T.danger}  active={false} />
            </div>
          </div>
        </StateFrame>
        <StateFrame label="Difícil selecionado">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontFamily: FONT_PIXEL, fontSize: 6, color: T.textMuted }}>DIFICULDADE</div>
            <div style={{ display: "flex", gap: 4 }}>
              <DiffChip label="Fácil"   color={T.success} active={false} />
              <DiffChip label="Médio"   color={T.warning} active={false} />
              <DiffChip label="Difícil" color={T.danger}  active />
            </div>
          </div>
        </StateFrame>
      </ComponentFrame>
    </div>
  );
}

// ─── TAB: ORGANISMS ──────────────────────────────────────────────────────────

function OrganismsTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle>🧬 ORGANISMS</SectionTitle>

      {/* ── PixelTabs ── */}
      <ComponentFrame
        name="PixelTabs — Tab bar (Profile / Settings)"
        specs={<>
          <SpecTag label="padding" value="4px (container) + 10px 6px (tab)" />
          <SpecTag label="border-radius (container)" value="10px" />
          <SpecTag label="border-radius (tab)" value="7px" />
          <SpecTag label="font" value="Press Start 2P 7px" />
          <SpecTag label="icon-size" value="14px" />
          <SpecTag label="gap (label-icon)" value="5px" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-bg-deepest"     value={T.bgDeepest}    color={T.textMuted}  where="Container bg" />
          <TokenTag name="--rpg-border-subtle"  value={T.borderSubtle} color={T.textMuted}  where="Container border" />
          <TokenTag name="--rpg-accent-gold"    value={T.accentGold}   color={T.accentGold} where="Active tab color" />
          <TokenTag name="--rpg-text-inactive"  value={T.textInactive} color={T.textInactive} where="Inactive tab color" />
        </>}
        wide
      >
        <StateFrame label="Tab bar completo" bg={T.bgPage}>
          <div style={{
            display: "flex", gap: 0,
            background: T.bgDeepest, border: `1px solid ${T.borderSubtle}`,
            borderRadius: 10, padding: 4,
          }}>
            {[
              { label: "GERAL",   Icon: User,    color: T.accentGold, active: true  },
              { label: "STATS",   Icon: Zap,     color: T.warrior,    active: false },
              { label: "PODER",   Icon: Shield,  color: T.mage,       active: false },
              { label: "REBIRTH", Icon: RotateCcw, color: T.orange,   active: false },
            ].map(tab => (
              <button key={tab.label} style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 5,
                padding: "10px 6px",
                background: tab.active ? tab.color + "18" : "transparent",
                border: tab.active ? `1px solid ${tab.color}55` : "1px solid transparent",
                borderRadius: 7,
                color: tab.active ? tab.color : T.textInactive,
                fontFamily: FONT_PIXEL, fontSize: 7, cursor: "pointer",
                letterSpacing: 0.5,
                textShadow: tab.active ? `0 0 8px ${tab.color}88` : "none",
              }}>
                <tab.Icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </StateFrame>
      </ComponentFrame>

      {/* ── BottomNav ── */}
      <ComponentFrame
        name="BottomNav — Mobile navigation"
        specs={<>
          <SpecTag label="height" value="~72px" />
          <SpecTag label="padding" value="0 8px / 8px 4px (inner)" />
          <SpecTag label="border-radius" value="40px (pill)" />
          <SpecTag label="backdrop-filter" value="blur(12px)" />
          <SpecTag label="icon-size" value="16px" />
          <SpecTag label="font" value="Press Start 2P 6px" />
          <SpecTag label="tab-padding" value="7px 14px" />
          <SpecTag label="tab-border-radius" value="32px" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-bg-deepest"    value="rgba(8,10,24,0.92)" color={T.textMuted}  where="Nav background (glass)" />
          <TokenTag name="--rpg-border-subtle" value={T.borderSubtle}     color={T.textMuted}  where="Nav border" />
          <TokenTag name="--rpg-accent-gold"   value={T.accentGold}       color={T.accentGold} where="Active tab color + outline" />
          <TokenTag name="--rpg-text-inactive" value={T.textInactive}     color={T.textInactive} where="Inactive tab icon/label" />
          <TokenTag name="--rpg-danger"        value={T.danger}           color={T.danger}     where="Notification badge" />
        </>}
        wide
      >
        <StateFrame label="Mobile nav preview" bg={T.bgDeepest}>
          <div style={{
            background: "rgba(8,10,24,0.92)",
            border: `2px solid ${T.borderSubtle}`,
            borderRadius: 40, padding: "0 8px",
            display: "inline-flex",
          }}>
            {[
              { label: "CAMPANHA",   Icon: Swords, active: true,  notif: 0 },
              { label: "HÁBITOS",    Icon: Flame,  active: false, notif: 2 },
              { label: "CONQUISTAS", Icon: Award,  active: false, notif: 0 },
              { label: "PERFIL",     Icon: User,   active: false, notif: 0 },
            ].map(tab => (
              <div key={tab.label} style={{ position: "relative" }}>
                {tab.notif > 0 && (
                  <div style={{
                    position: "absolute", top: 6, right: 10,
                    minWidth: 14, height: 14, background: T.danger,
                    border: `1.5px solid ${T.bgDeepest}`, borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 8, fontFamily: FONT_PIXEL, color: "#fff",
                    padding: "0 3px", lineHeight: 1, zIndex: 2,
                  }}>
                    {tab.notif}
                  </div>
                )}
                <button style={{
                  flexShrink: 0, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 4,
                  padding: "10px 14px", borderRadius: 32, border: "none",
                  background: tab.active ? T.accentGoldDim : "transparent",
                  outline: tab.active ? `1.5px solid ${T.accentGold}` : "1.5px solid transparent",
                  color: tab.active ? T.accentGold : T.textInactive,
                  cursor: "pointer", fontFamily: FONT_PIXEL, fontSize: 6, whiteSpace: "nowrap",
                }}>
                  <tab.Icon size={16} strokeWidth={tab.active ? 2.5 : 1.8} />
                  {tab.label}
                </button>
              </div>
            ))}
          </div>
        </StateFrame>
      </ComponentFrame>

      {/* ── PageShell Header ── */}
      <ComponentFrame
        name="PageShell — Page header card"
        specs={<>
          <SpecTag label="padding (header)" value="13px 18px" />
          <SpecTag label="border-radius" value="10px" />
          <SpecTag label="border-left" value="3px solid {accentColor}" />
          <SpecTag label="gap (icon-title)" value="12px" />
          <SpecTag label="font (title)" value="Press Start 2P 10–13px" />
          <SpecTag label="margin-bottom" value="16px" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-bg-card"        value={T.bgCard}        color={T.textMuted}  where="Header bg" />
          <TokenTag name="--rpg-border-subtle"  value={T.borderSubtle}  color={T.textMuted}  where="Header border" />
          <TokenTag name="--rpg-accent-gold"    value={T.accentGold}    color={T.accentGold} where="Default accent — icon + title + left border" />
          <TokenTag name="--rpg-mage"           value={T.mage}          color={T.mage}       where="Variant: Hábitos" />
          <TokenTag name="--rpg-warrior"        value={T.warrior}       color={T.warrior}    where="Variant: Conquistas" />
          <TokenTag name="--rpg-danger"         value={T.danger}        color={T.danger}     where="Variant: Desafios" />
        </>}
        wide
      >
        {[
          { title: "PERFIL",      Icon: User,    color: T.accentGold },
          { title: "HÁBITOS",     Icon: Flame,   color: T.mage       },
          { title: "CONQUISTAS",  Icon: Trophy,  color: T.warrior    },
          { title: "DESAFIOS",    Icon: Timer,   color: T.danger     },
        ].map(({ title, Icon, color }) => (
          <StateFrame key={title} label={`${title} variant`} bg={T.bgPage}>
            <div style={{
              background: T.bgCard,
              border: `1px solid rgba(42,46,80,0.8)`,
              borderLeft: `3px solid ${color}`,
              borderRadius: 10,
              padding: "13px 18px",
              display: "flex", alignItems: "center", gap: 12,
              minWidth: 200,
            }}>
              <Icon size={18} color={color} />
              <span style={{
                fontFamily: FONT_PIXEL, fontSize: 10,
                color: color, textShadow: "2px 2px 0 #000", letterSpacing: 1,
              }}>
                {title}
              </span>
            </div>
          </StateFrame>
        ))}
      </ComponentFrame>

      {/* ── Task Item ── */}
      <ComponentFrame
        name="TaskItem — Task list row"
        specs={<>
          <SpecTag label="padding" value="10px 12px" />
          <SpecTag label="border-radius" value="8px" />
          <SpecTag label="border" value="1px solid" />
          <SpecTag label="font (name)" value="VT323 17px" />
          <SpecTag label="font (damage)" value="VT323 13px" />
          <SpecTag label="gap" value="8px" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-bg-card"         value={T.bgCard}        color={T.textMuted}  where="Row background" />
          <TokenTag name="--rpg-border-elevated"  value={T.borderElevated} color={T.textMuted} where="Default border" />
          <TokenTag name="--rpg-success"          value={T.success}       color={T.success}    where="Fácil — border + damage" />
          <TokenTag name="--rpg-warning"          value={T.warning}       color={T.warning}    where="Médio — border + damage" />
          <TokenTag name="--rpg-danger"           value={T.danger}        color={T.danger}     where="Difícil — border + damage" />
          <TokenTag name="--rpg-text-muted"       value={T.textMuted}     color={T.textMuted}  where="Completed task name (dim)" />
          <TokenTag name="--rpg-accent-gold"      value={T.accentGold}    color={T.accentGold} where="Checked checkbox" />
        </>}
        wide
      >
        {/* Default unchecked */}
        {[
          { name: "Estudar 1h de inglês", diff: "easy",   color: T.success, dmg: 30, done: false },
          { name: "Entregar relatório",   diff: "medium",  color: T.warning, dmg: 50, done: false },
          { name: "Malhar por 45min",     diff: "hard",    color: T.danger,  dmg: 75, done: false },
          { name: "Ler 20 páginas",       diff: "easy",    color: T.success, dmg: 30, done: true  },
        ].map((task) => (
          <StateFrame key={task.name} label={task.done ? "Completed" : `${task.diff} — Default`} bg={T.bgPage}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: T.bgCard,
              border: `1px solid ${task.done ? T.borderElevated : task.color + "55"}`,
              borderRadius: 8, padding: "10px 12px",
              minWidth: 220, maxWidth: 260,
              opacity: task.done ? 0.6 : 1,
            }}>
              {/* Checkbox */}
              <div style={{
                width: 20, height: 20, flexShrink: 0,
                border: `2px solid ${task.done ? T.accentGold : task.color}`,
                borderRadius: 4,
                background: task.done ? T.accentGold + "22" : T.bgDeepest,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {task.done && <Check size={11} color={T.accentGold} strokeWidth={3} />}
              </div>
              {/* Task info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: FONT_BODY, fontSize: 17, color: task.done ? T.textMuted : T.textLight,
                  textDecoration: task.done ? "line-through" : "none",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {task.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <div style={{
                    fontFamily: FONT_BODY, fontSize: 13,
                    color: task.color, background: task.color + "18",
                    border: `1px solid ${task.color}55`,
                    borderRadius: 4, padding: "1px 6px",
                  }}>
                    {task.diff === "easy" ? "Fácil" : task.diff === "medium" ? "Médio" : "Difícil"}
                  </div>
                  <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: T.textMuted }}>
                    -{task.dmg}HP
                  </span>
                </div>
              </div>
            </div>
          </StateFrame>
        ))}
      </ComponentFrame>

      {/* ── PlayerCard (mini) ── */}
      <ComponentFrame
        name="PlayerCard — Hero info card"
        specs={<>
          <SpecTag label="clip-path" value="staircase polygon (6px steps)" />
          <SpecTag label="pixel-shadow" value="drop-shadow(6px 6px 0 ...)" />
          <SpecTag label="padding (inner)" value="16px" />
          <SpecTag label="font (name)" value="Press Start 2P 9px" />
          <SpecTag label="font (stats)" value="VT323 14–16px" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-accent-gold"   value={T.accentGold}   color={T.accentGold} where="Clip border + rank badge + XP bar" />
          <TokenTag name="--rpg-accent-shadow" value={T.accentShadow} color={T.accentShadow} where="Pixel drop-shadow" />
          <TokenTag name="--rpg-bg-card"       value={T.bgCard}       color={T.textMuted}  where="Card bg" />
          <TokenTag name="--rpg-bg-deepest"    value={T.bgDeepest}    color={T.textMuted}  where="XP bar track" />
          <TokenTag name="--rpg-text-light"    value={T.textLight}    color={T.textLight}  where="Player name" />
          <TokenTag name="--rpg-rank-*"        value="dynamic"        color={T.rankGuerreiro} where="Rank badge color — per getRank(level)" />
        </>}
        wide
      >
        <StateFrame label="Guerreiro — Lv 7" bg={T.bgPage}>
          <div style={{ filter: "drop-shadow(6px 6px 0 #7a5010)" }}>
            <div style={{
              clipPath: "polygon(12px 0px,calc(100% - 12px) 0px,calc(100% - 6px) 0px,calc(100% - 6px) 6px,100% 6px,100% 12px,100% calc(100% - 12px),100% calc(100% - 6px),calc(100% - 6px) calc(100% - 6px),calc(100% - 6px) 100%,calc(100% - 12px) 100%,12px 100%,6px 100%,6px calc(100% - 6px),0px calc(100% - 6px),0px calc(100% - 12px),0px 12px,0px 6px,6px 6px,6px 0px)",
              background: T.accentGold, padding: 3,
            }}>
              <div style={{ background: T.bgCard, padding: 16, minWidth: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: FONT_PIXEL, fontSize: 9, color: T.textLight, marginBottom: 4 }}>Herói</div>
                    <RankBadge label="GUERREIRO" color={T.rankGuerreiro} />
                  </div>
                  <div style={{
                    fontFamily: FONT_PIXEL, fontSize: 22,
                    color: T.accentGold, textShadow: "2px 2px 0 #000",
                  }}>
                    7
                  </div>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: FONT_PIXEL, fontSize: 5, color: T.textMuted }}>XP</span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: T.textMuted }}>180/350</span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: T.bgDeepest, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: "51%", height: "100%", background: T.accentGold, boxShadow: `0 0 6px ${T.accentGold}88` }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {[{ label: "Missões", value: "12" }, { label: "Tarefas", value: "48" }].map(s => (
                    <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontFamily: FONT_BODY, fontSize: 20, color: T.textLight }}>{s.value}</span>
                      <span style={{ fontFamily: FONT_PIXEL, fontSize: 5, color: T.textMuted }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </StateFrame>

        <StateFrame label="Mago — Lv 22 (Épico)" bg={T.bgPage}>
          <div style={{ filter: "drop-shadow(6px 6px 0 #5a0f80)" }}>
            <div style={{
              clipPath: "polygon(12px 0px,calc(100% - 12px) 0px,calc(100% - 6px) 0px,calc(100% - 6px) 6px,100% 6px,100% 12px,100% calc(100% - 12px),100% calc(100% - 6px),calc(100% - 6px) calc(100% - 6px),calc(100% - 6px) 100%,calc(100% - 12px) 100%,12px 100%,6px 100%,6px calc(100% - 6px),0px calc(100% - 6px),0px calc(100% - 12px),0px 12px,0px 6px,6px 6px,6px 0px)",
              background: T.mage, padding: 3,
            }}>
              <div style={{ background: "#0e0b1c", padding: 16, minWidth: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: FONT_PIXEL, fontSize: 9, color: T.textLight, marginBottom: 4 }}>Herói</div>
                    <RankBadge label="ÉPICO" color={T.rankEpico} />
                  </div>
                  <div style={{ fontFamily: FONT_PIXEL, fontSize: 22, color: T.mage, textShadow: "2px 2px 0 #000" }}>
                    22
                  </div>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: FONT_PIXEL, fontSize: 5, color: T.textMuted }}>XP</span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: T.textMuted }}>840/1200</span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: T.bgDeepest, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: "70%", height: "100%", background: T.mage, boxShadow: `0 0 6px ${T.mage}88` }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {[{ label: "Missões", value: "58" }, { label: "Tarefas", value: "212" }].map(s => (
                    <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontFamily: FONT_BODY, fontSize: 20, color: T.textLight }}>{s.value}</span>
                      <span style={{ fontFamily: FONT_PIXEL, fontSize: 5, color: T.textMuted }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </StateFrame>
      </ComponentFrame>

      {/* ── AudioControlPanel ── */}
      <ComponentFrame
        name="AudioControlPanel — BGM indicator"
        specs={<>
          <SpecTag label="bar-count" value="5 bars" />
          <SpecTag label="bar-width" value="3px" />
          <SpecTag label="bar-gap" value="2px" />
          <SpecTag label="animation" value="custom keyframes per bar" />
          <SpecTag label="font (track)" value="VT323 13px" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-accent-gold"    value={T.accentGold}    color={T.accentGold} where="Bar color + track name" />
          <TokenTag name="--rpg-bg-deepest"     value={T.bgDeepest}     color={T.textMuted}  where="Panel background" />
          <TokenTag name="--rpg-border-subtle"  value={T.borderSubtle}  color={T.textMuted}  where="Panel border" />
        </>}
      >
        <StateFrame label="Playing" bg={T.bgPage}>
          <style>{`
            @keyframes dsBar1{0%,100%{height:4px}50%{height:14px}}
            @keyframes dsBar2{0%,100%{height:10px}50%{height:4px}}
            @keyframes dsBar3{0%,100%{height:6px}50%{height:16px}}
            @keyframes dsBar4{0%,100%{height:12px}50%{height:5px}}
            @keyframes dsBar5{0%,100%{height:8px}50%{height:14px}}
          `}</style>
          <div style={{
            background: T.bgDeepest, border: `1px solid ${T.borderSubtle}`,
            borderRadius: 8, padding: "8px 12px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 18 }}>
              {[
                { anim: "dsBar1", delay: "0s" },
                { anim: "dsBar2", delay: "0.1s" },
                { anim: "dsBar3", delay: "0.2s" },
                { anim: "dsBar4", delay: "0.05s" },
                { anim: "dsBar5", delay: "0.15s" },
              ].map((b, i) => (
                <div key={i} style={{
                  width: 3, background: T.accentGold, borderRadius: 2,
                  animation: `${b.anim} 0.8s ease-in-out infinite`,
                  animationDelay: b.delay,
                }} />
              ))}
            </div>
            <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: T.accentGold }}>
              Theme I
            </span>
          </div>
        </StateFrame>
        <StateFrame label="Muted" bg={T.bgPage}>
          <div style={{
            background: T.bgDeepest, border: `1px solid ${T.borderSubtle}`,
            borderRadius: 8, padding: "8px 12px",
            display: "flex", alignItems: "center", gap: 10, opacity: 0.4,
          }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 18 }}>
              {[4, 4, 4, 4, 4].map((h, i) => (
                <div key={i} style={{ width: 3, height: h, background: T.textInactive, borderRadius: 2 }} />
              ))}
            </div>
            <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: T.textInactive }}>
              Mudo
            </span>
          </div>
        </StateFrame>
      </ComponentFrame>

      {/* ── LevelUpOverlay (micro) ── */}
      <ComponentFrame
        name="LevelUpOverlay — Level up celebration"
        specs={<>
          <SpecTag label="position" value="fixed overlay (z-index: 9999)" />
          <SpecTag label="backdrop" value="rgba(0,0,0,0.85)" />
          <SpecTag label="font (level)" value="Press Start 2P 40–60px" />
          <SpecTag label="animation" value="scale-in → hold → scale-out (3.2s)" />
        </>}
        tokens={<>
          <TokenTag name="--rpg-accent-gold"   value={T.accentGold} color={T.accentGold} where="Level number + glow" />
          <TokenTag name="--rpg-rank-*"        value="dynamic"      color={T.rankEpico}  where="Rank badge — dynamic per level" />
          <TokenTag name="--rpg-bg-card"       value={T.bgCard}     color={T.textMuted}  where="Overlay card bg" />
          <TokenTag name="--rpg-legendary"     value={T.legendary}  color={T.legendary}  where="Stars / particles" />
        </>}
      >
        <StateFrame label="In — Phase" bg="#00000099">
          <div style={{
            background: T.bgCard, border: `2px solid ${T.accentGold}`,
            borderRadius: 16, padding: "24px 32px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            textAlign: "center",
          }}>
            <div style={{ fontFamily: FONT_PIXEL, fontSize: 9, color: T.textMuted, letterSpacing: 2 }}>
              LEVEL UP!
            </div>
            <div style={{
              fontFamily: FONT_PIXEL, fontSize: 40,
              color: T.accentGold, textShadow: `0 0 24px ${T.accentGold}`,
            }}>
              8
            </div>
            <RankBadge label="GUERREIRO" color={T.rankGuerreiro} />
          </div>
        </StateFrame>
      </ComponentFrame>

    </div>
  );
}

// ─── TABS CONFIG ──────────────────────────────────────────────────────────────

const DS_TABS = [
  { key: "tokens",    label: "TOKENS",    Icon: Palette },
  { key: "atoms",     label: "ÁTOMOS",    Icon: Atom    },
  { key: "molecules", label: "MOLÉCULAS", Icon: Layers  },
  { key: "organisms", label: "ORGANISMOS",Icon: Box     },
] as const;

type DSTab = typeof DS_TABS[number]["key"];

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────

export default function DesignSystemScreen() {
  const [tab, setTab] = useState<DSTab>("tokens");

  return (
    <PageShell
      icon={<Palette size={20} />}
      title="DESIGN SYSTEM"
      accentColor={T.mage}
      badge={
        <div style={{
          background: T.mage + "22", border: `1px solid ${T.mage}88`,
          borderRadius: 6, padding: "3px 10px",
          fontFamily: FONT_PIXEL, fontSize: 6, color: T.mage,
          letterSpacing: 0.5,
        }}>
          v1.0
        </div>
      }
    >
      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 0,
        background: T.bgDeepest, border: `1px solid ${T.borderSubtle}`,
        borderRadius: 10, padding: 4, marginBottom: 24, flexShrink: 0,
      }}>
        {DS_TABS.map(({ key, label, Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 5,
                padding: "10px 6px",
                background: active ? T.mage + "18" : "transparent",
                border: active ? `1px solid ${T.mage}55` : "1px solid transparent",
                borderRadius: 7,
                color: active ? T.mage : T.textInactive,
                fontFamily: FONT_PIXEL, fontSize: 6, cursor: "pointer",
                letterSpacing: 0.5,
                textShadow: active ? `0 0 8px ${T.mage}88` : "none",
                transition: "all 0.15s",
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1 }}>
        {tab === "tokens"    && <TokensTab />}
        {tab === "atoms"     && <AtomsTab />}
        {tab === "molecules" && <MoleculesTab />}
        {tab === "organisms" && <OrganismsTab />}
      </div>
    </PageShell>
  );
}
