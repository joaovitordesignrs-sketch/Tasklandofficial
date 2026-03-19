import { useState, useEffect, useMemo } from "react";
import { Trophy, Lock, Swords } from "lucide-react";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { getMissions } from "../data/missions";
import { getHabits } from "../data/habits";
import { getChallenges } from "../data/challenges";
import { getEconomy, ACHIEVEMENTS, TIER_COLORS, checkAchievements, AchievementDef, PlayerStats } from "../data/economy";
import { getLevelInfo, calcTotalXP } from "../data/gameEngine";
import { PageShell } from "./ui/PageShell";
import { PixelIcon } from "./ui/PixelIcon";
import { CardIn } from "./ui/CardIn";
import { markAchievementsSeen } from "../hooks/useNotifications";
import {
  BG_DEEPEST, BG_CARD, BORDER_SUBTLE, BORDER_ELEVATED,
  COLOR_MAGE, COLOR_SUCCESS, COLOR_DANGER, COLOR_LEGENDARY,
  TEXT_INACTIVE, TEXT_MUTED,
  FONT_PIXEL, FONT_BODY, RADIUS_LG, RADIUS_XL,
} from "../data/tokens";

function gatherStats(): PlayerStats {
  const missions = getMissions();
  const habits = getHabits();
  const challenges = getChallenges();
  const econ = getEconomy();

  let totalTasksCompleted = 0;
  let totalMonstersDefeated = 0;
  let totalBossesDefeated = 0;

  for (const m of missions) {
    for (const t of m.tasks) {
      if (t.completed) totalTasksCompleted++;
    }
    if ((m.monsterCurrentHp ?? 1) <= 0) {
      totalMonstersDefeated++;
      if (m.monsterType === "boss") totalBossesDefeated++;
    }
  }

  const challengesCompleted = challenges.filter(c => c.status === "completed").length;
  const maxHabitStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak), 0);
  const habitsOver100Days = habits.filter(h => h.bestStreak >= 100).length;
  const level = getLevelInfo(calcTotalXP(missions)).level;

  return {
    totalTasksCompleted, totalMonstersDefeated, totalBossesDefeated,
    maxHabitStreak, habitsOver100Days,
    level, challengesCompleted, onePunchBosses: econ.onePunchBosses,
  };
}

const CATEGORIES = ["Tarefas", "Monstros", "Bosses", "Nível", "Hábitos", "Tempo", "Hardcore"];

