import { useState, useRef, useEffect, useCallback } from "react";
import { Music, Volume2, VolumeX, SkipForward, SkipBack, User, Save, LogOut, Shield, Settings, Globe } from "lucide-react";
import { useAudioSettings } from "../hooks/useAudioSettings";
import { audioManager } from "../hooks/audioManager";
import { loadPlayerName, savePlayerName } from "../data/missions";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { useAuth } from "../hooks/useAuth";
import { forcePush } from "../data/syncService";
import { useNavigate } from "react-router";
import { PageShell } from "./ui/PageShell";
import { PixelTabs, PixelTabDef } from "./ui/PixelTabs";
import { RpgButton } from "./ui/RpgButton";
import { getPreferences } from "../data/preferences";
import { useTheme } from "../contexts/PreferencesContext";
import { useLanguage } from "../contexts/PreferencesContext";

// ── Pixel-art Volume Slider ──────────────────────────────────────────────────
function VolumeSlider({
  value, onChange, disabled, color, label,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
  color: string;
  label: string;
}) {
  const { BG_PAGE, BORDER_ELEVATED, TEXT_MUTED, FONT_PIXEL, FONT_BODY } = useTheme();
  const pct = Math.round(value * 100);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      opacity: disabled ? 0.35 : 1,
    }}>
      <span style={{ fontFamily: FONT_PIXEL, fontSize: 8, color: TEXT_MUTED, minWidth: 28 }}>
        {label}
      </span>

      <div style={{ flex: 1, position: "relative", height: 22, display: "flex", alignItems: "center" }}>
        <div style={{
          position: "absolute", width: "100%", height: 10,
          background: BG_PAGE, border: `2px solid ${BORDER_ELEVATED}`,
        }}>
          <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.1s" }} />
        </div>
        <input
          type="range" min={0} max={100} value={pct}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          style={{
            position: "absolute", width: "100%", height: 22,
            opacity: 0, cursor: disabled ? "default" : "pointer", margin: 0,
          }}
        />
      </div>

      <span style={{
        fontFamily: FONT_BODY, fontSize: 18,
        color: disabled ? TEXT_MUTED : color,
        minWidth: 36, textAlign: "right",
      }}>
        {pct}%
      </span>
    </div>
  );
}

// ── Sound Settings Tab ───────────────────────────────────────────────────────
function SoundSettings() {
  const t = useLanguage();
  const { BG_CARD, BG_PAGE, BORDER_ELEVATED, COLOR_MAGE, COLOR_ORANGE, COLOR_SUCCESS, TEXT_MUTED, FONT_PIXEL, FONT_BODY, RADIUS_XL, alpha } = useTheme();
  const sfxPreviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    musicOn, musicVolume,
    sfxOn, sfxVolume,
    trackName, currentTrack, trackCount,
    setMusicOn, setMusicVolume,
    setSfxOn, setSfxVolume,
    nextTrack, prevTrack,
    playPreviewBeep,
  } = useAudioSettings();

  const handleSfxVolumeChange = useCallback((v: number) => {
    setSfxVolume(v);
    if (sfxPreviewTimer.current) clearTimeout(sfxPreviewTimer.current);
    sfxPreviewTimer.current = setTimeout(() => playPreviewBeep(), 150);
  }, [setSfxVolume, playPreviewBeep]);

  useEffect(() => {
    audioManager.ensureStarted();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── MUSIC ── */}
      <div style={{
        background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "cc")}`,
        borderRadius: RADIUS_XL, padding: "18px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Music size={18} color={musicOn ? COLOR_MAGE : TEXT_MUTED} />
            <span style={{ fontFamily: FONT_PIXEL, color: COLOR_MAGE, fontSize: 10, textShadow: "1px 1px 0 #000" }}>
              {t("settings.music")}
            </span>
          </div>
          <RpgButton
            variant="toggle"
            color={COLOR_SUCCESS}
            isOn={musicOn}
            onClick={() => setMusicOn(!musicOn)}
          >
            {musicOn ? t("common.on") : t("common.off")}
          </RpgButton>
        </div>

        {/* Track selector */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: BG_PAGE, border: `2px solid ${BORDER_ELEVATED}`, padding: "10px 12px",
          marginBottom: 14, opacity: musicOn ? 1 : 0.4,
        }}>
          <RpgButton variant="icon" color={COLOR_MAGE} disabled={!musicOn} onClick={prevTrack}>
            <SkipBack size={18} />
          </RpgButton>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontFamily: FONT_PIXEL, fontSize: 9, color: COLOR_MAGE, textShadow: "1px 1px 0 #000", marginBottom: 3 }}>
              ♫ {trackName}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 16, color: TEXT_MUTED }}>
              {t("settings.track")} {currentTrack + 1} {t("settings.track.of")} {trackCount}
            </div>
          </div>
          <RpgButton variant="icon" color={COLOR_MAGE} disabled={!musicOn} onClick={nextTrack}>
            <SkipForward size={18} />
          </RpgButton>
        </div>

        <VolumeSlider value={musicVolume} onChange={setMusicVolume} disabled={!musicOn} color={COLOR_MAGE} label={t("settings.vol")} />
      </div>

      {/* ── SFX ── */}
      <div style={{
        background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "cc")}`,
        borderRadius: RADIUS_XL, padding: "18px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {sfxOn ? <Volume2 size={18} color={COLOR_ORANGE} /> : <VolumeX size={18} color={TEXT_MUTED} />}
            <span style={{ fontFamily: FONT_PIXEL, color: COLOR_ORANGE, fontSize: 10, textShadow: "1px 1px 0 #000" }}>
              {t("settings.sfx")}
            </span>
          </div>
          <RpgButton
            variant="toggle"
            color={COLOR_SUCCESS}
            isOn={sfxOn}
            onClick={() => setSfxOn(!sfxOn)}
          >
            {sfxOn ? t("common.on") : t("common.off")}
          </RpgButton>
        </div>

        <VolumeSlider value={sfxVolume} onChange={handleSfxVolumeChange} disabled={!sfxOn} color={COLOR_ORANGE} label={t("settings.vol")} />
      </div>
    </div>
  );
}

