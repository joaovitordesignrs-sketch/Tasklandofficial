/**
 * HomeScreen — Campaign right column (desktop) & full screen (mobile).
 * All combat state comes from CampaignContext (useCampaign).
 */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { useCampaign }  from "../hooks/useCampaign";
import { useAuth }      from "../hooks/useAuth";
import { ChallengePanel }    from "./ChallengePanel";
import { FocusPanel }        from "./FocusPanel";
import { TaskList }          from "./TaskList";
import { PageShell } from "./ui/PageShell";
import { ClassPickerOverlay } from "./ClassPickerOverlay";
import { TaskCharacter } from "./TaskCharacter";
import { PastMonsterTasks } from "./PastMonsterTasks";
import { getRebirthState }   from "../data/economy";
import { TYPE_INFO }         from "../data/missions";
import { audioManager }      from "../hooks/audioManager";
import { Skull, Zap, Settings, Swords, Trophy, Timer, Brain } from "lucide-react";
import { PixelIcon } from "./ui/PixelIcon";
import { FloatingDamage } from "./ui/FloatingDamage";

import imgArenaBackground from "figma:asset/6037587fea6349ebacca46bf46244c717b2e23e6.png";
import imgAvatar  from "figma:asset/97194cdd6dc3ec8040cc985dae2b65b2314dcf1e.png";
import imgAvatarMago from "figma:asset/5c09b71e009581d58103f7df9949281a05a710d1.png";
import imgSlime    from "figma:asset/dc6ff590dfbf25672d088cf95ba85807861b754a.png";
import imgGoblin   from "figma:asset/6b2c7d65c99eabe04c7cf81373859cf650099675.png";
import imgCogu     from "figma:asset/02b7cadfe976fe3622d67cb58af1c8f90572a8f2.png";
import imgSkeleton from "figma:asset/aac85f62dfb7ce285b01089399299b9b6b091fe5.png";
import imgGolem    from "figma:asset/843a5f024b278e6710a508a853f1ebd9c4fed362.png";
import imgDarkLord from "figma:asset/028f146c821934274d14ce8a95fd29ab64707c54.png";

// ── Monster sprite picker ─────────────────────────────────────────────────────
function getMonsterSprite(monsterType?: string, campaignOrder?: number): string {
  switch (monsterType) {
    case "weak":     return imgSlime;
    case "xp_bonus": return imgCogu;
    case "normal":   return imgGoblin;
    case "strong":   return imgSkeleton;
    case "boss":
      return ((campaignOrder ?? 0) % 2 === 0) ? imgGolem : imgDarkLord;
    default:         return imgDarkLord;
  }
}

// ── Monster height by type ────────────────────────────────────────────────────
function getMonsterHeight(monsterType?: string): string {
  switch (monsterType) {
    case "weak":     return "30%";
    case "xp_bonus": return "38%";
    case "normal":   return "48%";
    case "strong":   return "58%";
    case "boss":     return "88%";
    default:         return "88%";
  }
}

function getMonsterBottom(monsterType?: string): string {
  switch (monsterType) {
    case "weak":     return "18%";
    case "xp_bonus": return "16%";
    case "normal":   return "15%";
    case "strong":   return "12%";
    case "boss":     return "5%";
    default:         return "5%";
  }
}

