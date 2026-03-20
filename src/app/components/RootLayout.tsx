/**
 * RootLayout — React Router root route component.
 *
 * IMPORTANT: DesktopLayout / MobileLayout / GameShell have been extracted to
 * GameLayouts.tsx to prevent Vite HMR from causing a "useCampaign must be inside
 * CampaignProvider" error. When all layout code lived here, an HMR reload of any
 * transitive dependency (e.g. FloatingDamage, useNotifications) could cause
 * useCampaign.tsx to create a NEW CampaignContext before React reconciled the
 * new CampaignProvider — resulting in a null context window caught by React
 * Router's ErrorBoundary.
 *
 * By keeping layout components in a separate file that also directly imports
 * useCampaign, both modules share the same instance during any HMR cycle.
 */
import { useEffect, useState, useRef } from "react";
import { AuthProvider, useAuth }        from "../hooks/useAuth";
import { CampaignProvider }             from "../hooks/useCampaign";
import { audioManager }                 from "../hooks/audioManager";
import { PreferencesProvider, useTheme } from "../contexts/PreferencesContext";
import { GameShell }                    from "./GameLayouts";
import AuthScreen                       from "./AuthScreen";
import { OnboardingOverlay, useOnboarding } from "./OnboardingOverlay";
import {
  pullFromCloud, setSyncUser, startRealtime, stopRealtime,
  applyCloudData, clearGameLocalStorage, stopSync, setAccessToken,
} from "../data/syncService";

// ── CSS keyframes injected once ───────────────────────────────────────────────
const GLOBAL_CSS = `
  html, body {
    background: #15182d !important;
    overscroll-behavior-y: contain;
  }
  @keyframes missionScreenShake {
    0%  { transform:translate(0,0) rotate(0deg); }
    10% { transform:translate(-8px,-4px) rotate(-0.5deg); }
    20% { transform:translate(8px,4px) rotate(0.5deg); }
    30% { transform:translate(-7px,3px) rotate(-0.3deg); }
    40% { transform:translate(7px,-3px) rotate(0.3deg); }
    50% { transform:translate(-4px,4px) rotate(-0.2deg); }
    60% { transform:translate(4px,-2px) rotate(0.2deg); }
    70% { transform:translate(-2px,3px) rotate(-0.1deg); }
    80% { transform:translate(2px,-1px) rotate(0.1deg); }
    90% { transform:translate(-1px,1px) rotate(0deg); }
    100%{ transform:translate(0,0) rotate(0deg); }
  }
  @keyframes bannerPop {
    0%  {transform:translate(-50%,-50%) scale(0.3) rotate(-8deg);opacity:0}
    25% {transform:translate(-50%,-50%) scale(1.15) rotate(2deg);opacity:1}
    55% {transform:translate(-50%,-50%) scale(1) rotate(-1deg);opacity:1}
    80% {transform:translate(-50%,-50%) scale(1) rotate(0deg);opacity:1}
    100%{transform:translate(-50%,-50%) scale(0.85) rotate(0deg);opacity:0}
  }
  @keyframes criticalPulse{0%,50%{opacity:1}25%,75%{opacity:0.6}100%{opacity:1}}
  @keyframes flashIn{0%{opacity:0.45}100%{opacity:0}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.75}}
  @keyframes penaltyDrop {
    0%  {transform:translate(-50%,-50%) scale(0.5);opacity:0}
    20% {transform:translate(-50%,-50%) scale(1.1);opacity:1}
    40% {transform:translate(-50%,-50%) scale(1);opacity:1}
    80% {transform:translate(-50%,-50%) scale(1);opacity:1}
    100%{transform:translate(-50%,-50%) scale(0.8);opacity:0}
  }
  @keyframes lvlBannerIn {
    0%   {opacity:0; transform:scale(0.5)}
    10%  {opacity:1; transform:scale(1.15)}
    20%  {transform:scale(1)}
    85%  {opacity:1; transform:scale(1)}
    100% {opacity:0; transform:scale(0.9)}
  }
  @keyframes lvlGlowPulse { 0%{opacity:0.8} 50%{opacity:0.3} 100%{opacity:0} }
  @keyframes lvlShine { 0%,100%{opacity:0.6} 50%{opacity:1} }
  @keyframes lvlNumberPop { 0%{transform:scale(0.3);opacity:0} 100%{transform:scale(1);opacity:1} }
  @keyframes notifPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.28)} }
`;

