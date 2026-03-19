import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import { audioManager } from "../hooks/audioManager";
import { getEconomy, selectClass, buyClass, CLASS_INFO, type CharacterClass } from "../data/economy";
import { useCampaign } from "../hooks/useCampaign";
import imgAvatarWarrior from "figma:asset/97194cdd6dc3ec8040cc985dae2b65b2314dcf1e.png";
import imgAvatarMage    from "figma:asset/5c09b71e009581d58103f7df9949281a05a710d1.png";

const RIV_URLS: Record<CharacterClass, string> = {
  guerreiro: "https://raw.githubusercontent.com/joaovitordesignrs-sketch/taskland/main/taskland_animations_warrior_base.riv",
  mago:      "https://raw.githubusercontent.com/joaovitordesignrs-sketch/taskland/main/taskland_animations_mage_base.riv",
};

const CLASS_COLOR: Record<CharacterClass, string> = {
  guerreiro: "#E63946",
  mago:      "#60a5fa",
};

function RivePreview({ cls }: { cls: CharacterClass }) {
  const [riveReady, setRiveReady] = useState(false);
  const onLoad = useCallback(() => setRiveReady(true), []);

  const { RiveComponent } = useRive({
    src: RIV_URLS[cls],
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.BottomCenter }),
    onLoad,
  });

  const fallbackSrc = cls === "mago" ? imgAvatarMage : imgAvatarWarrior;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {!riveReady && (
        <img
          src={fallbackSrc}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "contain", imageRendering: "pixelated", opacity: 0.75,
          }}
        />
      )}
      <RiveComponent
        style={{ width: "100%", height: "100%", imageRendering: "pixelated", opacity: riveReady ? 1 : 0, transition: "opacity 0.4s" }}
      />
    </div>
  );
}

export default function ClassSelectionScreen() {
  const navigate = useNavigate();
  const { selectedClass: contextSelectedClass, setSelectedClass: ctxSetClass, setNeedsClassPick } = useCampaign();
  const economy = getEconomy();

  const [selected,  setSelected]  = useState<CharacterClass | null>(
    (contextSelectedClass as CharacterClass | null) ?? economy.selectedClass
  );
  const [confirmed, setConfirmed] = useState(false);

  const handleSelect = (cls: CharacterClass) => {
    audioManager.playClick("navigate");
    setSelected(cls);
    setConfirmed(false);
  };

  const handleConfirm = () => {
    if (!selected) return;
    audioManager.playClick("press");
    const econ = getEconomy();
    if (!econ.unlockedClasses.includes(selected)) buyClass(selected);
    else selectClass(selected);
    ctxSetClass(selected);
    setNeedsClassPick(false);
    setConfirmed(true);
    setTimeout(() => navigate(-1), 900);
  };

  const selColor = selected ? CLASS_COLOR[selected] : "#f0c040";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07090f",
      display: "flex",
      flexDirection: "column",
      paddingBottom: 80,
    }}>
      <style>{`
        @keyframes clsFadeIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 16px",
        borderBottom: "1px solid #1a1e37",
      }}>
        <button
          onClick={() => { audioManager.playClick("navigate"); navigate(-1); }}
          style={{
            background: "transparent", border: "1px solid #2a2e50",
            borderRadius: 8, color: "#5a6080", cursor: "pointer",
            padding: "6px 8px", display: "flex",
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <span style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 10, color: "#c0c8e0", letterSpacing: 1,
        }}>
          ESCOLHA SUA CLASSE
        </span>
      </div>

      {/* Cards */}
      <div style={{
        display: "flex",
        gap: 12,
        padding: "20px 16px 0",
        maxWidth: 540,
        width: "100%",
        margin: "0 auto",
        animation: "clsFadeIn 0.35s ease both",
      }}>
        {(["guerreiro", "mago"] as CharacterClass[]).map(cls => {
          const info    = CLASS_INFO[cls];
          const color   = CLASS_COLOR[cls];
          const active  = contextSelectedClass === cls;
          const picked  = selected === cls;

          return (
            <button
              key={cls}
              onClick={() => handleSelect(cls)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 0,
                background: picked ? `${color}0e` : "#0d1024",
                border: `2px solid ${picked ? color : "#1f254f"}`,
                borderRadius: 12,
                cursor: "pointer",
                outline: "none",
                overflow: "hidden",
                transition: "border-color 0.18s, background 0.18s",
              }}
            >
              {/* Animation */}
              <div style={{
                width: "100%",
                aspectRatio: "1 / 1",
                background: "#060818",
                position: "relative",
              }}>
                <RivePreview cls={cls} />
                {active && (
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    background: color,
                    borderRadius: 5,
                    padding: "3px 7px",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <CheckCircle2 size={9} color="#0d1024" />
                    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: "#0d1024" }}>ATIVO</span>
                  </div>
                )}
              </div>

              {/* Label + habilidade */}
              <div style={{ padding: "12px 14px 14px", width: "100%", textAlign: "center" }}>
                <div style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 9,
                  color: picked ? color : "#8a9fba",
                  marginBottom: 6,
                  transition: "color 0.18s",
                }}>
                  {info.label.toUpperCase()}
                </div>
                <div style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: 16,
                  color: picked ? color : "#4a5a70",
                  lineHeight: 1.3,
                  transition: "color 0.18s",
                }}>
                  {info.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm button */}
      <div style={{
        padding: "20px 16px 0",
        maxWidth: 540,
        width: "100%",
        margin: "0 auto",
        animation: "clsFadeIn 0.4s 0.1s ease both",
      }}>
        <button
          onClick={handleConfirm}
          disabled={!selected || confirmed}
          style={{
            width: "100%",
            padding: "14px 0",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 10,
            color: confirmed ? "#06FFA5" : selected ? "#0d1024" : "#3a4060",
            background: confirmed
              ? "rgba(6,255,165,0.08)"
              : selected
              ? selColor
              : "#0e1224",
            border: confirmed
              ? "2px solid #06FFA5"
              : selected
              ? `1px solid ${selColor}`
              : "1px solid #2a2e50",
            borderRadius: 10,
            cursor: selected && !confirmed ? "pointer" : "default",
            transition: "all 0.18s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {confirmed ? (
            <><CheckCircle2 size={13} /> CONFIRMADO!</>
          ) : selected ? (
            <>▶ JOGAR COMO {CLASS_INFO[selected].label.toUpperCase()}</>
          ) : (
            "SELECIONE UMA CLASSE"
          )}
        </button>
        <p style={{
          textAlign: "center",
          fontFamily: "'VT323', monospace",
          color: "#2a3050", fontSize: 15, marginTop: 10,
        }}>
          Pode trocar de classe a qualquer momento
        </p>
      </div>
    </div>
  );
}
