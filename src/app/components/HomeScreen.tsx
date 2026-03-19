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
import { RpgButton }         from "./ui/RpgButton";
import { TYPE_INFO }         from "../data/missions";
import { audioManager }      from "../hooks/audioManager";
import { Skull, Zap, Settings, Swords, Trophy } from "lucide-react";
import { PixelIcon } from "./ui/PixelIcon";
import { FloatingDamage } from "./ui/FloatingDamage";
import { useTheme } from "../contexts/PreferencesContext";
import type { ThemeTokens } from "../data/tokens";

import imgArenaBackground from "../../assets/arena_background/arena_background_default.png";
import imgAvatar  from "../../assets/profile_pic/profile_pic_warrior.png";
import imgAvatarMago from "../../assets/profile_pic/profile_pic_mage.png";
import imgSlime    from "../../assets/monsters/monster_slime.png";
import imgGoblin   from "../../assets/monsters/monster_goblin.png";
import imgCogu     from "../../assets/monsters/monster_cogu.png";
import imgSkeleton from "../../assets/monsters/monster_skeleton.png";
import imgGolem    from "figma:asset/843a5f024b278e6710a508a853f1ebd9c4fed362.png";
import imgDarkLord from "../../assets/monsters/monster_darklord.png";

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

// ── Attack button helpers (accept tokens as parameter) ────────────────────────
function getAttackBg(monsterType: string | undefined, count: number, tk: ThemeTokens): string {
  const { COLOR_ORANGE, COLOR_LEGENDARY, COLOR_SUCCESS, COLOR_DANGER, COLOR_MAGE } = tk;
  if (count >= 5) return `linear-gradient(135deg, ${COLOR_ORANGE}, ${COLOR_LEGENDARY})`;
  if (count >= 3) {
    switch (monsterType) {
      case "weak":     return `linear-gradient(135deg, ${COLOR_SUCCESS}, #22D3EE)`;
      case "xp_bonus": return `linear-gradient(135deg, ${COLOR_LEGENDARY}, #f59e0b)`;
      case "strong":   return `linear-gradient(135deg, ${COLOR_DANGER}, ${COLOR_ORANGE})`;
      case "boss":     return `linear-gradient(135deg, #7c3aed, ${COLOR_MAGE})`;
      default:         return `linear-gradient(135deg, #4ded6e, #22D3EE)`;
    }
  }
  if (count >= 2) {
    switch (monsterType) {
      case "weak":     return COLOR_SUCCESS;
      case "xp_bonus": return "#f59e0b";
      case "strong":   return COLOR_DANGER;
      case "boss":     return "linear-gradient(135deg, #5b21b6, #7c3aed)";
      default:         return `linear-gradient(135deg, ${COLOR_SUCCESS}, #22D3EE)`;
    }
  }
  switch (monsterType) {
    case "weak":     return COLOR_SUCCESS;
    case "xp_bonus": return COLOR_LEGENDARY;
    case "strong":   return COLOR_DANGER;
    case "boss":     return `linear-gradient(135deg, #5b21b6, ${COLOR_MAGE})`;
    default:         return "#4ded6e";
  }
}

function getAttackShadow(monsterType: string | undefined, count: number, tk: ThemeTokens): string {
  const { COLOR_ORANGE, COLOR_SUCCESS, COLOR_LEGENDARY, COLOR_DANGER, alpha } = tk;
  if (count >= 5) return `0 0 20px ${alpha(COLOR_ORANGE, "99")}`;
  switch (monsterType) {
    case "weak":     return `0 0 14px ${alpha(COLOR_SUCCESS, "66")}`;
    case "xp_bonus": return `0 0 14px ${alpha(COLOR_LEGENDARY, "80")}`;
    case "strong":   return `0 0 14px ${alpha(COLOR_DANGER, "80")}`;
    case "boss":     return "0 0 18px rgba(124,58,237,0.6)";
    default:         return `0 0 14px ${alpha(COLOR_SUCCESS, "59")}`;
  }
}

function getAttackTextColor(monsterType: string | undefined, tk: ThemeTokens): string {
  return monsterType === "boss" ? "#e8d5ff" : tk.BG_CARD;
}

