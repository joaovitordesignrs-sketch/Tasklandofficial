/**
 * DesktopLeftColumn — persistent left panel shown on ALL desktop routes.
 * Contains: arena battle card + character info card + navigation menu.
 * All data comes from the CampaignContext (useCampaign).
 */
import { useNavigate, useLocation } from "react-router";
import {
  Swords, Flame, Award,
  Users, Settings, LogOut, Skull, Trophy, Zap,
  User, ShoppingBag, Coins, Sparkles,
} from "lucide-react";
import { audioManager }        from "../hooks/audioManager";
import { useCampaign }         from "../hooks/useCampaign";
import { useAuth }             from "../hooks/useAuth";
import { useEffect }           from "react";
import { TaskCharacter }       from "./TaskCharacter";
import { ClassPickerOverlay }  from "./ClassPickerOverlay";
import { TYPE_INFO }           from "../data/missions";
import { forcePush }           from "../data/syncService";
import { getEconomy } from "../data/economy";
import { FloatingDamage }      from "./ui/FloatingDamage";
import { useNotifications }    from "../hooks/useNotifications";
import { RpgButton }           from "./ui/RpgButton";
import { useTheme } from "../contexts/PreferencesContext";

import imgAvatar  from "../../assets/profile_pic/profile_pic_warrior.png";
import imgAvatarMago from "../../assets/profile_pic/profile_pic_mage.png";
import imgArenaBackground from "../../assets/arena_background/arena_background_default.png";
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

// ── Monster height by type (relative to arena height) ────────────────────────
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

// ── Monster bottom anchor ─────────────────────────────────────────────────────
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

// ── Level-Up Banner (arena overlay) ──────────────────────────────────────────
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
      <style>{`
        @keyframes arenaAttackPulse {
          0%   {opacity:0.8;transform:translateX(-50%) scale(0.97)}
          25%  {opacity:1;transform:translateX(-50%) scale(1.03)}
          50%  {opacity:0.8;transform:translateX(-50%) scale(0.97)}
          75%  {opacity:1;transform:translateX(-50%) scale(1.03)}
          100% {opacity:0.8;transform:translateX(-50%) scale(0.97)}
        }
      `}</style>
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

