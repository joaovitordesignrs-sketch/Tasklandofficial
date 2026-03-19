// ── Combat Power System ────────────────────────────────────────────────────────
// CP = 75 × PowerTotal      (integer, displayed to user)
// PowerTotal = MH × MN × MC × MR
//
// MH = 1 + min(5, hábitosChecadosHoje) × 0.05   → max 1.25 com 5 hábitos
// MN = 1 + (nível × 0.03)                  → linear (ex: lvl 10 → 1.30)
// MC = 1.20 (Guerreiro em Desafio Tempo) | 1.25 (Mago em Modo Foco) | 1.00
// MR = 1.0 + Σ(conquistas descongeladas)   — persiste entre rebirths
//
// Referência: combat-power-formula.md

import { getActiveHabits } from "./habits";
import { getEconomy, getPowerMR } from "./economy";
import { getItemBonuses } from "./items";

// ── Types ─────────────────────────────────────────────────────────────────────

/** Contexto de modo de jogo — afeta MC (Multiplicador de Classe) */
export type PowerMode = "temporal" | "focus" | "none";

export interface PowerSource {
  id:     string;
  label:  string;
  icon:   string;
  color:  string;
  /** Valor do multiplicador, ex.: 1.20 */
  value:  number;
  desc:   string;
  active: boolean;
}

export interface PowerData {
  /** Multiplicador total: MH × MN × MC × MR */
  total:       number;
  /** CP exibido ao usuário: Math.floor(75 × total) */
  combatPower: number;
  mh:      number;   // Multiplicador de Hábitos
  mn:      number;   // Multiplicador de Nível
  mc:      number;   // Multiplicador de Classe
  mr:      number;   // Multiplicador de Rebirth
  sources: PowerSource[];
  rank:    PowerRank;
}

export interface PowerRank {
  tier:     string;
  label:    string;
  color:    string;
  glow:     string;
  minPower: number; // em unidades de multiplicador (minCP / 75)
}

// ── Rank Tiers — calibrados para os cenários da fórmula ───────────────────────
// minPower = minCP / 75  (ex: CP 200 → minPower = 2.667)
//
// Cenário 1 (novato, CP ≈ 89)  → F
// Cenário 2 (intermediário, CP 212) → B
// Cenário 3 (hard user, CP 562) → S+
const POWER_RANKS: PowerRank[] = [
  { tier: "S+", label: "TRANSCENDENTE", color: "#FF2D55", glow: "rgba(255,45,85,0.5)",   minPower: 562 / 75 }, // CP 562
  { tier: "S",  label: "LENDÁRIO",      color: "#FFD700", glow: "rgba(255,215,0,0.5)",    minPower: 375 / 75 }, // CP 375
  { tier: "A",  label: "MÍTICO",        color: "#FF6B35", glow: "rgba(255,107,53,0.4)",   minPower: 270 / 75 }, // CP 270
  { tier: "B",  label: "ÉPICO",         color: "#c084fc", glow: "rgba(192,132,252,0.4)",  minPower: 200 / 75 }, // CP 200
  { tier: "C",  label: "RARO",          color: "#60a5fa", glow: "rgba(96,165,250,0.4)",   minPower: 150 / 75 }, // CP 150
  { tier: "D",  label: "VETERANO",      color: "#06FFA5", glow: "rgba(6,255,165,0.3)",    minPower: 120 / 75 }, // CP 120
  { tier: "E",  label: "APRENDIZ",      color: "#8a9fba", glow: "rgba(138,159,186,0.3)",  minPower:  90 / 75 }, // CP  90
  { tier: "F",  label: "NOVATO",        color: "#5a6080", glow: "rgba(90,96,128,0.2)",    minPower: 0 },
];

export function getPowerRank(power: number): PowerRank {
  for (const rank of POWER_RANKS) {
    if (power >= rank.minPower) return rank;
  }
  return POWER_RANKS[POWER_RANKS.length - 1];
}

/** Lookup rank from an integer CP value (as stored in the DB) */
export function getPowerRankFromCP(cp: number): PowerRank {
  return getPowerRank(cp / 75);
}

