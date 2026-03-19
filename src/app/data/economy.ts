// ── Economy, Classes, Pets & Achievements System ─────────────────────────────

// ── Character Classes ────────────────────────────────────────────────────────
export type CharacterClass = "guerreiro" | "mago";

export const CLASS_INFO: Record<CharacterClass, {
  label: string; cost: number; color: string; icon: string;
  ability: string; desc: string; detailedDesc: string;
}> = {
  guerreiro: {
    label: "Guerreiro", cost: 0, color: "#E63946", icon: "swords",
    ability: "Investida Final",
    desc: "Última task do dia +30% dano",
    detailedDesc: "Especialista em combate corpo a corpo. A última tarefa completada a cada dia causa 30% mais dano ao monstro.",
  },
  mago: {
    label: "Mago", cost: 0, color: "#60a5fa", icon: "wand2",
    ability: "Sabedoria Arcana",
    desc: "Tasks difíceis +15% XP",
    detailedDesc: "Mestre dos arcanos. Tarefas de dificuldade DIFÍCIL concedem 15% mais XP, acelerando a progressão de nível.",
  },
};

// ── Pets ───────────────────────────────────────────────────────────────���───
export type PetType = "dragao" | "fenix" | "slime";

export const PET_INFO: Record<PetType, {
  label: string; cost: number; color: string; icon: string;
  effect: string; desc: string;
}> = {
  dragao: {
    label: "Dragãozinho", cost: 500, color: "#FF6B35", icon: "flame",
    effect: "+5 moedas/task", desc: "Coleta automaticamente 5 moedas por task concluída",
  },
  fenix: {
    label: "Fênix", cost: 2000, color: "#FFD700", icon: "sparkles",
    effect: "Revive 1 task/dia", desc: "Revive 1 task falhada por dia",
  },
  slime: {
    label: "Slime Tático", cost: 800, color: "#06FFA5", icon: "zap",
    effect: "+10% loot", desc: "+10% chance de loot duplicado em moedas",
  },
};

// ── Achievements ─────────────────────────────────────────────────────────────
export type AchievementTier = "bronze" | "prata" | "ouro" | "diamante" | "lendario";

/** Valor de multiplicador MR por tier de conquista (somado ao MR após rebirth) */
export const TIER_MR_VALUE: Record<AchievementTier, number> = {
  bronze:   0.10,
  prata:    0.15,
  ouro:     0.20,
  diamante: 0.40,
  lendario: 0.60,
};

/** @deprecated Use TIER_MR_VALUE — kept for backward compatibility */
export const TIER_DAMAGE_BONUS: Record<AchievementTier, number> = TIER_MR_VALUE;

export interface AchievementDef {
  id:       string;
  category: string;
  name:     string;
  desc:     string;
  icon:     string;
  tier:     AchievementTier;
  check:    (stats: PlayerStats) => boolean;
  reward:   { damageBonus: number; title?: string };
}

