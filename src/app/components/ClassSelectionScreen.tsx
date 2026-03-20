import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import { audioManager } from "../hooks/audioManager";
import { getEconomy, buySkin, selectSkin, SKIN_INFO, type SkinId } from "../data/economy";
import { useCampaign } from "../hooks/useCampaign";
import imgAvatarWarrior from "../../assets/profile_pic/profile_pic_warrior.png";
import imgAvatarMage    from "../../assets/profile_pic/profile_pic_mage.png";
import { useTheme } from "../contexts/PreferencesContext";

const SKIN_ORDER: SkinId[] = ["warrior_base", "warrior_aventureiro", "mage"];

function RivePreview({ skinId }: { skinId: SkinId }) {
  const [riveReady, setRiveReady] = useState(false);
  const onLoad = useCallback(() => setRiveReady(true), []);
  const info = SKIN_INFO[skinId];

  const { RiveComponent } = useRive({
    src: info.rivUrl,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.BottomCenter }),
    onLoad,
  });

  const fallbackSrc = info.fallbackImg === "mage" ? imgAvatarMage : imgAvatarWarrior;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {!riveReady && (
        <img
          src={fallbackSrc}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "contain", imageRendering: "pixelated",
            opacity: info.locked ? 0.3 : 0.75,
          }}
        />
      )}
      <RiveComponent
        style={{
          width: "100%", height: "100%", imageRendering: "pixelated",
          opacity: riveReady ? (info.locked ? 0.35 : 1) : 0,
          transition: "opacity 0.4s",
          filter: info.locked ? "grayscale(1)" : "none",
        }}
      />
    </div>
  );
}

