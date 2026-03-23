// ClassPickerOverlay.tsx
// Skin selection overlay shown on first launch — 3 skins with lock states.

import { useState, useEffect, useCallback } from 'react';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import { buySkin, selectSkin, getEconomy, SKIN_INFO, type SkinId } from '../data/economy';
import { audioManager } from '../hooks/audioManager';
import { Lock } from 'lucide-react';
import imgAvatarWarrior from '../../assets/profile_pic/profile_pic_warrior.webp';
import imgAvatarMage    from '../../assets/profile_pic/profile_pic_mage.webp';
import { useTheme } from '../contexts/PreferencesContext';

const SKIN_ORDER: SkinId[] = ['warrior_base', 'warrior_aventureiro', 'mage'];

// ── Mini Rive preview ─────────────────────────────────────────────────────────
function SkinRivePreview({ skinId }: { skinId: SkinId }) {
  const [riveReady, setRiveReady] = useState(false);
  const onLoad = useCallback(() => setRiveReady(true), []);
  const info = SKIN_INFO[skinId];

  const { RiveComponent } = useRive({
    src: info.rivUrl,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.BottomCenter }),
    onLoad,
  });

  const fallbackSrc = info.fallbackImg === 'mage' ? imgAvatarMage : imgAvatarWarrior;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {!riveReady && (
        <img
          src={fallbackSrc}
          alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'contain', imageRendering: 'pixelated',
            opacity: info.locked ? 0.3 : 0.75,
          }}
        />
      )}
      <RiveComponent
        style={{
          width: '100%', height: '100%', imageRendering: 'pixelated',
          opacity: riveReady ? (info.locked ? 0.35 : 1) : 0,
          transition: 'opacity 0.4s',
          filter: info.locked ? 'grayscale(1)' : 'none',
        }}
      />
    </div>
  );
}

// ── Skin Card ─────────────────────────────────────────────────────────────────
function SkinCard({
  skinId, isSelected, onSelect, unlocked,
}: {
  skinId: SkinId; isSelected: boolean; onSelect: () => void; unlocked: boolean;
}) {
  const { BG_CARD, BG_DEEPEST, BORDER_ELEVATED, COLOR_SUCCESS, COLOR_DANGER, TEXT_INACTIVE, TEXT_LIGHT, FONT_PIXEL, FONT_BODY, alpha } = useTheme();
  const info = SKIN_INFO[skinId];
  const locked = info.locked;
  const color = locked ? TEXT_INACTIVE : info.color;
  const canClick = !locked;

  return (
    <button
      onClick={canClick ? onSelect : undefined}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: isSelected ? `${color}14` : BG_DEEPEST,
        border: `1px solid ${isSelected ? color : locked ? BG_CARD : BORDER_ELEVATED}`,
        boxShadow: isSelected ? `0 0 20px ${color}44` : 'none',
        cursor: canClick ? 'pointer' : 'not-allowed',
        padding: '0 0 12px',
        outline: 'none',
        transition: 'all 0.18s ease',
        overflow: 'hidden',
        borderRadius: 10,
        opacity: locked ? 0.65 : 1,
      }}
    >
      {/* Animation area */}
      <div style={{ width: '100%', aspectRatio: '1 / 1', background: BG_DEEPEST, position: 'relative' }}>
        <SkinRivePreview skinId={skinId} />

        {/* Lock overlay */}
        {locked && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: alpha(BG_DEEPEST, '8c'),
            gap: 6,
          }}>
            <Lock size={22} color={TEXT_INACTIVE} />
            <span style={{ fontFamily: FONT_PIXEL, fontSize: 6, color: TEXT_INACTIVE, letterSpacing: 1 }}>
              COMING SOON
            </span>
          </div>
        )}

        {/* Active checkmark */}
        {isSelected && !locked && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: color, width: 20, height: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT_PIXEL, fontSize: 9, color: BG_CARD,
          }}>
            ✓
          </div>
        )}

        {/* Coin cost badge for unlockable skins */}
        {!locked && !unlocked && info.cost > 0 && (
          <div style={{
            position: 'absolute', bottom: 6, right: 6,
            background: BG_CARD, border: `1px solid ${info.color}`,
            padding: '2px 6px', borderRadius: 4,
            fontFamily: FONT_BODY, fontSize: 13, color: info.color,
          }}>
            🪙 {info.cost}
          </div>
        )}

        {/* Unlocked badge */}
        {!locked && unlocked && skinId !== 'warrior_base' && (
          <div style={{
            position: 'absolute', bottom: 6, right: 6,
            background: BG_CARD, border: `1px solid ${COLOR_SUCCESS}`,
            padding: '2px 6px', borderRadius: 4,
            fontFamily: FONT_BODY, fontSize: 13, color: COLOR_SUCCESS,
          }}>
            OWNED
          </div>
        )}
      </div>

      {/* Name */}
      <div style={{
        fontFamily: FONT_PIXEL,
        fontSize: 'clamp(7px, 2vw, 9px)',
        color: isSelected && !locked ? color : locked ? TEXT_INACTIVE : TEXT_LIGHT,
        marginTop: 10, marginBottom: 4, letterSpacing: 1,
      }}>
        {info.label.toUpperCase()}
      </div>

      {/* Cost or status line */}
      <div style={{
        fontFamily: FONT_BODY,
        fontSize: 14,
        color: locked ? TEXT_INACTIVE : unlocked ? COLOR_SUCCESS : info.color,
        letterSpacing: 0.5,
      }}>
        {locked ? 'LOCKED' : unlocked ? (skinId === 'warrior_base' ? 'DEFAULT' : 'UNLOCKED') : `${info.cost} coins`}
      </div>
    </button>
  );
}