export interface PlayerStats {
  totalTasksCompleted:   number;
  totalMonstersDefeated: number;
  totalBossesDefeated:   number;
  maxHabitStreak:        number;
  habitsOver100Days:     number;
  level:                 number;
  challengesCompleted:   number;
  onePunchBosses:        number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Tempo
  { id: "speedrunner-b", category: "Tempo",    name: "Speedrunner",           desc: "Complete 5 desafios de tempo",              icon: "timer",    tier: "bronze",   check: s => s.challengesCompleted >= 5,   reward: { damageBonus: 0.10 } },
  { id: "speedrunner-p", category: "Tempo",    name: "Speedrunner Platina",   desc: "Complete 50 desafios de tempo",             icon: "timer",    tier: "lendario", check: s => s.challengesCompleted >= 50,  reward: { damageBonus: 0.60 } },
  // Bosses
  { id: "boss-slayer-b", category: "Bosses",   name: "Caçador de Chefes",     desc: "Derrote 3 bosses",                          icon: "skull",    tier: "bronze",   check: s => s.totalBossesDefeated >= 3,   reward: { damageBonus: 0.10 } },
  { id: "boss-slayer-s", category: "Bosses",   name: "Caçador de Chefes II",  desc: "Derrote 10 bosses",                         icon: "skull",    tier: "prata",    check: s => s.totalBossesDefeated >= 10,  reward: { damageBonus: 0.15 } },
  { id: "boss-slayer-g", category: "Bosses",   name: "Exterminador de Bosses",desc: "Derrote 25 bosses",                         icon: "skull",    tier: "diamante", check: s => s.totalBossesDefeated >= 25,  reward: { damageBonus: 0.40 } },
  // Hábitos
  { id: "iron-disc",     category: "Hábitos",  name: "Disciplina de Ferro",   desc: "3 hábitos acima de 100 dias",               icon: "flame",    tier: "lendario", check: s => s.habitsOver100Days >= 3,     reward: { damageBonus: 0.60, title: "Mestre da Disciplina" } },
  { id: "habit-start",   category: "Hábitos",  name: "Primeiro Passo",        desc: "Crie seu primeiro hábito",                  icon: "sprout",   tier: "bronze",   check: s => s.maxHabitStreak >= 1,        reward: { damageBonus: 0.10 } },
  { id: "habit-week",    category: "Hábitos",  name: "Semana Consistente",    desc: "7 dias de streak em um hábito",             icon: "calendar-days", tier: "prata", check: s => s.maxHabitStreak >= 7,   reward: { damageBonus: 0.15 } },
  // Hardcore
  { id: "one-punch",     category: "Hardcore", name: "One Punch",             desc: "Derrote um boss com 1 task difícil",        icon: "zap",      tier: "lendario", check: s => s.onePunchBosses >= 1,        reward: { damageBonus: 0.60, title: "Saitama" } },
  // Tasks
  { id: "tasks-10",      category: "Tarefas",  name: "Aprendiz",              desc: "Complete 10 tarefas",                       icon: "pencil",   tier: "bronze",   check: s => s.totalTasksCompleted >= 10,  reward: { damageBonus: 0.10 } },
  { id: "tasks-50",      category: "Tarefas",  name: "Dedicado",              desc: "Complete 50 tarefas",                       icon: "pencil",   tier: "prata",    check: s => s.totalTasksCompleted >= 50,  reward: { damageBonus: 0.15 } },
  { id: "tasks-200",     category: "Tarefas",  name: "Imparável",             desc: "Complete 200 tarefas",                      icon: "pencil",   tier: "ouro",     check: s => s.totalTasksCompleted >= 200, reward: { damageBonus: 0.20 } },
  { id: "tasks-1000",    category: "Tarefas",  name: "Lenda Viva",            desc: "Complete 1000 tarefas",                     icon: "pencil",   tier: "lendario", check: s => s.totalTasksCompleted >= 1000,reward: { damageBonus: 0.60 } },
  // Monstros
  { id: "monsters-10",   category: "Monstros", name: "Caçador",               desc: "Derrote 10 monstros",                       icon: "sword",    tier: "bronze",   check: s => s.totalMonstersDefeated >= 10,reward: { damageBonus: 0.10 } },
  { id: "monsters-50",   category: "Monstros", name: "Veterano de Guerra",    desc: "Derrote 50 monstros",                       icon: "sword",    tier: "prata",    check: s => s.totalMonstersDefeated >= 50,reward: { damageBonus: 0.15 } },
  // Level
  { id: "level-5",       category: "Nível",    name: "Guerreiro",             desc: "Alcance nível 5",                           icon: "star",     tier: "bronze",   check: s => s.level >= 5,                 reward: { damageBonus: 0.10 } },
  { id: "level-10",      category: "Nível",    name: "Veterano",              desc: "Alcance nível 10",                          icon: "star",     tier: "prata",    check: s => s.level >= 10,                reward: { damageBonus: 0.15 } },
  { id: "level-20",      category: "Nível",    name: "Mestre",                desc: "Alcance nível 20",                          icon: "star",     tier: "ouro",     check: s => s.level >= 20,                reward: { damageBonus: 0.20 } },
  { id: "level-30",      category: "Nível",    name: "Lendário",              desc: "Alcance nível 30",                          icon: "star",     tier: "diamante", check: s => s.level >= 30,                reward: { damageBonus: 0.40 } },
];

export const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: "#cd7f32", prata: "#c0c0c0", ouro: "#FFD700", diamante: "#60a5fa", lendario: "#c084fc",
};

// ── Player Economy State ─────────────────────────────────────────────────────
export interface EconomyState {
  coins:           number;
  totalCoinsEarned: number;
  selectedClass:   CharacterClass | null;
  unlockedClasses: CharacterClass[];
  pets:            PetType[];
  activePet:       PetType | null;
  unlockedAchievements: string[];
  title:           string | null;
  onePunchBosses:  number;
  needsClassSelection: boolean;
  focusDamageBonus: number;  // permanent +0.01x per focus task completed
  bonusXP:         number;   // XP from monster kills (synced to cloud via economy)
  monsterEssences: number;   // essência de monstro — usada para evoluir itens
}

