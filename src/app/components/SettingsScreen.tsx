import { useState, useRef, useEffect, useCallback } from "react";
import { Music, Volume2, VolumeX, SkipForward, SkipBack, User, Save, LogOut, Shield, Settings } from "lucide-react";
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
import {
  BG_DEEPEST, BG_CARD, BG_PAGE, BORDER_SUBTLE, BORDER_ELEVATED,
  ACCENT_GOLD, ACCENT_SHADOW, COLOR_MAGE, COLOR_WARRIOR, COLOR_ORANGE,
  COLOR_SUCCESS, TEXT_MUTED, TEXT_INACTIVE, TEXT_LIGHT, RANK_NOVATO,
  FONT_PIXEL, FONT_BODY, RADIUS_XL, RADIUS_LG, RADIUS_MD,
} from "../data/tokens";

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
        background: BG_CARD, border: `1px solid rgba(42,46,80,0.8)`,
        borderRadius: RADIUS_XL, padding: "18px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Music size={18} color={musicOn ? COLOR_MAGE : TEXT_MUTED} />
            <span style={{ fontFamily: FONT_PIXEL, color: COLOR_MAGE, fontSize: 10, textShadow: "1px 1px 0 #000" }}>
              MÚSICA
            </span>
          </div>
          <RpgButton
            variant="toggle"
            color={COLOR_SUCCESS}
            isOn={musicOn}
            onClick={() => setMusicOn(!musicOn)}
          >
            {musicOn ? "ON" : "OFF"}
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
              Faixa {currentTrack + 1} de {trackCount}
            </div>
          </div>
          <RpgButton variant="icon" color={COLOR_MAGE} disabled={!musicOn} onClick={nextTrack}>
            <SkipForward size={18} />
          </RpgButton>
        </div>

        <VolumeSlider value={musicVolume} onChange={setMusicVolume} disabled={!musicOn} color={COLOR_MAGE} label="Vol" />
      </div>

      {/* ── SFX ── */}
      <div style={{
        background: BG_CARD, border: `1px solid rgba(42,46,80,0.8)`,
        borderRadius: RADIUS_XL, padding: "18px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {sfxOn ? <Volume2 size={18} color={COLOR_ORANGE} /> : <VolumeX size={18} color={TEXT_MUTED} />}
            <span style={{ fontFamily: FONT_PIXEL, color: COLOR_ORANGE, fontSize: 10, textShadow: "1px 1px 0 #000" }}>
              EFEITOS SONOROS
            </span>
          </div>
          <RpgButton
            variant="toggle"
            color={COLOR_SUCCESS}
            isOn={sfxOn}
            onClick={() => setSfxOn(!sfxOn)}
          >
            {sfxOn ? "ON" : "OFF"}
          </RpgButton>
        </div>

        <VolumeSlider value={sfxVolume} onChange={handleSfxVolumeChange} disabled={!sfxOn} color={COLOR_ORANGE} label="Vol" />
      </div>
    </div>
  );
}

// ── Profile Settings Tab ─────────────────────────────────────────────────────
function ProfileSettings() {
  const [name, setName] = useState(loadPlayerName);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const trimmed = name.trim() || "Aventureiro";
    savePlayerName(trimmed);
    setName(trimmed);
    setSaved(true);
    audioManager.playClick("press");
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{
      background: BG_CARD, border: `1px solid rgba(42,46,80,0.8)`,
      borderRadius: RADIUS_XL, padding: "24px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <User size={18} color={ACCENT_GOLD} />
        <span style={{ fontFamily: FONT_PIXEL, color: ACCENT_GOLD, fontSize: 10, textShadow: "1px 1px 0 #000" }}>
          PERFIL
        </span>
      </div>

      {/* Name */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontFamily: FONT_BODY, color: RANK_NOVATO, fontSize: 18, display: "block", marginBottom: 8 }}>
          Nome do Aventureiro
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
          maxLength={20}
          placeholder="Seu nome..."
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
          {name.length}/20 caracteres
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
        <Save size={14} /> {saved ? "✓ SALVO!" : "SALVAR"}
      </button>
    </div>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
type SettingsTab = "sound" | "profile" | "account";

const SETTINGS_TABS: PixelTabDef<SettingsTab>[] = [
  { key: "sound",   Icon: Volume2, label: "SONS",   color: COLOR_MAGE    },
  { key: "profile", Icon: User,    label: "PERFIL", color: ACCENT_GOLD   },
  { key: "account", Icon: Shield,  label: "CONTA",  color: COLOR_WARRIOR },
];

export default function SettingsScreen() {
  const isDesktop = useIsDesktop();
  const [tab, setTab] = useState<SettingsTab>("sound");
  const { user, nick, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <PageShell icon={<Settings size={16} />} title="CONFIGURAÇÕES" accentColor={COLOR_WARRIOR}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <PixelTabs tabs={SETTINGS_TABS} active={tab} onSelect={setTab} style={{ marginBottom: 20 }} />

        {/* Content */}
        {tab === "sound" && <SoundSettings />}
        {tab === "profile" && <ProfileSettings />}
        {tab === "account" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Account Info */}
            <div style={{
              background: BG_CARD, border: `1px solid rgba(42,46,80,0.8)`,
              borderRadius: RADIUS_XL, padding: "24px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Shield size={18} color={COLOR_WARRIOR} />
                <span style={{ fontFamily: FONT_PIXEL, color: COLOR_WARRIOR, fontSize: 10, textShadow: "1px 1px 0 #000" }}>
                  CONTA
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {[
                  { label: "Email", value: user?.email ?? "—" },
                  { label: "Nick",  value: nick ? `@${nick}` : "Não definido" },
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
                <Save size={14} /> SINCRONIZAR AGORA
              </RpgButton>
            </div>

            {/* Logout */}
            <RpgButton
              variant="dashed"
              color="#E63946"
              fullWidth
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
            >
              <LogOut size={16} /> SAIR DA CONTA
            </RpgButton>
          </div>
        )}
      </div>
    </PageShell>
  );
}