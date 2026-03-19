import { useNavigate, useLocation } from "react-router";
import {
  Swords, Brain, Flame, Award, Settings, Zap, Users, LogOut, User, Palette, ShoppingBag, Coins, Sparkles,
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
  { path: "/",              label: "CAMPAIGN",    Icon: Swords       },
  { path: "/desafios",      label: "FOCUS",       Icon: Brain        },
  { path: "/habitos",       label: "HABITS",      Icon: Flame        },
  { path: "/conquistas",    label: "ACHIEVEMENTS", Icon: Award       },
  { path: "/perfil",        label: "PROFILE",     Icon: User         },
  { path: "/loja",          label: "SHOP",        Icon: ShoppingBag  },
  { path: "/amigos",        label: "FRIENDS",     Icon: Users        },
  { path: "/configuracoes", label: "SETTINGS",    Icon: Settings     },
  { path: "/design_system", label: "DESIGN KIT",  Icon: Palette      },
];

export function DesktopSidebar({ playerName, level, rankLabel, rankColor, xpPct, currentXP, neededXP }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { signOut, nick } = useAuth();
  const { activeSkin } = useCampaign();
  const avatarSrc = activeSkin === "mage" ? imgAvatarMago : imgAvatar;

  return (
    <aside style={{
      width: 260,
      flexShrink: 0,
      background: "rgba(11,13,30,0.97)",
      borderRight: "1px solid #1f254f",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
      zIndex: 30,
      fontFamily: "'VT323', monospace",
      overflowY: "auto",
    }}>

      {/* ── Player Card ── */}
      <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid #1f254f" }}>
        {/* Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 52, height: 52, flexShrink: 0,
            background: "#0d1024", position: "relative", overflow: "hidden",
            border: "1px solid #1f254f", borderRadius: 10,
          }}>
            <img src={avatarSrc} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", color: "#fff",
              fontSize: 9, textShadow: "1px 1px 0 #000", marginBottom: 5,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {nick || playerName}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#FFD700", fontSize: 8, textShadow: "1px 1px 0 #000" }}>
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
            <span style={{ color: "#8a7a6a", fontSize: 13 }}>{currentXP}/{neededXP} XP</span>
            <span style={{ color: "#FFD700", fontSize: 13 }}>{Math.round(xpPct)}%</span>
          </div>
          <div style={{ height: 8, background: "#0b0d1e", border: "1px solid #2a2e50", borderRadius: 5, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, width: `${xpPct}%`, background: "#FFD700", transition: "width 0.6s ease" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg,transparent 0px,transparent 10px,rgba(0,0,0,0.2) 10px,rgba(0,0,0,0.2) 11px)", pointerEvents: "none" }} />
          </div>
        </div>

        {/* Power */}
        {(() => {
          const cp = getPower(level);
          return (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "5px 8px",
              background: `${cp.rank.color}0C`, border: `1px solid ${cp.rank.color}25`,
              borderRadius: 6,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Zap size={12} color={cp.rank.color} />
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: cp.rank.color, textShadow: "1px 1px 0 #000", letterSpacing: 1 }}>
                  {formatPower(cp.total)}
                </span>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#5a6080", letterSpacing: 1 }}>POWER</span>
              </div>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: cp.rank.color, opacity: 0.85 }}>{cp.rank.tier}</span>
            </div>
          );
        })()}

        {/* Gold + Essence */}
        {(() => {
          const econ = getEconomy();
          return (
            <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
              <div style={{
                flex: 1, display: "flex", alignItems: "center", gap: 5,
                padding: "4px 7px",
                background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.18)",
                borderRadius: 5,
              }}>
                <Coins size={11} color="#FFD700" />
                <span style={{ fontFamily: "'VT323', monospace", color: "#FFD700", fontSize: 14 }}>
                  {econ.coins.toLocaleString("en-US")}
                </span>
              </div>
              <div style={{
                flex: 1, display: "flex", alignItems: "center", gap: 5,
                padding: "4px 7px",
                background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.18)",
                borderRadius: 5,
              }}>
                <Sparkles size={11} color="#a855f7" />
                <span style={{ fontFamily: "'VT323', monospace", color: "#a855f7", fontSize: 14 }}>
                  {(econ.monsterEssences ?? 0).toLocaleString("en-US")}
                </span>
              </div>
            </div>
          );
        })()}

      </div>

      {/* ── Navigation Menu ── */}
      <div style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {MENU_ITEMS.map(({ path, label, Icon }) => {
            const active = pathname === path || (path !== "/" && pathname.startsWith(path));
            return (
              <button
                key={path}
                onClick={() => { audioManager.playClick("navigate"); navigate(path); }}
                style={{
                  background: active ? "rgba(227,159,100,0.14)" : "rgba(255,255,255,0.02)",
                  border: `2px solid ${active ? "#e39f64" : "#1f2545"}`,
                  color: active ? "#e39f64" : "#4a5278",
                  padding: "13px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontFamily: "'Press Start 2P', monospace",
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
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.borderColor = "#2e3560";
                    e.currentTarget.style.color = "#7a8aaa";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.boxShadow = "2px 2px 0 rgba(0,0,0,0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.borderColor = "#1f2545";
                    e.currentTarget.style.color = "#4a5278";
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.boxShadow = "2px 2px 0 rgba(0,0,0,0.4)";
                  }
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "translate(1px,1px)";
                  e.currentTarget.style.boxShadow = active
                    ? "inset 0 1px 0 rgba(255,255,255,0.06), 1px 1px 0 rgba(0,0,0,0.5)"
                    : "1px 1px 0 rgba(0,0,0,0.4)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "none";
                }}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Logout ── */}
      <div style={{ padding: "10px 10px 14px", borderTop: "1px solid #1f254f" }}>
        {nick && (
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: "#3a4060", marginBottom: 6, textAlign: "center" }}>
            @{nick}
          </div>
        )}
        <button
          onClick={async () => { await forcePush(); await signOut(); navigate("/"); }}
          style={{
            width: "100%", padding: "11px 0",
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
            color: "#E63946", background: "rgba(255,255,255,0.02)",
            border: "2px solid #2a2e50",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            borderRadius: 6, transition: "all 0.12s",
            boxShadow: "2px 2px 0 rgba(0,0,0,0.4)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#E63946"; e.currentTarget.style.background = "rgba(230,57,70,0.10)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2e50"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "translate(1px,1px)"; e.currentTarget.style.boxShadow = "1px 1px 0 rgba(0,0,0,0.4)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "2px 2px 0 rgba(0,0,0,0.4)"; }}
        >
          <LogOut size={14} /> EXIT
        </button>
      </div>
    </aside>
  );
}