const ECON_KEY = "rpg_economy_v1";

function loadEconomy(): EconomyState {
  try {
    const raw = localStorage.getItem(ECON_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as EconomyState;
      if (parsed.needsClassSelection === undefined) {
        parsed.needsClassSelection = parsed.selectedClass === null;
      }
      if (parsed.focusDamageBonus === undefined) {
        parsed.focusDamageBonus = 0;
      }
      if (parsed.bonusXP === undefined) {
        // Migrate from legacy rpg_bonus_xp_v3 key
        try {
          const legacy = parseInt(localStorage.getItem("rpg_bonus_xp_v3") ?? "0") || 0;
          parsed.bonusXP = legacy;
          if (legacy > 0) localStorage.removeItem("rpg_bonus_xp_v3");
        } catch {
          parsed.bonusXP = 0;
        }
      }
      if (parsed.monsterEssences === undefined) {
        parsed.monsterEssences = 0;
      }
      return parsed;
    }
  } catch { /* noop */ }
  // Migrate from legacy key on first load (no economy entry yet)
  let migratedBonusXP = 0;
  try {
    migratedBonusXP = parseInt(localStorage.getItem("rpg_bonus_xp_v3") ?? "0") || 0;
    if (migratedBonusXP > 0) localStorage.removeItem("rpg_bonus_xp_v3");
  } catch { /* noop */ }
  return {
    coins: 0, totalCoinsEarned: 0, selectedClass: null,
    unlockedClasses: [], pets: [], activePet: null,
    unlockedAchievements: [], title: null, onePunchBosses: 0,
    needsClassSelection: true, focusDamageBonus: 0, bonusXP: migratedBonusXP,
    monsterEssences: 0,
  };
}

function saveEconomy(e: EconomyState): void {
  try { localStorage.setItem(ECON_KEY, JSON.stringify(e)); } catch { /* noop */ }
  try { import("./syncService").then(s => s.schedulePush(5000)); } catch { /* noop */ }
}

let econ: EconomyState = loadEconomy();

export function getEconomy(): EconomyState { return econ; }

export function addCoins(amount: number): void {
  // Slime pet bonus: +10% chance of double coins
  if (econ.activePet === "slime" && Math.random() < 0.10) {
    amount = Math.round(amount * 2);
  }
  econ = { ...econ, coins: econ.coins + amount, totalCoinsEarned: econ.totalCoinsEarned + amount };
  saveEconomy(econ);
}

export function spendCoins(amount: number): boolean {
  if (econ.coins < amount) return false;
  econ = { ...econ, coins: econ.coins - amount };
  saveEconomy(econ);
  return true;
}

export function buyClass(cls: CharacterClass): boolean {
  const info = CLASS_INFO[cls];
  if (econ.unlockedClasses.includes(cls)) {
    // Already unlocked — just re-select it
    econ = { ...econ, selectedClass: cls, needsClassSelection: false };
    saveEconomy(econ);
    return true;
  }
  if (!spendCoins(info.cost)) return false;
  econ = { ...econ, unlockedClasses: [...econ.unlockedClasses, cls], selectedClass: cls, needsClassSelection: false };
  saveEconomy(econ);
  return true;
}

export function selectClass(cls: CharacterClass | null): void {
  if (cls && !econ.unlockedClasses.includes(cls)) return;
  econ = { ...econ, selectedClass: cls, needsClassSelection: cls !== null ? false : econ.needsClassSelection };
  saveEconomy(econ);
}

/** Mark class as chosen — clears the selection gate */
export function markClassSelected(): void {
  econ = { ...econ, needsClassSelection: false };
  saveEconomy(econ);
}

export function buyPet(pet: PetType): boolean {
  const info = PET_INFO[pet];
  if (econ.pets.includes(pet)) return false;
  if (!spendCoins(info.cost)) return false;
  econ = { ...econ, pets: [...econ.pets, pet], activePet: pet };
  saveEconomy(econ);
  return true;
}

export function selectPet(pet: PetType | null): void {
  if (pet && !econ.pets.includes(pet)) return;
  econ = { ...econ, activePet: pet };
  saveEconomy(econ);
}

export function recordOnePunchBoss(): void {
  econ = { ...econ, onePunchBosses: econ.onePunchBosses + 1 };
  saveEconomy(econ);
}

/** Get the accumulated focus task permanent damage bonus */
export function getFocusDamageBonus(): number {
  return econ.focusDamageBonus ?? 0;
}

