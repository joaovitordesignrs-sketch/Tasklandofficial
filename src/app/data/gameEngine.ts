/**
 * Game Engine v4 – Rebalanced damage & HP system
 * ─ 5 monster types: weak, normal, strong, xp_bonus, boss
 * ─ HP = phaseBase × typeModifier × variance(0.9–1.1)
 * ─ XP = phaseBaseXP × typeXPModifier
 * ─ Damage: base × (1 + level × 0.15)  [+0.15x per level]
 */
import { Task, Mission, MonsterType, TYPE_MODIFIERS, getPhase, getPhaseBaseXP } from "./missions";
import { getBonusXP } from "./challenges";
import { getClassXPBonus, getGmBonusXP } from "./economy";
import { getPower, type PowerMode } from "./combatPower";

// ── Difficulty tables ─────────────────────────────────────────────────────────

/** Base DAMAGE per task difficulty */
export const DIFFICULTY_DAMAGE: Record<string, number> = {
  easy:   30,
  medium: 50,
  hard:   75,
};

/** Base XP per task difficulty */
const DIFFICULTY_XP: Record<string, number> = {
  easy:   10,
  medium: 20,
  hard:   30,
};

export const DIFFICULTY_INFO: Record<string, { label: string; color: string; short: string; emoji: string }> = {
  easy:   { label: "Easy",   color: "#06FFA5", short: "E", emoji: "shield"  },
  medium: { label: "Medium", color: "#f0c040", short: "M", emoji: "swords"  },
  hard:   { label: "Hard",   color: "#E63946", short: "H", emoji: "flame"   },
};

// ── Damage calculation ────────────────────────────────────────────────────────
/**
 * Dano = DanoBase × Power
 * Power = MH × MN × MC × MR  (fórmula multiplicativa documentada)
 *
 * @param mode  - "temporal" (Guerreiro +15%), "focus" (Mago +20%), ou "none"
 */
export function calcTaskDamage(task: Task, level: number, isLastTaskOfDay = false, mode: PowerMode = "none"): number {
  const base  = DIFFICULTY_DAMAGE[task.difficulty ?? "easy"] ?? 30;
  const power = getPower(level, mode);
  return Math.max(1, Math.round(base * power.total));
}

export function calcBatchDamage(tasks: Task[], level: number, mode: PowerMode = "none"): number {
  return tasks.reduce((acc, t) => acc + calcTaskDamage(t, level, false, mode), 0);
}

// ── XP System ─────────────────────────────────────────────────────────────────

/** XP needed to go from `level` to `level+1` */
function xpForLevel(level: number): number {
  if (level <= 0) return 50;
  const earlyThresholds = [50, 100, 200, 350, 500];
  if (level <= 5) return earlyThresholds[level - 1];
  return Math.round(500 * Math.pow(1.25, level - 5));
}

export function getLevelInfo(totalXP: number): {
  level: number; currentXP: number; neededXP: number; totalXP: number;
} {
  // Guard against NaN/Infinity — would cause an infinite loop in the while below
  const safeXP = Number.isFinite(totalXP) && totalXP >= 0 ? totalXP : 0;
  let level = 1;
  let spent = 0;
  while (true) {
    const needed = xpForLevel(level);
    if (safeXP - spent < needed) {
      return { level, currentXP: safeXP - spent, neededXP: needed, totalXP: safeXP };
    }
    spent += needed;
    level++;
  }
}

/** XP gained for a single completed task */
export function calcTaskXP(task: Task, level: number): number {
  const base = DIFFICULTY_XP[task.difficulty ?? "easy"] ?? 10;
  const classBonus = getClassXPBonus(task.difficulty ?? "easy");
  return Math.round(base * (1 + level * 0.05) * (1 + classBonus));
}

/** Total XP from all completed tasks across all missions.
 *
 * The streak multiplier (×1.5 when 5+ tasks done today) is applied ONLY to
 * today's task XP, NOT retroactively to the entire historical sum.
 * This makes the total XP monotonically non-decreasing — it cannot shrink
 * at midnight or after a cloud sync that carries fewer "today" tasks.
 */
