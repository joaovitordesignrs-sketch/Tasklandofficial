// ── Economy, Classes, Pets & Achievements System ─────────────────────────────

// ── Skins ─────────────────────────────────────────────────────────────────────
export type SkinId = "warrior_base" | "warrior_aventureiro" | "mage";

export const SKIN_INFO: Record<SkinId, {
  label: string; cost: number; color: string; locked: boolean;
  rivUrl: string; fallbackImg: "warrior" | "mage";
}> = {
  warrior_base: {
    label: "Warrior", cost: 0, color: "#E63946", locked: false,
    rivUrl: "/taskland_animations_warrior_base.riv",
    fallbackImg: "warrior",
  },
  warrior_aventureiro: {
    label: "Adventurer", cost: 500, color: "#e39f64", locked: false,
    rivUrl: "/assets/taskland_animations_warrior_skin_aventureiro.riv",
    fallbackImg: "warrior",
  },
  mage: {
    label: "Mage", cost: 0, color: "#60a5fa", locked: true,
    rivUrl: "/taskland_animations_mage_base.riv",
    fallbackImg: "mage",
  },
};

// ── Character Classes (kept for backward compat with saved data) ──────────────
export type CharacterClass = "guerreiro" | "mago";

export const CLASS_INFO: Record<CharacterClass, {
  label: string; cost: number; color: string; icon: string;
  ability: string; desc: string; detailedDesc: string;
}> = {
  guerreiro: {
    label: "Warrior", cost: 0, color: "#E63946", icon: "swords",
    ability: "Final Charge",
    desc: "Last task of the day +30% damage",
    detailedDesc: "Combat specialist. The last task completed each day deals 30% more damage to the monster.",
  },
  mago: {
    label: "Mage", cost: 0, color: "#60a5fa", icon: "wand2",
    ability: "Arcane Wisdom",
    desc: "Hard tasks +15% XP",
    detailedDesc: "Master of arcane arts. HARD difficulty tasks grant 15% more XP, accelerating level progression.",
  },
};

// ── Pets ───────────────────────────────────────────────────────────────���───
export type PetType = "dragao" | "fenix" | "slime";

export const PET_INFO: Record<PetType, {
  label: string; cost: number; color: string; icon: string;
  effect: string; desc: string;
}> = {
  dragao: {
    label: "Little Dragon", cost: 500, color: "#FF6B35", icon: "flame",
    effect: "+5 coins/task", desc: "Automatically collects 5 coins per completed task",
  },
  fenix: {
    label: "Phoenix", cost: 2000, color: "#FFD700", icon: "sparkles",
    effect: "Revives 1 task/day", desc: "Revives 1 failed task per day",
  },
  slime: {
    label: "Tactical Slime", cost: 800, color: "#06FFA5", icon: "zap",
    effect: "+10% loot", desc: "+10% chance of doubled coin loot",
  },
};

