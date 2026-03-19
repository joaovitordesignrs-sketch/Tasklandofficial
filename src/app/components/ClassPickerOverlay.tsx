// ClassPickerOverlay.tsx
// Simple two-card class selection overlay with live Rive idle animations.

import { useState, useEffect, useCallback } from 'react';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import { buyClass, CLASS_INFO, type CharacterClass } from '../data/economy';
import { audioManager } from '../hooks/audioManager';
import { PixelIcon } from './ui/PixelIcon';
import imgAvatarWarrior from 'figma:asset/97194cdd6dc3ec8040cc985dae2b65b2314dcf1e.png';
import imgAvatarMage    from 'figma:asset/5c09b71e009581d58103f7df9949281a05a710d1.png';

const RIV_URLS: Record<CharacterClass, string> = {
  guerreiro: 'https://raw.githubusercontent.com/joaovitordesignrs-sketch/taskland/main/taskland_animations_warrior_base.riv',
  mago:      'https://raw.githubusercontent.com/joaovitordesignrs-sketch/taskland/main/taskland_animations_mage_base.riv',
};

const CLASS_COLORS: Record<CharacterClass, { color: string; glow: string }> = {
  mago:      { color: '#60a5fa', glow: 'rgba(96,165,250,0.35)' },
  guerreiro: { color: '#E63946', glow: 'rgba(230,57,70,0.35)'  },
};

// ── Mini Rive preview ─────────────────────────────────────────────────────────
function ClassRivePreview({ cls }: { cls: CharacterClass }) {
  const [riveReady, setRiveReady] = useState(false);
  const onLoad = useCallback(() => setRiveReady(true), []);

  const { RiveComponent } = useRive({
    src: RIV_URLS[cls],
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.BottomCenter }),
    onLoad,
  });

  const fallbackSrc = cls === 'mago' ? imgAvatarMage : imgAvatarWarrior;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {!riveReady && (
        <img
          src={fallbackSrc}
          alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'contain', imageRendering: 'pixelated', opacity: 0.75,
          }}
        />
      )}
      <RiveComponent
        style={{ width: '100%', height: '100%', imageRendering: 'pixelated', opacity: riveReady ? 1 : 0, transition: 'opacity 0.4s' }}
      />
    </div>
  );
}

// ── Class Card ────────────────────────────────────────────────────────────────
function ClassCard({
  cls,
  isSelected,
  onSelect,
  disabled,
}: {
  cls: CharacterClass;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  const { color, glow } = CLASS_COLORS[cls];
  const info = CLASS_INFO[cls];

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: isSelected ? `${color}14` : '#0a0c1a',
        border: `1px solid ${isSelected ? color : '#2a2e50'}`,
        boxShadow: isSelected ? `0 0 20px ${glow}44` : 'none',
        cursor: disabled ? 'default' : 'pointer',
        padding: '0 0 16px',
        outline: 'none',
        transition: 'all 0.18s ease',
        overflow: 'hidden',
        borderRadius: 10,
      }}
    >
      {/* Rive animation area */}
      <div style={{ width: '100%', aspectRatio: '1 / 1', background: '#060818', position: 'relative' }}>
        <ClassRivePreview cls={cls} />

        {/* Selected checkmark */}
        {isSelected && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: color, width: 20, height: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#0d1024',
          }}>
            ✓
          </div>
        )}
      </div>

      {/* Name */}
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 'clamp(9px, 2.5vw, 11px)',
        color: isSelected ? color : '#d0d4e8',
        textShadow: isSelected ? `0 0 10px ${glow}` : 'none',
        marginTop: 14, marginBottom: 6,
        letterSpacing: 1,
      }}>
        {info.icon && <PixelIcon name={info.icon} size={14} color={isSelected ? color : '#d0d4e8'} />} {info.label.toUpperCase()}
      </div>

      {/* Short description */}
      <div style={{
        fontFamily: "'VT323', monospace",
        fontSize: 16,
        color: '#6a7890',
        textAlign: 'center',
        padding: '0 12px',
        lineHeight: 1.3,
      }}>
        {info.desc}
      </div>
    </button>
  );
}

// ── Main Overlay ──────────────────────────────────────────────────────────────
interface ClassPickerOverlayProps {
  onConfirm: (cls: CharacterClass) => void;
}

export function ClassPickerOverlay({ onConfirm }: ClassPickerOverlayProps) {
  const [selected, setSelected] = useState<CharacterClass | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  function handleSelect(cls: CharacterClass) {
    if (confirmed) return;
    audioManager.playClick('navigate');
    setSelected(cls);
  }

  function handleConfirm() {
    if (!selected || confirmed) return;
    audioManager.playClick('press');
    setConfirmed(true);
    buyClass(selected);
    setTimeout(() => onConfirm(selected), 800);
  }

  const selColor = selected ? CLASS_COLORS[selected].color : '#f0c040';

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
      {selected && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse at ${selected === 'mago' ? '35%' : '65%'} 50%, ${CLASS_COLORS[selected].glow} 0%, transparent 60%)`,
          transition: 'background 0.4s ease',
        }} />
      )}

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
            ESCOLHA SEU HERÓI
          </h1>
          <p style={{ color: '#3a4060', fontSize: 17, margin: '4px 0 0', fontFamily: "'VT323', monospace" }}>
            Sua classe define como você enfrenta os monstros.
          </p>
        </div>

        {/* ── Two class cards ── */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
          {(['mago', 'guerreiro'] as CharacterClass[]).map(cls => (
            <ClassCard
              key={cls}
              cls={cls}
              isSelected={selected === cls}
              onSelect={() => handleSelect(cls)}
              disabled={confirmed}
            />
          ))}
        </div>

        {/* ── Confirm button ── */}
        <button
          onClick={handleConfirm}
          disabled={!selected || confirmed}
          style={{
            width: '100%',
            padding: '15px 0',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(9px, 2.5vw, 11px)',
            letterSpacing: 1,
            color: confirmed ? '#06FFA5' : selected ? '#0d1024' : '#3a4060',
            background: confirmed
              ? 'rgba(6,255,165,0.1)'
              : selected ? selColor : '#131628',
            border: confirmed
              ? '3px solid #06FFA5'
              : selected ? `1px solid ${selColor}` : '1px solid #2a2e50',
            boxShadow: selected && !confirmed ? `0 0 18px ${selColor}44` : 'none',
            cursor: selected && !confirmed ? 'pointer' : 'default',
            transition: 'all 0.2s',
          }}
        >
          {confirmed
            ? `✦ ${CLASS_INFO[selected!].label.toUpperCase()} CONFIRMADO! ✦`
            : selected
              ? `JOGAR COMO ${CLASS_INFO[selected].label.toUpperCase()} ▶`
              : 'SELECIONE UMA CLASSE'}
        </button>
      </div>
    </div>
  );
}