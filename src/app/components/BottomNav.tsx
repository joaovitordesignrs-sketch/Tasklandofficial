import { useNavigate, useLocation } from "react-router";
import { Swords, Flame, Award, User, Users } from "lucide-react";
import { useInteractionFeedback } from "../hooks/useInteractionFeedback";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { useNotifications } from "../hooks/useNotifications";

const tabs = [
  { path: "/",           label: "CAMPANHA",   Icon: Swords, notif: null as null | keyof ReturnType<typeof useNotifications> },
  { path: "/habitos",    label: "HÁBITOS",    Icon: Flame,  notif: "habitsUnchecked" as const },
  { path: "/conquistas", label: "CONQUISTAS", Icon: Award,  notif: "newAchievements" as const },
  { path: "/perfil",     label: "PERFIL",     Icon: User,   notif: null },
  { path: "/amigos",     label: "AMIGOS",     Icon: Users,  notif: null },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const feedback = useInteractionFeedback();
  const isDesktop = useIsDesktop();
  const notifs = useNotifications();

  if (isDesktop) return null;

  return (
    <>
      <style>{`
        .bnav-scroll::-webkit-scrollbar { display: none; }
        .bnav-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .bnav-btn { transition: all 0.15s ease; -webkit-tap-highlight-color: transparent; }
        .bnav-btn:active { transform: scale(0.92); }
        @keyframes notifPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.25)} }
      `}</style>

      {/* Spacer so content isn't hidden under the floating nav */}
      <div style={{ height: 88 }} />

      <nav style={{
        position:     "fixed",
        bottom:       16,
        left:         "50%",
        transform:    "translateX(-50%)",
        zIndex:       200,
        width:        "calc(100% - 24px)",
        maxWidth:     520,
        background:   "rgba(8, 10, 24, 0.92)",
        border:       "2px solid #1f254f",
        borderRadius: 40,
        boxShadow:    "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding:      "0 8px",
        overflow:     "hidden",
      }}>
        <div
          className="bnav-scroll"
          style={{
            display:        "flex",
            overflowX:      "auto",
            gap:            4,
            padding:        "8px 4px",
            alignItems:     "center",
          }}
        >
          {tabs.map(({ path, label, Icon, notif }) => {
            const active = pathname === path || (path !== "/" && pathname.startsWith(path));
            const count = notif ? (notifs[notif] as number) : 0;
            return (
              <button
                key={path}
                className="bnav-btn"
                onClick={() => { feedback.navigate(); navigate(path); }}
                style={{
                  flexShrink:    0,
                  display:       "flex",
                  flexDirection: "column",
                  alignItems:    "center",
                  justifyContent:"center",
                  gap:           4,
                  padding:       "7px 14px",
                  borderRadius:  32,
                  border:        "none",
                  background:    active ? "rgba(227,159,100,0.18)" : "transparent",
                  outline:       active ? "1.5px solid #e39f64" : "1.5px solid transparent",
                  color:         active ? "#e39f64" : "#3a4060",
                  cursor:        "pointer",
                  fontFamily:    "'Press Start 2P', monospace",
                  fontSize:      6,
                  whiteSpace:    "nowrap",
                  letterSpacing: active ? 0.5 : 0,
                  position:      "relative",
                }}
              >
                {/* Notification badge */}
                {count > 0 && (
                  <span style={{
                    position:  "absolute",
                    top:       4,
                    right:     8,
                    minWidth:  14,
                    height:    14,
                    background: "#E63946",
                    border:    "1.5px solid #0a0c1a",
                    borderRadius: 8,
                    display:   "flex",
                    alignItems:"center",
                    justifyContent: "center",
                    fontSize:  8,
                    fontFamily:"'Press Start 2P', monospace",
                    color:     "#fff",
                    lineHeight:1,
                    padding:   "0 3px",
                    animation: "notifPulse 1.8s ease-in-out infinite",
                    zIndex:    2,
                  }}>
                    {count > 9 ? "9+" : count}
                  </span>
                )}
                <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}