// ── Achievements ─────────────────────────────────────────────────────────────
export type AchievementTier = "bronze" | "prata" | "ouro" | "diamante" | "lendario";

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
  // Time
  { id: "speedrunner-b", category: "Time",     name: "Speedrunner",          desc: "Complete 5 time challenges",                icon: "timer",    tier: "bronze",   check: s => s.challengesCompleted >= 5,   reward: { damageBonus: 0.10 } },
  { id: "speedrunner-p", category: "Time",     name: "Platinum Speedrunner", desc: "Complete 50 time challenges",               icon: "timer",    tier: "lendario", check: s => s.challengesCompleted >= 50,  reward: { damageBonus: 0.60 } },
  // Bosses
  { id: "boss-slayer-b", category: "Bosses",   name: "Boss Hunter",          desc: "Defeat 3 bosses",                           icon: "skull",    tier: "bronze",   check: s => s.totalBossesDefeated >= 3,   reward: { damageBonus: 0.10 } },
  { id: "boss-slayer-s", category: "Bosses",   name: "Boss Hunter II",       desc: "Defeat 10 bosses",                          icon: "skull",    tier: "prata",    check: s => s.totalBossesDefeated >= 10,  reward: { damageBonus: 0.15 } },
  { id: "boss-slayer-g", category: "Bosses",   name: "Boss Exterminator",    desc: "Defeat 25 bosses",                          icon: "skull",    tier: "diamante", check: s => s.totalBossesDefeated >= 25,  reward: { damageBonus: 0.40 } },
  // Habits
  { id: "iron-disc",     category: "Habits",   name: "Iron Discipline",      desc: "3 habits above 100 days",                   icon: "flame",    tier: "lendario", check: s => s.habitsOver100Days >= 3,     reward: { damageBonus: 0.60, title: "Discipline Master" } },
  { id: "habit-start",   category: "Habits",   name: "First Step",           desc: "Create your first habit",                   icon: "sprout",   tier: "bronze",   check: s => s.maxHabitStreak >= 1,        reward: { damageBonus: 0.10 } },
  { id: "habit-week",    category: "Habits",   name: "Consistent Week",      desc: "7-day streak on a habit",                   icon: "calendar-days", tier: "prata", check: s => s.maxHabitStreak >= 7,  reward: { damageBonus: 0.15 } },
  // Hardcore
  { id: "one-punch",     category: "Hardcore", name: "One Punch",            desc: "Defeat a boss with 1 hard task",            icon: "zap",      tier: "lendario", check: s => s.onePunchBosses >= 1,        reward: { damageBonus: 0.60, title: "Saitama" } },
  // Tasks
  { id: "tasks-10",      category: "Tasks",    name: "Apprentice",           desc: "Complete 10 tasks",                         icon: "pencil",   tier: "bronze",   check: s => s.totalTasksCompleted >= 10,  reward: { damageBonus: 0.10 } },
  { id: "tasks-50",      category: "Tasks",    name: "Dedicated",            desc: "Complete 50 tasks",                         icon: "pencil",   tier: "prata",    check: s => s.totalTasksCompleted >= 50,  reward: { damageBonus: 0.15 } },
  { id: "tasks-200",     category: "Tasks",    name: "Unstoppable",          desc: "Complete 200 tasks",                        icon: "pencil",   tier: "ouro",     check: s => s.totalTasksCompleted >= 200, reward: { damageBonus: 0.20 } },
  { id: "tasks-1000",    category: "Tasks",    name: "Living Legend",        desc: "Complete 1000 tasks",                       icon: "pencil",   tier: "lendario", check: s => s.totalTasksCompleted >= 1000,reward: { damageBonus: 0.60 } },
  // Monsters
  { id: "monsters-10",   category: "Monsters", name: "Hunter",               desc: "Defeat 10 monsters",                        icon: "sword",    tier: "bronze",   check: s => s.totalMonstersDefeated >= 10,reward: { damageBonus: 0.10 } },
  { id: "monsters-50",   category: "Monsters", name: "War Veteran",          desc: "Defeat 50 monsters",                        icon: "sword",    tier: "prata",    check: s => s.totalMonstersDefeated >= 50,reward: { damageBonus: 0.15 } },
  // Level
  { id: "level-5",       category: "Level",    name: "Warrior",              desc: "Reach level 5",                             icon: "star",     tier: "bronze",   check: s => s.level >= 5,                 reward: { damageBonus: 0.10 } },
  { id: "level-10",      category: "Level",    name: "Veteran",              desc: "Reach level 10",                            icon: "star",     tier: "prata",    check: s => s.level >= 10,                reward: { damageBonus: 0.15 } },
  { id: "level-20",      category: "Level",    name: "Master",               desc: "Reach level 20",                            icon: "star",     tier: "ouro",     check: s => s.level >= 20,                reward: { damageBonus: 0.20 } },
  { id: "level-30",      category: "Level",    name: "Legendary",            desc: "Reach level 30",                            icon: "star",     tier: "diamante", check: s => s.level >= 30,                reward: { damageBonus: 0.40 } },
];

