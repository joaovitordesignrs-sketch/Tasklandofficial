// ── Sync Service ──────────────────────────────────────────────────────────────
// Bidirectional sync between localStorage (cache) and Supabase game_data (source of truth).
//
// Architecture:
// - Cloud writes go through Edge Function server (SERVICE_ROLE_KEY → bypasses RLS)
// - localStorage is a TEMPORARY CACHE, always overwritten by cloud on login/pull
// - On logout, ALL game localStorage keys are wiped
// - On login, cloud data is pulled BEFORE the game renders
// - "dirty" flag tracks if local data changed since last push
// - Debounced push 3s after changes + periodic fallback every 15s
// - Pull on window focus for cross-device sync
// - keepalive fetch for reliable beforeunload push
// - Realtime subscription on game_data table for instant cross-device updates

import { supabase } from "./supabaseClient";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import type { Mission, TaskHistoryEntry } from "./missions";
import type { Challenge } from "./challenges";
import type { Habit } from "./habits";
import type { EconomyState, RebirthState } from "./economy";

// Direct imports for synchronous reload (no circular dep: these modules
// call schedulePush via dynamic import("./syncService"), not static import)
import { reloadMissions } from "./missions";
import { reloadEconomy, reloadRebirth } from "./economy";
import { reloadHabits } from "./habits";
import { reloadChallenges } from "./challenges";
import { reloadTaskHistory } from "./missions";
import { reloadItems, getItems, type UserItem } from "./items";

// In-memory store accessors (used by gatherLocalData to avoid reading stale/empty localStorage)
import { getMissions } from "./missions";
import { getChallenges } from "./challenges";
import { getHabits } from "./habits";
import { getEconomy, getRebirthState } from "./economy";
import { getCombatPower } from "./combatPower";
import { calcTotalXP, getLevelInfo } from "./gameEngine";