export function getNextPowerRank(power: number): PowerRank | null {
  const current = getPowerRank(power);
  const idx = POWER_RANKS.indexOf(current);
  return idx > 0 ? POWER_RANKS[idx - 1] : null;
}

/** Next rank lookup from an integer CP value */
export function getNextPowerRankFromCP(cp: number): PowerRank | null {
  return getNextPowerRank(cp / 75);
}

// ── Cálculos por componente ───────────────────────────────────────────────────

/**
 * MH = 1 + min(5, hábitosChecadosHoje) × 0.05
 * Só contam hábitos marcados hoje — criar um hábito sem marcar não dá bônus.
 * Cap: 5 hábitos → MH máx = 1.25
 */
export function calcMH(): number {
  const today  = new Date().toISOString().slice(0, 10);
  const habits = getActiveHabits();
  const checkedToday = habits.filter(h => h.checkIns.includes(today));
  const count  = Math.min(5, checkedToday.length);
  return parseFloat((1 + count * 0.05).toFixed(4));
}

/**
 * MN = 1 + (nível × 0.03)
 * Crescimento linear: lvl 10 → 1.30, lvl 20 → 1.60, lvl 30 → 1.90
 */
export function calcMN(level: number): number {
  return parseFloat((1 + level * 0.03).toFixed(4));
}

/**
 * MC = multiplicador de classe baseado no modo atual
 *  - Guerreiro em Desafio Temporal → 1.20
 *  - Mago em Modo Foco → 1.25
 *  - Fora do contexto → 1.00
 *  - Em modo "none" (display neutro): mostra o máximo da classe
 */
export function calcMC(mode: PowerMode = "none"): number {
  const economy = getEconomy();
  const cls = economy.selectedClass;
  if (cls === "guerreiro" && mode === "temporal") return 1.20;
  if (cls === "mago"      && mode === "focus")    return 1.25;
  // Display neutro: mostra o bônus característico da classe
  if (mode === "none") {
    if (cls === "guerreiro") return 1.20;
    if (cls === "mago")      return 1.25;
  }
  return 1.00;
}

/** MR = 1.0 + Σ(conquistas descongeladas de runs anteriores) */
export function calcMR(): number {
  return getPowerMR();
}

// ── Cálculo completo do Combat Power ─────────────────────────────────────────

/**
 * CP = 75 × (MH × MN × MC × MR)
 *
 * @param level   - Nível atual do personagem
 * @param mode    - Contexto de modo: "temporal", "focus", ou "none" (display neutro)
 */