export const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: "#cd7f32", prata: "#c0c0c0", ouro: "#FFD700", diamante: "#60a5fa", lendario: "#c084fc",
};

// ── Player Economy State ─────────────────────────────────────────────────────
export interface EconomyState {
  coins:           number;
  totalCoinsEarned: number;
  selectedClass:   CharacterClass | null;   // kept for cloud sync compat
  unlockedClasses: CharacterClass[];        // kept for cloud sync compat
  activeSkin:      SkinId;
  unlockedSkins:   SkinId[];
  pets:            PetType[];
  activePet:       PetType | null;
  unlockedAchievements: string[];
  title:           string | null;
  onePunchBosses:  number;
  needsClassSelection: boolean;
  bonusXP:         number;   // XP from monster kills (synced to cloud via economy)
  monsterEssences: number;   // essência de monstro — usada para evoluir itens
  gmBonusXP:       number;   // XP extra definido pelo Game Master (nunca resetado)
}

const ECON_KEY = "rpg_economy_v1";

function loadEconomy(): EconomyState {
  try {
    const raw = localStorage.getItem(ECON_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as EconomyState;
      parsed.needsClassSelection = false;
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
      if (!parsed.activeSkin) {
        parsed.activeSkin = "warrior_base";
        parsed.unlockedSkins = ["warrior_base"];
      }
      if (!parsed.unlockedSkins) {
        parsed.unlockedSkins = ["warrior_base"];
      }
      if (parsed.gmBonusXP === undefined) {
        parsed.gmBonusXP = 0;
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
    unlockedClasses: [], activeSkin: "warrior_base", unlockedSkins: ["warrior_base"],
    pets: [], activePet: null,
    unlockedAchievements: [], title: null, onePunchBosses: 0,
    needsClassSelection: false, bonusXP: migratedBonusXP,
    monsterEssences: 0, gmBonusXP: 0,
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

export function buySkin(skin: SkinId): boolean {
  const info = SKIN_INFO[skin];
  if (info.locked) return false;
  if (econ.unlockedSkins.includes(skin)) {
    econ = { ...econ, activeSkin: skin, needsClassSelection: false };
    saveEconomy(econ);
    return true;
  }
  if (!spendCoins(info.cost)) return false;
  econ = { ...econ, unlockedSkins: [...econ.unlockedSkins, skin], activeSkin: skin, needsClassSelection: false };
  saveEconomy(econ);
  return true;
}

export function selectSkin(skin: SkinId): void {
  if (!econ.unlockedSkins.includes(skin)) return;
  econ = { ...econ, activeSkin: skin, needsClassSelection: false };
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

/** Total damage bonus from all unlocked achievements */
export function getAchievementDamageBonus(): number {
  let total = 0;
  for (const ach of ACHIEVEMENTS) {
    if (econ.unlockedAchievements.includes(ach.id)) {
      total += ach.reward.damageBonus;
    }
  }
  return total;
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
  econ = {
    coins: 0, totalCoinsEarned: 0, selectedClass: null,
    unlockedClasses: [], activeSkin: "warrior_base", unlockedSkins: ["warrior_base"],
    pets: [], activePet: null,
    unlockedAchievements: [], title: null, onePunchBosses: 0,
    needsClassSelection: false, bonusXP: 0,
    monsterEssences: econ.monsterEssences ?? 0, gmBonusXP: 0,
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

// ── Game Master functions ─────────────────────────────────────────────────────

export function getGmBonusXP(): number {
  return econ.gmBonusXP ?? 0;
}

export function gmSetCoins(amount: number): void {
  econ = { ...econ, coins: Math.max(0, Math.floor(amount)) };
  saveEconomy(econ);
}

export function gmSetEssences(amount: number): void {
  econ = { ...econ, monsterEssences: Math.max(0, Math.floor(amount)) };
  saveEconomy(econ);
}

export function gmSetBonusXP(amount: number): void {
  econ = { ...econ, gmBonusXP: Math.max(0, Math.floor(amount)) };
  saveEconomy(econ);
}

