import { useNavigate, useLocation } from "react-router";
import { Swords, Flame, Award, User, Users } from "lucide-react";
import { useInteractionFeedback } from "../hooks/useInteractionFeedback";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { useNotifications } from "../hooks/useNotifications";
import { useTheme } from "../contexts/PreferencesContext";
import { useLanguage } from "../contexts/PreferencesContext";

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const feedback = useInteractionFeedback();
  const isDesktop = useIsDesktop();
  const notifs = useNotifications();
  const { ACCENT_GOLD, ACCENT_GOLD_DIM, TEXT_INACTIVE, COLOR_DANGER, BG_CARD, BG_DEEPEST, BORDER_SUBTLE, FONT_PIXEL, alpha } = useTheme();
  const t = useLanguage();

  const tabs = [
    { path: "/",           label: t("nav.campaign"),     Icon: Swords, notif: null as null | keyof ReturnType<typeof useNotifications> },
    { path: "/habitos",    label: t("nav.habits"),       Icon: Flame,  notif: "habitsUnchecked" as const },
    { path: "/conquistas", label: t("nav.achievements"), Icon: Award,  notif: "newAchievements" as const },
    { path: "/perfil",     label: t("nav.profile"),      Icon: User,   notif: null },
    { path: "/amigos",     label: t("nav.friends"),      Icon: Users,  notif: null },
  ];

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
        background:   alpha(BG_CARD, "eb"),
        border:       `2px solid ${BORDER_SUBTLE}`,
        borderRadius: 40,
        boxShadow:    "0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06) inset",
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
                  background:    active ? ACCENT_GOLD_DIM : "transparent",
                  outline:       active ? `1.5px solid ${ACCENT_GOLD}` : "1.5px solid transparent",
                  color:         active ? ACCENT_GOLD : TEXT_INACTIVE,
                  cursor:        "pointer",
                  fontFamily:    FONT_PIXEL,
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
                    background: COLOR_DANGER,
                    border:    `1.5px solid ${BG_DEEPEST}`,
                    borderRadius: 8,
                    display:   "flex",
                    alignItems:"center",
                    justifyContent: "center",
                    fontSize:  8,
                    fontFamily: FONT_PIXEL,
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
