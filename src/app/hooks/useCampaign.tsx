/**
 * useCampaign — shared campaign state & handlers (context).
 * Wraps the entire authenticated game so that DesktopLeftColumn
 * and HomeScreen can share the same mission/combat state.
 */
import {
  createContext, useContext,
  useState, useCallback, useEffect, useRef, useMemo,
  ReactNode,
} from "react";
import { track } from "./analytics";
import { useSound }               from "./useSound";
import { audioManager }           from "./audioManager";
import { useInteractionFeedback } from "./useInteractionFeedback";
import { getCombatPower }         from "../data/combatPower";
import {
  getMissions, getActiveCampaignMission, unlockNext, isCampaignComplete,
  addTaskToHistory, removeTaskFromHistory, loadPlayerName,
  updateMission, createMission, initialMissions,
  Mission, Task,
} from "../data/missions";
import { getEconomy, addBonusXP, addCoins, addEssences, recordOnePunchBoss, selectSkin, buySkin, getMonsterCoinReward, type SkinId } from "../data/economy";
import { getEssenceDrop } from "../data/items";
import {
  calcTaskDamage, calcBatchDamage, calcMonsterXP,
  calcTotalXP, getLevelInfo, getRank,
  getMonsterHpInfo, isMonsterDefeated, getAttackBanner,
  AttackBanner,
} from "../data/gameEngine";
import type { TemporalStrike } from "../components/ChallengePanel";
import type { FocusStrike }    from "../components/FocusPanel";
import type { DamageNumber }   from "../components/ui/FloatingDamage";

const FOCUS_BONUS_PER_TASK = 0.01;

// ── Context shape ──────────────────────────────────────────────────────────
export interface CampaignContextValue {
  // state
  mission:          Mission | null;
  allMissions:      Mission[];
  monsterShake:     boolean;
  taskCompleted:    boolean;
  showVictory:      boolean;
  victoryXP:        number;
  victoryGold:      number;
  victoryEssence:   number;
  nextMission:      Mission | null;
  campaignDone:     boolean;
  levelUpInfo:      { level: number; rank: string; rankColor: string } | null;
  attackBanner:     AttackBanner | null;
  screenShake:      boolean;
  screenFlash:      boolean;
  xpPenaltyBanner:  { amount: number } | null;
  hpInfo:           { current: number; max: number; percent: number; label: string };
  hpColor:          string;
  defeated:         boolean;
  doneCampaign:     number;
  totalCampaign:    number;
  activeSkin:       SkinId | null;
  needsClassPick:   boolean;
  damageNumbers:    DamageNumber[];
  // arena attack bridge
  selectedTaskCount:   number;
  setSelectedTaskCount:(n: number) => void;
  attackCallbackRef:   React.MutableRefObject<(() => void) | null>;
  // temporal attack bridge
  temporalSelectedCount:   number;
  setTemporalSelectedCount:(n: number) => void;
  temporalAttackCallbackRef: React.MutableRefObject<(() => void) | null>;
  // focus attack bridge
  focusSelectedCount:   number;
  setFocusSelectedCount:(n: number) => void;
  focusAttackCallbackRef: React.MutableRefObject<(() => void) | null>;
  // player
  lvInfo:    { level: number; currentXP: number; neededXP: number };
  xpPct:     number;
  rank:      { label: string; color: string };
  cpData:    ReturnType<typeof getCombatPower>;
  playerName: string;
  // actions
  handleAttackStart:      () => void;
  handleComplete:         (count: number, completedIds: string[]) => void;
  handleTasksChange:      (newTasks: Mission["tasks"]) => void;
  handleUncompleteTask:   (taskId: string) => void;
  handleDeleteTask:       (task: Task) => void;
  handleNextMission:      () => void;
  handleTemporalStrike:   (strike: TemporalStrike) => void;
  handleFocusStrike:      (strike: FocusStrike) => void;
  handleChallengeFailed:  () => void;
  handleEmptyStateChange: (newTasks: Task[]) => void;
  setShowVictory:    (v: boolean) => void;
  setNeedsClassPick: (v: boolean) => void;
  setActiveSkin:     (skin: SkinId) => void;
  setLevelUpInfo:    (v: { level: number; rank: string; rankColor: string } | null) => void;
  refresh: () => void;
}

const CampaignContext = createContext<CampaignContextValue | null>(null);