// ── Profile Settings Tab ─────────────────────────────────────────────────────
function ProfileSettings() {
  const t = useLanguage();
  const {
    BG_CARD, BG_PAGE, BORDER_ELEVATED, ACCENT_GOLD, ACCENT_SHADOW,
    COLOR_SUCCESS, TEXT_MUTED, RANK_NOVATO,
    FONT_PIXEL, FONT_BODY, RADIUS_XL, alpha,
  } = useTheme();
  const [name, setName] = useState(loadPlayerName);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const trimmed = name.trim() || "Adventurer";
    savePlayerName(trimmed);
    setName(trimmed);
    setSaved(true);
    audioManager.playClick("press");
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{
      background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "cc")}`,
      borderRadius: RADIUS_XL, padding: "24px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <User size={18} color={ACCENT_GOLD} />
        <span style={{ fontFamily: FONT_PIXEL, color: ACCENT_GOLD, fontSize: 10, textShadow: "1px 1px 0 #000" }}>
          {t("settings.tab.profile")}
        </span>
      </div>

      {/* Name */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontFamily: FONT_BODY, color: RANK_NOVATO, fontSize: 18, display: "block", marginBottom: 8 }}>
          {t("settings.player.name")}
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
          maxLength={20}
          placeholder={t("settings.player.placeholder")}
          style={{
            width: "100%", background: BG_PAGE,
            border: `2px solid ${BORDER_ELEVATED}`, color: "#fff",
            padding: "12px 14px", fontSize: 20,
            fontFamily: FONT_BODY,
            outline: "none", boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = ACCENT_GOLD)}
          onBlur={(e) => (e.target.style.borderColor = BORDER_ELEVATED)}
        />
        <div style={{ fontFamily: FONT_BODY, color: TEXT_MUTED, fontSize: 14, marginTop: 4 }}>
          {name.length}/20 {t("settings.player.chars")}
        </div>
      </div>

      <button
        onClick={handleSave}
        style={{
          width: "100%",
          background: saved ? COLOR_SUCCESS : ACCENT_GOLD,
          border: "none", color: BG_CARD, padding: "12px",
          fontFamily: FONT_PIXEL, fontSize: 10,
          cursor: "pointer",
          boxShadow: `3px 3px 0 ${saved ? "#2a9a45" : ACCENT_SHADOW}`,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "background 0.2s",
        }}
        onMouseDown={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "translate(2px,2px)")}
        onMouseUp={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "")}
      >
        <Save size={14} /> {saved ? t("settings.saved") : t("settings.save")}
      </button>
    </div>
  );
}

// ── Preferences Settings Tab ──────────────────────────────────────────────────
function PreferencesSettings() {
  const t = useLanguage();
  const {
    BG_CARD, ACCENT_GOLD, COLOR_SUCCESS,
    TEXT_MUTED, TEXT_LIGHT,
    FONT_PIXEL, FONT_BODY, RADIUS_XL, RADIUS_MD,
    BORDER_ELEVATED, alpha,
  } = useTheme();
  const [prefs, setPrefs] = useState(getPreferences);

  useEffect(() => {
    const handler = () => setPrefs(getPreferences());
    window.addEventListener("rpg-prefs-changed", handler);
    return () => window.removeEventListener("rpg-prefs-changed", handler);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "cc")}`,
        borderRadius: RADIUS_XL, padding: "24px 20px",
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Globe size={18} color={COLOR_SUCCESS} />
          <span style={{ fontFamily: FONT_PIXEL, color: COLOR_SUCCESS, fontSize: 10, textShadow: "1px 1px 0 #000" }}>
            {t("settings.tab.prefs")}
          </span>
        </div>

      </div>
    </div>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
