/**
 * DesktopLeftColumn — persistent left panel shown on ALL desktop routes.
 * Contains: arena battle card + character info card + navigation menu.
 * All data comes from the CampaignContext (useCampaign).
 */
import { useNavigate, useLocation } from "react-router";
import {
  Swords, Brain, Flame, Scroll, Award, BarChart3,
  RotateCcw, Users, Settings, LogOut, Skull, Trophy, Zap, Timer,
  User,
} from "lucide-react";
import { audioManager }        from "../hooks/audioManager";
import { useCampaign }         from "../hooks/useCampaign";
import { useAuth }             from "../hooks/useAuth";
import { useEffect }           from "react";
import { TaskCharacter }       from "./TaskCharacter";
import { ClassPickerOverlay }  from "./ClassPickerOverlay";
import { TYPE_INFO }           from "../data/missions";
import { formatMultiplier }        from "../data/combatPower";
import { forcePush }           from "../data/syncService";
import { getRebirthState }     from "../data/economy";
import { FloatingDamage }      from "./ui/FloatingDamage";
import { useNotifications }    from "../hooks/useNotifications";

import imgMonster from "figma:asset/147b3ea044d17ccabc73d88e4f920ffa7c656903.png";
import imgAvatar  from "figma:asset/97194cdd6dc3ec8040cc985dae2b65b2314dcf1e.png";
import imgAvatarMago from "figma:asset/5c09b71e009581d58103f7df9949281a05a710d1.png";
import imgArenaBackground from "figma:asset/6037587fea6349ebacca46bf46244c717b2e23e6.png";
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

// ── Monster height by type (relative to arena height) ────────────────────────
// Monsters are on a BACK PLANE — smaller & higher up to simulate depth.
// Character sits at bottom 4%, height 85% (zIndex 4 / foreground).
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

// ── Monster bottom anchor — higher = further back on the ground plane ─────────
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

