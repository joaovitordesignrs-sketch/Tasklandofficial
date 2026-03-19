/**
 * AudioControlPanel – Pixel-art styled popup panel for
 * controlling background music and SFX settings.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { Music, Volume2, VolumeX, Settings } from "lucide-react";
import { useAudioSettings } from "../hooks/useAudioSettings";
import { audioManager } from "../hooks/audioManager";
import { useTheme } from "../contexts/PreferencesContext";

export function AudioControlPanel() {
  const { BG_CARD, BG_PAGE, BORDER_ELEVATED, TEXT_LIGHT, TEXT_MUTED, TEXT_INACTIVE, alpha } = useTheme();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const sfxPreviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    musicOn, musicVolume,
    sfxOn, sfxVolume,
    trackName,
    setMusicOn, setMusicVolume,
    setSfxOn, setSfxVolume,
    playPreviewBeep,
  } = useAudioSettings();

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSfxVolumeChange = useCallback((v: number) => {
    setSfxVolume(v);
    if (sfxPreviewTimer.current) clearTimeout(sfxPreviewTimer.current);
    sfxPreviewTimer.current = setTimeout(() => { playPreviewBeep(); }, 150);
  }, [setSfxVolume, playPreviewBeep]);

  function handleOpen() {
    audioManager.ensureStarted();
    audioManager.playClick("tap");
    setOpen((p) => !p);
  }

  const hasAudio = musicOn || sfxOn;

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      {/* Toggle button */}
      <button
        onClick={handleOpen}
        title="Audio Settings"
        style={{
          background: "none",
          border: `2px solid ${open ? "#e39f64" : BORDER_ELEVATED}`,
          color: hasAudio ? "#06FFA5" : TEXT_MUTED,
          padding: "6px 8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Settings size={14} />
        {musicOn && (
          <div style={{
            position: "absolute", top: 2, right: 2,
            width: 4, height: 4, background: "#06FFA5",
          }} />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          zIndex: 999,
          width: 252,
          background: BG_CARD,
          border: `1px solid ${alpha(BORDER_ELEVATED, "cc")}`,
          borderRadius: 10,
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          fontFamily: "'VT323', monospace",
          padding: 0,
        }}>
          {/* Header */}
          <div style={{
            background: BG_PAGE,
            borderBottom: `1px solid ${BORDER_ELEVATED}`,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <Settings size={12} color="#e39f64" />
            <span style={{
              fontFamily: "'Press Start 2P', monospace",
              color: "#e39f64", fontSize: 8, textShadow: "1px 1px 0 rgba(0,0,0,0.2)",
            }}>
              AUDIO
            </span>
          </div>

          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* ── MUSIC SECTION ── */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Music size={13} color={musicOn ? "#c084fc" : TEXT_MUTED} />
                  <span style={{ color: TEXT_LIGHT, fontSize: 17 }}>Music</span>
                </div>
                <button
                  onClick={() => setMusicOn(!musicOn)}
                  style={{
                    background: musicOn ? "#06FFA5" : BORDER_ELEVATED,
                    border: "2px solid " + (musicOn ? "#06FFA5" : TEXT_MUTED),
                    color: musicOn ? "#0d1024" : TEXT_MUTED,
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 7, padding: "3px 8px", cursor: "pointer", minWidth: 38,
                  }}
                >
                  {musicOn ? "ON" : "OFF"}
                </button>
              </div>

              {/* Now playing ambient indicator */}
              <div style={{
                display: "flex", alignItems: "center", gap: 7,
                background: BG_PAGE, border: `1px solid ${BORDER_ELEVATED}`,
                padding: "6px 10px", marginBottom: 8, borderRadius: 4,
                opacity: musicOn ? 1 : 0.35,
              }}>
                {/* Animated music bars */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 14, flexShrink: 0 }}>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 3,
                        background: musicOn ? "#c084fc" : TEXT_INACTIVE,
                        borderRadius: 1,
                        animation: musicOn ? `bgmBar${i} ${0.6 + i * 0.15}s ease-in-out infinite alternate` : "none",
                        height: musicOn ? undefined : 4,
                      }}
                    />
                  ))}
                </div>
                <span style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: 15, color: musicOn ? "#c084fc" : TEXT_INACTIVE,
                  flex: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                }}>
                  {musicOn ? trackName : "—"}
                </span>
              </div>

              <VolumeSlider
                value={musicVolume}
                onChange={setMusicVolume}
                disabled={!musicOn}
                color="#c084fc"
                label="Vol"
                bgColor={BG_PAGE}
                borderColor={BORDER_ELEVATED}
                mutedColor={TEXT_MUTED}
              />
            </div>

            <div style={{ height: 2, background: BORDER_ELEVATED }} />

            {/* ── SFX SECTION ── */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {sfxOn
                    ? <Volume2 size={13} color="#FF6B35" />
                    : <VolumeX size={13} color={TEXT_MUTED} />
                  }
                  <span style={{ color: TEXT_LIGHT, fontSize: 17 }}>Sound Effects</span>
                </div>
                <button
                  onClick={() => setSfxOn(!sfxOn)}
                  style={{
                    background: sfxOn ? "#06FFA5" : BORDER_ELEVATED,
                    border: "2px solid " + (sfxOn ? "#06FFA5" : TEXT_MUTED),
                    color: sfxOn ? "#0d1024" : TEXT_MUTED,
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 7, padding: "3px 8px", cursor: "pointer", minWidth: 38,
                  }}
                >
                  {sfxOn ? "ON" : "OFF"}
                </button>
              </div>
              <VolumeSlider
                value={sfxVolume}
                onChange={handleSfxVolumeChange}
                disabled={!sfxOn}
                color="#FF6B35"
                label="Vol"
                bgColor={BG_PAGE}
                borderColor={BORDER_ELEVATED}
                mutedColor={TEXT_MUTED}
              />
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${BORDER_ELEVATED}`, padding: "6px 14px", textAlign: "center" }}>
            <span style={{ color: TEXT_MUTED, fontSize: 13 }}>Click outside to close</span>
          </div>

          {/* Keyframes for animated bars */}
          <style>{`
            @keyframes bgmBar1 { from { height: 4px } to { height: 13px } }
            @keyframes bgmBar2 { from { height: 8px } to { height: 5px  } }
            @keyframes bgmBar3 { from { height: 3px } to { height: 11px } }
          `}</style>
        </div>
      )}
    </div>
  );
}

// ── Pixel-art Volume Slider ──────────────────────────────────────────────────
function VolumeSlider({
  value, onChange, disabled, color, label, bgColor, borderColor, mutedColor,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
  color: string;
  label: string;
  bgColor: string;
  borderColor: string;
  mutedColor: string;
}) {
  const pct = Math.round(value * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: disabled ? 0.35 : 1 }}>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: mutedColor, minWidth: 22 }}>
        {label}
      </span>
      <div style={{ flex: 1, position: "relative", height: 18, display: "flex", alignItems: "center" }}>
        <div style={{
          position: "absolute", width: "100%", height: 8,
          background: bgColor, border: `1px solid ${borderColor}`,
        }}>
          <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.1s" }} />
        </div>
        <input
          type="range" min={0} max={100} value={pct} disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          style={{
            position: "absolute", width: "100%", height: 18,
            opacity: 0, cursor: disabled ? "default" : "pointer", margin: 0,
          }}
        />
      </div>
      <span style={{
        fontFamily: "'VT323', monospace", fontSize: 15,
        color: disabled ? mutedColor : color, minWidth: 30, textAlign: "right",
      }}>
        {pct}%
      </span>
    </div>
  );
}
