import { useNavigate, useLocation } from "react-router";
import {
  Swords, Brain, Flame, Award, Settings, Zap, Users, LogOut, User, Palette, ShoppingBag, Coins, Sparkles, Lock,
} from "lucide-react";
import { audioManager } from "../hooks/audioManager";
import { getPower, formatPower } from "../data/combatPower";
import imgAvatar from "../../assets/profile_pic/profile_pic_warrior.png";
import imgAvatarMago from "../../assets/profile_pic/profile_pic_mage.png";
import { useAuth } from "../hooks/useAuth";
import { forcePush } from "../data/syncService";
import { getEconomy } from "../data/economy";
import { useCampaign } from "../hooks/useCampaign";
import { AudioControlPanel } from "./AudioControlPanel";
import { useTheme } from "../contexts/PreferencesContext";

interface Props {
  playerName: string;
  level: number;
  rankLabel: string;
  rankColor: string;
  xpPct: number;
  currentXP: number;
  neededXP: number;
}

const MENU_ITEMS = [
  { path: "/",              label: "CAMPAIGN",    Icon: Swords,      locked: false },
  { path: "/desafios",      label: "FOCUS",       Icon: Brain,       locked: true  },
  { path: "/habitos",       label: "HABITS",      Icon: Flame,       locked: false },
  { path: "/conquistas",    label: "ACHIEVEMENTS", Icon: Award,      locked: false },
  { path: "/perfil",        label: "PROFILE",     Icon: User,        locked: false },
  { path: "/loja",          label: "SHOP",        Icon: ShoppingBag, locked: true  },
  { path: "/amigos",        label: "FRIENDS",     Icon: Users,       locked: false },
  { path: "/configuracoes", label: "SETTINGS",    Icon: Settings,    locked: false },
  { path: "/design_system", label: "DESIGN KIT",  Icon: Palette,     locked: false },
];