function getAttackLabel(monsterType: string | undefined, count: number): string {
  const sprite: Record<string, string> = {
    weak: "SLIME", normal: "GOBLIN", xp_bonus: "SHROOM", strong: "SKELETON", boss: "BOSS",
  };
  const name = sprite[monsterType ?? ""] ?? "MONSTER";
  if (count >= 5) return `CRITICAL HIT!!! ×${count}`;
  if (count >= 3) return `TRIPLE STRIKE at ${name}! (${count})`;
  if (count >= 2) return `DOUBLE STRIKE at ${name}! (${count})`;
  return `ATTACK ${name}! (${count})`;
}

// ── Level-Up Banner ───────────────────────────────────────────────────────────
function LevelUpBanner({ level, rankColor, onDone }: { level: number; rankColor: string; onDone: () => void }) {
  const { FONT_PIXEL, PX_SM } = useTheme();
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
        <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_SM, color: "#fff", letterSpacing: 3, marginBottom: 4, textShadow: "1px 1px 0 #000", animation: "lvlShine 1s ease-in-out infinite" }}>LEVEL UP</div>
        <div style={{ fontFamily: FONT_PIXEL, fontSize: 32, color: rankColor, textShadow: `3px 3px 0 #000, 0 0 15px ${rankColor}88`, lineHeight: 1, animation: "lvlNumberPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
          {level}
        </div>
      </div>
    </div>
  );
}

// ── Strip type suffixes from monster name ──────────────────────────────────────
function cleanMonsterName(name: string): string {
  return name
    .replace(/\s*[▽▲★♛]\s*(WEAK|STRONG|XP\s*BONUS|BOSS)\s*$/i, "")
    .trim();
}