export default function ClassSelectionScreen() {
  const navigate = useNavigate();
  const { BG_PAGE, BG_CARD, BG_DEEPEST, BORDER_SUBTLE, BORDER_ELEVATED, COLOR_DANGER, COLOR_SUCCESS, TEXT_LIGHT, TEXT_MUTED, TEXT_INACTIVE, TEXT_BODY, FONT_PIXEL, FONT_BODY, alpha } = useTheme();
  const { activeSkin: contextActiveSkin, setActiveSkin: ctxSetSkin, setNeedsClassPick } = useCampaign();
  const economy = getEconomy();

  const [selected,  setSelected]  = useState<SkinId>(
    (contextActiveSkin as SkinId | null) ?? economy.activeSkin ?? "warrior_base"
  );
  const [confirmed, setConfirmed] = useState(false);

  const handleSelect = (skinId: SkinId) => {
    if (SKIN_INFO[skinId].locked) return;
    audioManager.playClick("navigate");
    setSelected(skinId);
    setConfirmed(false);
  };

  const handleConfirm = () => {
    const info = SKIN_INFO[selected];
    if (info.locked) return;
    const econ = getEconomy();

    audioManager.playClick("press");
    if (econ.unlockedSkins.includes(selected)) {
      selectSkin(selected);
    } else {
      buySkin(selected);
    }
    ctxSetSkin(selected);
    setNeedsClassPick(false);
    setConfirmed(true);
    setTimeout(() => navigate(-1), 900);
  };

  const selInfo   = SKIN_INFO[selected];
  const economy2  = getEconomy();
  const canAfford = selInfo.locked ? false : (economy2.unlockedSkins.includes(selected) || economy2.coins >= selInfo.cost);
  const selColor  = selInfo.locked ? TEXT_INACTIVE : selInfo.color;

  return (
    <div style={{
      minHeight: "100vh",
      background: BG_PAGE,
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
        borderBottom: `1px solid ${BORDER_SUBTLE}`,
      }}>
        <button
          onClick={() => { audioManager.playClick("navigate"); navigate(-1); }}
          style={{
            background: "transparent", border: `1px solid ${BORDER_ELEVATED}`,
            borderRadius: 8, color: TEXT_MUTED, cursor: "pointer",
            padding: "6px 8px", display: "flex",
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <span style={{
          fontFamily: FONT_PIXEL,
          fontSize: 10, color: TEXT_LIGHT, letterSpacing: 1,
        }}>
          CHOOSE YOUR SKIN
        </span>
      </div>

      {/* Cards */}
      <div style={{
        display: "flex",
        gap: 10,
        padding: "20px 16px 0",
        maxWidth: 540,
        width: "100%",
        margin: "0 auto",
        animation: "clsFadeIn 0.35s ease both",
      }}>
        {SKIN_ORDER.map(skinId => {
          const info    = SKIN_INFO[skinId];
          const locked  = info.locked;
          const color   = locked ? TEXT_INACTIVE : info.color;
          const active  = contextActiveSkin === skinId;
          const picked  = selected === skinId;
          const owned   = economy.unlockedSkins.includes(skinId);

          return (
            <button
              key={skinId}
              onClick={() => handleSelect(skinId)}
              disabled={locked}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 0,
                background: picked && !locked ? `${color}0e` : BG_CARD,
                border: `2px solid ${picked && !locked ? color : locked ? BG_DEEPEST : BORDER_SUBTLE}`,
                borderRadius: 12,
                cursor: locked ? "not-allowed" : "pointer",
                outline: "none",
                overflow: "hidden",
                transition: "border-color 0.18s, background 0.18s",
                opacity: locked ? 0.6 : 1,
              }}
            >
              {/* Animation */}
              <div style={{
                width: "100%",
                aspectRatio: "1 / 1",
                background: BG_DEEPEST,
                position: "relative",
              }}>
                <RivePreview skinId={skinId} />

                {/* Lock overlay */}
                {locked && (
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    background: alpha(BG_DEEPEST, "8c"), gap: 4,
                  }}>
                    <Lock size={18} color={TEXT_INACTIVE} />
                    <span style={{ fontFamily: FONT_PIXEL, fontSize: 5, color: TEXT_INACTIVE }}>
                      COMING SOON
                    </span>
                  </div>
                )}

                {/* Active badge */}
                {active && !locked && (
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    background: color, borderRadius: 5,
                    padding: "3px 7px",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <CheckCircle2 size={9} color={BG_CARD} />
                    <span style={{ fontFamily: FONT_PIXEL, fontSize: 5, color: BG_CARD }}>ACTIVE</span>
                  </div>
                )}

                {/* Coin cost badge */}
                {!locked && !owned && info.cost > 0 && (
                  <div style={{
                    position: "absolute", bottom: 6, right: 6,
                    background: BG_CARD, border: `1px solid ${color}`,
                    padding: "2px 5px", borderRadius: 4,
                    fontFamily: FONT_BODY, fontSize: 12, color,
                  }}>
                    🪙 {info.cost}
                  </div>
                )}
              </div>

              {/* Label */}
              <div style={{ padding: "10px 10px 12px", width: "100%", textAlign: "center" }}>
                <div style={{
                  fontFamily: FONT_PIXEL,
                  fontSize: 8,
                  color: picked && !locked ? color : locked ? TEXT_INACTIVE : TEXT_BODY,
                  marginBottom: 4,
                  transition: "color 0.18s",
                }}>
                  {info.label.toUpperCase()}
                </div>
                <div style={{
                  fontFamily: FONT_BODY,
                  fontSize: 14,
                  color: locked ? TEXT_INACTIVE : owned ? COLOR_SUCCESS : color,
                }}>
                  {locked ? "LOCKED" : owned ? (skinId === "warrior_base" ? "DEFAULT" : "OWNED") : `${info.cost} coins`}
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
          disabled={selInfo.locked || confirmed || !canAfford}
          style={{
            width: "100%",
            padding: "14px 0",
            fontFamily: FONT_PIXEL,
            fontSize: 10,
            color: confirmed ? COLOR_SUCCESS : selInfo.locked ? TEXT_INACTIVE : !canAfford ? COLOR_DANGER : BG_CARD,
            background: confirmed
              ? alpha(COLOR_SUCCESS, "14")
              : selInfo.locked ? BG_DEEPEST
              : !canAfford ? alpha(COLOR_DANGER, "14")
              : selColor,
            border: confirmed
              ? `2px solid ${COLOR_SUCCESS}`
              : selInfo.locked ? `1px solid ${BG_DEEPEST}`
              : !canAfford ? `1px solid ${COLOR_DANGER}`
              : `1px solid ${selColor}`,
            borderRadius: 10,
            cursor: !selInfo.locked && canAfford && !confirmed ? "pointer" : "default",
            transition: "all 0.18s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {confirmed ? (
            <><CheckCircle2 size={13} /> CONFIRMED!</>
          ) : selInfo.locked ? (
            "LOCKED"
          ) : !canAfford ? (
            `NOT ENOUGH COINS`
          ) : economy2.unlockedSkins.includes(selected) ? (
            <>▶ PLAY AS {selInfo.label.toUpperCase()}</>
          ) : (
            <>▶ UNLOCK ({selInfo.cost} coins)</>
          )}
        </button>
        <p style={{
          textAlign: "center",
          fontFamily: FONT_BODY,
          color: TEXT_INACTIVE, fontSize: 15, marginTop: 10,
        }}>
          You can change your skin at any time
        </p>
      </div>
    </div>
  );
}
