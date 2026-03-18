// ── Types ─────────────────────────────────────────────────────────────────────
export type TaskDifficulty = "easy" | "medium" | "hard";
export type GameMode       = "standard" | "campaign";
export type MonsterType    = "weak" | "normal" | "strong" | "xp_bonus" | "boss";

export interface Task {
  id:          string;
  text:        string;
  completed:   boolean;
  difficulty?: TaskDifficulty;
  completedAt?: number;
  damageDealt?: number;
  tag?:        string;   // ← NEW: client / project tag
}

export interface Mission {
  id:          string;
  name:        string;
  description: string;
  deadline:    string;
  startedAt:   string;
  monsterName: string;
  tasks:       Task[];
  mode?:            GameMode;
  monsterMaxHp?:     number;
  monsterCurrentHp?: number;
  monsterType?:      MonsterType;
  monsterPhase?:     number;
  campaignGroupId?:  string;
  campaignOrder?:    number;
  unlocked?:         boolean;
}

// ── Phase system ──────────────────────────────────────────────────────────────
export function getPhase(order: number): number {
  if (order < 5)  return 1;
  if (order < 15) return 2;
  if (order < 30) return 3;
  if (order < 50) return 4;
  return 4 + Math.floor((order - 50) / 20) + 1;
}

export function getPhaseBaseHP(phase: number): number {
  return Math.round(75 * Math.pow(2, phase - 1));
}

export function getPhaseBaseXP(phase: number): number {
  return 50 * phase;
}

function isBossSlot(order: number): boolean {
  return order === 4 || order === 14 || order === 29 || order === 49
    || (order >= 50 && ((order - 50) % 20 === 19));
}

// ── Monster type modifiers ────────────────────────────────────────────────────
export const TYPE_MODIFIERS: Record<MonsterType, { hp: number; xp: number }> = {
  weak:     { hp: 1.0, xp: 1.0 },
  normal:   { hp: 1.5, xp: 1.5 },
  strong:   { hp: 2.0, xp: 2.0 },
  xp_bonus: { hp: 1.5, xp: 3.0 },
  boss:     { hp: 3.5, xp: 6.0 },
};

export const TYPE_INFO: Record<MonsterType, { label: string; color: string; icon: string }> = {
  weak:     { label: "FRACO",    color: "#8a9fba", icon: "▽" },
  normal:   { label: "NORMAL",   color: "#ffffff", icon: "" },
  strong:   { label: "FORTE",    color: "#E63946", icon: "▲" },
  xp_bonus: { label: "XP BÔNUS", color: "#FFD700", icon: "★" },
  boss:     { label: "BOSS",     color: "#FF6B35", icon: "♛" },
};

// ── Pity / streak tracking ────────────────────────────────────────────────────
const PITY_KEY = "rpg_pity_history_v1";

function loadPityHistory(): MonsterType[] {
  try {
    const raw = localStorage.getItem(PITY_KEY);
    if (raw) return JSON.parse(raw) as MonsterType[];
  } catch { /* noop */ }
  return [];
}

function savePityHistory(history: MonsterType[]): void {
  try { localStorage.setItem(PITY_KEY, JSON.stringify(history.slice(-5))); } catch { /* noop */ }
}

function pushPityHistory(type: MonsterType): void {
  const h = loadPityHistory();
  h.push(type);
  savePityHistory(h);
}

function rollMonsterType(rand: () => number): MonsterType {
  const history = loadPityHistory();
  const last = history[history.length - 1];
  const lastThree = history.slice(-3);

  let wWeak = 25, wNormal = 50, wStrong = 15, wBonus = 10;

  if (last === "strong") {
    wWeak   += 10; wBonus  += 10; wStrong -= 10; wNormal -= 10;
  }
  if (lastThree.length >= 3 && lastThree.every(t => t === "weak")) {
    wStrong += 30; wWeak -= 20; wNormal -= 10;
  }
  if (last === "xp_bonus") {
    wBonus -= 5; wNormal += 5;
  }

  wWeak   = Math.max(5, wWeak);
  wNormal = Math.max(10, wNormal);
  wStrong = Math.max(5, wStrong);
  wBonus  = Math.max(3, wBonus);

  const total = wWeak + wNormal + wStrong + wBonus;
  const r = rand() * total;

  if (r < wWeak)                     return "weak";
  if (r < wWeak + wNormal)           return "normal";
  if (r < wWeak + wNormal + wStrong) return "strong";
  return "xp_bonus";
}