// ── Main Overlay ──────────────────────────────────────────────────────────────
interface ClassPickerOverlayProps {
  onConfirm: (skin: SkinId) => void;
}

export function ClassPickerOverlay({ onConfirm }: ClassPickerOverlayProps) {
  const { BG_DEEPEST, BG_CARD, COLOR_SUCCESS, COLOR_DANGER, COLOR_WARNING, TEXT_INACTIVE, FONT_PIXEL, FONT_BODY, alpha } = useTheme();
  const econ = getEconomy();
  const [selected,  setSelected]  = useState<SkinId>('warrior_base');
  const [confirmed, setConfirmed] = useState(false);
  const [visible,   setVisible]   = useState(false);
  const [coins,     setCoins]     = useState(econ.coins);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  function handleSelect(skin: SkinId) {
    if (confirmed || SKIN_INFO[skin].locked) return;
    audioManager.playClick('navigate');
    setSelected(skin);
  }

  function handleConfirm() {
    if (confirmed) return;
    const info = SKIN_INFO[selected];
    const economy = getEconomy();

    // Check if player can afford it

    audioManager.playClick('press');
    setConfirmed(true);

    if (economy.unlockedSkins.includes(selected)) {
      selectSkin(selected);
    } else {
      buySkin(selected);
    }
    setCoins(getEconomy().coins);
    setTimeout(() => onConfirm(selected), 800);
  }

  void coins;

  const economy = getEconomy();
  const selInfo = SKIN_INFO[selected];
  const canAfford = selInfo.locked ? false : (economy.unlockedSkins.includes(selected) || economy.coins >= selInfo.cost);
  const selColor = selInfo.locked ? TEXT_INACTIVE : selInfo.color;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: alpha(BG_DEEPEST, 'f7'),
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.35s ease',
        fontFamily: FONT_BODY,
        padding: '20px 16px',
        overflowY: 'auto',
      }}
    >
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.01) 0px,transparent 1px,transparent 3px)',
      }} />

      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 50%, ${selColor}22 0%, transparent 60%)`,
        transition: 'background 0.4s ease',
      }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 500 }}>

        {/* ── Title ── */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <h1 style={{
            fontFamily: FONT_PIXEL,
            fontSize: 'clamp(9px, 2.8vw, 13px)',
            color: COLOR_WARNING,
            textShadow: '2px 2px 0 #000, 0 0 16px rgba(240,192,64,0.25)',
            margin: 0, lineHeight: 1.6,
          }}>
            CHOOSE YOUR SKIN
          </h1>
          <p style={{ color: TEXT_INACTIVE, fontSize: 17, margin: '4px 0 0', fontFamily: FONT_BODY }}>
            Your hero's appearance. More skins coming soon.
          </p>
        </div>

        {/* ── Three skin cards ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {SKIN_ORDER.map(skinId => (
            <SkinCard
              key={skinId}
              skinId={skinId}
              isSelected={selected === skinId}
              onSelect={() => handleSelect(skinId)}
              unlocked={economy.unlockedSkins.includes(skinId)}
            />
          ))}
        </div>

        {/* ── Confirm button ── */}
        <button
          onClick={handleConfirm}
          disabled={SKIN_INFO[selected].locked || confirmed || !canAfford}
          style={{
            width: '100%',
            padding: '15px 0',
            fontFamily: FONT_PIXEL,
            fontSize: 'clamp(9px, 2.5vw, 11px)',
            letterSpacing: 1,
            color: confirmed ? COLOR_SUCCESS : SKIN_INFO[selected].locked ? TEXT_INACTIVE : !canAfford ? COLOR_DANGER : BG_CARD,
            background: confirmed
              ? alpha(COLOR_SUCCESS, '1a')
              : SKIN_INFO[selected].locked ? BG_DEEPEST
              : !canAfford ? alpha(COLOR_DANGER, '14')
              : selColor,
            border: confirmed
              ? `3px solid ${COLOR_SUCCESS}`
              : SKIN_INFO[selected].locked ? `1px solid ${BG_DEEPEST}`
              : !canAfford ? `1px solid ${COLOR_DANGER}`
              : `1px solid ${selColor}`,
            boxShadow: !SKIN_INFO[selected].locked && canAfford && !confirmed ? `0 0 18px ${selColor}44` : 'none',
            cursor: !SKIN_INFO[selected].locked && canAfford && !confirmed ? 'pointer' : 'default',
            transition: 'all 0.2s',
          }}
        >
          {confirmed
            ? `✦ ${SKIN_INFO[selected].label.toUpperCase()} CONFIRMED! ✦`
            : SKIN_INFO[selected].locked
              ? 'LOCKED'
              : !canAfford
                ? `NOT ENOUGH COINS (need ${selInfo.cost})`
                : economy.unlockedSkins.includes(selected)
                  ? `PLAY AS ${SKIN_INFO[selected].label.toUpperCase()} ▶`
                  : `UNLOCK & PLAY (${selInfo.cost} coins) ▶`}
        </button>
      </div>
    </div>
  );
}