//  Level-Up Banner (arena overlay) ───────────────────────────────────────
function LevelUpBanner({ level, rankColor, onDone }: { level: number; rankColor: string; onDone: () => void }) {
  useEffect(() => {
    audioManager.playLevelUp();
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — som e timer devem disparar apenas uma vez ao montar

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

// ── Arena battle card ────────────────────────────────────────────────────────
function ArenaCard() {
  const {
    mission, allMissions, hpInfo, hpColor, defeated, monsterShake, taskCompleted,
    selectedClass, showVictory, victoryXP, nextMission, doneCampaign, totalCampaign,
    campaignDone, handleAttackStart, handleNextMission, setShowVictory,
    levelUpInfo, setLevelUpInfo, rank, cpData,
    selectedTaskCount, attackCallbackRef,
    temporalSelectedCount, temporalAttackCallbackRef,
    focusSelectedCount, focusAttackCallbackRef,
    damageNumbers,
  } = useCampaign();

  if (campaignDone) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 32, background: "#0d1024", borderRadius: 10, border: "1px solid rgba(42,46,80,0.7)" }}>
        <Trophy size={64} color="#FFD700" />
        <div style={{ fontFamily: "'Press Start 2P', monospace", color: "#FFD700", fontSize: 14, textShadow: "3px 3px 0 #000", textAlign: "center", animation: "pulse 2s infinite" }}>CAMPANHA CONCLUÍDA!</div>
        <div style={{ fontFamily: "'VT323', monospace", color: "#06FFA5", fontSize: 18, textAlign: "center" }}>Todos os monstros derrotados!</div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div style={{ background: "#0d1024", border: "1px solid rgba(42,46,80,0.7)", borderRadius: 10, padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: 0.45 }}>
        <Skull size={34} color="#3a4060" />
        <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#3a4060", fontSize: 8, textAlign: "center", letterSpacing: 1 }}>NENHUMA MISSÃO ATIVA</span>
        <span style={{ fontFamily: "'VT323', monospace", color: "#2a3050", fontSize: 17, textAlign: "center" }}>Adicione tarefas à direita para iniciar</span>
      </div>
    );
  }

  return (
    <div style={{ background: "#0d1024", border: "1px solid rgba(42,46,80,0.7)", borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
      {/* Toolbar — number badge + clean name (no HP here) */}
      <div style={{ background: "#0b0d1e", borderBottom: "1px solid #1f254f", padding: "6px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        {/* Mission number badge */}
        <div style={{ flexShrink: 0, minWidth: 24, height: 24, background: "#1a1e37", border: "1px solid #2a2e50", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#e39f64", fontSize: 7, lineHeight: 1 }}>
            #{(mission.campaignOrder ?? 0) + 1}
          </span>
        </div>
        <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#fff", fontSize: 9, textShadow: "1px 1px 0 #000", whiteSpace: "nowrap", flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{cleanMonsterName(mission.name)}</span>
      </div>

      {/* Battle area — pixel art background */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "#0a0c1a" }}>
        {/* Arena background image */}
        <img
          src={imgArenaBackground}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            imageRendering: "pixelated",
            zIndex: 1,
          }}
        />
        {/* Subtle vignette overlay to blend edges */}
        <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(5,7,18,0.45) 100%)" }} />
        {/* Character — foreground plane (zIndex 4) */}
        <div style={{ position: "absolute", left: "4%", bottom: "4%", height: "85%", zIndex: 4 }}>
          <TaskCharacter key={selectedClass ?? "__none__"} taskCompleted={taskCompleted} selectedClass={selectedClass} onAttackStart={handleAttackStart} />
        </div>

        {/* Power badge — overlaid top-left inside arena */}
        <div style={{
          position: "absolute",
          left: "4%",
          top: "6%",
          zIndex: 6,
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(10, 14, 40, 0.88)",
          border: `1px solid ${cpData.rank.color}88`,
          borderRadius: 7,
          padding: "5px 11px",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow: `0 0 16px ${cpData.rank.color}55, inset 0 0 8px ${cpData.rank.color}18`,
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}>
          <Zap size={12} color={cpData.rank.color} strokeWidth={2.5} />
          <span style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 10,
            color: cpData.rank.color,
            letterSpacing: 1,
            textShadow: `0 0 10px ${cpData.rank.color}cc`,
          }}>
            {cpData.combatPower}
          </span>
        </div>

        {/* Monster — back plane (zIndex 2): smaller, higher, slightly darker to convey depth */}
        <div style={{ position: "absolute", right: "8%", bottom: getMonsterBottom(mission.monsterType), height: getMonsterHeight(mission.monsterType), zIndex: 2, transform: monsterShake ? "scaleX(-1) translateX(-8px)" : "scaleX(-1)", transition: monsterShake ? "transform 0.05s" : "transform 0.3s", filter: hpInfo.percent < 25 ? "brightness(1.4) saturate(1.2)" : "brightness(0.88) saturate(0.82)", imageRendering: "pixelated" }}>
          <img src={getMonsterSprite(mission.monsterType, mission.campaignOrder)} alt="" style={{ height: "100%", width: "auto", objectFit: "contain", imageRendering: "pixelated", opacity: defeated ? 0.15 : 1, transition: "opacity 0.5s" }} />
          {defeated && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "#ed4f49" }}><Skull size={44} /></div>}
        </div>

        {/* Floating damage numbers */}
        <FloatingDamage numbers={damageNumbers} />

        {levelUpInfo && (
          <LevelUpBanner level={levelUpInfo.level} rankColor={levelUpInfo.rankColor} onDone={() => setLevelUpInfo(null)} />
        )}
      </div>

      {/* Footer — type tag + HP bar + attack buttons + victory */}
      <div style={{ background: "#0b0d1e", borderTop: "1px solid #1f254f", padding: "7px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        {/* Row 1: type tag (left) + HP bar (right) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Monster type tag */}
          {mission.monsterType && mission.monsterType !== "normal" ? (() => {
            const info = TYPE_INFO[mission.monsterType!];
            return (
              <span style={{ background: info.color + "22", border: `1px solid ${info.color}66`, color: info.color, fontFamily: "'Press Start 2P', monospace", fontSize: 7, padding: "2px 6px", borderRadius: 3, whiteSpace: "nowrap", letterSpacing: 0.5 }}>
                {info.icon} {info.label}
              </span>
            );
          })() : (
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#3a4060", letterSpacing: 0.5 }}>NORMAL</span>
          )}

          {/* HP bar — right */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            <div style={{ flex: 1, maxWidth: 140, height: 8, background: "rgba(0,0,0,0.6)", border: `1px solid ${hpColor}55`, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${hpInfo.percent}%`, height: "100%", background: hpColor, transition: "width 0.6s ease" }} />
            </div>
            <span style={{ fontFamily: "'VT323', monospace", color: hpColor, fontSize: 13, whiteSpace: "nowrap", minWidth: 48, textAlign: "right" }}>{hpInfo.label}</span>
          </div>
        </div>

        {/* Unified attack button */}
        {(() => {
          const total = selectedTaskCount + temporalSelectedCount + focusSelectedCount;
          if (total === 0 || defeated || showVictory) return null;
          const hasCampaign = selectedTaskCount > 0;
          const hasTemporal = temporalSelectedCount > 0;
          const hasFocus    = focusSelectedCount > 0;
          const mixed = [hasCampaign, hasTemporal, hasFocus].filter(Boolean).length > 1;

          const bg = mixed
            ? "linear-gradient(135deg, #E63946, #c084fc)"
            : hasCampaign
            ? (total >= 5 ? "linear-gradient(135deg,#FF6B35,#FFD700)" : total >= 3 ? "linear-gradient(135deg,#FF6B35,#FFD700)" : total >= 2 ? "linear-gradient(135deg,#06FFA5,#22D3EE)" : "#4ded6e")
            : hasTemporal
            ? (temporalSelectedCount >= 3 ? "linear-gradient(135deg, #E63946, #FF6B35)" : "#FF6B35")
            : "linear-gradient(135deg, #c084fc, #7c3aed)";

          const textColor = hasFocus && !mixed ? "#fff" : "#0d1024";

          const label = mixed
            ? `ATACAR! (${total})`
            : hasCampaign
            ? (total >= 5 ? `ATAQUE CRÍTICO!!! ×${total}` : total >= 3 ? `GOLPE TRIPLO! (${total})` : total >= 2 ? `DUPLO GOLPE! (${total})` : `ATACAR! (${total})`)
            : hasTemporal
            ? (temporalSelectedCount >= 3 ? `GOLPE TEMPORAL CRÍTICO! (${temporalSelectedCount})` : `GOLPE TEMPORAL! (${temporalSelectedCount})`)
            : `FOCO! ${focusSelectedCount} TASK${focusSelectedCount > 1 ? "S" : ""}`;

          return (
            <div style={{ paddingTop: 4, borderTop: "1px solid #1f254f" }}>
              <button
                onClick={() => {
                  audioManager.playClick("press");
                  if (selectedTaskCount > 0) attackCallbackRef.current?.();
                  if (temporalSelectedCount > 0) temporalAttackCallbackRef.current?.();
                  if (focusSelectedCount > 0) focusAttackCallbackRef.current?.();
                }}
                style={{
                  width: "100%",
                  background: bg,
                  border: "none",
                  color: textColor,
                  padding: "10px 16px",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 10,
                  cursor: "pointer",
                  borderRadius: 7,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  animation: total >= 3 ? "pulse 0.8s infinite" : "pulse 1.5s infinite",
                  boxShadow: mixed
                    ? "0 0 16px rgba(192,132,252,0.4)"
                    : hasFocus
                    ? "0 0 14px rgba(192,132,252,0.45)"
                    : hasTemporal
                    ? "0 0 14px rgba(255,107,53,0.4)"
                    : total >= 3 ? "0 0 16px rgba(255,107,53,0.45)" : "0 0 14px rgba(6,255,165,0.35)",
                }}
              >
                <Swords size={14} />
                {label}
              </button>
            </div>
          );
        })()}

        {showVictory && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 4, borderTop: "1px solid #1f254f" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Trophy size={18} color="#f0c040" />
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#f0c040", textShadow: "1px 1px 0 #000" }}>VITÓRIA!</span>
              </div>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: "#FFD700", textShadow: "1px 1px 0 #000", animation: "pulse 0.8s ease-out" }}>+{victoryXP} XP</span>
            </div>
            {nextMission ? (
              <button
                onClick={handleNextMission}
                style={{ width: "100%", background: "#c084fc", border: "none", color: "#0d1024", padding: "10px 16px", fontFamily: "'Press Start 2P', monospace", fontSize: 10, cursor: "pointer", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, animation: "pulse 1.5s infinite" }}
              >
                <Zap size={14} /> PRÓXIMO MONSTRO ▶
              </button>
            ) : (
              <button
                onClick={() => setShowVictory(false)}
                style={{ width: "100%", background: "#1b1e37", border: "1px solid #f0c040", color: "#f0c040", padding: "8px 16px", fontFamily: "'VT323', monospace", fontSize: 18, cursor: "pointer", borderRadius: 7 }}
              >
                Fechar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Character card ────────────────────────────────────────────────────────────
function CharacterCard() {
  const { lvInfo, xpPct, rank, cpData, selectedClass, levelUpInfo, playerName } = useCampaign();
  const { nick } = useAuth();

  const avatarSrc  = selectedClass === "mago" ? imgAvatarMago : imgAvatar;
  const classLabel = selectedClass === "mago" ? "MAGO" : selectedClass === "guerreiro" ? "GUERREIRO" : null;
  const classColor = selectedClass === "mago" ? "#60a5fa" : "#E63946";

  return (
    <div style={{ background: "#0d1024", border: "1px solid rgba(42,46,80,0.7)", borderRadius: 10, padding: "14px 16px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 56, height: 56, flexShrink: 0, background: "#0b0d1e", border: "1px solid #1f254f", borderRadius: 10, overflow: "hidden", position: "relative" }}>
          <img
            src={avatarSrc}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", color: "#fff", fontSize: 10, textShadow: "1px 1px 0 #000", marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {nick || playerName}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#FFD700", fontSize: 9, whiteSpace: "nowrap" }}>LVL {lvInfo.level}</span>
            <span style={{ fontFamily: "'VT323', monospace", color: rank.color, fontSize: 18 }}>{rank.label}</span>
            {classLabel && (
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: classColor, background: `${classColor}18`, border: `1px solid ${classColor}44`, padding: "2px 5px", whiteSpace: "nowrap" }}>
                {classLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* XP bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontFamily: "'VT323', monospace", color: "#8a7a6a", fontSize: 15 }}>{lvInfo.currentXP} / {lvInfo.neededXP} XP</span>
          <span style={{ fontFamily: "'VT323', monospace", color: "#FFD700", fontSize: 15 }}>{Math.round(xpPct)}%</span>
        </div>
        <div style={{ height: 10, background: "#0b0d1e", border: "1px solid #2a2e50", borderRadius: 5, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, width: `${xpPct}%`, background: levelUpInfo ? rank.color : "#FFD700", transition: "width 0.6s ease" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg,transparent 0px,transparent 10px,rgba(0,0,0,0.2) 10px,rgba(0,0,0,0.2) 11px)", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Power */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", background: `${cpData.rank.color}0C`, border: `1px solid ${cpData.rank.color}25`, borderRadius: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Zap size={14} color={cpData.rank.color} />
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: cpData.rank.color, textShadow: "1px 1px 0 #000", letterSpacing: 1 }}>POWER {cpData.combatPower}</span>
        </div>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: cpData.rank.color, opacity: 0.85 }}>{cpData.rank.tier}</span>
      </div>
    </div>
  );
}

// ── Navigation menu ───────────────────────────────────────────────────────────
const HOME_NAV_ITEMS = [
  { path: "/",           label: "CAMPANHA",   Icon: Swords,  notif: null as null | "habitsUnchecked" | "newAchievements" },
  { path: "/habitos",    label: "HÁBITOS",    Icon: Flame,   notif: "habitsUnchecked" as const },
  { path: "/conquistas", label: "CONQUISTAS", Icon: Award,   notif: "newAchievements" as const },
  { path: "/perfil",     label: "PERFIL",     Icon: User,    notif: null },
  { path: "/amigos",     label: "AMIGOS",     Icon: Users,   notif: null },
];

function NavMenu() {
  const navigate    = useNavigate();
  const { pathname } = useLocation();
  const { signOut, nick } = useAuth();
  const notifs = useNotifications();

  return (
    <div style={{ background: "#0d1024", border: "1px solid rgba(42,46,80,0.7)", borderRadius: 10, padding: "10px", flexShrink: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {HOME_NAV_ITEMS.map(({ path, label, Icon, notif }) => {
          const active = pathname === path || (path !== "/" && pathname.startsWith(path));
          const count = notif ? (notifs[notif] as number) : 0;
          return (
            <button
              key={path}
              onClick={() => { audioManager.playClick("navigate"); navigate(path); }}
              style={{
                background: active ? "rgba(227,159,100,0.10)" : "transparent",
                border:     `1px solid ${active ? "#e39f64" : "#1a1e37"}`,
                color:      active ? "#e39f64" : "#5a6080",
                padding:    "13px 14px",
                cursor:     "pointer",
                display:    "flex", alignItems: "center", gap: 10,
                fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                transition: "all 0.15s", borderRadius: 7,
                textAlign:  "left", width: "100%",
                position:   "relative",
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.borderColor = "#2a2e50";
                  e.currentTarget.style.color       = "#8a9fba";
                  e.currentTarget.style.background  = "rgba(255,255,255,0.03)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.borderColor = "#1a1e37";
                  e.currentTarget.style.color       = "#5a6080";
                  e.currentTarget.style.background  = "transparent";
                }
              }}
            >
              <Icon size={15} /> {label}
              {/* Notification badge */}
              {count > 0 && (
                <span style={{
                  marginLeft: "auto",
                  minWidth: 18,
                  height: 18,
                  background: "#E63946",
                  border: "1.5px solid #0a0c1a",
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 7,
                  fontFamily: "'Press Start 2P', monospace",
                  color: "#fff",
                  lineHeight: 1,
                  padding: "0 4px",
                  flexShrink: 0,
                  animation: "notifPulse 1.8s ease-in-out infinite",
                }}>
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer: nick + settings + logout */}
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #1f254f", display: "flex", alignItems: "center", gap: 6 }}>
        {nick && (
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: "#3a4060", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            @{nick}
          </span>
        )}

        {/* Settings button */}
        <button
          onClick={() => { audioManager.playClick("navigate"); navigate("/configuracoes"); }}
          title="Configurações"
          style={{
            background: pathname.startsWith("/configuracoes") ? "rgba(96,165,250,0.12)" : "transparent",
            border: `1px solid ${pathname.startsWith("/configuracoes") ? "#60a5fa" : "#2a2e50"}`,
            color: pathname.startsWith("/configuracoes") ? "#60a5fa" : "#5a6080",
            padding: "6px 10px",
            fontFamily: "'Press Start 2P', monospace", fontSize: 6,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            borderRadius: 6, whiteSpace: "nowrap", transition: "all 0.15s",
            marginLeft: nick ? "0" : "auto",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#60a5fa"; e.currentTarget.style.color = "#60a5fa"; e.currentTarget.style.background = "rgba(96,165,250,0.08)"; }}
          onMouseLeave={e => {
            const isActive = pathname.startsWith("/configuracoes");
            e.currentTarget.style.borderColor = isActive ? "#60a5fa" : "#2a2e50";
            e.currentTarget.style.color       = isActive ? "#60a5fa" : "#5a6080";
            e.currentTarget.style.background  = isActive ? "rgba(96,165,250,0.12)" : "transparent";
          }}
        >
          <Settings size={10} /> CONFIG
        </button>

        {/* Logout button */}
        <button
          onClick={async () => { await forcePush(); await signOut(); navigate("/"); }}
          style={{
            background: "transparent", border: "1px solid #2a2e50",
            color: "#E63946", padding: "6px 10px",
            fontFamily: "'Press Start 2P', monospace", fontSize: 6,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            borderRadius: 6, whiteSpace: "nowrap", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#E63946"; e.currentTarget.style.background = "rgba(230,57,70,0.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2e50"; e.currentTarget.style.background = "transparent"; }}
        >
          <LogOut size={10} /> SAIR
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function DesktopLeftColumn() {
  const { needsClassPick, setNeedsClassPick, setSelectedClass } = useCampaign();
  const rebirthInfo = getRebirthState();

  return (
    <>
      {/* Class picker overlay (shown on first launch / rebirth) */}
      {needsClassPick && (
        <ClassPickerOverlay
          isRebirth={rebirthInfo.totalRebirths > 0}
          runNumber={rebirthInfo.runNumber}
          onConfirm={(cls) => {
            setNeedsClassPick(false);
            setSelectedClass(cls);
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