// ── Infinite campaign data pools ──────────────────────────────────────────────
// Names per type match the actual sprite used in the arena
const MONSTER_NAMES: Record<MonsterType, string[]> = {
  // Sprite: Slime
  weak: [
    "Slime Verdoso","Slime Ácido","Slime Glacial","Slime Tóxico","Slime Sombrio",
    "Slime Carmesim","Slime Elétrico","Slime Dourado","Slime Fantasma","Slime Abissal",
  ],
  // Sprite: Goblin
  normal: [
    "Goblin Guerreiro","Goblin Arqueiro","Goblin Xamã","Goblin Mercenário","Goblin Ladrão",
    "Goblin Capitão","Goblin Bombardeiro","Goblin Sentinela","Goblin Berserk","Goblin Sábio",
  ],
  // Sprite: Esqueleto
  strong: [
    "Esqueleto Guerreiro","Esqueleto Arcano","Esqueleto Campeão","Esqueleto Cavaleiro",
    "Esqueleto Sombrio","Esqueleto Ancião","Esqueleto Amaldiçoado","Esqueleto Lorde",
    "Esqueleto Implacável","Esqueleto Invocador",
  ],
  // Sprite: Cogu
  xp_bonus: [
    "Cogu Venenoso","Cogu Radioativo","Cogu Dourado","Cogu Sombrio","Cogu Explosivo",
    "Cogu Arcano","Cogu Maldito","Cogu Místico","Cogu Celestial","Cogu Ancião",
  ],
  // Sprite: Golem de Cristal (order par) / Dark Lord Warrior (order ímpar)
  boss: [
    "Golem de Cristal","Dark Lord Warrior","Golem Primordial","Cavaleiro das Sombras",
    "Golem Celestial","Senhor das Trevas","Golem Eterno","Guerreiro Sombrio",
    "Golem Abissal","Lorde Caótico",
  ],
};

const CHAPTER_NAMES = [
  "Saga das Masmorras","Ruínas do Esquecido","Abismo Eterno","O Trono Proibido",
  "Além das Estrelas","O Caos Primordial","Eras das Trevas","O Fim dos Tempos",
];