// ── Mobile: player info strip ─────────────────────────────────────────────────
function MobilePlayerStrip() {
  const { lvInfo, xpPct, rank, cpData, playerName, levelUpInfo, activeSkin } = useCampaign();
  const { nick } = useAuth();
  const navigate = useNavigate();
  const {
    BG_DEEPEST, BG_CARD, BORDER_SUBTLE, BORDER_ELEVATED,
    ACCENT_GOLD, COLOR_LEGENDARY,
    FONT_PIXEL, FONT_BODY,
    PX_SM, PX_XS, VT_MD,
    RADIUS_SM, RADIUS_LG,
  } = useTheme();

  void cpData;

  const avatarSrc = activeSkin === "mage" ? imgAvatarMago : imgAvatar;

  return (
    <div style={{ background: `${BG_DEEPEST}f7`, padding: "9px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid #1a1e37` }}>
      {/* Avatar */}
      <div style={{ width: 44, height: 44, flexShrink: 0, background: BG_CARD, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: RADIUS_LG, overflow: "hidden", position: "relative" }}>
        <img src={avatarSrc} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
      </div>

      {/* Name + LVL + rank + XP bar */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, overflow: "hidden" }}>
          <span style={{ fontFamily: FONT_PIXEL, color: "#fff", fontSize: PX_SM, textShadow: "1px 1px 0 #000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>
            {nick || playerName}
          </span>
          <span style={{ fontFamily: FONT_PIXEL, color: COLOR_LEGENDARY, fontSize: PX_XS, whiteSpace: "nowrap" }}>LVL {lvInfo.level}</span>
          <span style={{ fontFamily: FONT_BODY, color: rank.color, fontSize: VT_MD, whiteSpace: "nowrap" }}>{rank.label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ flex: 1, height: 7, background: BG_DEEPEST, border: `1px solid ${BORDER_ELEVATED}`, borderRadius: RADIUS_SM, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, width: `${xpPct}%`, background: levelUpInfo ? rank.color : COLOR_LEGENDARY, transition: "width 0.6s ease" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg,transparent 0px,transparent 10px,rgba(0,0,0,0.2) 10px,rgba(0,0,0,0.2) 11px)", pointerEvents: "none" }} />
          </div>
          <span style={{ fontFamily: FONT_BODY, color: COLOR_LEGENDARY, fontSize: 12, whiteSpace: "nowrap" }}>{Math.round(xpPct)}%</span>
        </div>
      </div>

      {/* Settings button */}
      <button
        onClick={() => navigate("/configuracoes")}
        style={{ background: "none", border: `1px solid ${BORDER_ELEVATED}`, color: "#8a9fba", padding: "7px 9px", cursor: "pointer", display: "flex", alignItems: "center", borderRadius: RADIUS_LG, transition: "border-color 0.15s, color 0.15s", flexShrink: 0 }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT_GOLD; e.currentTarget.style.color = ACCENT_GOLD; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER_ELEVATED; e.currentTarget.style.color = "#8a9fba"; }}
      >
        <Settings size={18} />
      </button>
    </div>
  );
}

function MobileArenaSection() {
  const {
    mission, hpInfo, hpColor, defeated, monsterShake, taskCompleted,
    activeSkin, showVictory, victoryXP, nextMission,
    campaignDone, handleAttackStart, handleNextMission, setShowVictory,
    levelUpInfo, setLevelUpInfo, cpData, damageNumbers,
  } = useCampaign();
  const {
    BG_DEEPEST, BORDER_SUBTLE, BORDER_ELEVATED,
    ACCENT_GOLD, COLOR_WARNING, COLOR_LEGENDARY, COLOR_MAGE,
    COLOR_DANGER, TEXT_INACTIVE,
    FONT_PIXEL, FONT_BODY,
    PX_SM, PX_XS, PX_2XS, PX_MD,
    VT_SM, VT_LG,
    RADIUS_SM, RADIUS_LG,
    SP_SM,
  } = useTheme();

  void ACCENT_GOLD;

  if (!mission || campaignDone) return null;

  return (
    <div style={{ width: "100%", background: BG_DEEPEST, borderBottom: `2px solid ${BORDER_SUBTLE}` }}>
      {/* Mission toolbar */}
      <div style={{ background: BG_DEEPEST, borderBottom: `1px solid ${BORDER_SUBTLE}`, padding: "5px 14px", display: "flex", alignItems: "center", gap: SP_SM }}>
        <div style={{ flexShrink: 0, minWidth: 22, height: 22, background: "#1a1e37", border: `1px solid ${BORDER_ELEVATED}`, borderRadius: RADIUS_SM + 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: FONT_PIXEL, color: ACCENT_GOLD, fontSize: PX_2XS, lineHeight: 1 }}>
            #{(mission.campaignOrder ?? 0) + 1}
          </span>
        </div>
        <span style={{ fontFamily: FONT_PIXEL, color: "#fff", fontSize: PX_XS, textShadow: "1px 1px 0 #000", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {cleanMonsterName(mission.name)}
        </span>
      </div>

      {/* Battle area */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "#0a0c1a" }}>
        <img src={imgArenaBackground} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated", zIndex: 1 }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(5,7,18,0.45) 100%)" }} />

        {/* Character */}
        <div style={{ position: "absolute", left: "4%", bottom: "4%", height: "85%", zIndex: 4 }}>
          <TaskCharacter key={activeSkin ?? "__none__"} taskCompleted={taskCompleted} activeSkin={activeSkin} onAttackStart={handleAttackStart} />
        </div>

        {/* Power badge */}
        <div style={{
          position: "absolute", left: "4%", top: "6%", zIndex: 6,
          display: "flex", alignItems: "center", gap: 7,
          background: "rgba(10, 14, 40, 0.88)",
          border: `1px solid ${cpData.rank.color}88`,
          borderRadius: RADIUS_LG,
          padding: "7px 14px",
          backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
          boxShadow: `0 0 18px ${cpData.rank.color}55, inset 0 0 10px ${cpData.rank.color}18`,
          whiteSpace: "nowrap", pointerEvents: "none",
        }}>
          <Zap size={15} color={cpData.rank.color} strokeWidth={2.5} />
          <span style={{ fontFamily: FONT_PIXEL, fontSize: 13, color: cpData.rank.color, letterSpacing: 1, textShadow: `0 0 12px ${cpData.rank.color}cc` }}>
            POWER {cpData.combatPower}
          </span>
        </div>

        {/* Monster */}
        <div style={{ position: "absolute", right: "8%", bottom: getMonsterBottom(mission.monsterType), height: getMonsterHeight(mission.monsterType), zIndex: 2, transform: monsterShake ? "scaleX(-1) translateX(-8px)" : "scaleX(-1)", transition: monsterShake ? "transform 0.05s" : "transform 0.3s", filter: hpInfo.percent < 25 ? "brightness(1.4) saturate(1.2)" : "brightness(0.88) saturate(0.82)", imageRendering: "pixelated" }}>
          <img src={getMonsterSprite(mission.monsterType, mission.campaignOrder)} alt="" style={{ height: "100%", width: "auto", objectFit: "contain", imageRendering: "pixelated", opacity: defeated ? 0.15 : 1, transition: "opacity 0.5s" }} />
          {defeated && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: COLOR_DANGER }}><Skull size={44} /></div>}
        </div>

        <FloatingDamage numbers={damageNumbers} />
        {levelUpInfo && <LevelUpBanner level={levelUpInfo.level} rankColor={levelUpInfo.rankColor} onDone={() => setLevelUpInfo(null)} />}
      </div>

      {/* Footer */}
      <div style={{ background: BG_DEEPEST, borderTop: `1px solid #1a1e37`, padding: "7px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: SP_SM }}>
          {/* Monster type tag */}
          {(() => {
            const type = mission.monsterType;
            if (!type || type === "normal") {
              return <span style={{ fontFamily: FONT_BODY, color: TEXT_INACTIVE, fontSize: VT_SM, whiteSpace: "nowrap" }}>NORMAL</span>;
            }
            const info = TYPE_INFO[type];
            return (
              <span style={{ background: info.color + "22", border: `1px solid ${info.color}66`, color: info.color, fontFamily: FONT_PIXEL, fontSize: PX_2XS, padding: "3px 7px", borderRadius: RADIUS_SM, whiteSpace: "nowrap", letterSpacing: 0.5 }}>
                {info.icon} {info.label}
              </span>
            );
          })()}

          {/* HP bar */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            <div style={{ flex: 1, maxWidth: 160, height: 8, background: BG_DEEPEST, border: `1px solid ${hpColor}55`, borderRadius: RADIUS_SM, overflow: "hidden" }}>
              <div style={{ width: `${hpInfo.percent}%`, height: "100%", background: hpColor, transition: "width 0.6s ease" }} />
            </div>
            <span style={{ fontFamily: FONT_BODY, color: hpColor, fontSize: VT_SM, whiteSpace: "nowrap", minWidth: 48, textAlign: "right" }}>{hpInfo.label}</span>
          </div>
        </div>

        {/* Victory panel */}
        {showVictory && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 4, borderTop: `1px solid ${BORDER_SUBTLE}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Trophy size={18} color={COLOR_WARNING} />
                <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_SM, color: COLOR_WARNING }}>VICTORY!</span>
              </div>
              <span style={{ fontFamily: FONT_PIXEL, fontSize: 11, color: COLOR_LEGENDARY, animation: "pulse 0.8s ease-out" }}>+{victoryXP} XP</span>
            </div>
            {nextMission ? (
              <RpgButton
                fullWidth
                color={COLOR_MAGE}
                onClick={handleNextMission}
                style={{ animation: "pulse 1.5s infinite", fontSize: PX_MD, padding: "10px 16px", borderRadius: RADIUS_LG - 1 }}
              >
                <Zap size={14} /> NEXT MONSTER ▶
              </RpgButton>
            ) : (
              <RpgButton
                fullWidth
                variant="ghost"
                color={COLOR_WARNING}
                bodyFont
                onClick={() => setShowVictory(false)}
                style={{ fontSize: VT_LG }}
              >
                Close
              </RpgButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mobile Attack Modal ────────────────────────────────────────────────────────
function MobileAttackModal() {
  const {
    mission, defeated, showVictory,
    selectedTaskCount, attackCallbackRef,
    temporalSelectedCount, temporalAttackCallbackRef,
    focusSelectedCount, focusAttackCallbackRef,
  } = useCampaign();
  const tk = useTheme();
  const { BG_DEEPEST, COLOR_DANGER, COLOR_ORANGE, COLOR_MAGE, FONT_PIXEL, PX_MD, SP_SM, alpha } = tk;

  const totalSelected = selectedTaskCount + temporalSelectedCount + focusSelectedCount;
  const hasAttack = !defeated && !showVictory && mission && totalSelected > 0;

  if (!hasAttack) return null;

  const hasCampaign = selectedTaskCount > 0;
  const hasTemporal = temporalSelectedCount > 0;
  const hasFocus    = focusSelectedCount > 0;
  const mixed       = [hasCampaign, hasTemporal, hasFocus].filter(Boolean).length > 1;

  const bg = mixed
    ? `linear-gradient(135deg, ${COLOR_DANGER}, ${COLOR_MAGE})`
    : hasCampaign
    ? getAttackBg(mission.monsterType, selectedTaskCount, tk)
    : hasTemporal
    ? (temporalSelectedCount >= 3 ? `linear-gradient(135deg, ${COLOR_DANGER}, ${COLOR_ORANGE})` : COLOR_ORANGE)
    : `linear-gradient(135deg, ${COLOR_MAGE}, #7c3aed)`;

  const textColor = hasFocus && !mixed ? "#fff" : getAttackTextColor(mission.monsterType, tk);

  const label = mixed
    ? `ATTACK! (${totalSelected})`
    : hasCampaign
    ? getAttackLabel(mission.monsterType, selectedTaskCount)
    : hasTemporal
    ? (temporalSelectedCount >= 3 ? `TEMPORAL CRITICAL HIT! (${temporalSelectedCount})` : `TEMPORAL STRIKE! (${temporalSelectedCount})`)
    : `FOCUS! ${focusSelectedCount} TASK${focusSelectedCount > 1 ? "S" : ""}`;

  const shadow = mixed
    ? `0 0 18px ${alpha(COLOR_MAGE, "66")}, 0 8px 32px rgba(0,0,0,0.15)`
    : hasCampaign
    ? `${getAttackShadow(mission.monsterType, selectedTaskCount, tk)}, 0 8px 32px rgba(0,0,0,0.15)`
    : hasTemporal
    ? `0 0 14px ${alpha(COLOR_ORANGE, "66")}, 0 8px 32px rgba(0,0,0,0.15)`
    : `0 0 14px ${alpha(COLOR_MAGE, "73")}, 0 8px 32px rgba(0,0,0,0.15)`;

  function handleUnifiedAttack() {
    audioManager.playClick("press");
    if (selectedTaskCount > 0) attackCallbackRef.current?.();
    if (temporalSelectedCount > 0) temporalAttackCallbackRef.current?.();
    if (focusSelectedCount > 0) focusAttackCallbackRef.current?.();
  }

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 300,
      padding: "10px 14px 120px",
      background: `linear-gradient(to top, ${BG_DEEPEST}fa 70%, transparent 100%)`,
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
          fontFamily: FONT_PIXEL,
          fontSize: PX_MD,
          cursor: "pointer",
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center", gap: SP_SM,
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

// ── Main export ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigate   = useNavigate();
  const isDesktop  = useIsDesktop();
  const { nick }   = useAuth();
  const {
    mission, campaignDone, defeated, lvInfo, rank, activeSkin, playerName,
    needsClassPick, setNeedsClassPick, setActiveSkin,
    handleComplete, handleTasksChange, handleUncompleteTask, handleDeleteTask,
    handleTemporalStrike, handleFocusStrike, handleChallengeFailed, handleEmptyStateChange,
    screenFlash, screenShake, attackBanner, xpPenaltyBanner,
    setTemporalSelectedCount, temporalAttackCallbackRef,
    setFocusSelectedCount, focusAttackCallbackRef,
  } = useCampaign();
  const {
    BG_PAGE, BG_CARD,
    BORDER_ELEVATED,
    ACCENT_GOLD,
    COLOR_DANGER, COLOR_SUCCESS, COLOR_LEGENDARY,
    TEXT_INACTIVE,
    FONT_PIXEL, FONT_BODY,
    PX_XS,
    VT_SM, VT_LG,
    RADIUS_XL,
    SP_SM,
    alpha,
  } = useTheme();
  const addTriggerRef = useRef<(() => void) | null>(null);
  const [addFormOpen, setAddFormOpen] = useState(false);

  void nick; void rank; void activeSkin; void playerName;

  // ── DESKTOP ────────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <PageShell icon={<Swords size={16} />} title="CAMPAIGN" accentColor={ACCENT_GOLD}>
        <div style={{ display: "flex", flexDirection: "column", gap: SP_SM, flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: SP_SM, flexShrink: 0 }}>
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

  // ── MOBILE ─────────────────────────────────────────────────────────────────
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
          <div style={{ marginBottom: 6, color: COLOR_DANGER }}><Skull size={52} /></div>
          <div style={{ fontFamily: FONT_PIXEL, fontSize: 22, color: COLOR_DANGER, textShadow: "3px 3px 0 #000", letterSpacing: 2, lineHeight: 1.3 }}>CHALLENGE FAILED!</div>
          <div style={{ fontFamily: FONT_PIXEL, fontSize: 16, color: COLOR_DANGER, textShadow: "2px 2px 0 #000", marginTop: 8, animation: "criticalPulse 0.5s step-end infinite" }}>-{xpPenaltyBanner.amount} XP</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: VT_LG, color: "#ff8888", marginTop: 6 }}>50% of level progress lost</div>
        </div>
      )}
      {attackBanner && (
        <div style={{ position: "fixed", top: "38%", left: "50%", zIndex: 9000, pointerEvents: "none", textAlign: "center", animation: "bannerPop 1.4s ease forwards", transform: "translate(-50%,-50%)" }}>
          <div style={{ marginBottom: 4, color: attackBanner.color }}><PixelIcon name={attackBanner.emoji} size={52} color={attackBanner.color} /></div>
          <div style={{ fontFamily: FONT_PIXEL, fontSize: attackBanner.size, color: attackBanner.color, textShadow: "3px 3px 0 #000", letterSpacing: 2, lineHeight: 1.2, whiteSpace: "nowrap", animation: attackBanner.text.includes("CRÍTICO") ? "criticalPulse 0.4s step-end infinite" : "none" }}>{attackBanner.text}</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 22, color: attackBanner.color, opacity: 0.85, marginTop: 6, textShadow: "2px 2px 0 #000" }}>{attackBanner.sub}</div>
        </div>
      )}

      {/* Class picker */}
      {needsClassPick && (
        <ClassPickerOverlay
          onConfirm={(skin) => { setNeedsClassPick(false); setActiveSkin(skin); }}
        />
      )}

      <div style={{
        background: BG_PAGE,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: "100vh",
        paddingBottom: 88,
        fontFamily: FONT_BODY,
        animation: screenShake ? "missionScreenShake 0.4s ease" : "none",
      }}>
        {/* Pixel-grid background */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "repeating-linear-gradient(0deg,rgba(255,255,255,0.018) 0px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,rgba(255,255,255,0.018) 0px,transparent 1px,transparent 48px)" }} />

        <MobilePlayerStrip />

        <div style={{ position: "sticky", top: 0, zIndex: 30, flexShrink: 0 }}>
          <MobileArenaSection />
        </div>

        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", maxWidth: 900, width: "100%", margin: "0 auto" }}>
          {campaignDone ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 32 }}>
              <Trophy size={64} color={COLOR_LEGENDARY} />
              <div style={{ fontFamily: FONT_PIXEL, color: COLOR_LEGENDARY, fontSize: 22, textShadow: "3px 3px 0 #000", textAlign: "center", animation: "pulse 2s infinite" }}>CAMPAIGN COMPLETE!</div>
              <div style={{ fontFamily: FONT_BODY, color: COLOR_SUCCESS, fontSize: 22, textAlign: "center" }}>You defeated all monsters!</div>
            </div>
          ) : (
            <>
              <ChallengePanel playerLevel={lvInfo.level} monsterAlive={!defeated && !!mission} onTemporalStrike={handleTemporalStrike} onChallengeFailed={handleChallengeFailed}
                onSelectedCountChange={setTemporalSelectedCount} attackCallbackRef={temporalAttackCallbackRef} />
              <FocusPanel playerLevel={lvInfo.level} monsterAlive={!defeated && !!mission} onFocusStrike={handleFocusStrike}
                onSelectedCountChange={setFocusSelectedCount} attackCallbackRef={focusAttackCallbackRef} />
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
                  <div style={{ height: 200 }} />
                </>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
                  <div style={{ padding: "8px 14px" }}>
                    <div style={{ background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "b3")}`, borderRadius: RADIUS_XL, padding: "22px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: 0.45 }}>
                      <Skull size={34} color={TEXT_INACTIVE} />
                      <span style={{ fontFamily: FONT_PIXEL, color: TEXT_INACTIVE, fontSize: PX_XS, textAlign: "center", letterSpacing: 1 }}>NO ACTIVE MISSION</span>
                      <span style={{ fontFamily: FONT_BODY, color: TEXT_INACTIVE, fontSize: VT_SM }}>Add tasks below to start</span>
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

      <MobileAttackModal />

      {/* Mobile FAB */}
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
            backgroundImage: `linear-gradient(135deg, ${ACCENT_GOLD} 0%, #c07a3f 100%)`,
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
          aria-label="New Task"
        >
          <div style={{ position: "absolute", inset: 0, border: "1.2px solid rgba(255,255,255,0.15)", borderRadius: 12, pointerEvents: "none" }} />
          <svg width="22" height="22" viewBox="0 0 21.9856 21.9856" fill="none">
            <path d="M10.9928 4.58034V17.4053" stroke={BG_CARD} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.29017" />
            <path d="M4.58034 10.9928H17.4053" stroke={BG_CARD} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.29017" />
          </svg>
        </button>
      )}
    </>
  );
}