export function calcTotalXP(missions: Mission[]): number {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTs = todayStart.getTime();

  let historicalXP = 0; // tasks completed before today — fixed, never retroactively changed
  let todayXP = 0;      // tasks completed today — gets the streak bonus
  let todayCount = 0;

  for (const m of missions) {
    // Monster-type XP multiplier for task XP
    const typeMod = TYPE_MODIFIERS[m.monsterType ?? "normal"]?.xp ?? 1.0;
    // Phase 1 onboarding bonus (+20%)
    const phase = m.monsterPhase ?? getPhase(m.campaignOrder ?? 0);
    const onboardingMult = phase === 1 ? 1.2 : 1.0;

    for (const t of m.tasks) {
      if (t.completed) {
        const base = DIFFICULTY_XP[t.difficulty ?? "easy"] ?? 10;
        const taskXp = Math.round(base * onboardingMult * Math.min(typeMod, 1.5));

        if (t.completedAt && t.completedAt >= todayTs) {
          // Completed today — eligible for streak bonus
          todayXP += taskXp;
          todayCount++;
        } else {
          // Historical task — XP is locked in, unaffected by today's streak
          historicalXP += taskXp;
        }
      }
    }
  }

  // Apply streak bonus only to today's XP (never retroactive)
  const streakMult = todayCount >= 5 ? 1.5 : 1.0;
  const totalTaskXP = historicalXP + Math.round(todayXP * streakMult);

  return totalTaskXP + getBonusXP() + getGmBonusXP();
}

/** XP earned when defeating a campaign monster.
 *  Formula: phaseBaseXP × typeXPModifier */
export function calcMonsterXP(mission: Mission): number {
  const phase  = mission.monsterPhase ?? getPhase(mission.campaignOrder ?? 0);
  const baseXP = getPhaseBaseXP(phase);
  const mod    = TYPE_MODIFIERS[mission.monsterType ?? "normal"]?.xp ?? 1.0;
  return Math.round(baseXP * mod);
}

// ── Rank system ───────────────────────────────────────────────────────────────
export function getRank(level: number): { label: string; color: string } {
  if (level >= 30) return { label: "LEGENDARY", color: "#FF6B35" };
  if (level >= 20) return { label: "EPIC",      color: "#c084fc" };
  if (level >= 15) return { label: "MASTER",    color: "#60a5fa" };
  if (level >= 10) return { label: "RARE",      color: "#06FFA5" };
  if (level >= 5)  return { label: "WARRIOR",   color: "#e39f64" };
  if (level >= 3)  return { label: "VETERAN",   color: "#8a9fba" };
  return              { label: "NOVICE",      color: "#8a7a6a" };
}

// ── HP info ───────────────────────────────────────────────────────────────────
export interface HpInfo {
  current: number;
  max:     number;
  percent: number;
  label:   string;
}

export function getMonsterHpInfo(mission: Mission): HpInfo {
  const max     = mission.monsterMaxHp ?? 100;
  const current = Math.max(0, mission.monsterCurrentHp ?? max);
  return {
    current,
    max,
    percent: max > 0 ? (current / max) * 100 : 0,
    label:   `${current}/${max} HP`,
  };
}

export function isMonsterDefeated(mission: Mission): boolean {
  return (mission.monsterCurrentHp ?? 1) <= 0;
}

// ── Attack banner ─────────────────────────────────────────────────────────────
export type AttackBanner = {
  text: string; sub: string; color: string; emoji: string; size: string;
};

export function getAttackBanner(count: number, damage: number): AttackBanner {
  const dmgStr = `-${damage}HP`;
  if (count >= 5) return { text: "CRITICAL HIT!!!", sub: `${count} tasks! ${dmgStr}`,     color: "#FF6B35", emoji: "zap",      size: "34px" };
  if (count >= 3) return { text: "TRIPLE STRIKE!",  sub: `${count} destroyed! ${dmgStr}`, color: "#FFD700", emoji: "sparkles", size: "28px" };
  if (count >= 2) return { text: "DOUBLE STRIKE!",  sub: `2 at once! ${dmgStr}`,          color: "#06FFA5", emoji: "sparkles", size: "24px" };
  return            { text: "ATTACK!",              sub: `task completed! ${dmgStr}`,     color: "#ffffff", emoji: "swords",   size: "20px" };
}