function rng(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function typeLabel(type: MonsterType): string {
  switch (type) {
    case "weak":     return " ▽FRACO";
    case "strong":   return " ▲FORTE";
    case "xp_bonus": return " ★XP BÔNUS";
    case "boss":     return " ♛BOSS";
    default:         return "";
  }
}

export function generateMission(order: number): Mission {
  const chapter   = Math.floor(order / 5);
  const posInChap = order % 5;
  const rand      = rng(order * 31337 + 999 + Date.now() % 10000);

  const phase  = getPhase(order);
  const baseHP = getPhaseBaseHP(phase);

  let type: MonsterType;
  if (isBossSlot(order)) {
    type = "boss";
  } else {
    type = rollMonsterType(rand);
    pushPityHistory(type);
  }

  const mod = TYPE_MODIFIERS[type];
  const variance = 0.9 + rand() * 0.2;
  const hp = Math.round(baseHP * mod.hp * variance);

  const romans      = ["I","II","III","IV","V"];
  const monsterIdx  = order % MONSTER_NAMES[type].length;
  const monsterName = MONSTER_NAMES[type][monsterIdx];
  const chapterName = CHAPTER_NAMES[chapter % CHAPTER_NAMES.length];
  const tLabel      = typeLabel(type);
  const name        = `${romans[posInChap]} – ${monsterName}${tLabel}`;
  const description = `${chapterName}: Nível ${order + 1}. ${monsterName} (${TYPE_INFO[type].label}) aguarda com ${hp} HP.`;

  return {
    id:               `camp-gen-${order}`,
    name,
    description,
    deadline:         new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    startedAt:        new Date().toISOString(),
    monsterName,
    mode:             "campaign",
    monsterMaxHp:     hp,
    monsterCurrentHp: hp,
    monsterType:      type,
    monsterPhase:     phase,
    campaignGroupId:  "infinite",
    campaignOrder:    order,
    unlocked:         order === 0,
    tasks:            [],
  };
}

// ── Static initial missions (Phase 1, orders 0–4) ────────────────────────────
export const initialMissions: Mission[] = [
  {
    id: "camp-1", name: "I – Slime Verdoso ▽FRACO",
    description: "Um Slime Verdoso bloqueia a entrada da masmorra. Adicione suas tarefas para derrotá-lo!",
    deadline: new Date(Date.now()+30*24*60*60*1000).toISOString(), startedAt: new Date().toISOString(),
    monsterName: "Slime Verdoso", mode: "campaign", monsterType: "weak", monsterPhase: 1,
    monsterMaxHp: 75, monsterCurrentHp: 75,
    campaignGroupId: "infinite", campaignOrder: 0, unlocked: true,
    tasks: [],
  },
  {
    id: "camp-2", name: "II – Goblin Guerreiro",
    description: "O Goblin Guerreiro guarda o corredor sombrio com seu machado enferrujado.",
    deadline: new Date(Date.now()+30*24*60*60*1000).toISOString(), startedAt: new Date().toISOString(),
    monsterName: "Goblin Guerreiro", mode: "campaign", monsterType: "normal", monsterPhase: 1,
    monsterMaxHp: 112, monsterCurrentHp: 112,
    campaignGroupId: "infinite", campaignOrder: 1, unlocked: false,
    tasks: [],
  },
  {
    id: "camp-3", name: "III – Cogu Dourado ★XP BÔNUS",
    description: "O Cogu Dourado é raro e cheio de esporos mágicos — derrote-o para ganhar XP extra!",
    deadline: new Date(Date.now()+30*24*60*60*1000).toISOString(), startedAt: new Date().toISOString(),
    monsterName: "Cogu Dourado", mode: "campaign", monsterType: "xp_bonus", monsterPhase: 1,
    monsterMaxHp: 112, monsterCurrentHp: 112,
    campaignGroupId: "infinite", campaignOrder: 2, unlocked: false,
    tasks: [],
  },
  {
    id: "camp-4", name: "IV – Esqueleto Guerreiro ▲FORTE",
    description: "O Esqueleto Guerreiro reviveu das ruínas e está sedento por batalha!",
    deadline: new Date(Date.now()+30*24*60*60*1000).toISOString(), startedAt: new Date().toISOString(),
    monsterName: "Esqueleto Guerreiro", mode: "campaign", monsterType: "strong", monsterPhase: 1,
    monsterMaxHp: 150, monsterCurrentHp: 150,
    campaignGroupId: "infinite", campaignOrder: 3, unlocked: false,
    tasks: [],
  },
  {
    id: "camp-5", name: "V – Golem de Cristal ♛BOSS",
    description: "O Golem de Cristal guarda o portal para a Fase 2. Derrote-o para avançar!",
    deadline: new Date(Date.now()+30*24*60*60*1000).toISOString(), startedAt: new Date().toISOString(),
    monsterName: "Golem de Cristal", mode: "campaign", monsterType: "boss", monsterPhase: 1,
    monsterMaxHp: 262, monsterCurrentHp: 262,
    campaignGroupId: "infinite", campaignOrder: 4, unlocked: false,
    tasks: [],
  },
];

// ── localStorage ──────────────────────────────────────────────────────────────
const KEY         = "rpg_missions_v8";
const PLAYER_KEY  = "rpg_player_v1";
const HISTORY_KEY = "rpg_task_history_v1";

// ── Task History ──────────────────────────────────────────────────────────────
export interface TaskHistoryEntry {
  id:          string;
  text:        string;
  difficulty:  TaskDifficulty;
  completedAt: number;
  monsterName: string;
  missionId:   string;
  missionName?: string;
  source?:        "campaign" | "time-attack" | "focus";
  challengeName?: string;
  tag?:        string;
}

function loadTaskHistory(): TaskHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw) as TaskHistoryEntry[];
  } catch { /* noop */ }
  return [];
}

// ── In-memory store for task history (mirrors localStorage) ──────────────────
let taskHistoryStore: TaskHistoryEntry[] = loadTaskHistory();

/** Reload in-memory task history from localStorage (called after cloud sync) */
export function reloadTaskHistory(): void {
  taskHistoryStore = loadTaskHistory();
}

function saveTaskHistory(history: TaskHistoryEntry[]): void {
  taskHistoryStore = history; // update in-memory immediately
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { /* noop */ }
  // Dispatch a local event so PastMonsterTasks and other listeners refresh immediately
  try { window.dispatchEvent(new CustomEvent("rpg:history-updated")); } catch { /* noop */ }
  // Urgent push: task history must reach cloud fast (500ms) so it survives
  // a quick page refresh before the debounce fires.
  try { import("./syncService").then(s => s.schedulePush(500)); } catch { /* noop */ }
}