// ── Attack button helpers ─────────────────────────────────────────────────────
function getAttackBg(monsterType: string | undefined, count: number): string {
  if (count >= 5) return "linear-gradient(135deg, #FF6B35, #FFD700)";
  if (count >= 3) {
    switch (monsterType) {
      case "weak":     return "linear-gradient(135deg, #06FFA5, #22D3EE)";
      case "xp_bonus": return "linear-gradient(135deg, #FFD700, #f59e0b)";
      case "strong":   return "linear-gradient(135deg, #E63946, #FF6B35)";
      case "boss":     return "linear-gradient(135deg, #7c3aed, #c084fc)";
      default:         return "linear-gradient(135deg, #4ded6e, #22D3EE)";
    }
  }
  if (count >= 2) {
    switch (monsterType) {
      case "weak":     return "#06FFA5";
      case "xp_bonus": return "#f59e0b";
      case "strong":   return "#E63946";
      case "boss":     return "linear-gradient(135deg, #5b21b6, #7c3aed)";
      default:         return "linear-gradient(135deg, #06FFA5, #22D3EE)";
    }
  }
  switch (monsterType) {
    case "weak":     return "#06FFA5";
    case "xp_bonus": return "#FFD700";
    case "strong":   return "#E63946";
    case "boss":     return "linear-gradient(135deg, #5b21b6, #c084fc)";
    default:         return "#4ded6e";
  }
}
function getAttackShadow(monsterType: string | undefined, count: number): string {
  if (count >= 5) return "0 0 20px rgba(255,107,53,0.6)";
  switch (monsterType) {
    case "weak":     return "0 0 14px rgba(6,255,165,0.4)";
    case "xp_bonus": return "0 0 14px rgba(255,215,0,0.5)";
    case "strong":   return "0 0 14px rgba(230,57,70,0.5)";
    case "boss":     return "0 0 18px rgba(124,58,237,0.6)";
    default:         return "0 0 14px rgba(6,255,165,0.35)";
  }
}
function getAttackTextColor(monsterType: string | undefined): string {
  return monsterType === "boss" ? "#e8d5ff" : "#0d1024";
}
function getAttackLabel(monsterType: string | undefined, count: number): string {
  const sprite: Record<string, string> = {
    weak: "SLIME", normal: "GOBLIN", xp_bonus: "COGU", strong: "ESQUELETO", boss: "BOSS",
  };
  const name = sprite[monsterType ?? ""] ?? "MONSTRO";
  if (count >= 5) return `ATAQUE CRÍTICO!!! ×${count}`;
  if (count >= 3) return `TRIPLO GOLPE no ${name}! (${count})`;
  if (count >= 2) return `DUPLO GOLPE no ${name}! (${count})`;
  return `ATACAR ${name}! (${count})`;
}

// ─ Level-Up Banner ───────────────────────────────────────────────────────────
function LevelUpBanner({ level, rankColor, onDone }: { level: number; rankColor: string; onDone: () => void }) {
  useEffect(() => {
    audioManager.playLevelUp();
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 20, pointerEvents: "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "lvlBannerIn 3.2s ease forwards",
    }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, ${rankColor}33 0%, transparent 70%)`, animation: "lvlGlowPulse 1s ease-out forwards" }} />
      <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#fff", letterSpacing: 3, marginBottom: 4, textShadow: "1px 1px 0 #000", animation: "lvlShine 1s ease-in-out infinite" }}>LEVEL UP</div>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 32, color: rankColor, textShadow: `3px 3px 0 #000, 0 0 15px ${rankColor}88`, lineHeight: 1, animation: "lvlNumberPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
          {level}
        </div>
      </div>
    </div>
  );
}

// ── Strip type suffixes from monster name for clean display ───────────────────
function cleanMonsterName(name: string): string {
  return name
    .replace(/\s*[▽▲★♛]\s*(FRACO|FORTE|XP\s*BÔNUS|BOSS)\s*$/i, "")
    .trim();
}

// ── Mobile Hero: player info + arena fused, edge-to-edge ─────────────────────
// Split into two sub-components so only the arena sticks to top