// ── SyncLoader: shown while cloud pull is in progress ─────────────────────────
function SyncLoader() {
  const { BG_DEEPEST, COLOR_WARNING, TEXT_MUTED, FONT_PIXEL, FONT_BODY } = useTheme();
  return (
    <div style={{ position: "fixed", inset: 0, background: BG_DEEPEST, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontFamily: FONT_PIXEL, fontSize: 12, color: COLOR_WARNING, textShadow: "2px 2px 0 #000", animation: "pulse 1.5s ease-in-out infinite" }}>
        SINCRONIZANDO DADOS...
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 18, color: TEXT_MUTED }}>
        Carregando progresso do servidor
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}

// ── RootLayoutInner: manages auth + sync state ────────────────────────────────
// Does NOT call useCampaign() — see module comment above.
function RootLayoutInner() {
  const { user, session, loading: authLoading } = useAuth();
  const [tick,     setTick]     = useState(0);
  const [syncDone, setSyncDone] = useState(false);
  const activeUidRef = useRef<string | null>(null);
  const { show: showOnboarding, finish: finishOnboarding } = useOnboarding();

  void tick; // prevents unused-variable lint warning; triggers re-render for sidebar XP

  // Start music on first user interaction
  useEffect(() => {
    function handleInteraction() {
      audioManager.ensureStarted();
      audioManager.retryPendingPlay();
      window.removeEventListener("click",      handleInteraction);
      window.removeEventListener("keydown",    handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    }
    window.addEventListener("click",      handleInteraction);
    window.addEventListener("keydown",    handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    return () => {
      window.removeEventListener("click",      handleInteraction);
      window.removeEventListener("keydown",    handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  // Sync lifecycle — manages cloud pull and realtime subscription
  useEffect(() => {
    if (!user) {
      if (activeUidRef.current) {
        console.log("[RootLayout] User logged out → full cleanup");
        stopSync();
        clearGameLocalStorage();
        activeUidRef.current = null;
      }
      setSyncDone(false);
      return;
    }

    setAccessToken(session?.access_token ?? null);

    if (activeUidRef.current === user.id) return;

    let cancelled = false;

    const initSync = async () => {
      const uid = user.id;
      console.log("[RootLayout] New login → uid:", uid);
      stopSync();
      clearGameLocalStorage();
      setSyncUser(uid);

      // Re-apply the access token AFTER setSyncUser/stopSync — both of which
      // clear cachedAccessToken — so pullFromCloud always has a valid token.
      setAccessToken(session?.access_token ?? null);

      const pullOk = await pullFromCloud(uid);
      console.log("[RootLayout] pullFromCloud result:", pullOk);

      if (cancelled) return;

      activeUidRef.current = uid;
      setSyncDone(true);

      // Notify CampaignProvider to re-read economy data (class, needsClassPick, etc.)
      // after the cloud pull has populated localStorage. We use a DOM event so we
      // don't need to call useCampaign() from this component.
      window.dispatchEvent(new CustomEvent("rpg:sync-complete"));

      startRealtime(uid, (data) => {
        applyCloudData(data);
        setTick(t => t + 1);
      });
    };

    initSync();
    return () => { cancelled = true; stopRealtime(); };
  }, [user, session]);

  // Periodic tick for sidebar XP poll
  useEffect(() => {
    const poll = setInterval(() => setTick(t => t + 1), 2000);
    const onFocus = () => setTick(t => t + 1);
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(poll); window.removeEventListener("focus", onFocus); };
  }, []);

  if (authLoading) return <SyncLoader />;
  if (!user)       return <AuthScreen />;
  if (!syncDone)   return <SyncLoader />;

  // GameShell (defined in GameLayouts.tsx) picks Desktop or Mobile layout.
  // It DOES call useCampaign() — which is safe because it is rendered here,
  // inside CampaignProvider (see RootLayout below).
  return (
    <>
      <GameShell globalCss={GLOBAL_CSS} />
      {showOnboarding && <OnboardingOverlay onFinish={finishOnboarding} />}
    </>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <CampaignProvider>
          <RootLayoutInner />
        </CampaignProvider>
      </AuthProvider>
    </PreferencesProvider>
  );
}