export function getTaskHistory(): TaskHistoryEntry[] {
  return taskHistoryStore;
}

export function addTaskToHistory(task: Task, mission: Mission): void {
  const history = [...taskHistoryStore]; // use in-memory store for consistency
  if (history.some((h) => h.id === task.id)) return;
  history.push({
    id:          task.id,
    text:        task.text,
    difficulty:  task.difficulty ?? "easy",
    completedAt: task.completedAt ?? Date.now(),
    monsterName: mission.monsterName,
    missionId:   mission.id,
    missionName: mission.name,
    source:      "campaign",
    tag:         task.tag,
  });
  saveTaskHistory(history);
}

export function addChallengeTaskToHistory(
  taskId: string,
  text: string,
  difficulty: TaskDifficulty,
  completedAt: number,
  source: "time-attack" | "focus",
  challengeName: string,
): void {
  const history = [...taskHistoryStore]; // use in-memory store for consistency
  if (history.some((h) => h.id === taskId)) return;
  history.push({
    id: taskId, text, difficulty, completedAt,
    monsterName: "", missionId: "", source, challengeName,
  });
  saveTaskHistory(history);
}

export function removeTaskFromHistory(taskId: string): void {
  const history = taskHistoryStore.filter((h) => h.id !== taskId);
  saveTaskHistory(history);
}

function loadMissions(): Mission[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Mission[];
  } catch { /* noop */ }
  return initialMissions.map((m) => ({ ...m }));
}

function saveMissions(missions: Mission[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(missions)); } catch { /* noop */ }
  // Push to cloud within 1s — faster than the old 3s so task completions
  // survive a quick page refresh before the debounce fires.
  try { import("./syncService").then(s => s.schedulePush(1000)); } catch { /* noop */ }
}

export function loadPlayerName(): string {
  try { return localStorage.getItem(PLAYER_KEY) ?? "Aventureiro"; } catch { return "Aventureiro"; }
}
export function savePlayerName(name: string): void {
  try { localStorage.setItem(PLAYER_KEY, name); } catch { /* noop */ }
}

let missionsStore: Mission[] = loadMissions();

export function getMissions(): Mission[] { return missionsStore; }

export function reloadMissions(): void {
  missionsStore = loadMissions();
}