function MobilePlayerStrip() {
  const { lvInfo, xpPct, rank, cpData, playerName, levelUpInfo, selectedClass } = useCampaign();
  const { nick } = useAuth();
  const navigate = useNavigate();

  const avatarSrc = selectedClass === "mago" ? imgAvatarMago : imgAvatar;

  return (
    <div style={{ background: "rgba(11,13,30,0.97)", padding: "9px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #1a1e37" }}>
      {/* Avatar */}
      <div style={{ width: 44, height: 44, flexShrink: 0, background: "#0d1024", border: "1px solid #1f254f", borderRadius: 8, overflow: "hidden", position: "relative" }}>
        <img src={avatarSrc} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
      </div>

      {/* Name + LVL + rank + XP bar */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, overflow: "hidden" }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#fff", fontSize: 9, textShadow: "1px 1px 0 #000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>
            {nick || playerName}
          </span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#FFD700", fontSize: 8, whiteSpace: "nowrap" }}>LVL {lvInfo.level}</span>
          <span style={{ fontFamily: "'VT323', monospace", color: rank.color, fontSize: 16, whiteSpace: "nowrap" }}>{rank.label}</span>
        </div>
        {/* XP bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ flex: 1, height: 7, background: "#0b0d1e", border: "1px solid #2a2e50", borderRadius: 4, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, width: `${xpPct}%`, background: levelUpInfo ? rank.color : "#FFD700", transition: "width 0.6s ease" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg,transparent 0px,transparent 10px,rgba(0,0,0,0.2) 10px,rgba(0,0,0,0.2) 11px)", pointerEvents: "none" }} />
          </div>
          <span style={{ fontFamily: "'VT323', monospace", color: "#FFD700", fontSize: 12, whiteSpace: "nowrap" }}>{Math.round(xpPct)}%</span>
        </div>
      </div>

      {/* Settings button */}
      <button
        onClick={() => navigate("/configuracoes")}
        style={{ background: "none", border: "1px solid #2a2e50", color: "#8a9fba", padding: "7px 9px", cursor: "pointer", display: "flex", alignItems: "center", borderRadius: 8, transition: "border-color 0.15s, color 0.15s", flexShrink: 0 }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e39f64"; e.currentTarget.style.color = "#e39f64"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2e50"; e.currentTarget.style.color = "#8a9fba"; }}
      >
        <Settings size={18} />
      </button>
    </div>
  );
}

function MobileArenaSection() {
  const {
    mission, hpInfo, hpColor, defeated, monsterShake, taskCompleted,
    selectedClass, showVictory, victoryXP, nextMission,
    campaignDone, handleAttackStart, handleNextMission, setShowVictory,
    levelUpInfo, setLevelUpInfo, cpData, damageNumbers,
  } = useCampaign();

  if (!mission || campaignDone) return null;

  return (
    <div style={{ width: "100%", background: "#0a0c1a", borderBottom: "2px solid #1f254f" }}>
      {/* Mission toolbar — number badge + clean name, no HP */}
      <div style={{ background: "#07091a", borderBottom: "1px solid #1a1e37", padding: "5px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flexShrink: 0, minWidth: 22, height: 22, background: "#1a1e37", border: "1px solid #2a2e50", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#e39f64", fontSize: 7, lineHeight: 1 }}>
            #{(mission.campaignOrder ?? 0) + 1}
          </span>
        </div>
        <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#fff", fontSize: 8, textShadow: "1px 1px 0 #000", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {cleanMonsterName(mission.name)}
        </span>
      </div>

      {/* Battle area — full width, no border-radius */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "#0a0c1a" }}>
        <img src={imgArenaBackground} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated", zIndex: 1 }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(5,7,18,0.45) 100%)" }} />
        {/* Character — foreground */}
        <div style={{ position: "absolute", left: "4%", bottom: "4%", height: "85%", zIndex: 4 }}>
          <TaskCharacter key={selectedClass ?? "__none__"} taskCompleted={taskCompleted} selectedClass={selectedClass} onAttackStart={handleAttackStart} />
        </div>

        {/* Power badge — overlaid top-left */}
        <div style={{
          position: "absolute",
          left: "4%",
          top: "6%",
          zIndex: 6,
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: "rgba(10, 14, 40, 0.88)",
          border: `1px solid ${cpData.rank.color}88`,
          borderRadius: 8,
          padding: "7px 14px",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow: `0 0 18px ${cpData.rank.color}55, inset 0 0 10px ${cpData.rank.color}18`,
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}>
          <Zap size={15} color={cpData.rank.color} strokeWidth={2.5} />
          <span style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 13,
            color: cpData.rank.color,
            letterSpacing: 1,
            textShadow: `0 0 12px ${cpData.rank.color}cc`,
          }}>
            POWER {cpData.combatPower}
          </span>
        </div>

        {/* Monster — back plane */}
        <div style={{ position: "absolute", right: "8%", bottom: getMonsterBottom(mission.monsterType), height: getMonsterHeight(mission.monsterType), zIndex: 2, transform: monsterShake ? "scaleX(-1) translateX(-8px)" : "scaleX(-1)", transition: monsterShake ? "transform 0.05s" : "transform 0.3s", filter: hpInfo.percent < 25 ? "brightness(1.4) saturate(1.2)" : "brightness(0.88) saturate(0.82)", imageRendering: "pixelated" }}>
          <img src={getMonsterSprite(mission.monsterType, mission.campaignOrder)} alt="" style={{ height: "100%", width: "auto", objectFit: "contain", imageRendering: "pixelated", opacity: defeated ? 0.15 : 1, transition: "opacity 0.5s" }} />
          {defeated && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "#ed4f49" }}><Skull size={44} /></div>}
        </div>
        {/* Floating damage numbers */}
        <FloatingDamage numbers={damageNumbers} />
        {levelUpInfo && <LevelUpBanner level={levelUpInfo.level} rankColor={levelUpInfo.rankColor} onDone={() => setLevelUpInfo(null)} />}
      </div>

      {/* Footer — type tag (left) + HP bar (right) + victory panel */}
      <div style={{ background: "#07091a", borderTop: "1px solid #1a1e37", padding: "7px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Monster type tag — left */}
          {(() => {
            const type = mission.monsterType;
            if (!type || type === "normal") {
              return <span style={{ fontFamily: "'VT323', monospace", color: "#5a6080", fontSize: 14, whiteSpace: "nowrap" }}>NORMAL</span>;
            }
            const info = TYPE_INFO[type];
            return (
              <span style={{ background: info.color + "22", border: `1px solid ${info.color}66`, color: info.color, fontFamily: "'Press Start 2P', monospace", fontSize: 7, padding: "3px 7px", borderRadius: 4, whiteSpace: "nowrap", letterSpacing: 0.5 }}>
                {info.icon} {info.label}
              </span>
            );
          })()}

          {/* HP bar — right */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            <div style={{ flex: 1, maxWidth: 160, height: 8, background: "rgba(0,0,0,0.6)", border: `1px solid ${hpColor}55`, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${hpInfo.percent}%`, height: "100%", background: hpColor, transition: "width 0.6s ease" }} />
            </div>
            <span style={{ fontFamily: "'VT323', monospace", color: hpColor, fontSize: 14, whiteSpace: "nowrap", minWidth: 48, textAlign: "right" }}>{hpInfo.label}</span>
          </div>
        </div>

        {/* Victory panel */}
        {showVictory && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 4, borderTop: "1px solid #1f254f" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Trophy size={18} color="#f0c040" />
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#f0c040" }}>VITÓRIA!</span>
              </div>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: "#FFD700", animation: "pulse 0.8s ease-out" }}>+{victoryXP} XP</span>
            </div>
            {nextMission ? (
              <button onClick={handleNextMission} style={{ width: "100%", background: "#c084fc", border: "none", color: "#0d1024", padding: "10px 16px", fontFamily: "'Press Start 2P', monospace", fontSize: 10, cursor: "pointer", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, animation: "pulse 1.5s infinite" }}>
                <Zap size={14} /> PRÓXIMO MONSTRO ▶
              </button>
            ) : (
              <button onClick={() => setShowVictory(false)} style={{ width: "100%", background: "#1b1e37", border: "1px solid #f0c040", color: "#f0c040", padding: "8px 16px", fontFamily: "'VT323', monospace", fontSize: 18, cursor: "pointer", borderRadius: 7 }}>
                Fechar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mobile Attack Modal — fixed above the bottom navbar ───────────────────────
function MobileAttackModal() {
  const {
    mission, defeated, showVictory,
    selectedTaskCount, attackCallbackRef,
    temporalSelectedCount, temporalAttackCallbackRef,
    focusSelectedCount, focusAttackCallbackRef,
  } = useCampaign();

  const totalSelected = selectedTaskCount + temporalSelectedCount + focusSelectedCount;
  const hasAttack = !defeated && !showVictory && mission && totalSelected > 0;

  if (!hasAttack) return null;

  // Determine button appearance based on active sources
  const hasCampaign = selectedTaskCount > 0;
  const hasTemporal = temporalSelectedCount > 0;
  const hasFocus    = focusSelectedCount > 0;
  const mixed       = [hasCampaign, hasTemporal, hasFocus].filter(Boolean).length > 1;

  const bg = mixed
    ? "linear-gradient(135deg, #E63946, #c084fc)"
    : hasCampaign
    ? getAttackBg(mission.monsterType, selectedTaskCount)
    : hasTemporal
    ? (temporalSelectedCount >= 3 ? "linear-gradient(135deg, #E63946, #FF6B35)" : "#FF6B35")
    : "linear-gradient(135deg, #c084fc, #7c3aed)";

  const textColor = hasFocus && !mixed ? "#fff" : getAttackTextColor(mission.monsterType);

  const label = mixed
    ? `ATACAR! (${totalSelected})`
    : hasCampaign
    ? getAttackLabel(mission.monsterType, selectedTaskCount)
    : hasTemporal
    ? (temporalSelectedCount >= 3 ? `GOLPE TEMPORAL CRÍTICO! (${temporalSelectedCount})` : `GOLPE TEMPORAL! (${temporalSelectedCount})`)
    : `FOCO! ${focusSelectedCount} TASK${focusSelectedCount > 1 ? "S" : ""}`;

  const shadow = mixed
    ? "0 0 18px rgba(192,132,252,0.4), 0 8px 32px rgba(0,0,0,0.6)"
    : hasCampaign
    ? `${getAttackShadow(mission.monsterType, selectedTaskCount)}, 0 8px 32px rgba(0,0,0,0.6)`
    : hasTemporal
    ? "0 0 14px rgba(255,107,53,0.4), 0 8px 32px rgba(0,0,0,0.6)"
    : "0 0 14px rgba(192,132,252,0.45), 0 8px 32px rgba(0,0,0,0.6)";

  function handleUnifiedAttack() {
    audioManager.playClick("press");
    if (selectedTaskCount > 0) attackCallbackRef.current?.();
    if (temporalSelectedCount > 0) temporalAttackCallbackRef.current?.();
    if (focusSelectedCount > 0) focusAttackCallbackRef.current?.();
  }

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 300,
      padding: "10px 14px 120px",
      background: "linear-gradient(to top, rgba(7,9,26,0.98) 70%, transparent 100%)",
      pointerEvents: "none",
    }}>
      <button
        onClick={handleUnifiedAttack}
        style={{
          pointerEvents: "all",
          width: "100%",
          background: bg,
          border: "none",
          color: textColor,
          padding: "14px 16px",
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 10,
          cursor: "pointer",
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          animation: totalSelected >= 3 ? "pulse 0.8s infinite" : "pulse 1.5s infinite",
          boxShadow: shadow,
        }}
      >
        <Swords size={14} />
        {label}
      </button>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigate   = useNavigate();
  const isDesktop  = useIsDesktop();
  const { nick }   = useAuth();
  const {
    mission, campaignDone, defeated, lvInfo, rank, selectedClass, playerName,
    needsClassPick, setNeedsClassPick, setSelectedClass,
    handleComplete, handleTasksChange, handleUncompleteTask, handleDeleteTask,
    handleTemporalStrike, handleFocusStrike, handleChallengeFailed, handleEmptyStateChange,
    screenFlash, screenShake, attackBanner, xpPenaltyBanner,
    setTemporalSelectedCount, temporalAttackCallbackRef,
    setFocusSelectedCount, focusAttackCallbackRef,
  } = useCampaign();
  const rebirthInfo = getRebirthState();

  // Ref shared with TaskList so the FAB can open the add form
  const addTriggerRef = useRef<(() => void) | null>(null);
  // Hide FAB while the add-task form is open
  const [addFormOpen, setAddFormOpen] = useState(false);

  // ── DESKTOP: only right-column content ────────────────────────────────────
  if (isDesktop) {
    return (
      <PageShell icon={<Swords size={16} />} title="CAMPANHA" accentColor="#e39f64">
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          {/* Always render panels — prevents FocusPanel timer from resetting during monster transitions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
            <ChallengePanel
              playerLevel={lvInfo.level} monsterAlive={!defeated && !!mission && !campaignDone}
              onTemporalStrike={handleTemporalStrike} onChallengeFailed={handleChallengeFailed}
              onSelectedCountChange={setTemporalSelectedCount}
              attackCallbackRef={temporalAttackCallbackRef}
            />
            <FocusPanel
              playerLevel={lvInfo.level} monsterAlive={!defeated && !!mission && !campaignDone}
              onFocusStrike={handleFocusStrike}
              onSelectedCountChange={setFocusSelectedCount}
              attackCallbackRef={focusAttackCallbackRef}
            />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            {mission && !campaignDone ? (
              <>
                <TaskList
                  tasks={mission.tasks}
                  onChange={handleTasksChange}
                  onComplete={handleComplete}
                  onUncomplete={handleUncompleteTask}
                  onDeleteTask={handleDeleteTask}
                  showDamage={true}
                  playerLevel={lvInfo.level}
                  hideAttackButton={true}
                />
                <PastMonsterTasks />
              </>
            ) : (
              <>
                <TaskList tasks={[]} onChange={handleEmptyStateChange} showDamage={false} playerLevel={lvInfo.level} />
                <PastMonsterTasks />
              </>
            )}
          </div>
        </div>
      </PageShell>
    );
  }

  // ── MOBILE: full layout ────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes bannerPop {
          0%  {transform:translate(-50%,-50%) scale(0.3) rotate(-8deg);opacity:0}
          25% {transform:translate(-50%,-50%) scale(1.15) rotate(2deg);opacity:1}
          80% {transform:translate(-50%,-50%) scale(1) rotate(0deg);opacity:1}
          100%{transform:translate(-50%,-50%) scale(0.85) rotate(0deg);opacity:0}
        }
        @keyframes criticalPulse{0%,50%{opacity:1}25%,75%{opacity:0.6}100%{opacity:1}}
        @keyframes flashIn{0%{opacity:0.45}100%{opacity:0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.75}}
        @keyframes penaltyDrop {
          0%  {transform:translate(-50%,-50%) scale(0.5);opacity:0}
          20% {transform:translate(-50%,-50%) scale(1.1);opacity:1}
          80% {transform:translate(-50%,-50%) scale(1);opacity:1}
          100%{transform:translate(-50%,-50%) scale(0.8);opacity:0}
        }
        @keyframes lvlBannerIn {
          0%   {opacity:0;transform:scale(0.5)}
          10%  {opacity:1;transform:scale(1.15)}
          20%  {transform:scale(1)}
          85%  {opacity:1;transform:scale(1)}
          100% {opacity:0;transform:scale(0.9)}
        }
        @keyframes lvlGlowPulse{0%{opacity:0.8}50%{opacity:0.3}100%{opacity:0}}
        @keyframes lvlShine{0%,100%{opacity:0.6}50%{opacity:1}}
        @keyframes lvlNumberPop{0%{transform:scale(0.3);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>

      {/* Fixed overlays */}
      {screenFlash && <div style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,0.3)", zIndex: 9999, pointerEvents: "none", animation: "flashIn 0.18s ease-out forwards" }} />}
      {xpPenaltyBanner && (
        <div style={{ position: "fixed", top: "35%", left: "50%", zIndex: 9500, pointerEvents: "none", textAlign: "center", animation: "penaltyDrop 3s ease forwards", transform: "translate(-50%,-50%)" }}>
          <div style={{ marginBottom: 6, color: "#E63946" }}><Skull size={52} /></div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 22, color: "#E63946", textShadow: "3px 3px 0 #000", letterSpacing: 2, lineHeight: 1.3 }}>DESAFIO FALHOU!</div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: "#E63946", textShadow: "2px 2px 0 #000", marginTop: 8, animation: "criticalPulse 0.5s step-end infinite" }}>-{xpPenaltyBanner.amount} XP</div>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 18, color: "#ff8888", marginTop: 6 }}>50% do progresso do nível perdido</div>
        </div>
      )}
      {attackBanner && (
        <div style={{ position: "fixed", top: "38%", left: "50%", zIndex: 9000, pointerEvents: "none", textAlign: "center", animation: "bannerPop 1.4s ease forwards", transform: "translate(-50%,-50%)" }}>
          <div style={{ marginBottom: 4, color: attackBanner.color }}><PixelIcon name={attackBanner.emoji} size={52} color={attackBanner.color} /></div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: attackBanner.size, color: attackBanner.color, textShadow: "3px 3px 0 #000", letterSpacing: 2, lineHeight: 1.2, whiteSpace: "nowrap", animation: attackBanner.text.includes("CRÍTICO") ? "criticalPulse 0.4s step-end infinite" : "none" }}>{attackBanner.text}</div>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 22, color: attackBanner.color, opacity: 0.85, marginTop: 6, textShadow: "2px 2px 0 #000" }}>{attackBanner.sub}</div>
        </div>
      )}

      {/* Class picker */}
      {needsClassPick && (
        <ClassPickerOverlay
          isRebirth={rebirthInfo.totalRebirths > 0}
          runNumber={rebirthInfo.runNumber}
          onConfirm={(cls) => { setNeedsClassPick(false); setSelectedClass(cls); }}
        />
      )}

      <div style={{
        background: "#15182d",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: "100vh",
        paddingBottom: 88,
        fontFamily: "'VT323', monospace",
        animation: screenShake ? "missionScreenShake 0.4s ease" : "none",
      }}>
        {/* Fixed pixel-grid background */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "repeating-linear-gradient(0deg,rgba(255,255,255,0.018) 0px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,rgba(255,255,255,0.018) 0px,transparent 1px,transparent 48px)" }} />

        {/* Player info strip — scrolls with page */}
        <MobilePlayerStrip />

        {/* Arena — only this section sticks to top */}
        <div style={{ position: "sticky", top: 0, zIndex: 30, flexShrink: 0 }}>
          <MobileArenaSection />
        </div>

        {/* Content below arena — grows naturally, no height constraint */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", maxWidth: 900, width: "100%", margin: "0 auto" }}>
          {campaignDone ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 32 }}>
              <Trophy size={64} color="#FFD700" />
              <div style={{ fontFamily: "'Press Start 2P', monospace", color: "#FFD700", fontSize: 22, textShadow: "3px 3px 0 #000", textAlign: "center", animation: "pulse 2s infinite" }}>CAMPANHA CONCLUÍDA!</div>
              <div style={{ fontFamily: "'VT323', monospace", color: "#06FFA5", fontSize: 22, textAlign: "center" }}>Você derrotou todos os monstros!</div>
            </div>
          ) : (
            <>
              {/* Always render Challenge/Focus panels — prevents timer reset during monster transitions */}
              <ChallengePanel playerLevel={lvInfo.level} monsterAlive={!defeated && !!mission} onTemporalStrike={handleTemporalStrike} onChallengeFailed={handleChallengeFailed}
                onSelectedCountChange={setTemporalSelectedCount} attackCallbackRef={temporalAttackCallbackRef} />
              <FocusPanel playerLevel={lvInfo.level} monsterAlive={!defeated && !!mission} onFocusStrike={handleFocusStrike}
                onSelectedCountChange={setFocusSelectedCount} attackCallbackRef={focusAttackCallbackRef} />
              {/* Task list — only show if mission active */}
              {mission ? (
                <>
                  <TaskList
                    tasks={mission.tasks}
                    onChange={handleTasksChange}
                    onComplete={handleComplete}
                    onUncomplete={handleUncompleteTask}
                    onDeleteTask={handleDeleteTask}
                    showDamage={true}
                    playerLevel={lvInfo.level}
                    hideAttackButton={true}
                    addTriggerRef={addTriggerRef}
                    onAddFormToggle={setAddFormOpen}
                  />
                  <PastMonsterTasks />
                  {/* Bottom breathing room */}
                  <div style={{ height: 200 }} />
                </>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
                  <div style={{ padding: "8px 14px" }}>
                    <div style={{ background: "#0d1024", border: "1px solid rgba(42,46,80,0.7)", borderRadius: 10, padding: "22px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: 0.45 }}>
                      <Skull size={34} color="#3a4060" />
                      <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#3a4060", fontSize: 8, textAlign: "center", letterSpacing: 1 }}>NENHUMA MISSÃO ATIVA</span>
                      <span style={{ fontFamily: "'VT323', monospace", color: "#2a3050", fontSize: 17, textAlign: "center" }}>Adicione tarefas abaixo para iniciar</span>
                    </div>
                  </div>
                  <TaskList tasks={[]} onChange={handleEmptyStateChange} showDamage={false} playerLevel={lvInfo.level} addTriggerRef={addTriggerRef} onAddFormToggle={setAddFormOpen} />
                  <PastMonsterTasks />
                  <div style={{ height: 200 }} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Attack Modal */}
      <MobileAttackModal />

      {/* Mobile FAB — hides when add form is open */}
      {!addFormOpen && (
        <button
          onClick={() => { audioManager.playClick("press"); addTriggerRef.current?.(); }}
          style={{
            position: "fixed",
            bottom: 104,
            right: 18,
            zIndex: 250,
            width: 52,
            height: 52,
            borderRadius: 12,
            backgroundImage: "linear-gradient(135deg, rgb(227, 159, 100) 0%, rgb(192, 122, 63) 100%)",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            WebkitTapHighlightColor: "transparent",
            boxShadow: "none",
            outline: "none",
          } as React.CSSProperties}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.92)"; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
          onTouchStart={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.92)"; }}
          onTouchEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
          aria-label="Nova Tarefa"
        >
          {/* Inner border overlay */}
          <div style={{ position: "absolute", inset: 0, border: "1.2px solid rgba(255,255,255,0.15)", borderRadius: 12, pointerEvents: "none" }} />
          {/* Plus icon matching Figma */}
          <svg width="22" height="22" viewBox="0 0 21.9856 21.9856" fill="none">
            <path d="M10.9928 4.58034V17.4053" stroke="#0D1024" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.29017" />
            <path d="M4.58034 10.9928H17.4053" stroke="#0D1024" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.29017" />
          </svg>
        </button>
      )}
    </>
  );
}