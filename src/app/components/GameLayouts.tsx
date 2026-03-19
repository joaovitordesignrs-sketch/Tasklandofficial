/**
 * GameLayouts — Desktop and Mobile layout shells.
 *
 * Kept in a SEPARATE file from RootLayout.tsx intentionally:
 * Vite HMR re-evaluates modules on change. If DesktopLayout / MobileLayout
 * lived inside RootLayout.tsx (which also imports CampaignProvider), an HMR
 * reload of any transitive dependency could cause useCampaign.tsx to create
 * a NEW CampaignContext while the DOM still held the OLD CampaignProvider —
 * resulting in "useCampaign must be inside CampaignProvider" during the
 * short window before React reconciles the new tree.
 *
 * By isolating layouts here, both this file and useCampaign.tsx share the
 * same module instance during an HMR cycle, keeping context identity stable.
 */
import { Skull } from "lucide-react";
import { Outlet } from "react-router";
import { BottomNav }         from "./BottomNav";
import { DesktopLeftColumn } from "./DesktopLeftColumn";
import { PixelIcon }         from "./ui/PixelIcon";
import { useCampaign }       from "../hooks/useCampaign";
import { useIsDesktop }      from "../hooks/useIsDesktop";

// ── Desktop layout ─────────────────────────────────────────────────────────────
export function DesktopLayout() {
  const { screenFlash, screenShake, attackBanner, xpPenaltyBanner } = useCampaign();

  return (
    <>
      {screenFlash && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,0.3)", zIndex: 9999, pointerEvents: "none", animation: "flashIn 0.18s ease-out forwards" }} />
      )}
      {xpPenaltyBanner && (
        <div style={{ position: "fixed", top: "35%", left: "50%", zIndex: 9500, pointerEvents: "none", textAlign: "center", animation: "penaltyDrop 3s ease forwards", transform: "translate(-50%,-50%)" }}>
          <div style={{ marginBottom: 6, color: "#E63946" }}><Skull size={52} /></div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 22, color: "#E63946", textShadow: "3px 3px 0 #000, 0 0 20px rgba(230,57,70,0.6)", letterSpacing: 2, lineHeight: 1.3 }}>CHALLENGE FAILED!</div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: "#E63946", textShadow: "2px 2px 0 #000", marginTop: 8, animation: "criticalPulse 0.5s step-end infinite" }}>-{xpPenaltyBanner.amount} XP</div>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 18, color: "#ff8888", marginTop: 6, textShadow: "1px 1px 0 #000" }}>50% of level progress lost</div>
        </div>
      )}
      {attackBanner && (
        <div style={{ position: "fixed", top: "38%", left: "50%", zIndex: 9000, pointerEvents: "none", textAlign: "center", animation: "bannerPop 1.4s ease forwards", transform: "translate(-50%,-50%)" }}>
          <div style={{ marginBottom: 4, color: attackBanner.color }}><PixelIcon name={attackBanner.emoji} size={52} color={attackBanner.color} /></div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: attackBanner.size, color: attackBanner.color, textShadow: "3px 3px 0 #000", letterSpacing: 2, lineHeight: 1.2, whiteSpace: "nowrap", animation: attackBanner.text.includes("CRITICAL") ? "criticalPulse 0.4s step-end infinite" : "none" }}>{attackBanner.text}</div>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 22, color: attackBanner.color, opacity: 0.85, marginTop: 6, textShadow: "2px 2px 0 #000" }}>{attackBanner.sub}</div>
        </div>
      )}

      <div
        style={{
          height: "100vh",
          overflow: "hidden",
          background: "#15182d",
          animation: screenShake ? "missionScreenShake 0.4s ease" : "none",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        <div style={{
          display: "flex",
          width: "100%",
          maxWidth: 1280,
          padding: "20px 32px",
          gap: 20,
          boxSizing: "border-box",
        }}>
          <DesktopLeftColumn />
          <div style={{
            flex: 1,
            minWidth: 0,
            overflowY: "auto",
            overflowX: "hidden",
            height: "calc(100vh - 40px)",
            display: "flex",
            flexDirection: "column",
            borderRadius: 12,
          }}>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Mobile / Tablet layout ─────────────────────────────────────────────────────
// On tablets (640–1023px) content is centered at max-width 640px;
// on phones it naturally fills the screen.
export function MobileLayout() {
  const { screenFlash, screenShake, attackBanner, xpPenaltyBanner } = useCampaign();

  return (
    <>
      {screenFlash && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,0.3)", zIndex: 9999, pointerEvents: "none", animation: "flashIn 0.18s ease-out forwards" }} />
      )}
      {xpPenaltyBanner && (
        <div style={{ position: "fixed", top: "35%", left: "50%", zIndex: 9500, pointerEvents: "none", textAlign: "center", animation: "penaltyDrop 3s ease forwards", transform: "translate(-50%,-50%)" }}>
          <div style={{ marginBottom: 6, color: "#E63946" }}><Skull size={52} /></div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 22, color: "#E63946", textShadow: "3px 3px 0 #000, 0 0 20px rgba(230,57,70,0.6)", letterSpacing: 2, lineHeight: 1.3 }}>CHALLENGE FAILED!</div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: "#E63946", textShadow: "2px 2px 0 #000", marginTop: 8, animation: "criticalPulse 0.5s step-end infinite" }}>-{xpPenaltyBanner.amount} XP</div>
        </div>
      )}
      {attackBanner && (
        <div style={{ position: "fixed", top: "38%", left: "50%", zIndex: 9000, pointerEvents: "none", textAlign: "center", animation: "bannerPop 1.4s ease forwards", transform: "translate(-50%,-50%)" }}>
          <div style={{ marginBottom: 4, color: attackBanner.color }}><PixelIcon name={attackBanner.emoji} size={52} color={attackBanner.color} /></div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: attackBanner.size, color: attackBanner.color, textShadow: "3px 3px 0 #000", letterSpacing: 2, lineHeight: 1.2, whiteSpace: "nowrap", animation: attackBanner.text.includes("CRITICAL") ? "criticalPulse 0.4s step-end infinite" : "none" }}>{attackBanner.text}</div>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 22, color: attackBanner.color, opacity: 0.85, marginTop: 6, textShadow: "2px 2px 0 #000" }}>{attackBanner.sub}</div>
        </div>
      )}

      {/* Full-screen background */}
      <div style={{ minHeight: "100dvh", background: "#15182d", animation: screenShake ? "missionScreenShake 0.4s ease" : "none" }}>
        {/* Centered content column — constrained on tablet, full-width on phone */}
        <div style={{
          width: "100%",
          maxWidth: 640,
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexDirection: "column",
        }}>
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </>
  );
}

// ── GameShell: picks layout based on viewport ──────────────────────────────────
export function GameShell({ globalCss }: { globalCss: string }) {
  const isDesktop = useIsDesktop();
  return (
    <>
      <style>{globalCss}</style>
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}
    </>
  );
}