export function getMissionById(id: string): Mission | undefined {
  return missionsStore.find((m) => m.id === id);
}
export function updateMission(m: Mission): void {
  missionsStore = missionsStore.map((x) => (x.id === m.id ? m : x));
  saveMissions(missionsStore);
}
export function createMission(m: Omit<Mission,"id">): Mission {
  const nm = { ...m, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
  missionsStore = [...missionsStore, nm];
  saveMissions(missionsStore);
  return nm;
}
export function deleteMission(id: string): void {
  missionsStore = missionsStore.filter((m) => m.id !== id);
  saveMissions(missionsStore);
}

// ── Campaign helpers ──────────────────────────────────────────────────────────

export function getActiveCampaignMission(): Mission | null {
  const campaign = missionsStore
    .filter((m) => m.mode === "campaign" && m.unlocked === true)
    .sort((a, b) => (a.campaignOrder ?? 0) - (b.campaignOrder ?? 0));
  return campaign.find((m) => (m.monsterCurrentHp ?? m.monsterMaxHp ?? 1) > 0) ?? null;
}

export function unlockNext(defeated: Mission): Mission {
  const nextOrder = (defeated.campaignOrder ?? 0) + 1;

  const existing = missionsStore.find(
    (m) => m.campaignGroupId === "infinite" && m.campaignOrder === nextOrder
  );

  if (existing) {
    const unlocked = { ...existing, unlocked: true };
    updateMission(unlocked);
    return unlocked;
  }

  const generated = generateMission(nextOrder);
  const withUnlock = { ...generated, unlocked: true };
  missionsStore = [...missionsStore, withUnlock];
  saveMissions(missionsStore);
  return withUnlock;
}

export function isCampaignComplete(): boolean { return false; }

/**
 * Full game reset — clears ALL data including task history.
 * Use only for the "nuclear reset" in settings.
 * NOTE: callers must also call resetBonusXP() from economy.ts
 * (not done here to avoid a circular import: missions → economy → syncService → missions).
 */
export function resetAllProgress(): void {
  missionsStore = initialMissions.map(m => ({ ...m }));
  saveMissions(missionsStore);
  // Full reset: clear task history, pity, and challenges
  try { localStorage.removeItem(HISTORY_KEY); } catch { /* noop */ }
  try { localStorage.removeItem("rpg_pity_history_v1"); } catch { /* noop */ }
  try { localStorage.removeItem("rpg_challenges_v1"); } catch { /* noop */ }
}

/**
 * Rebirth reset — resets campaign progress but PRESERVES the task history
 * (Diário de Missões) so the player can always see their past missions.
 * Only pending tasks from the ACTIVE mission (being fought) are carried over
 * into the first mission of the new run. Tasks from locked/future missions
 * are discarded — they would feel like "phantom tasks" the user didn't add.
 * NOTE: callers must also call resetBonusXP() from economy.ts.
 */
export function rebirthReset(): { monstersDefeated: number; tasksCompleted: number } {
  let monstersDefeated = 0;
  let tasksCompleted = 0;

  // Find the currently active mission (the one being fought right now)
  const activeMission = getActiveCampaignMission();

  // Only carry over pending tasks from the active mission
  const pendingTasks: Task[] = activeMission
    ? activeMission.tasks
        .filter(t => !t.completed)
        .map(t => ({
          ...t,
          id: `carry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          completed: false,
          completedAt: undefined,
          damageDealt: undefined,
        }))
    : [];

  // Count stats across all missions
  for (const m of missionsStore) {
    if ((m.monsterCurrentHp ?? 1) <= 0) monstersDefeated++;
    for (const t of m.tasks) {
      if (t.completed) tasksCompleted++;
    }
  }

  const freshMissions = initialMissions.map(m => ({ ...m }));
  if (pendingTasks.length > 0) {
    freshMissions[0] = { ...freshMissions[0], tasks: pendingTasks };
  }

  missionsStore = freshMissions;
  saveMissions(missionsStore);

  // ✅ HISTORY_KEY is intentionally NOT removed here — the Diário de Missões
  //    must survive across rebirths so the player always sees their past tasks.
  // Only reset the monster pity counter and active challenges (run-scoped).
  try { localStorage.removeItem("rpg_pity_history_v1"); } catch { /* noop */ }
  try { localStorage.removeItem("rpg_challenges_v1"); } catch { /* noop */ }

  return { monstersDefeated, tasksCompleted };
}

// ── Tag management ────────────────────────────────────────────────────────────
const TAGS_KEY = "rpg_tags_v1";
const TAGS_COLORS_KEY = "rpg_tag_colors_v1";

export function getTags(): string[] {
  try {
    const raw = localStorage.getItem(TAGS_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch { /* noop */ }
  return [];
}

function saveTagsList(tags: string[]): void {
  try { localStorage.setItem(TAGS_KEY, JSON.stringify(tags)); } catch { /* noop */ }
}

/** Adds a tag to the global registry if it doesn't already exist. */
export function ensureTag(tag: string): void {
  const t = tag.trim();
  if (!t) return;
  const tags = getTags();
  if (!tags.includes(t)) {
    tags.push(t);
    saveTagsList(tags);
  }
}

/** Removes a tag from the global registry (does NOT clear it from existing tasks). */
export function removeTag(tag: string): void {
  saveTagsList(getTags().filter(t => t !== tag));
  removeTagColor(tag);
}

// ── Tag colors ────────────────────────────────────────────────────────────────
export const TAG_PALETTE = [
  "#7c4dff","#e63946","#06FFA5","#f59e0b",
  "#60a5fa","#fb923c","#a78bfa","#22d3ee",
  "#f472b6","#84cc16",
] as const;

export function getTagColors(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TAGS_COLORS_KEY);
    if (raw) return JSON.parse(raw) as Record<string, string>;
  } catch { /* noop */ }
  return {};
}

export function setTagColor(tag: string, color: string): void {
  const colors = getTagColors();
  colors[tag] = color;
  try { localStorage.setItem(TAGS_COLORS_KEY, JSON.stringify(colors)); } catch { /* noop */ }
}

function removeTagColor(tag: string): void {
  const colors = getTagColors();
  delete colors[tag];
  try { localStorage.setItem(TAGS_COLORS_KEY, JSON.stringify(colors)); } catch { /* noop */ }
}

/** Deterministic color for a tag string — checks custom override first. */
export function tagColor(tag: string): string {
  const custom = getTagColors()[tag];
  if (custom) return custom;
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) & 0xffff;
  return TAG_PALETTE[h % TAG_PALETTE.length];
}