export function useCampaign(): CampaignContextValue {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error("useCampaign must be inside CampaignProvider");
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function CampaignProvider({ children }: { children: ReactNode }) {
  const feedback = useInteractionFeedback();

  const [mission,          setMission]         = useState<Mission | null>(getActiveCampaignMission);
  const [allMissions,      setAllMissions]      = useState(getMissions());
  const [monsterShake,     setMonsterShake]     = useState(false);
  const [prevHpPct,        setPrevHpPct]        = useState(100);
  const [attackBanner,     setAttackBanner]     = useState<AttackBanner | null>(null);
  const [screenShake,      setScreenShake]      = useState(false);
  const [screenFlash,      setScreenFlash]      = useState(false);
  const [showVictory,      setShowVictory]      = useState(false);
  const [victoryRewards,   setVictoryRewards]   = useState({ xp: 0, gold: 0, essence: 0 });
  const [nextMission,      setNextMission]      = useState<Mission | null>(null);
  const [campaignDone,     setCampaignDone]     = useState(false);
  const [playerName]                            = useState(loadPlayerName);
  const [levelUpInfo,      setLevelUpInfo]      = useState<{ level: number; rank: string; rankColor: string } | null>(null);
  const [taskCompleted,    setTaskCompleted]    = useState(false);
  const [xpPenaltyBanner,  setXpPenaltyBanner] = useState<{ amount: number } | null>(null);
  const [needsClassPick,   setNeedsClassPick]  = useState(() => getEconomy().needsClassSelection);
  const [activeSkin,       setActiveSkinSt]    = useState<SkinId | null>(() => getEconomy().activeSkin ?? "warrior_base");

  const prevLevelRef        = useRef<number>(0);
  const pendingFeedbackRef  = useRef<(() => void) | null>(null);
  const fallbackTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attackCallbackRef          = useRef<(() => void) | null>(null);
  const temporalAttackCallbackRef  = useRef<(() => void) | null>(null);
  const focusAttackCallbackRef     = useRef<(() => void) | null>(null);
  const [selectedTaskCount,        setSelectedTaskCount]        = useState(0);
  const [temporalSelectedCount,    setTemporalSelectedCount]    = useState(0);
  const [focusSelectedCount,       setFocusSelectedCount]       = useState(0);
  const [damageNumbers,            setDamageNumbers]            = useState<DamageNumber[]>([]);

  const playHit = useSound("/audio/sound_hit.mp3");

  // ── shared monster-defeat sequence ─────────────────────────────────────────
  const processVictory = useCallback((updatedMission: Mission) => {
    const xpGained      = calcMonsterXP({ ...updatedMission });
    const monType       = updatedMission.monsterType ?? "normal";
    const goldEarned    = getMonsterCoinReward(monType);
    const essenceEarned = getEssenceDrop(monType);
    addBonusXP(xpGained);
    addCoins(goldEarned);
    addEssences(essenceEarned);
    setVictoryRewards({ xp: xpGained, gold: goldEarned, essence: essenceEarned });
    const next = unlockNext(updatedMission);
    setNextMission(next);
    setCampaignDone(!next && isCampaignComplete());
    track("monster_defeated", { type: monType, xp: xpGained, gold: goldEarned });
    setTimeout(() => { feedback.victory(); audioManager.playVictory(); setShowVictory(true); }, 800);
  }, [feedback]);

  // Add a floating damage number that auto-removes after animation
  const addDamageNumber = useCallback((amount: number) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setDamageNumbers(prev => [...prev, { id, amount }]);
    setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== id)), 1400);
  }, []);

  // ── helpers ──────────────────────────────────────────────────────────────────
  const handleAttackStart = useCallback(() => {
    if (fallbackTimerRef.current) { clearTimeout(fallbackTimerRef.current); fallbackTimerRef.current = null; }
    const fb = pendingFeedbackRef.current;
    if (fb) { pendingFeedbackRef.current = null; fb(); }
  }, []);

  const scheduleFeedback = useCallback((fn: () => void) => {
    pendingFeedbackRef.current = fn;
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = setTimeout(() => {
      fallbackTimerRef.current = null;
      const fb = pendingFeedbackRef.current;
      if (fb) { pendingFeedbackRef.current = null; fb(); }
    }, 700);
  }, []);

  const syncMissions = useCallback(() => {
    const fresh = getMissions();
    setAllMissions([...fresh]);
    const xp     = calcTotalXP(fresh);
    const lvInfo = getLevelInfo(xp);
    if (lvInfo.level > prevLevelRef.current && prevLevelRef.current > 0) {
      const r = getRank(lvInfo.level);
      setLevelUpInfo({ level: lvInfo.level, rank: r.label, rankColor: r.color });
      track("level_up", { level: lvInfo.level, rank: r.label });
    }
    prevLevelRef.current = lvInfo.level;
  }, []);

  const refresh = useCallback(() => {
    const currentMissions = getMissions();
    const hasCampaign = currentMissions.some(m => m.mode === "campaign");
    if (!hasCampaign) { for (const m of initialMissions) createMission(m); }
    const active = getActiveCampaignMission();
    // Only update mission state if something actually changed — avoids
    // unnecessary re-renders that restart CSS animations on focus/visibility.
    setMission(prev => {
      if (!prev && !active) return prev;
      if (!prev || !active) return active;
      if (prev.id === active.id && prev.monsterCurrentHp === active.monsterCurrentHp
          && prev.tasks.length === active.tasks.length) return prev;
      return active;
    });
    if (active) setPrevHpPct(getMonsterHpInfo(active).percent);
    syncMissions();
    const freshEcon = getEconomy();
    setNeedsClassPick(prev => {
      const next = freshEcon.needsClassSelection;
      return prev === next ? prev : next;
    });
    setActiveSkinSt(prev => {
      const next = freshEcon.activeSkin ?? "warrior_base";
      return prev === next ? prev : next;
    });
  }, [syncMissions]);

  useEffect(() => {
    const xp0 = calcTotalXP(getMissions());
    prevLevelRef.current = getLevelInfo(xp0).level;
    refresh();
    const handleVis = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", handleVis);
    // Listen for cloud sync completion so we can re-read economy state into context.
    // This event is dispatched by RootLayout after pullFromCloud finishes, fixing
    // the "class selection on every login" bug without calling useCampaign() from RootLayout.
    const handleSyncComplete = () => refresh();
    window.addEventListener("rpg:sync-complete", handleSyncComplete);
    const poll = setInterval(() => syncMissions(), 2000);
    return () => {
      document.removeEventListener("visibilitychange", handleVis);
      window.removeEventListener("rpg:sync-complete", handleSyncComplete);
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (!mission) return;
    const hp = getMonsterHpInfo(mission).percent;
    if (hp < prevHpPct) { setMonsterShake(true); setTimeout(() => setMonsterShake(false), 600); }
    setPrevHpPct(hp);
  }, [mission]);

  // ── derived (memoized to avoid expensive recomputation every render) ────────
  const totalXP       = useMemo(() => calcTotalXP(allMissions), [allMissions]);
  const lvInfo        = useMemo(() => getLevelInfo(totalXP), [totalXP]);
  const xpPct         = Math.round((lvInfo.currentXP / lvInfo.neededXP) * 100);
  const rank          = useMemo(() => getRank(lvInfo.level), [lvInfo.level]);
  const cpData        = useMemo(() => getCombatPower(lvInfo.level), [lvInfo.level]);
  const hpInfo        = mission ? getMonsterHpInfo(mission) : { current: 0, max: 0, percent: 0, label: "0/0" };
  const defeated      = mission ? isMonsterDefeated(mission) : false;
  const hpColor       = hpInfo.percent > 50 ? "#E63946" : hpInfo.percent > 25 ? "#ed8549" : "#f0c040";
  const { totalCampaign, doneCampaign } = useMemo(() => {
    let total = 0, done = 0;
    for (const m of allMissions) {
      if (m.mode === "campaign") { total++; if ((m.monsterCurrentHp ?? 1) <= 0) done++; }
    }
    return { totalCampaign: total, doneCampaign: done };
  }, [allMissions]);

  // ── handlers ──────────────────────────────────────────────────────────────────
  const handleComplete = useCallback((count: number, completedIds: string[]) => {
    if (!mission) return;
    const level    = getLevelInfo(calcTotalXP(getMissions())).level;
    const justDone = mission.tasks.filter(t => completedIds.includes(t.id));
    const damage   = calcBatchDamage(justDone, level);
    const newHp    = Math.max(0, (mission.monsterCurrentHp ?? mission.monsterMaxHp ?? 100) - damage);
    const now = Date.now();
    const updatedTasks = mission.tasks.map(t =>
      completedIds.includes(t.id)
        ? { ...t, completed: true, completedAt: now, damageDealt: calcTaskDamage(t, level) }
        : t
    );
    const updated = { ...mission, monsterCurrentHp: newHp, tasks: updatedTasks };

    // ← Save correct state (tasks + HP) IMMEDIATELY — do NOT wait for the attack animation.
    // If the page closes before scheduleFeedback fires, the mission data is already correct
    // in localStorage. Without this, handleTasksChange (called by TaskList's onChange before
    // handleComplete) would leave an incorrect HP in localStorage.
    updateMission(updated);

    updatedTasks.filter(t => completedIds.includes(t.id)).forEach(t => addTaskToHistory(t, mission));
    track("task_completed", { count, damage, monster: mission.monsterType ?? "normal" });
    setTaskCompleted(true);
    setTimeout(() => setTaskCompleted(false), 0);
    scheduleFeedback(() => {
      playHit();
      // updateMission already persisted above — only update React visual state here
      setMission({ ...updated });
      syncMissions();
      const banner = getAttackBanner(count, damage);
      setAttackBanner(banner);
      setScreenShake(true);
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 180);
      setTimeout(() => setScreenShake(false), count >= 3 ? 600 : 380);
      setTimeout(() => setAttackBanner(null), count >= 5 ? 2000 : 1400);
      addDamageNumber(damage);
      if (newHp <= 0) {
        if (updated.monsterType === "boss" && completedIds.length === 1) {
          const theTask = justDone[0];
          if (theTask?.difficulty === "hard") recordOnePunchBoss();
        }
        processVictory(updated);
      }
    });
  }, [mission, scheduleFeedback]);

  const handleTasksChange = useCallback((newTasks: Mission["tasks"]) => {
    if (!mission) return;
    const updated = { ...mission, tasks: newTasks };
    updateMission(updated);
    setMission({ ...updated });
  }, [mission]);

  const handleUncompleteTask = useCallback((taskId: string) => {
    if (!mission) return;
    const task = mission.tasks.find(t => t.id === taskId);
    if (!task) return;
    const damage = task.damageDealt ?? calcTaskDamage(task, getLevelInfo(calcTotalXP(getMissions())).level);
    const maxHp  = mission.monsterMaxHp ?? 100;
    const curHp  = mission.monsterCurrentHp ?? maxHp;
    const newHp  = Math.min(maxHp, curHp + damage);
    const updatedTasks = mission.tasks.map(t =>
      t.id === taskId ? { ...t, completed: false, completedAt: undefined, damageDealt: undefined } : t
    );
    const updated = { ...mission, monsterCurrentHp: newHp, tasks: updatedTasks };
    updateMission(updated);
    setMission({ ...updated });
    syncMissions();
    setShowVictory(false);
    removeTaskFromHistory(taskId);
  }, [mission]);

  const handleDeleteTask = useCallback((task: Task) => {
    if (!mission) return;
    const updatedTasks = mission.tasks.filter(t => t.id !== task.id);
    if (task.completed) {
      const damage = task.damageDealt ?? calcTaskDamage(task, getLevelInfo(calcTotalXP(getMissions())).level);
      const maxHp  = mission.monsterMaxHp ?? 100;
      const curHp  = mission.monsterCurrentHp ?? maxHp;
      const newHp  = Math.min(maxHp, curHp + damage);
      const updated = { ...mission, monsterCurrentHp: newHp, tasks: updatedTasks };
      updateMission(updated);
      setMission({ ...updated });
      syncMissions();
      setShowVictory(false);
      removeTaskFromHistory(task.id);
    } else {
      const updated = { ...mission, tasks: updatedTasks };
      updateMission(updated);
      setMission({ ...updated });
    }
  }, [mission]);

  const handleNextMission = useCallback(() => {
    if (mission) {
      const uncompletedTasks = mission.tasks
        .filter(t => !t.completed)
        .map(t => ({ ...t, id: `carry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }));
      if (uncompletedTasks.length > 0 && nextMission) {
        updateMission({ ...nextMission, tasks: [...uncompletedTasks, ...nextMission.tasks] });
      }
    }
    setShowVictory(false);
    setMission(null);
    setTimeout(() => refresh(), 200);
  }, [mission, nextMission, refresh]);

  const handleTemporalStrike = useCallback((strike: TemporalStrike) => {
    if (!mission || isMonsterDefeated(mission)) return;
    const maxHp  = mission.monsterMaxHp ?? 100;
    const curHp  = mission.monsterCurrentHp ?? maxHp;
    const newHp  = Math.max(0, curHp - strike.damage);
    const updated = { ...mission, monsterCurrentHp: newHp };
    setTaskCompleted(true);
    setTimeout(() => setTaskCompleted(false), 0);

    // ← Save immediately so HP is correct even if page closes before animation
    updateMission(updated);

    scheduleFeedback(() => {
      playHit();
      setMission({ ...updated });
      syncMissions();
      const banner: AttackBanner = strike.isCritical
        ? { text: "GOLPE TEMPORAL CRITICO!", sub: `x${strike.multiplier.toFixed(2)} -${strike.damage}HP`, color: "#FF6B35", emoji: "timer", size: "28px" }
        : { text: "GOLPE TEMPORAL!",         sub: `x${strike.multiplier.toFixed(2)} -${strike.damage}HP`, color: "#FF6B35", emoji: "timer", size: "22px" };
      setAttackBanner(banner);
      setScreenShake(true);
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 180);
      setTimeout(() => setScreenShake(false), strike.isCritical ? 600 : 380);
      setTimeout(() => setAttackBanner(null), strike.isCritical ? 2000 : 1400);
      addDamageNumber(strike.damage);
      if (newHp <= 0) processVictory(updated);
    });
  }, [mission, scheduleFeedback, processVictory]);

  const handleFocusStrike = useCallback((strike: FocusStrike) => {
    if (!mission || isMonsterDefeated(mission)) return;
    const maxHp  = mission.monsterMaxHp ?? 100;
    const curHp  = mission.monsterCurrentHp ?? maxHp;
    const newHp  = Math.max(0, curHp - strike.damage);
    const updated = { ...mission, monsterCurrentHp: newHp };
    setTaskCompleted(true);
    setTimeout(() => setTaskCompleted(false), 0);

    // ← Save immediately so HP is correct even if page closes before animation
    updateMission(updated);

    scheduleFeedback(() => {
      playHit();
      setMission({ ...updated });
      syncMissions();
      const banner: AttackBanner = {
        text:  strike.count > 1 ? "GOLPE DE FOCO!" : "FOCO ATIVADO!",
        sub:   `-${strike.damage}HP · +${(FOCUS_BONUS_PER_TASK * strike.count).toFixed(2)}x DMG permanente`,
        color: "#c084fc", emoji: "brain", size: "22px",
      };
      setAttackBanner(banner);
      setScreenShake(true);
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 180);
      setTimeout(() => setScreenShake(false), 380);
      setTimeout(() => setAttackBanner(null), 1600);
      addDamageNumber(strike.damage);
      if (newHp <= 0) processVictory(updated);
    });
  }, [mission, scheduleFeedback, processVictory]);

  const handleChallengeFailed = useCallback(() => {
    const missions = getMissions();
    const totalXp  = calcTotalXP(missions);
    const info     = getLevelInfo(totalXp);
    const penalty  = Math.floor(info.currentXP * 0.5);
    if (penalty <= 0) return;
    addBonusXP(-penalty);
    syncMissions();
    setXpPenaltyBanner({ amount: penalty });
    setScreenFlash(true);
    setTimeout(() => setScreenFlash(false), 250);
    setTimeout(() => setXpPenaltyBanner(null), 3000);
  }, [syncMissions]);

  const handleEmptyStateChange = useCallback((newTasks: Task[]) => {
    const currentMissions = getMissions();
    const firstActive = currentMissions.find(
      m => m.mode === "campaign" && m.unlocked && (m.monsterCurrentHp ?? m.monsterMaxHp ?? 1) > 0
    );
    if (firstActive) {
      const updated = { ...firstActive, tasks: newTasks };
      updateMission(updated);
      setMission({ ...updated });
      syncMissions();
    } else {
      const { id: _id, ...template } = initialMissions[0];
      const created = createMission({ ...template, tasks: newTasks });
      setMission(created);
      syncMissions();
    }
  }, [syncMissions]);

  const setActiveSkin = useCallback((skin: SkinId) => {
    const econ = getEconomy();
    if (econ.unlockedSkins.includes(skin)) {
      selectSkin(skin);
    } else {
      buySkin(skin);
    }
    setActiveSkinSt(skin);
  }, []);

  const value: CampaignContextValue = {
    mission, allMissions, monsterShake, taskCompleted, showVictory,
    victoryXP: victoryRewards.xp, victoryGold: victoryRewards.gold, victoryEssence: victoryRewards.essence,
    nextMission, campaignDone, levelUpInfo, attackBanner, screenShake, screenFlash,
    xpPenaltyBanner, hpInfo, hpColor, defeated, doneCampaign, totalCampaign,
    activeSkin, needsClassPick, damageNumbers,
    // arena attack bridge
    selectedTaskCount,
    setSelectedTaskCount,
    attackCallbackRef,
    // temporal attack bridge
    temporalSelectedCount,
    setTemporalSelectedCount,
    temporalAttackCallbackRef,
    // focus attack bridge
    focusSelectedCount,
    setFocusSelectedCount,
    focusAttackCallbackRef,
    lvInfo, xpPct, rank, cpData, playerName,
    handleAttackStart, handleComplete, handleTasksChange, handleUncompleteTask,
    handleDeleteTask, handleNextMission, handleTemporalStrike, handleFocusStrike,
    handleChallengeFailed, handleEmptyStateChange,
    setShowVictory, setNeedsClassPick, setActiveSkin, setLevelUpInfo, refresh,
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
}