type SettingsTab = "sound" | "profile" | "account" | "prefs";

export default function SettingsScreen() {
  const t = useLanguage();
  const {
    BG_DEEPEST, BG_CARD, BORDER_SUBTLE, BORDER_ELEVATED,
    ACCENT_GOLD, COLOR_DANGER, COLOR_MAGE, COLOR_WARRIOR, COLOR_SUCCESS, COLOR_WARNING,
    TEXT_MUTED, TEXT_LIGHT,
    FONT_PIXEL, FONT_BODY,
    RADIUS_XL, alpha,
  } = useTheme();
  const isDesktop = useIsDesktop();
  void isDesktop;
  const [tab, setTab] = useState<SettingsTab>("sound");
  const { user, nick, signOut } = useAuth();
  const navigate = useNavigate();

  const SETTINGS_TABS: PixelTabDef<SettingsTab>[] = [
    { key: "sound",   Icon: Volume2, label: t("settings.tab.sound"),   color: COLOR_MAGE    },
    { key: "profile", Icon: User,    label: t("settings.tab.profile"), color: ACCENT_GOLD   },
    { key: "account", Icon: Shield,  label: t("settings.tab.account"), color: COLOR_WARRIOR },
    { key: "prefs",   Icon: Globe,   label: t("settings.tab.prefs"),   color: COLOR_SUCCESS },
  ];

  return (
    <PageShell icon={<Settings size={16} />} title={t("settings.title")} accentColor={COLOR_WARRIOR}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <PixelTabs tabs={SETTINGS_TABS} active={tab} onSelect={setTab} style={{ marginBottom: 20 }} />

        {/* Content */}
        {tab === "sound" && <SoundSettings />}
        {tab === "profile" && <ProfileSettings />}
        {tab === "account" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Account Info */}
            <div style={{
              background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "cc")}`,
              borderRadius: RADIUS_XL, padding: "24px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Shield size={18} color={COLOR_WARRIOR} />
                <span style={{ fontFamily: FONT_PIXEL, color: COLOR_WARRIOR, fontSize: 10, textShadow: "1px 1px 0 #000" }}>
                  {t("settings.tab.account")}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {[
                  { label: "Email", value: user?.email ?? "—" },
                  { label: "Nick",  value: nick ? `@${nick}` : "Not set" },
                  { label: "UID",   value: (user?.id ?? "—").slice(0, 8) + "…" },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", background: BG_DEEPEST, border: `1px solid ${BORDER_SUBTLE}`,
                  }}>
                    <span style={{ fontFamily: FONT_PIXEL, fontSize: 7, color: TEXT_MUTED }}>{label}</span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: 16, color: TEXT_LIGHT }}>{value}</span>
                  </div>
                ))}
              </div>

              <RpgButton
                variant="ghost"
                color={COLOR_WARRIOR}
                fullWidth
                onClick={async () => {
                  await forcePush();
                  audioManager.playClick("press");
                }}
              >
                <Save size={14} /> {t("settings.sync")}
              </RpgButton>
            </div>

            {/* Game Master */}
            <RpgButton
              variant="ghost"
              color={COLOR_WARNING}
              fullWidth
              onClick={() => { audioManager.playClick("navigate"); navigate("/game-master"); }}
            >
              <Shield size={14} /> GAME MASTER
            </RpgButton>

            {/* Logout */}
            <RpgButton
              variant="dashed"
              color={COLOR_DANGER}
              fullWidth
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
            >
              <LogOut size={16} /> {t("settings.logout")}
            </RpgButton>
          </div>
        )}
        {tab === "prefs" && <PreferencesSettings />}
      </div>
    </PageShell>
  );
}