// ── Server URL ───────────────────────────────────────────────────────────────
const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8f0246f6`;

// ── Build headers for Edge Function requests ─────────────────────────────────
// Authorization: Bearer <publicAnonKey>  → passes the Supabase gateway reliably
// X-User-Token: <userJWT>               → our server reads the user identity
// Sending the user JWT directly in Authorization can cause "Invalid JWT" errors
// from the gateway when the token is expired or during refresh races.
function makeHeaders(userToken: string, contentType?: string): Record<string, string> {
  const h: Record<string, string> = {
    Authorization: `Bearer ${publicAnonKey}`,
    "X-User-Token": userToken,
  };
  if (contentType) h["Content-Type"] = contentType;
  return h;
}

// ── localStorage keys (must match the game modules) ──────────────────────────
const LS_KEYS = {
  missions:     "rpg_missions_v8",
  playerName:   "rpg_player_v1",
  taskHistory:  "rpg_task_history_v1",
  pityHistory:  "rpg_pity_history_v1",
  challenges:   "rpg_challenges_v1",
  bonusXP:      "rpg_bonus_xp_v3",
  habits:       "rpg_habits_v1",
  economy:      "rpg_economy_v1",
  rebirth:      "rpg_rebirth_v1",
  items:        "rpg_items_v1",
} as const;

// ── Key to track the last wipe applied locally ────────────────────────────────
const LAST_WIPE_LS_KEY = "rpg_last_wipe_at_v1";

const ALL_GAME_LS_KEYS = Object.values(LS_KEYS);

// ── Types ────────────────────────────────────────────────────────────────────

export interface GameDataRow {
  uid:                     string;
  missions:                Mission[];
  campaign_order:          number;
  task_history:            TaskHistoryEntry[];
  pity_history:            string[];
  challenges:              Challenge[];
  habits:                  Habit[];
  economy:                 EconomyState;
  rebirth:                 RebirthState;
  items:                   UserItem[];
  combat_power:            number;
  cp_rank_tier:            string;
  audio_settings:          any;
  total_tasks_completed:   number;
  total_monsters_defeated: number;
  total_bosses_defeated:   number;
  max_habit_streak:        number;
  challenges_completed:    number;
  player_name:             string;
  updated_at:              string;
}

// ── Internal state ───────────────────────────────────────────────────────────

let currentUid: string | null = null;
let isDirty = false;
let pushInProgress = false;
let periodicTimer: ReturnType<typeof setInterval> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let realtimeChannel: any = null;
let focusHandler: (() => void) | null = null;
let unloadHandler: (() => void) | null = null;
let lastPushTime = 0;

// ══════════════════════════════════════════════════════════════════════════════
//  TOKEN HELPERS
// ══════════════════════════════════════════════════════════════════════════════

// Cached token set explicitly by the auth flow (most reliable source)
let cachedAccessToken: string | null = null;

/** Called by RootLayout right after auth is confirmed, so we have a known-good token */
export function setAccessToken(token: string | null): void {
  cachedAccessToken = token;
}

/** Decode a JWT payload to check expiry. Returns true if expired or within bufferMs of expiry. */
function isTokenExpiredOrSoon(token: string, bufferMs = 90_000): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is in seconds; add buffer so we refresh before the server rejects it
    return payload.exp * 1000 < Date.now() + bufferMs;
  } catch {
    return true; // malformed token — treat as expired
  }
}

/** Synchronous token read from localStorage (used in beforeunload beacon) */
function getAccessToken(): string {
  // 1. Cached token from auth flow (check expiry first)
  if (cachedAccessToken && !isTokenExpiredOrSoon(cachedAccessToken, 0)) {
    return cachedAccessToken;
  }

  // 2. Read from Supabase's localStorage session
  try {
    const storageKey = `sb-${projectId}-auth-token`;
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.access_token) return parsed.access_token;
    }
  } catch { /* noop */ }

  // 3. NO fallback to publicAnonKey — that causes "Invalid JWT" at the gateway
  console.warn("[Sync] getAccessToken: no valid token found");
  return "";
}

/** Async token read — always checks expiry and proactively refreshes if needed */
async function getAccessTokenAsync(): Promise<string> {
  // Step 1: Ask the SDK for the current session.
  // The SDK's autoRefreshToken=true keeps the token fresh automatically, so
  // getSession() should normally return a non-expired token. We only hard-refresh
  // if the token is TRULY expired (not just "near-expiry") to avoid racing with
  // the SDK's own refresh scheduler, which fires 60 seconds before expiry.
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    if (token) {
      if (!isTokenExpiredOrSoon(token, 0)) {
        // Token is still valid — cache it and return immediately
        cachedAccessToken = token;
        return token;
      }
      // Token is genuinely expired — fall through to hard-refresh below
      console.log("[Sync] Token is expired → hard-refreshing session...");
    } else {
      console.log("[Sync] No session found → trying hard-refresh...");
    }
  } catch (e) {
    console.warn("[Sync] getSession failed:", e);
  }

  // Step 2: Hard-refresh via the stored refresh token (only reached when truly expired)
  try {
    const { data: refreshed } = await supabase.auth.refreshSession();
    if (refreshed?.session?.access_token) {
      cachedAccessToken = refreshed.session.access_token;
      console.log("[Sync] Session hard-refreshed successfully");
      return refreshed.session.access_token;
    }
  } catch (e) {
    console.warn("[Sync] refreshSession failed:", e);
  }

  // Step 3: Last resort — whatever we have cached
  const fallback = cachedAccessToken || getAccessToken();
  if (fallback) {
    console.warn("[Sync] Using fallback token, len:", fallback.length);
  } else {
    console.warn("[Sync] getAccessTokenAsync: no token available — sync skipped");
  }
  return fallback;
}

/** Force-refresh the token (called on 401 retry) */
async function refreshAccessToken(): Promise<string> {
  try {
    const { data } = await supabase.auth.refreshSession();
    if (data?.session?.access_token) {
      cachedAccessToken = data.session.access_token;
      console.log("[Sync] Token refreshed successfully");
      return data.session.access_token;
    }
  } catch (e) {
    console.warn("[Sync] refreshSession failed:", e);
  }
  return "";
}

// ══════════════════════════════════════════════════════════════════════════════
//  LOCALSTORAGE ↔ CLOUD DATA HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* noop */ }
  return fallback;
}

// ── Clear ALL game keys from localStorage + reload in-memory stores ──────────

export function clearGameLocalStorage(): void {
  console.log("[Sync] Clearing ALL game localStorage keys");
  for (const key of ALL_GAME_LS_KEYS) {
    localStorage.removeItem(key);
  }
  // Synchronous reload → in-memory stores now reflect empty state
  reloadMissions();
  reloadEconomy();
  reloadRebirth();
  reloadHabits();
  reloadChallenges();
}

// ── Gather all localStorage into a cloud-shaped object ───────────────────────

export function gatherLocalData(): Omit<GameDataRow, "uid" | "updated_at"> {
  const missions = getMissions();
  const challenges = getChallenges();
  const habits = getHabits();
  const economy = getEconomy();
  const rebirth = getRebirthState();

  let tasksCompleted = 0;
  let monstersDefeated = 0;
  let bossesDefeated = 0;
  for (const m of missions) {
    if ((m.monsterCurrentHp ?? 1) <= 0) {
      monstersDefeated++;
      if (m.monsterType === "boss") bossesDefeated++;
    }
    for (const t of m.tasks) {
      if (t.completed) tasksCompleted++;
    }
  }

  // ── Compute real level and Combat Power ──────────────────────────────────
  // These feed the friends list (level, rank, CP) — must NOT be hardcoded.
  const totalXP = calcTotalXP(missions);
  const { level: currentLevel } = getLevelInfo(totalXP);
  const cpData = getCombatPower(currentLevel);

  return {
    missions,
    campaign_order: missions.filter(m => m.mode === "campaign" && (m.monsterCurrentHp ?? 1) <= 0).length,
    task_history:            readLS<TaskHistoryEntry[]>(LS_KEYS.taskHistory, []),
    pity_history:            readLS<string[]>(LS_KEYS.pityHistory, []),
    challenges,
    habits,
    economy,
    rebirth,
    items:                   getItems(),
    combat_power:            cpData.combatPower,   // integer CP (ex: 212), not raw multiplier
    cp_rank_tier:            cpData.rank.tier,
    audio_settings:          {},
    total_tasks_completed:   tasksCompleted + (rebirth.totalTasksEver ?? 0),
    total_monsters_defeated: monstersDefeated + (rebirth.totalMonstersEver ?? 0),
    total_bosses_defeated:   bossesDefeated,
    max_habit_streak:        habits.reduce((max, h) => Math.max(max, h.bestStreak ?? 0), 0),
    challenges_completed:    challenges.filter(c => c.status === "completed").length,
    player_name:             localStorage.getItem(LS_KEYS.playerName) ?? "Aventureiro",
  };
}

// ── Apply cloud data → localStorage + synchronous reload ─────────────────────

export function applyCloudData(data: Partial<GameDataRow>, forceWipe = false): void {
  console.log("[Sync] Applying cloud data to localStorage", forceWipe ? "(force wipe mode)" : "");

  // Guard: if cloud has empty missions array, skip it to preserve initialMissions.
  // Exception: if forceWipe=true (server-side wipe), always clear missions.
  if (forceWipe) {
    // On wipe, always overwrite — even with empty arrays
    localStorage.setItem(LS_KEYS.missions, JSON.stringify(data.missions ?? []));
    localStorage.setItem(LS_KEYS.taskHistory, JSON.stringify(data.task_history ?? []));
    localStorage.setItem(LS_KEYS.pityHistory, JSON.stringify(data.pity_history ?? []));
    localStorage.setItem(LS_KEYS.challenges, JSON.stringify(data.challenges ?? []));
    localStorage.setItem(LS_KEYS.habits, JSON.stringify(data.habits ?? []));
    localStorage.setItem(LS_KEYS.economy, JSON.stringify(data.economy ?? {}));
    localStorage.setItem(LS_KEYS.rebirth, JSON.stringify(data.rebirth ?? {}));
    localStorage.setItem(LS_KEYS.items,   JSON.stringify(data.items   ?? []));
    if (data.player_name) localStorage.setItem(LS_KEYS.playerName, data.player_name);
  } else {
    if (data.missions && data.missions.length > 0) {
      localStorage.setItem(LS_KEYS.missions, JSON.stringify(data.missions));
    } else if (data.missions) {
      console.log("[Sync] Cloud missions array is empty — preserving local campaign data (expected on first login)");
    }

    // ── task_history: MERGE instead of replace ────────────────────────────
    // Never lose entries that exist locally but haven't been pushed to cloud yet.
    // This prevents data loss when a push fails or when the user refreshes
    // before the debounce timer fires.
    if (data.task_history !== undefined) {
      const localHistory = readLS<TaskHistoryEntry[]>(LS_KEYS.taskHistory, []);
      const cloudHistory  = Array.isArray(data.task_history) ? data.task_history : [];

      if (cloudHistory.length === 0 && localHistory.length > 0) {
        // Cloud sent an empty history but we have local entries — trust local
        // (cloud hasn't received the push yet or the push failed).
        console.log("[Sync] Cloud task_history is empty but local has entries — preserving local history");
      } else {
        // Merge: start with local entries, append any cloud entries not present locally
        const localIds = new Set(localHistory.map((h: TaskHistoryEntry) => h.id));
        const merged = [...localHistory];
        for (const entry of cloudHistory) {
          if (!localIds.has(entry.id)) {
            merged.push(entry);
          }
        }
        // Sort newest-first so the Diário always shows the most recent tasks at top
        merged.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
        console.log(`[Sync] task_history merged: local=${localHistory.length} cloud=${cloudHistory.length} → merged=${merged.length}`);
        localStorage.setItem(LS_KEYS.taskHistory, JSON.stringify(merged));
      }
    }

    if (data.pity_history)  localStorage.setItem(LS_KEYS.pityHistory, JSON.stringify(data.pity_history));
    if (data.challenges)    localStorage.setItem(LS_KEYS.challenges, JSON.stringify(data.challenges));
    if (data.habits)        localStorage.setItem(LS_KEYS.habits, JSON.stringify(data.habits));
    if (data.economy)       localStorage.setItem(LS_KEYS.economy, JSON.stringify(data.economy));
    if (data.rebirth)       localStorage.setItem(LS_KEYS.rebirth, JSON.stringify(data.rebirth));
    if (data.items && data.items.length > 0) {
      localStorage.setItem(LS_KEYS.items, JSON.stringify(data.items));
    } else if (data.items !== undefined) {
      // Cloud has items: [] — only overwrite local if local is also empty (fresh account)
      const localItems = readLS<UserItem[]>(LS_KEYS.items, []);
      if (localItems.length === 0) {
        localStorage.setItem(LS_KEYS.items, JSON.stringify([]));
      }
    }
    if (data.player_name)   localStorage.setItem(LS_KEYS.playerName, data.player_name);
  }

  // SYNCHRONOUS reload — in-memory stores IMMEDIATELY reflect the new data
  reloadMissions();
  reloadTaskHistory();
  reloadEconomy();
  reloadRebirth();
  reloadHabits();
  reloadChallenges();
  reloadItems();

  // Notify React components that data has been refreshed from cloud
  try { window.dispatchEvent(new Event("rpg:data-updated")); } catch { /* noop */ }
}

// ── Check for a server-side global wipe (called on every pull) ───────────────
async function checkServerWipe(): Promise<{ isWipe: boolean; wipeAt: string | null }> {
  try {
    const res = await fetch(`${SERVER_URL}/admin/wipe-check`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
    });
    if (!res.ok) return { isWipe: false, wipeAt: null };
    const { wipeAt } = await res.json();
    if (!wipeAt) return { isWipe: false, wipeAt: null };

    const lastWipe = localStorage.getItem(LAST_WIPE_LS_KEY);
    // If server has a newer wipe than what we last applied locally, a wipe is needed
    const isWipe = !lastWipe || new Date(wipeAt) > new Date(lastWipe);
    return { isWipe, wipeAt };
  } catch {
    return { isWipe: false, wipeAt: null };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  PULL FROM CLOUD (via Edge Function → game_data table)
// ══════════════════════════════════════════════════════════════════════════════

export async function pullFromCloud(uid: string): Promise<boolean> {
  try {
    console.log("[Sync] pullFromCloud → fetching game_data for uid", uid);
    const token = await getAccessTokenAsync();

    // Guard: if we have no valid token at all, skip — avoid pointless 401
    if (!token || token.split(".").length !== 3) {
      console.warn("[Sync] pullFromCloud: no valid token — skipping pull");
      return false;
    }

    let res = await fetch(`${SERVER_URL}/game-data/pull`, {
      headers: makeHeaders(token),
    });

    // ── 401 retry: refresh token and try once more ───────────────────────
    if (res.status === 401) {
      console.log("[Sync] Pull got 401 → refreshing token and retrying...");
      const freshToken = await refreshAccessToken();
      if (freshToken) {
        res = await fetch(`${SERVER_URL}/game-data/pull`, {
          headers: makeHeaders(freshToken),
        });
      }
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[Sync] Pull server error:", res.status, JSON.stringify(err));
      return false;
    }

    const result = await res.json();

    if (result.exists && result.data) {
      console.log("[Sync] Cloud data found → overwriting localStorage");

      // Check for server-side wipe
      const { isWipe, wipeAt } = await checkServerWipe();
      if (isWipe) {
        console.log("[Sync] Server-side wipe detected → applying wipe to local data");
        applyCloudData(result.data, true);
        localStorage.setItem(LAST_WIPE_LS_KEY, wipeAt ?? "");
      } else {
        applyCloudData(result.data);
      }

      return true;
    }

    console.log("[Sync] No cloud data yet → pushing current localStorage as initial seed");
    await pushToCloud(uid);
    return true;
  } catch (e) {
    console.error("[Sync] Pull exception:", e);
    return false;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  PUSH TO CLOUD (via Edge Function → game_data table)
// ══════════════════════════════════════════════════════════════════════════════

export async function pushToCloud(uid: string): Promise<boolean> {
  if (pushInProgress) {
    console.log("[Sync] Push already in progress, skipping");
    return false;
  }

  // Skip immediately if the browser reports no network — avoids noisy errors
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    console.log("[Sync] Offline — push skipped, will retry when dirty timer fires");
    return false;
  }

  pushInProgress = true;

  try {
    const localData = gatherLocalData();
    const token = await getAccessTokenAsync();

    // Guard: if we have no valid token at all, skip — avoid pointless 401
    if (!token || token.split(".").length !== 3) {
      console.warn("[Sync] pushToCloud: no valid token — skipping push");
      return false;
    }

    // Compute XP for profile update (use in-memory stores, not localStorage)
    let totalXP = 0;
    for (const m of localData.missions) {
      for (const t of m.tasks) {
        if (t.completed) {
          const base = { easy: 10, medium: 20, hard: 30 }[t.difficulty ?? "easy"] ?? 10;
          totalXP += base;
        }
      }
    }

    const payload = {
      gameData: localData,
      profileUpdate: {
        level: localData.rebirth?.highestLevelEver ?? 1,
        xp: totalXP,
        last_login: new Date().toISOString(),
      },
    };

    console.log("[Sync] Pushing to cloud...");

    // Helper: single fetch attempt with timeout
    const attemptFetch = async (tok: string, timeoutMs: number): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        return await fetch(`${SERVER_URL}/game-data/push`, {
          method: "POST",
          headers: makeHeaders(tok, "application/json"),
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // First attempt — 25s timeout (edge functions can cold-start slowly)
    let res: Response;
    try {
      res = await attemptFetch(token, 25_000);
    } catch (e: any) {
      // Network / timeout on first attempt → retry once after a short delay
      const isNet =
        e?.name === "AbortError" ||
        (typeof e?.message === "string" && e.message.toLowerCase().includes("failed to fetch"));
      if (isNet) {
        console.log("[Sync] First push attempt failed (network/timeout) — retrying in 3s...");
        await new Promise(r => setTimeout(r, 3000));
        try {
          res = await attemptFetch(token, 25_000);
        } catch (e2: any) {
          console.warn("[Sync] Push skipped — network unavailable after retry. Will retry on next dirty cycle.");
          return false;
        }
      } else {
        throw e;
      }
    }

    if (!res.ok) {
      // On 401, the token likely expired mid-session — refresh and retry once
      if (res.status === 401) {
        console.log("[Sync] 401 on push — refreshing token and retrying...");
        const newToken = await refreshAccessToken();
        if (newToken) {
          let retryRes: Response;
          try {
            retryRes = await attemptFetch(newToken, 25_000);
          } catch {
            console.warn("[Sync] Push retry (401) timed out.");
            return false;
          }
          if (retryRes.ok) {
            const retryResult = await retryRes.json();
            console.log("[Sync] Push retry successful:", retryResult);
            lastPushTime = Date.now();
            isDirty = false;
            return true;
          }
          const retryErr = await retryRes.json().catch(() => ({}));
          console.error("[Sync] Push retry also failed:", retryRes.status, JSON.stringify(retryErr));
          return false;
        }
      }
      const err = await res.json().catch(() => ({}));
      console.error("[Sync] Push server error:", res.status, JSON.stringify(err));
      return false;
    }

    const result = await res.json();
    console.log("[Sync] Push successful:", result);
    lastPushTime = Date.now();
    isDirty = false;
    return true;
  } catch (e: any) {
    // Unexpected (non-network) error
    console.error("[Sync] Push exception:", e);
    return false;
  } finally {
    pushInProgress = false;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  DIRTY FLAG + DEBOUNCE
// ══════════════════════════════════════════════════════════════════════════════

export function markDirty(delayMs = 2000): void {
  isDirty = true;

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (currentUid && isDirty && !pushInProgress) {
      pushToCloud(currentUid);
    }
  }, delayMs);
}

/** Schedule a cloud push after `delayMs` milliseconds (default 2000).
 *  Shorter delays override longer ones (last call wins). */
export function schedulePush(delayMs = 2000): void {
  // If there's already a pending timer with a shorter remaining time, keep it.
  // We achieve this by always clearing and resetting — the caller provides the
  // urgency level.
  markDirty(delayMs);
}

/** Force immediate push (used by manual "Sync" button) */
export async function forcePush(): Promise<void> {
  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
  if (currentUid) {
    isDirty = false;
    await pushToCloud(currentUid);
  }
}

/** Returns true if there are local changes not yet pushed to cloud */
export function getIsDirty(): boolean {
  return isDirty;
}

// ══════════════════════════════════════════════════════════════════════════════
//  BEACON PUSH (survives page close via keepalive)
// ══════════════════════════════════════════════════════════════════════════════

function beaconPush(): void {
  if (!currentUid || !isDirty) return;

  try {
    const localData = gatherLocalData();
    const token = getAccessToken(); // sync version for beforeunload

    const missions = readLS<Mission[]>(LS_KEYS.missions, []);
    let totalXP = 0;
    for (const m of missions) {
      for (const t of m.tasks) {
        if (t.completed) {
          const base = { easy: 10, medium: 20, hard: 30 }[t.difficulty ?? "easy"] ?? 10;
          totalXP += base;
        }
      }
    }

    const payload = JSON.stringify({
      gameData: localData,
      profileUpdate: {
        level: localData.rebirth?.highestLevelEver ?? 1,
        xp: totalXP,
        last_login: new Date().toISOString(),
      },
    });

    fetch(`${SERVER_URL}/game-data/push`, {
      method: "POST",
      headers: makeHeaders(token, "application/json"),
      body: payload,
      keepalive: true,
    }).catch(() => {});

    console.log("[Sync] Beacon push sent via keepalive fetch");
    isDirty = false;
  } catch (e) {
    console.log("[Sync] Beacon push failed:", e);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  SYNC LIFECYCLE: setSyncUser / stopSync
// ══════════════════════════════════════════════════════════════════════════════

export function setSyncUser(uid: string | null): void {
  stopSync();
  currentUid = uid;
  if (!uid) return;

  console.log("[Sync] setSyncUser →", uid);

  // 1. Periodic push every 15 seconds (only if dirty)
  periodicTimer = setInterval(() => {
    if (currentUid && isDirty && !pushInProgress) {
      console.log("[Sync] Periodic push (dirty data detected)");
      pushToCloud(currentUid);
    }
  }, 15_000);

  // 2. Pull fresh data when window regains focus (cross-device sync)
  focusHandler = async () => {
    if (!currentUid) return;

    // ── CRITICAL: if we have local changes not yet pushed to cloud,
    //    pulling stale cloud data would overwrite them. Skip the pull.
    //    The debounced push will sync them shortly.
    if (isDirty) {
      console.log("[Sync] Window focus — local data is dirty, skipping pull to protect pending changes");
      return;
    }

    const timeSinceLastPush = Date.now() - lastPushTime;
    if (timeSinceLastPush > 5000) {
      console.log("[Sync] Window focus → pulling fresh data via server");
      try {
        const token = await getAccessTokenAsync();
        const res = await fetch(`${SERVER_URL}/game-data/pull`, {
          headers: makeHeaders(token),
        });
        if (res.ok) {
          const result = await res.json();
          if (result.exists && result.data) {
            applyCloudData(result.data);
          }
        }
      } catch (e) {
        console.log("[Sync] Focus pull error:", e);
      }
    }
  };
  window.addEventListener("focus", focusHandler);

  // 3. Reliable push on page close
  unloadHandler = () => beaconPush();
  window.addEventListener("beforeunload", unloadHandler);

  // 4. Push when page becomes hidden (mobile tab switch)
  const visibilityHandler = () => {
    if (document.visibilityState === "hidden" && currentUid && isDirty) {
      console.log("[Sync] Page hidden → pushing via keepalive");
      beaconPush();
    }
  };
  document.addEventListener("visibilitychange", visibilityHandler);
  (window as any).__syncVisHandler = visibilityHandler;
}

export function stopSync(isLogout = false): void {
  if (periodicTimer) { clearInterval(periodicTimer); periodicTimer = null; }
  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
  if (focusHandler) { window.removeEventListener("focus", focusHandler); focusHandler = null; }
  if (unloadHandler) { window.removeEventListener("beforeunload", unloadHandler); unloadHandler = null; }
  if ((window as any).__syncVisHandler) {
    document.removeEventListener("visibilitychange", (window as any).__syncVisHandler);
    delete (window as any).__syncVisHandler;
  }
  stopRealtime();
  currentUid = null;
  // Only wipe the cached token on actual logout — NOT during internal sync restarts
  // (setSyncUser → stopSync). Clearing it during login races causes the first pull
  // to have no token, producing a spurious 401.
  if (isLogout) cachedAccessToken = null;
  isDirty = false;
  pushInProgress = false;
}

// ══════════════════════════════════════════════════════════════════════════════
//  REALTIME SUBSCRIPTION (watches game_data table for this uid)
// ══════════════════════════════════════════════════════════════════════════════

export function startRealtime(uid: string, onUpdate: (data: Partial<GameDataRow>) => void): void {
  stopRealtime();

  realtimeChannel = supabase
    .channel(`game_data_sync_${uid}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "game_data",
        filter: `uid=eq.${uid}`,
      },
      (payload: any) => {
        const timeSinceLastPush = Date.now() - lastPushTime;
        if (timeSinceLastPush < 3000) {
          console.log("[Sync] Ignoring realtime update (own push echo)");
          return;
        }
        // Guard: if local data is dirty (pending push), applying stale cloud data
        // would overwrite local changes. Skip — the debounced push will resolve the conflict.
        if (isDirty) {
          console.log("[Sync] Ignoring realtime update — local data is dirty, pending push takes priority");
          return;
        }
        console.log("[Sync] Realtime UPDATE from remote device → applying");
        if (payload.new) {
          onUpdate(payload.new as Partial<GameDataRow>);
        }
      }
    )
    .subscribe((status: string) => {
      console.log("[Sync] Realtime subscription status:", status);
    });
}

export function stopRealtime(): void {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}