/** Add +0.01x (or custom amount) permanent damage from completing a focus task */
export function addFocusDamageBonus(amount = 0.01): void {
  econ = { ...econ, focusDamageBonus: parseFloat(((econ.focusDamageBonus ?? 0) + amount).toFixed(4)) };
  saveEconomy(econ);
}

/** Check and unlock new achievements, returns newly unlocked ones */
export function checkAchievements(stats: PlayerStats): AchievementDef[] {
  const newlyUnlocked: AchievementDef[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (econ.unlockedAchievements.includes(ach.id)) continue;
    if (ach.check(stats)) {
      econ.unlockedAchievements.push(ach.id);
      newlyUnlocked.push(ach);
      // Grant title if any
      if (ach.reward.title) econ.title = ach.reward.title;
    }
  }
  if (newlyUnlocked.length > 0) saveEconomy(econ);
  return newlyUnlocked;
}

/** Total damage bonus from all unlocked achievements
 *  In the rebirth system, only the CRYSTALLISED bonus from past rebirths applies.
 *  Current-run achievements are "pending" until the next rebirth. */
export function getAchievementDamageBonus(): number {
  return loadRebirth().permanentDamageBonus;
}

/** Coins earned per task completion (+10, +5 if dragon pet) */
export function getTaskCoinReward(): number {
  let base = 10;
  if (econ.activePet === "dragao") base += 5;
  return base;
}

/** Coins earned for defeating a monster */
export function getMonsterCoinReward(type: string): number {
  switch (type) {
    case "boss":     return 200;
    case "strong":   return 75;
    case "xp_bonus": return 50;
    case "normal":   return 50;
    case "weak":     return 30;
    default:         return 50;
  }
}

/** Class-based damage multiplier bonus */
export function getClassDamageBonus(isLastTaskOfDay: boolean): number {
  if (econ.selectedClass === "guerreiro" && isLastTaskOfDay) return 0.30;
  return 0;
}

/** Class-based XP bonus */
export function getClassXPBonus(difficulty: string): number {
  if (econ.selectedClass === "mago" && difficulty === "hard") return 0.15;
  return 0;
}

export function resetEconomy(): void {
  // focusDamageBonus is permanent — survives rebirth
  const preservedFocusBonus = econ.focusDamageBonus ?? 0;
  econ = {
    coins: 0, totalCoinsEarned: 0, selectedClass: null,
    unlockedClasses: [], pets: [], activePet: null,
    unlockedAchievements: [], title: null, onePunchBosses: 0,
    needsClassSelection: true, focusDamageBonus: preservedFocusBonus, bonusXP: 0,
    monsterEssences: econ.monsterEssences ?? 0,
  };
  saveEconomy(econ);
}

export function reloadEconomy(): void {
  econ = loadEconomy();
}

// ── Bonus XP (monster kills) ─────────────────────────────────────────────────
// bonusXP lives inside EconomyState so it is included in the cloud sync payload.
// This prevents XP loss on page refresh (old impl used a separate localStorage key
// that was never pushed to cloud, causing desync).

export function getBonusXP(): number {
  return econ.bonusXP ?? 0;
}

export function addBonusXP(amount: number): void {
  econ = { ...econ, bonusXP: (econ.bonusXP ?? 0) + amount };
  // Write to localStorage synchronously (no await) so data is safe immediately
  try { localStorage.setItem(ECON_KEY, JSON.stringify(econ)); } catch { /* noop */ }
  // Urgent push: monster kills must reach cloud fast (500ms) to survive quick page refreshes
  try { import("./syncService").then(s => s.schedulePush(500)); } catch { /* noop */ }
}

export function resetBonusXP(): void {
  econ = { ...econ, bonusXP: 0 };
  saveEconomy(econ);
}

// ── Monster Essences ──────────────────────────────────────────────────────────

export function getMonsterEssences(): number {
  return econ.monsterEssences ?? 0;
}

export function addEssences(amount: number): void {
  econ = { ...econ, monsterEssences: (econ.monsterEssences ?? 0) + amount };
  try { localStorage.setItem(ECON_KEY, JSON.stringify(econ)); } catch { /* noop */ }
  try { import("./syncService").then(s => s.schedulePush(3000)); } catch { /* noop */ }
}

export function spendEssences(amount: number): boolean {
  if ((econ.monsterEssences ?? 0) < amount) return false;
  econ = { ...econ, monsterEssences: (econ.monsterEssences ?? 0) - amount };
  saveEconomy(econ);
  return true;
}