export default function AchievementsScreen() {
  const isDesktop = useIsDesktop();
  const [econ, setEcon] = useState(getEconomy());
  const [newAch, setNewAch] = useState<AchievementDef[]>([]);

  useEffect(() => {
    const stats = gatherStats();
    const newly = checkAchievements(stats);
    if (newly.length > 0) {
      setNewAch(newly);
      setTimeout(() => setNewAch([]), 4000);
    }
    setEcon({ ...getEconomy() });
    // Clear the notification badge since user is now viewing achievements
    markAchievementsSeen();
  }, []);

  const unlocked = new Set(econ.unlockedAchievements);
  const total = ACHIEVEMENTS.length;
  const unlockedCount = econ.unlockedAchievements.length;

  return (
    <>
      <style>{`@keyframes achUnlock { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }`}</style>

      <PageShell icon={<Trophy size={16} />} title="CONQUISTAS" accentColor={COLOR_MAGE}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Progress bar */}
          <div style={{
            background: BG_CARD,
            border: `1px solid ${COLOR_MAGE}33`,
            borderTop: `2px solid ${COLOR_MAGE}`,
            borderRadius: RADIUS_XL, padding: "14px 18px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: COLOR_MAGE, fontSize: 18, fontFamily: FONT_BODY }}>Progresso Geral</span>
              <span style={{ fontFamily: FONT_PIXEL, color: COLOR_MAGE, fontSize: 12 }}>{unlockedCount}/{total}</span>
            </div>
            <div style={{ height: 10, background: BG_DEEPEST, border: `1px solid ${BORDER_ELEVATED}`, borderRadius: 5, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, width: `${(unlockedCount / total) * 100}%`, background: COLOR_MAGE, transition: "width 0.8s ease" }} />
            </div>
          </div>

          {/* Categories */}
          {CATEGORIES.map(cat => {
            const achs = ACHIEVEMENTS.filter(a => a.category === cat);
            if (achs.length === 0) return null;
            return (
              <div key={cat}>
                <div style={{ fontFamily: FONT_PIXEL, color: TEXT_MUTED, fontSize: 9, marginBottom: 8, padding: "0 4px" }}>
                  {cat.toUpperCase()}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {achs.map((ach, achIdx) => {
                    const isUnlocked = unlocked.has(ach.id);
                    const isNew = newAch.some(n => n.id === ach.id);
                    return (
                      <CardIn key={ach.id} index={achIdx}>
                        <div
                          style={{
                            background: isUnlocked ? `${TIER_COLORS[ach.tier]}08` : BG_CARD,
                            border: `1px solid ${isUnlocked ? TIER_COLORS[ach.tier] + "55" : "#1a1d3566"}`,
                            borderLeft: isUnlocked ? `2px solid ${TIER_COLORS[ach.tier]}` : `2px solid ${BORDER_SUBTLE}`,
                            borderRadius: RADIUS_LG,
                            padding: "12px 16px",
                            display: "flex", alignItems: "center", gap: 14,
                            opacity: isUnlocked ? 1 : 0.45,
                            animation: isNew ? "achUnlock 0.6s ease-out" : "none",
                            boxShadow: isNew ? `0 0 20px ${TIER_COLORS[ach.tier]}55` : "none",
                          }}
                        >
                          <div style={{
                            width: 40, height: 40, flexShrink: 0,
                            background: isUnlocked ? TIER_COLORS[ach.tier] + "22" : BG_DEEPEST,
                            border: `1px solid ${isUnlocked ? TIER_COLORS[ach.tier] + "66" : BORDER_ELEVATED}`,
                            borderRadius: 6,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {isUnlocked ? <PixelIcon name={ach.icon} size={22} color={TIER_COLORS[ach.tier]} /> : <Lock size={16} color={TEXT_INACTIVE} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ color: isUnlocked ? TIER_COLORS[ach.tier] : TEXT_MUTED, fontSize: 18, fontFamily: FONT_BODY }}>{ach.name}</span>
                              <span style={{
                                background: TIER_COLORS[ach.tier] + "22",
                                border: `1px solid ${TIER_COLORS[ach.tier]}44`,
                                color: TIER_COLORS[ach.tier],
                                padding: "1px 6px", fontSize: 12, textTransform: "uppercase", borderRadius: 4,
                                fontFamily: FONT_BODY,
                              }}>
                                {ach.tier}
                              </span>
                            </div>
                            <div style={{ color: TEXT_INACTIVE, fontSize: 15, fontFamily: FONT_BODY }}>{ach.desc}</div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            {isUnlocked ? (
                              <span style={{ color: COLOR_DANGER, fontSize: 16, fontFamily: FONT_BODY, display: "flex", alignItems: "center", gap: 4 }}>
                                <Swords size={13} color={COLOR_DANGER} /> +{ach.reward.damageBonus.toFixed(2)}x
                              </span>
                            ) : (
                              <span style={{ color: BORDER_ELEVATED, fontSize: 14, fontFamily: FONT_BODY, display: "flex", alignItems: "center", gap: 4 }}>
                                <Swords size={12} color={BORDER_ELEVATED} /> +{ach.reward.damageBonus.toFixed(2)}x
                              </span>
                            )}
                            {ach.reward.title && isUnlocked && (
                              <div style={{ color: COLOR_MAGE, fontSize: 13, marginTop: 2, fontFamily: FONT_BODY }}>Título: {ach.reward.title}</div>
                            )}
                          </div>
                        </div>
                      </CardIn>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </PageShell>
    </>
  );
}