export function DesktopSidebar({ playerName, level, rankLabel, rankColor, xpPct, currentXP, neededXP }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { signOut, nick } = useAuth();
  const { activeSkin } = useCampaign();
  const avatarSrc = activeSkin === "mage" ? imgAvatarMago : imgAvatar;
  const {
    BORDER_SUBTLE, BG_CARD, COLOR_LEGENDARY, RANK_NOVATO, BG_DEEPEST,
    BORDER_ELEVATED, TEXT_MUTED, TEXT_LIGHT, TEXT_BODY, ACCENT_GOLD, COLOR_MAGE, COLOR_DANGER,
    TEXT_INACTIVE, FONT_PIXEL, FONT_BODY, VT_XS, alpha,
  } = useTheme();
  const cp = getPower(level);
  const econ = getEconomy();

  return (
    <aside style={{
      width: 260,
      flexShrink: 0,
      background: alpha(BG_DEEPEST, "f8"),
      borderRight: `1px solid ${BORDER_SUBTLE}`,
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
      zIndex: 30,
      fontFamily: FONT_BODY,
      overflowY: "auto",
    }}>

      {/* ── Player Card ── */}
      <div style={{ padding: "16px 14px 12px", borderBottom: `1px solid ${BORDER_SUBTLE}` }}>
        {/* Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 52, height: 52, flexShrink: 0,
            background: BG_CARD, position: "relative", overflow: "hidden",
            border: `1px solid ${BORDER_SUBTLE}`, borderRadius: 10,
          }}>
            <img src={avatarSrc} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: FONT_PIXEL, color: TEXT_LIGHT,
              fontSize: 9, textShadow: "1px 1px 0 #000", marginBottom: 5,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {nick || playerName}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: FONT_PIXEL, color: COLOR_LEGENDARY, fontSize: 8, textShadow: "1px 1px 0 #000" }}>
                LVL {level}
              </span>
              <span style={{ color: rankColor, fontSize: 16 }}>{rankLabel}</span>
            </div>
          </div>
          {/* Audio control tucked in corner */}
          <div style={{ flexShrink: 0 }}>
            <AudioControlPanel />
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ color: RANK_NOVATO, fontSize: VT_XS }}>{currentXP}/{neededXP} XP</span>
            <span style={{ color: COLOR_LEGENDARY, fontSize: VT_XS }}>{Math.round(xpPct)}%</span>
          </div>
          <div style={{ height: 8, background: BG_DEEPEST, border: `1px solid ${BORDER_ELEVATED}`, borderRadius: 5, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, width: `${xpPct}%`, background: COLOR_LEGENDARY, transition: "width 0.6s ease" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg,transparent 0px,transparent 10px,rgba(0,0,0,0.2) 10px,rgba(0,0,0,0.2) 11px)", pointerEvents: "none" }} />
          </div>
        </div>

        {/* Power */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "5px 8px",
          background: `${cp.rank.color}0C`, border: `1px solid ${cp.rank.color}25`,
          borderRadius: 6,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Zap size={12} color={cp.rank.color} />
            <span style={{ fontFamily: FONT_PIXEL, fontSize: 9, color: cp.rank.color, textShadow: "1px 1px 0 #000", letterSpacing: 1 }}>
              {formatPower(cp.total)}
            </span>
            <span style={{ fontFamily: FONT_PIXEL, fontSize: 6, color: TEXT_MUTED, letterSpacing: 1 }}>POWER</span>
          </div>
          <span style={{ fontFamily: FONT_PIXEL, fontSize: 7, color: cp.rank.color, opacity: 0.85 }}>{cp.rank.tier}</span>
        </div>

        {/* Gold + Essence */}
        <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 5,
            padding: "4px 7px",
            background: alpha(COLOR_LEGENDARY, "0f"), border: `1px solid ${alpha(COLOR_LEGENDARY, "2d")}`,
            borderRadius: 5,
          }}>
            <Coins size={11} color={COLOR_LEGENDARY} />
            <span style={{ fontFamily: FONT_BODY, color: COLOR_LEGENDARY, fontSize: 14 }}>
              {econ.coins.toLocaleString("en-US")}
            </span>
          </div>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 5,
            padding: "4px 7px",
            background: alpha(COLOR_MAGE, "0f"), border: `1px solid ${alpha(COLOR_MAGE, "2d")}`,
            borderRadius: 5,
          }}>
            <Sparkles size={11} color={COLOR_MAGE} />
            <span style={{ fontFamily: FONT_BODY, color: COLOR_MAGE, fontSize: 14 }}>
              {(econ.monsterEssences ?? 0).toLocaleString("en-US")}
            </span>
          </div>
        </div>

      </div>

      {/* ── Navigation Menu ── */}
      <div style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {MENU_ITEMS.map(({ path, label, Icon, locked }) => {
            const active = pathname === path || (path !== "/" && pathname.startsWith(path));
            return (
              <button
                key={path}
                onClick={() => {
                  if (locked) return;
                  audioManager.playClick("navigate");
                  navigate(path);
                }}
                title={locked ? "Coming Soon" : undefined}
                style={{
                  background: locked ? alpha(TEXT_LIGHT, "03") : active ? alpha(ACCENT_GOLD, "24") : alpha(TEXT_LIGHT, "05"),
                  border: `2px solid ${locked ? BORDER_SUBTLE : active ? ACCENT_GOLD : BORDER_SUBTLE}`,
                  color: locked ? TEXT_INACTIVE : active ? ACCENT_GOLD : TEXT_MUTED,
                  padding: "13px 14px",
                  cursor: locked ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontFamily: FONT_PIXEL,
                  fontSize: 9,
                  letterSpacing: 1,
                  transition: "all 0.12s",
                  borderRadius: 6,
                  textAlign: "left",
                  width: "100%",
                  boxShadow: active
                    ? "inset 0 1px 0 rgba(255,255,255,0.06), 3px 3px 0 rgba(0,0,0,0.5)"
                    : "2px 2px 0 rgba(0,0,0,0.4)",
                  transform: "none",
                  imageRendering: "pixelated",
                  opacity: locked ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!active && !locked) {
                    e.currentTarget.style.borderColor = BORDER_ELEVATED;
                    e.currentTarget.style.color = TEXT_BODY;
                    e.currentTarget.style.background = alpha(TEXT_LIGHT, "0d");
                    e.currentTarget.style.boxShadow = "2px 2px 0 rgba(0,0,0,0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active && !locked) {
                    e.currentTarget.style.borderColor = BORDER_SUBTLE;
                    e.currentTarget.style.color = TEXT_MUTED;
                    e.currentTarget.style.background = alpha(TEXT_LIGHT, "05");
                    e.currentTarget.style.boxShadow = "2px 2px 0 rgba(0,0,0,0.4)";
                  }
                }}
                onMouseDown={(e) => {
                  if (!locked) {
                    e.currentTarget.style.transform = "translate(1px,1px)";
                    e.currentTarget.style.boxShadow = active
                      ? "inset 0 1px 0 rgba(255,255,255,0.06), 1px 1px 0 rgba(0,0,0,0.5)"
                      : "1px 1px 0 rgba(0,0,0,0.4)";
                  }
                }}
                onMouseUp={(e) => {
                  if (!locked) e.currentTarget.style.transform = "none";
                }}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{label}</span>
                {locked && <Lock size={11} style={{ flexShrink: 0, opacity: 0.6 }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Logout ── */}
      <div style={{ padding: "10px 10px 14px", borderTop: `1px solid ${BORDER_SUBTLE}` }}>
        {nick && (
          <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: TEXT_INACTIVE, marginBottom: 6, textAlign: "center" }}>
            @{nick}
          </div>
        )}
        <button
          onClick={async () => { await forcePush(); await signOut(); navigate("/"); }}
          style={{
            width: "100%", padding: "11px 0",
            fontFamily: FONT_PIXEL, fontSize: 8,
            color: COLOR_DANGER, background: alpha(TEXT_LIGHT, "05"),
            border: `2px solid ${BORDER_ELEVATED}`,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            borderRadius: 6, transition: "all 0.12s",
            boxShadow: "2px 2px 0 rgba(0,0,0,0.4)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLOR_DANGER; e.currentTarget.style.background = "rgba(230,57,70,0.10)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER_ELEVATED; e.currentTarget.style.background = alpha(TEXT_LIGHT, "05"); }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "translate(1px,1px)"; e.currentTarget.style.boxShadow = "1px 1px 0 rgba(0,0,0,0.4)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "2px 2px 0 rgba(0,0,0,0.4)"; }}
        >
          <LogOut size={14} /> EXIT
        </button>
      </div>
    </aside>
  );
}