export function getPower(level: number, mode: PowerMode = "none"): PowerData {
  const economy  = getEconomy();
  const habits   = getActiveHabits();
  const today    = new Date().toISOString().slice(0, 10);
  const checkedToday = habits.filter(h => h.checkIns.includes(today));
  const count    = Math.min(5, checkedToday.length);

  // Guard: ensure level is a valid positive finite number
  const safeLevel = Number.isFinite(level) && level > 0 ? level : 1;

  const baseMH = calcMH();
  const baseMN = calcMN(safeLevel);
  const baseMC = calcMC(mode);
  const baseMR = calcMR();

  // Item bonuses from equipped items
  const itemBonuses = getItemBonuses();
  const mh = parseFloat((baseMH + itemBonuses.bonusMH).toFixed(4));
  const mn = parseFloat((baseMN + itemBonuses.bonusMN).toFixed(4));
  const mc = parseFloat((baseMC + itemBonuses.bonusMC).toFixed(4));
  const mr = parseFloat((baseMR + itemBonuses.bonusMR).toFixed(4));

  // Guard each multiplier against NaN/Infinity before multiplying
  const safeMH = Number.isFinite(mh) ? mh : 1;
  const safeMN = Number.isFinite(mn) ? mn : 1;
  const safeMC = Number.isFinite(mc) ? mc : 1;
  const safeMR = Number.isFinite(mr) ? mr : 1;

  const rawTotal    = safeMH * safeMN * safeMC * safeMR;
  const total       = parseFloat((Number.isFinite(rawTotal) ? rawTotal : 1).toFixed(4));
  const combatPower = Math.floor(75 * total);
  const rank        = getPowerRank(total);

  const cls = economy.selectedClass;

  const mcLabel = cls === "guerreiro"
    ? (mode === "temporal" ? "×1.20 (Ativo)" : "×1.20 (Desafio Tempo)")
    : cls === "mago"
    ? (mode === "focus"    ? "×1.25 (Ativo)" : "×1.25 (Modo Foco)")
    : "×1.00 (Sem Classe)";

  const sources: PowerSource[] = [
    {
      id:     "mh",
      label:  "Hábitos",
      icon:   "MH",
      color:  "#FF6B35",
      value:  mh,
      desc:   count > 0
        ? `${count} hábito${count > 1 ? "s" : ""} marcado${count > 1 ? "s" : ""} hoje (${count} × 0.05)`
        : "Nenhum hábito marcado hoje",
      active: mh > 1,
    },
    {
      id:     "mn",
      label:  "Nível",
      icon:   "MN",
      color:  "#FFD700",
      value:  mn,
      desc:   `Nível ${level} — 1 + ${level} × 0.03`,
      active: mn > 1,
    },
    {
      id:     "mc",
      label:  "Classe",
      icon:   "MC",
      color:  cls === "guerreiro" ? "#E63946" : cls === "mago" ? "#60a5fa" : "#5a6080",
      value:  mc,
      desc:   mcLabel,
      active: mc > 1,
    },
    {
      id:     "mr",
      label:  "Rebirth",
      icon:   "MR",
      color:  "#06FFA5",
      value:  mr,
      desc:   mr > 1
        ? `+${(mr - 1).toFixed(2)} de conquistas descongeladas`
        : "Sem conquistas descongeladas ainda",
      active: mr > 1,
    },
  ];

  // Item bonus source (shown only when at least one item is equipped)
  const totalItemBonus = itemBonuses.bonusMH + itemBonuses.bonusMN + itemBonuses.bonusMC + itemBonuses.bonusMR;
  if (totalItemBonus > 0) {
    sources.push({
      id:     "items",
      label:  "Itens",
      icon:   "MI",
      color:  "#e39f64",
      value:  parseFloat((1 + totalItemBonus).toFixed(4)),
      desc:   `Bônus de itens equipados (+${totalItemBonus.toFixed(3)} distribuído entre MH/MN/MC/MR)`,
      active: true,
    });
  }

  return { total, combatPower, mh, mn, mc, mr, sources, rank };
}

/** @deprecated Use getPower() — alias kept for compatibility */
export function getCombatPower(level: number): PowerData {
  return getPower(level);
}

/**
 * Formata o CP para exibição principal (número inteiro).
 * Ex: getPower(10).total → formatCP(total) → "130"
 */
export function formatCP(power: number): string {
  return String(Math.floor(75 * power));
}

/** @deprecated Use formatCP() — alias kept for compatibility */
export function formatPower(power: number): string {
  return formatCP(power);
}

/** Formata o multiplicador puro para breakdown (ex: "×1.20") */
export function formatMultiplier(value: number): string {
  return `×${value.toFixed(2)}`;
}

/** % progresso para o próximo rank */
export function getPowerProgress(power: number): { percent: number; remaining: number } | null {
  const next = getNextPowerRank(power);
  if (!next) return null;
  const current = getPowerRank(power);
  const range   = next.minPower - current.minPower;
  const progress = power - current.minPower;
  return {
    percent:   Math.min(100, Math.round((progress / range) * 100)),
    remaining: parseFloat((next.minPower - power).toFixed(4)),
  };
}

/** CP progress in integer CP units */
export function getCPProgress(total: number): { percent: number; remainingCP: number } | null {
  const progress = getPowerProgress(total);
  if (!progress) return null;
  return {
    percent:     progress.percent,
    remainingCP: Math.ceil(progress.remaining * 75),
  };
}

/** @deprecated Use getNextPowerRank() */
export function getNextCPRank(power: number) { return getNextPowerRank(power); }

/** @deprecated Use getPowerRank() */
export function getCPRank(power: number) { return getPowerRank(power); }

/** @deprecated Use getPower().rank */
export type CPRank = PowerRank;