// ── Arena battle card ─────────────────────────────────────────────────────────
function ArenaCard() {
  const {
    BG_DEEPEST, BG_CARD, BORDER_SUBTLE, BORDER_ELEVATED, ACCENT_GOLD,
    COLOR_DANGER, COLOR_SUCCESS, COLOR_WARNING, COLOR_MAGE, COLOR_LEGENDARY,
    COLOR_ORANGE, TEXT_INACTIVE, TEXT_LIGHT, FONT_PIXEL, FONT_BODY,
    PX_MD, PX_SM, PX_XS, PX_2XS, VT_LG, VT_SM, VT_XS,
    RADIUS_SM, RADIUS_LG, RADIUS_XL, SP_SM, alpha,
  } = useTheme();

  const {
    mission, hpInfo, hpColor, defeated, monsterShake, taskCompleted,
    activeSkin, showVictory, victoryXP, nextMission,
    campaignDone, handleAttackStart, handleNextMission, setShowVictory,
    levelUpInfo, setLevelUpInfo, cpData,
    selectedTaskCount, attackCallbackRef,
    temporalSelectedCount, temporalAttackCallbackRef,
    focusSelectedCount, focusAttackCallbackRef,
    damageNumbers,
  } = useCampaign();

  if (campaignDone) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 32, background: BG_CARD, borderRadius: RADIUS_XL, border: `1px solid ${alpha(BORDER_ELEVATED, "b3")}` }}>
        <Trophy size={64} color={COLOR_LEGENDARY} />
        <div style={{ fontFamily: FONT_PIXEL, color: COLOR_LEGENDARY, fontSize: 14, textShadow: "3px 3px 0 #000", textAlign: "center", animation: "pulse 2s infinite" }}>CAMPAIGN COMPLETE!</div>
        <div style={{ fontFamily: FONT_BODY, color: COLOR_SUCCESS, fontSize: VT_LG, textAlign: "center" }}>All monsters defeated!</div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div style={{ background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "b3")}`, borderRadius: RADIUS_XL, padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: 0.45 }}>
        <Skull size={34} color={TEXT_INACTIVE} />
        <span style={{ fontFamily: FONT_PIXEL, color: TEXT_INACTIVE, fontSize: PX_XS, textAlign: "center", letterSpacing: 1 }}>NO ACTIVE MISSION</span>
        <span style={{ fontFamily: FONT_BODY, color: TEXT_INACTIVE, fontSize: VT_SM }}>Add tasks to the right to start</span>
      </div>
    );
  }

  // ── Attack button state ───────────────────────────────────────────────────
  const total = selectedTaskCount + temporalSelectedCount + focusSelectedCount;
  const hasCampaign = selectedTaskCount > 0;
  const hasTemporal = temporalSelectedCount > 0;
  const hasFocus    = focusSelectedCount > 0;
  const mixed = [hasCampaign, hasTemporal, hasFocus].filter(Boolean).length > 1;

  const attackBg = mixed
    ? `linear-gradient(135deg, ${COLOR_DANGER}, ${COLOR_MAGE})`
    : hasCampaign
    ? (total >= 5 ? `linear-gradient(135deg,${COLOR_ORANGE},${COLOR_LEGENDARY})` : total >= 3 ? `linear-gradient(135deg,${COLOR_ORANGE},${COLOR_LEGENDARY})` : total >= 2 ? `linear-gradient(135deg,${COLOR_SUCCESS},#22D3EE)` : "#4ded6e")
    : hasTemporal
    ? (temporalSelectedCount >= 3 ? `linear-gradient(135deg, ${COLOR_DANGER}, ${COLOR_ORANGE})` : COLOR_ORANGE)
    : `linear-gradient(135deg, ${COLOR_MAGE}, #7c3aed)`;

  const attackTextColor = hasFocus && !mixed ? "#fff" : BG_CARD;

  const attackLabel = mixed
    ? `ATTACK! (${total})`
    : hasCampaign
    ? (total >= 5 ? `CRITICAL HIT!!! ×${total}` : total >= 3 ? `TRIPLE STRIKE! (${total})` : total >= 2 ? `DOUBLE STRIKE! (${total})` : `ATTACK! (${total})`)
    : hasTemporal
    ? (temporalSelectedCount >= 3 ? `TEMPORAL CRITICAL HIT! (${temporalSelectedCount})` : `TEMPORAL STRIKE! (${temporalSelectedCount})`)
    : `FOCUS! ${focusSelectedCount} TASK${focusSelectedCount > 1 ? "S" : ""}`;

  const attackShadow = mixed
    ? "0 0 16px rgba(192,132,252,0.4)"
    : hasFocus
    ? "0 0 14px rgba(192,132,252,0.45)"
    : hasTemporal
    ? "0 0 14px rgba(255,107,53,0.4)"
    : total >= 3 ? "0 0 16px rgba(255,107,53,0.45)" : "0 0 14px rgba(6,255,165,0.35)";

  return (
    <div style={{ background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "b3")}`, borderRadius: RADIUS_XL, overflow: "hidden", flexShrink: 0 }}>
      {/* Toolbar */}
      <div style={{ background: BG_DEEPEST, borderBottom: `1px solid ${BORDER_SUBTLE}`, padding: "6px 14px", display: "flex", alignItems: "center", gap: SP_SM }}>
        <div style={{ flexShrink: 0, minWidth: 24, height: 24, background: BG_CARD, border: `1px solid ${BORDER_ELEVATED}`, borderRadius: RADIUS_SM + 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: FONT_PIXEL, color: ACCENT_GOLD, fontSize: PX_2XS, lineHeight: 1 }}>
            #{(mission.campaignOrder ?? 0) + 1}
          </span>
        </div>
        <span style={{ fontFamily: FONT_PIXEL, color: TEXT_LIGHT, fontSize: PX_SM, whiteSpace: "nowrap", flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{cleanMonsterName(mission.name)}</span>
      </div>

      {/* Battle area */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", background: BG_DEEPEST }}>
        <img
          src={imgArenaBackground}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated", zIndex: 1 }}
        />
        <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: `radial-gradient(ellipse at 50% 50%, transparent 55%, ${alpha(BG_DEEPEST, "73")} 100%)` }} />

        {/* Character — foreground */}
        <div style={{ position: "absolute", left: "4%", bottom: "4%", height: "85%", zIndex: 4 }}>
          <TaskCharacter key={activeSkin ?? "__none__"} taskCompleted={taskCompleted} activeSkin={activeSkin} onAttackStart={handleAttackStart} />
        </div>

        {/* Power badge */}
        <div style={{
          position: "absolute", left: "4%", top: "6%", zIndex: 6,
          display: "flex", alignItems: "center", gap: 6,
          background: alpha(BG_DEEPEST, "e0"),
          border: `1px solid ${cpData.rank.color}88`,
          borderRadius: RADIUS_LG - 1,
          padding: "5px 11px",
          backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
          boxShadow: `0 0 16px ${cpData.rank.color}55, inset 0 0 8px ${cpData.rank.color}18`,
          whiteSpace: "nowrap", pointerEvents: "none",
        }}>
          <Zap size={12} color={cpData.rank.color} strokeWidth={2.5} />
          <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_MD, color: cpData.rank.color, letterSpacing: 1, textShadow: `0 0 10px ${cpData.rank.color}cc` }}>
            {cpData.combatPower}
          </span>
        </div>

        {/* Monster — back plane */}
        <div style={{ position: "absolute", right: "8%", bottom: getMonsterBottom(mission.monsterType), height: getMonsterHeight(mission.monsterType), zIndex: 2, transform: monsterShake ? "scaleX(-1) translateX(-8px)" : "scaleX(-1)", transition: monsterShake ? "transform 0.05s" : "transform 0.3s", filter: hpInfo.percent < 25 ? "brightness(1.4) saturate(1.2)" : "brightness(0.88) saturate(0.82)", imageRendering: "pixelated" }}>
          <img src={getMonsterSprite(mission.monsterType, mission.campaignOrder)} alt="" style={{ height: "100%", width: "auto", objectFit: "contain", imageRendering: "pixelated", opacity: defeated ? 0.15 : 1, transition: "opacity 0.5s" }} />
          {defeated && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: COLOR_DANGER }}><Skull size={44} /></div>}
        </div>

        <FloatingDamage numbers={damageNumbers} />

        {levelUpInfo && (
          <LevelUpBanner level={levelUpInfo.level} rankColor={levelUpInfo.rankColor} onDone={() => setLevelUpInfo(null)} />
        )}
      </div>

      {/* Footer */}
      <div style={{ background: BG_DEEPEST, borderTop: `1px solid ${BORDER_SUBTLE}`, padding: "7px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        {/* Row 1: type tag + HP bar */}
        <div style={{ display: "flex", alignItems: "center", gap: SP_SM }}>
          {mission.monsterType && mission.monsterType !== "normal" ? (() => {
            const info = TYPE_INFO[mission.monsterType!];
            return (
              <span style={{ background: info.color + "22", border: `1px solid ${info.color}66`, color: info.color, fontFamily: FONT_PIXEL, fontSize: PX_2XS, padding: "2px 6px", borderRadius: RADIUS_SM - 1, whiteSpace: "nowrap", letterSpacing: 0.5 }}>
                {info.icon} {info.label}
              </span>
            );
          })() : (
            <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: TEXT_INACTIVE, letterSpacing: 0.5 }}>NORMAL</span>
          )}

          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            <div style={{ flex: 1, maxWidth: 140, height: 8, background: BG_DEEPEST, border: `1px solid ${hpColor}55`, borderRadius: RADIUS_SM, overflow: "hidden" }}>
              <div style={{ width: `${hpInfo.percent}%`, height: "100%", background: hpColor, transition: "width 0.6s ease" }} />
            </div>
            <span style={{ fontFamily: FONT_BODY, color: hpColor, fontSize: VT_XS, whiteSpace: "nowrap", minWidth: 48, textAlign: "right" }}>{hpInfo.label}</span>
          </div>
        </div>

        {/* Attack button */}
        {total > 0 && !defeated && !showVictory && (
          <div style={{ paddingTop: 4, borderTop: `1px solid ${BORDER_SUBTLE}` }}>
            <button
              onClick={() => {
                audioManager.playClick("press");
                if (selectedTaskCount > 0) attackCallbackRef.current?.();
                if (temporalSelectedCount > 0) temporalAttackCallbackRef.current?.();
                if (focusSelectedCount > 0) focusAttackCallbackRef.current?.();
              }}
              style={{
                width: "100%",
                background: attackBg,
                border: "none",
                color: attackTextColor,
                padding: "10px 16px",
                fontFamily: FONT_PIXEL,
                fontSize: PX_MD,
                cursor: "pointer",
                borderRadius: RADIUS_LG - 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: SP_SM,
                animation: total >= 3 ? "pulse 0.8s infinite" : "pulse 1.5s infinite",
                boxShadow: attackShadow,
              }}
            >
              <Swords size={14} />
              {attackLabel}
            </button>
          </div>
        )}

        {/* Victory */}
        {showVictory && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 4, borderTop: `1px solid ${BORDER_SUBTLE}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Trophy size={18} color={COLOR_WARNING} />
                <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_SM, color: COLOR_WARNING, textShadow: "1px 1px 0 #000" }}>VICTORY!</span>
              </div>
              <span style={{ fontFamily: FONT_PIXEL, fontSize: 11, color: COLOR_LEGENDARY, textShadow: "1px 1px 0 #000", animation: "pulse 0.8s ease-out" }}>+{victoryXP} XP</span>
            </div>
            {nextMission ? (
              <RpgButton
                fullWidth
                color={COLOR_MAGE}
                onClick={handleNextMission}
                style={{ animation: "pulse 1.5s infinite", padding: "10px 16px", borderRadius: RADIUS_LG - 1, fontSize: PX_MD }}
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

// ── Character card ─────────────────────────────────────────────────────────────
function CharacterCard() {
  const {
    BG_DEEPEST, BG_CARD, BORDER_SUBTLE, BORDER_ELEVATED, ACCENT_GOLD,
    COLOR_DANGER, COLOR_MAGE, COLOR_LEGENDARY, COLOR_WARRIOR,
    FONT_PIXEL, FONT_BODY, PX_MD, PX_SM,
    VT_LG, VT_XS, RADIUS_SM, RADIUS_MD, RADIUS_XL,
    SP_SM, RANK_NOVATO, alpha,
  } = useTheme();

  const { lvInfo, xpPct, rank, cpData, activeSkin, levelUpInfo, playerName } = useCampaign();
  const { nick } = useAuth();

  const avatarSrc  = activeSkin === "mage" ? imgAvatarMago : imgAvatar;
  const classLabel = activeSkin === "mage" ? "MAGE" : activeSkin ? "WARRIOR" : null;
  const classColor = activeSkin === "mage" ? COLOR_WARRIOR : COLOR_DANGER;

  return (
    <div style={{ background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "b3")}`, borderRadius: RADIUS_XL, padding: "14px 16px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 56, height: 56, flexShrink: 0, background: BG_DEEPEST, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: RADIUS_XL, overflow: "hidden", position: "relative" }}>
          <img
            src={avatarSrc}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT_PIXEL, color: "#fff", fontSize: PX_MD, textShadow: "1px 1px 0 #000", marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {nick || playerName}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: SP_SM }}>
            <span style={{ fontFamily: FONT_PIXEL, color: COLOR_LEGENDARY, fontSize: PX_SM, whiteSpace: "nowrap" }}>LVL {lvInfo.level}</span>
            <span style={{ fontFamily: FONT_BODY, color: rank.color, fontSize: 18 }}>{rank.label}</span>
            {classLabel && (
              <span style={{ fontFamily: FONT_PIXEL, fontSize: 6, color: classColor, background: `${classColor}18`, border: `1px solid ${classColor}44`, padding: "2px 5px", whiteSpace: "nowrap" }}>
                {classLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* XP bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontFamily: FONT_BODY, color: RANK_NOVATO, fontSize: 15 }}>{lvInfo.currentXP} / {lvInfo.neededXP} XP</span>
          <span style={{ fontFamily: FONT_BODY, color: COLOR_LEGENDARY, fontSize: 15 }}>{Math.round(xpPct)}%</span>
        </div>
        <div style={{ height: 10, background: BG_DEEPEST, border: `1px solid ${BORDER_ELEVATED}`, borderRadius: RADIUS_SM + 1, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, width: `${xpPct}%`, background: levelUpInfo ? rank.color : COLOR_LEGENDARY, transition: "width 0.6s ease" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg,transparent 0px,transparent 10px,rgba(0,0,0,0.2) 10px,rgba(0,0,0,0.2) 11px)", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Power */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", background: `${cpData.rank.color}0C`, border: `1px solid ${cpData.rank.color}25`, borderRadius: RADIUS_MD }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Zap size={14} color={cpData.rank.color} />
          <span style={{ fontFamily: FONT_PIXEL, fontSize: 11, color: cpData.rank.color, textShadow: "1px 1px 0 #000", letterSpacing: 1 }}>POWER {cpData.combatPower}</span>
        </div>
        <span style={{ fontFamily: FONT_PIXEL, fontSize: VT_XS, color: cpData.rank.color, opacity: 0.85 }}>{cpData.rank.tier}</span>
      </div>

      {/* Gold + Essence */}
      {(() => {
        const econ = getEconomy();
        return (
          <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 5,
              padding: "5px 8px",
              background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.18)",
              borderRadius: RADIUS_MD,
            }}>
              <Coins size={12} color={ACCENT_GOLD} />
              <span style={{ fontFamily: FONT_BODY, color: ACCENT_GOLD, fontSize: VT_LG }}>
                {econ.coins.toLocaleString("en-US")}
              </span>
            </div>
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 5,
              padding: "5px 8px",
              background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.18)",
              borderRadius: RADIUS_MD,
            }}>
              <Sparkles size={12} color={COLOR_MAGE} />
              <span style={{ fontFamily: FONT_BODY, color: COLOR_MAGE, fontSize: VT_LG }}>
                {(econ.monsterEssences ?? 0).toLocaleString("en-US")}
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── Navigation menu ────────────────────────────────────────────────────────────
const HOME_NAV_ITEMS = [
  { path: "/",           label: "CAMPAIGN",      Icon: Swords,       notif: null as null | "habitsUnchecked" | "newAchievements" },
  { path: "/habitos",    label: "HABITS",         Icon: Flame,        notif: "habitsUnchecked" as const },
  { path: "/conquistas", label: "ACHIEVEMENTS",   Icon: Award,        notif: "newAchievements" as const },
  { path: "/perfil",     label: "PROFILE",        Icon: User,         notif: null },
  { path: "/loja",       label: "SHOP",           Icon: ShoppingBag,  notif: null },
  { path: "/amigos",     label: "FRIENDS",        Icon: Users,        notif: null },
];

function NavMenu() {
  const {
    BG_DEEPEST, BG_CARD, BORDER_SUBTLE, BORDER_ELEVATED, ACCENT_GOLD,
    COLOR_DANGER, COLOR_WARRIOR, TEXT_MUTED, TEXT_INACTIVE,
    FONT_PIXEL, FONT_BODY, PX_2XS, VT_SM,
    RADIUS_LG, RADIUS_XL, SP_SM, alpha,
  } = useTheme();

  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const { signOut, nick } = useAuth();
  const notifs = useNotifications();

  return (
    <div style={{ background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "b3")}`, borderRadius: RADIUS_XL, padding: "10px", flexShrink: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {HOME_NAV_ITEMS.map(({ path, label, Icon, notif }) => {
          const active = pathname === path || (path !== "/" && pathname.startsWith(path));
          const count = notif ? (notifs[notif] as number) : 0;
          return (
            <RpgButton
              key={path}
              variant={active ? "primary" : "ghost"}
              color={active ? ACCENT_GOLD : TEXT_MUTED}
              fullWidth
              onClick={() => { audioManager.playClick("navigate"); navigate(path); }}
              style={{
                justifyContent: "flex-start",
                padding: "13px 14px",
                borderRadius: RADIUS_LG - 1,
                fontSize: PX_2XS,
              }}
            >
              <Icon size={15} /> {label}
              {count > 0 && (
                <span style={{
                  marginLeft: "auto",
                  minWidth: 18, height: 18,
                  background: COLOR_DANGER,
                  border: `1.5px solid ${BG_DEEPEST}`,
                  borderRadius: 9,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: PX_2XS, fontFamily: FONT_PIXEL,
                  color: "#fff", lineHeight: 1,
                  padding: "0 4px", flexShrink: 0,
                  animation: "notifPulse 1.8s ease-in-out infinite",
                }}>
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </RpgButton>
          );
        })}
      </div>

      {/* Footer: nick + settings + logout */}
      <div style={{ marginTop: SP_SM, paddingTop: SP_SM, borderTop: `1px solid ${BORDER_SUBTLE}`, display: "flex", alignItems: "center", gap: 6 }}>
        {nick && (
          <span style={{ fontFamily: FONT_BODY, fontSize: VT_SM, color: TEXT_INACTIVE, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            @{nick}
          </span>
        )}

        <RpgButton
          variant={pathname.startsWith("/configuracoes") ? "primary" : "ghost"}
          color={COLOR_WARRIOR}
          small
          onClick={() => { audioManager.playClick("navigate"); navigate("/configuracoes"); }}
          title="Settings"
          style={{ marginLeft: nick ? "0" : "auto" }}
        >
          <Settings size={10} /> SETTINGS
        </RpgButton>

        <RpgButton
          variant="ghost"
          color={COLOR_DANGER}
          small
          onClick={async () => { await forcePush(); await signOut(); navigate("/"); }}
        >
          <LogOut size={10} /> EXIT
        </RpgButton>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export function DesktopLeftColumn() {
  const { needsClassPick, setNeedsClassPick, setActiveSkin } = useCampaign();

  return (
    <>
      {needsClassPick && (
        <ClassPickerOverlay
          onConfirm={(skin) => {
            setNeedsClassPick(false);
            setActiveSkin(skin);
          }}
        />
      )}

      <div style={{
        width: 540,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        overflowY: "auto",
        height: "calc(100vh - 40px)",
        padding: "0",
        background: "transparent",
      }}>
        <ArenaCard />
        <CharacterCard />
        <NavMenu />
      </div>
    </>
  );
}