// ── Rebirth / Rogue-like System ──────────────────────────────────────────────

export interface RebirthState {
  runNumber:              number;   // current run (starts at 1)
  totalRebirths:          number;   // how many times reborn
  permanentDamageBonus:   number;   // crystallised achievement damage bonus
  permanentAchievements:  string[]; // achievement IDs locked from past runs
  lastRebirthAt?:         number;   // timestamp
  highestLevelEver:       number;   // max level across all runs
  totalMonstersEver:      number;   // total monsters killed across all runs
  totalTasksEver:         number;   // total tasks done across all runs
}

const REBIRTH_KEY = "rpg_rebirth_v1";

function loadRebirth(): RebirthState {
  try {
    const raw = localStorage.getItem(REBIRTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RebirthState;
      // Migrate: ensure array fields always exist (older saves may lack them)
      if (!Array.isArray(parsed.permanentAchievements)) parsed.permanentAchievements = [];
      return parsed;
    }
  } catch { /* noop */ }
  return {
    runNumber: 1, totalRebirths: 0,
    permanentDamageBonus: 0, permanentAchievements: [],
    highestLevelEver: 0, totalMonstersEver: 0, totalTasksEver: 0,
  };
}

function saveRebirth(r: RebirthState): void {
  try { localStorage.setItem(REBIRTH_KEY, JSON.stringify(r)); } catch { /* noop */ }
  try { import("./syncService").then(s => s.schedulePush(3000)); } catch { /* noop */ }
}

let rebirthState: RebirthState = loadRebirth();

export function getRebirthState(): RebirthState { return rebirthState; }

export function reloadRebirth(): void { rebirthState = loadRebirth(); }

/** Get the permanent damage bonus from past rebirths */
export function getRebirthDamageBonus(): number {
  return rebirthState.permanentDamageBonus;
}

/** Calculate the "pending" bonus — what achievements would give after rebirth */
export function getPendingRebirthBonus(): number {
  let total = 0;
  for (const ach of ACHIEVEMENTS) {
    if (econ.unlockedAchievements.includes(ach.id)) {
      total += ach.reward.damageBonus;
    }
  }
  return total;
}

/** Calculate gain from rebirthing now (pending minus already crystallised) */
export function getRebirthGain(): number {
  return Math.max(0, getPendingRebirthBonus() - loadRebirth().permanentDamageBonus);
}

/** Power Multiplicador de Rebirth (MR):
 *  MR = 1.0 + permanentDamageBonus (crystallised from past rebirths)
 *  Current-run pending achievements are NOT included — they crystallise at next rebirth. */
export function getPowerMR(): number {
  const permanentBonus = loadRebirth().permanentDamageBonus;
  const base = 1.0 + (Number.isFinite(permanentBonus) ? permanentBonus : 0);
  // focusDamageBonus accumulates permanently and contributes to MR
  const rawFocus = econ.focusDamageBonus;
  const focusContrib = Number.isFinite(rawFocus) ? rawFocus : 0;
  return parseFloat((base + focusContrib).toFixed(4));
}

/**
 * Perform a rebirth:
 * - Crystallises all unlocked achievement bonuses as permanent damage
 * - Resets: level, missions, challenges, bonus XP, campaign progress
 * - Keeps: achievements, habits, coins, classes, pets, player name
 */
export function performRebirth(currentLevel: number, totalMonsters: number, totalTasks: number): RebirthState {
  // Crystallise achievement damage
  const newPermBonus = getPendingRebirthBonus();
  
  // Merge achievement IDs
  const allAchIds = new Set([
    ...rebirthState.permanentAchievements,
    ...econ.unlockedAchievements,
  ]);

  rebirthState = {
    runNumber:             rebirthState.runNumber + 1,
    totalRebirths:         rebirthState.totalRebirths + 1,
    permanentDamageBonus:  newPermBonus,
    permanentAchievements: Array.from(allAchIds),
    lastRebirthAt:         Date.now(),
    highestLevelEver:      Math.max(rebirthState.highestLevelEver, currentLevel),
    totalMonstersEver:     rebirthState.totalMonstersEver + totalMonsters,
    totalTasksEver:        rebirthState.totalTasksEver + totalTasks,
  };
  saveRebirth(rebirthState);

  // Reset class selection so user picks again for the new run
  econ = {
    ...econ,
    selectedClass: null,
    unlockedClasses: [],
    needsClassSelection: true,
  };
  saveEconomy(econ);

  return rebirthState;
}