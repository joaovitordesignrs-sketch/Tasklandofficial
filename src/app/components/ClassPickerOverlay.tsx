// ClassPickerOverlay.tsx
// Skin selection overlay shown on first launch — 3 skins with lock states.

import { useState, useEffect, useCallback } from 'react';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import { buySkin, selectSkin, getEconomy, SKIN_INFO, type SkinId } from '../data/economy';
import { audioManager } from '../hooks/audioManager';
import { Lock } from 'lucide-react';
import imgAvatarWarrior from '../../assets/profile_pic/profile_pic_warrior.png';
import imgAvatarMage    from '../../assets/profile_pic/profile_pic_mage.png';

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
  const info = SKIN_INFO[skinId];
  const locked = info.locked;
  const color = locked ? '#3a4060' : info.color;
  const canClick = !locked;

  return (
    <button
      onClick={canClick ? onSelect : undefined}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: isSelected ? `${color}14` : '#0a0c1a',
        border: `1px solid ${isSelected ? color : locked ? '#1a1e30' : '#2a2e50'}`,
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
      <div style={{ width: '100%', aspectRatio: '1 / 1', background: '#060818', position: 'relative' }}>
        <SkinRivePreview skinId={skinId} />

        {/* Lock overlay */}
        {locked && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(4,6,18,0.55)',
            gap: 6,
          }}>
            <Lock size={22} color="#3a4060" />
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: '#3a4060', letterSpacing: 1 }}>
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
            fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#0d1024',
          }}>
            ✓
          </div>
        )}

        {/* Coin cost badge for unlockable skins */}
        {!locked && !unlocked && info.cost > 0 && (
          <div style={{
            position: 'absolute', bottom: 6, right: 6,
            background: '#0d1024', border: `1px solid ${info.color}`,
            padding: '2px 6px', borderRadius: 4,
            fontFamily: "'VT323', monospace", fontSize: 13, color: info.color,
          }}>
            🪙 {info.cost}
          </div>
        )}

        {/* Unlocked badge */}
        {!locked && unlocked && skinId !== 'warrior_base' && (
          <div style={{
            position: 'absolute', bottom: 6, right: 6,
            background: '#0d1024', border: `1px solid #06FFA5`,
            padding: '2px 6px', borderRadius: 4,
            fontFamily: "'VT323', monospace", fontSize: 13, color: '#06FFA5',
          }}>
            OWNED
          </div>
        )}
      </div>

      {/* Name */}
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 'clamp(7px, 2vw, 9px)',
        color: isSelected && !locked ? color : locked ? '#2a3050' : '#d0d4e8',
        marginTop: 10, marginBottom: 4, letterSpacing: 1,
      }}>
        {info.label.toUpperCase()}
      </div>

      {/* Cost or status line */}
      <div style={{
        fontFamily: "'VT323', monospace",
        fontSize: 14,
        color: locked ? '#2a3050' : unlocked ? '#06FFA5' : info.color,
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

  const economy = getEconomy();
  const selInfo = SKIN_INFO[selected];
  const canAfford = selInfo.locked ? false : (economy.unlockedSkins.includes(selected) || economy.coins >= selInfo.cost);
  const selColor = selInfo.locked ? '#3a4060' : selInfo.color;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'rgba(4,6,18,0.97)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.35s ease',
        fontFamily: "'VT323', monospace",
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
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(9px, 2.8vw, 13px)',
            color: '#f0c040',
            textShadow: '2px 2px 0 #000, 0 0 16px rgba(240,192,64,0.25)',
            margin: 0, lineHeight: 1.6,
          }}>
            CHOOSE YOUR SKIN
          </h1>
          <p style={{ color: '#3a4060', fontSize: 17, margin: '4px 0 0', fontFamily: "'VT323', monospace" }}>
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
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(9px, 2.5vw, 11px)',
            letterSpacing: 1,
            color: confirmed ? '#06FFA5' : SKIN_INFO[selected].locked ? '#2a3050' : !canAfford ? '#E63946' : '#0d1024',
            background: confirmed
              ? 'rgba(6,255,165,0.1)'
              : SKIN_INFO[selected].locked ? '#0a0c1a'
              : !canAfford ? 'rgba(230,57,70,0.08)'
              : selColor,
            border: confirmed
              ? '3px solid #06FFA5'
              : SKIN_INFO[selected].locked ? '1px solid #1a1e30'
              : !canAfford ? '1px solid #E63946'
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
