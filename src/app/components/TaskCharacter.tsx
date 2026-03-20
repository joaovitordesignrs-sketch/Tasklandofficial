// TaskCharacter.tsx
// Loads the correct .riv animation based on the player's active skin.
import { useRive, Layout, Fit, Alignment, EventType } from '@rive-app/react-canvas';
import { useEffect, useRef, useCallback, useState } from 'react';
import { SKIN_INFO, type SkinId } from '../data/economy';
import imgAvatarWarrior from '../../assets/profile_pic/profile_pic_warrior.png';
import imgAvatarMage    from '../../assets/profile_pic/profile_pic_mage.png';

const SKIN_SCALE: Record<SkinId, number> = {
  warrior_base:       1.0,
  warrior_aventureiro: 1.0,
  mage:               1.22,
};

// Cache which skins have already been loaded so remounts skip the fallback flash
const loadedSkins = new Set<string>();

interface TaskCharacterProps {
  taskCompleted: boolean;
  activeSkin: SkinId | null;
  /** Called the instant Rive transitions into any "attack" state — use this to sync feedback */
  onAttackStart?: () => void;
}

export function TaskCharacter({ taskCompleted, activeSkin, onAttackStart }: TaskCharacterProps) {
  const hasFired        = useRef(false);
  const attackInputRef  = useRef<any>(null);
  const skin = activeSkin ?? "warrior_base";
  const [riveReady, setRiveReady] = useState(() => loadedSkins.has(skin));

  // Keep a stable ref so the state-change listener never captures a stale closure
  const onAttackStartRef = useRef(onAttackStart);
  useEffect(() => { onAttackStartRef.current = onAttackStart; }, [onAttackStart]);

  const rivSrc = SKIN_INFO[skin].rivUrl;

  const onLoad = useCallback(() => {
    loadedSkins.add(skin);
    setRiveReady(true);
  }, [skin]);

  const { RiveComponent, rive } = useRive({
    src: rivSrc,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.BottomCenter }),
    onLoad,
  });

  // ── After file is fully loaded, discover SM, grab attack input, and
  //    subscribe to state changes so we know the exact frame Attack 1 starts ──
  useEffect(() => {
    if (!rive || !riveReady) return;

    // Reset refs whenever the riv file changes (skin switch)
    attackInputRef.current = null;
    hasFired.current = false;

    const sms: string[]   = (rive as any).stateMachineNames ?? [];
    const anims: string[] = rive.animationNames ?? [];

    console.log('[TaskCharacter] skin:', skin, '| Animations:', anims);
    console.log('[TaskCharacter] State Machines:', sms);

    if (sms.length === 0) {
      if (anims.length > 0) {
        try { rive.play(anims[0]); } catch (_) {}
        console.log('[TaskCharacter] Fallback: playing animation', anims[0]);
      }
      return;
    }

    const smName = sms[0];
    try { rive.play(smName); } catch (_) {}

    const inputs: any[] = (rive as any).stateMachineInputs?.(smName) ?? [];
    console.log(
      '[TaskCharacter] SM:', smName,
      '| Inputs:', inputs.map((i: any) => `${i.name} (type=${i.type})`)
    );

    const atkInput =
      inputs.find((i: any) => /attack/i.test(i.name)) ??
      inputs.find((i: any) => /trigger/i.test(i.name)) ??
      inputs[0] ??
      null;

    if (atkInput) {
      attackInputRef.current = atkInput;
      console.log('[TaskCharacter] Attack input ready:', atkInput.name);
    }

    // ── State-change listener: fires onAttackStart the moment Rive enters
    //    any "attack" state (e.g. "Attack 1", "attack_1", etc.)  ──────────
    const handleStateChange = (event: any) => {
      const states: string[] = Array.isArray(event.data)
        ? event.data
        : typeof event.data === 'string' ? [event.data] : [];

      if (states.some((s: string) => /attack/i.test(s))) {
        console.log('[TaskCharacter] Attack state entered:', states);
        onAttackStartRef.current?.();
      }
    };

    rive.on(EventType.StateChange, handleStateChange);

    return () => {
      try { rive.off(EventType.StateChange, handleStateChange); } catch (_) {}
    };
  }, [rive, riveReady, skin]);

  // ── Fire attack when taskCompleted flips to true ──────────────────────
  useEffect(() => {
    if (!taskCompleted) {
      hasFired.current = false;
      return;
    }
    if (hasFired.current) return;
    hasFired.current = true;

    const input = attackInputRef.current;
    if (!input) return;

    if (typeof input.fire === 'function') {
      input.fire();
      return;
    }

    input.value = true;
    setTimeout(() => { input.value = false; }, 70);
  }, [taskCompleted]);

  const scale = SKIN_SCALE[skin] ?? 1.0;
  const fallbackSrc = SKIN_INFO[skin].fallbackImg === 'mage' ? imgAvatarMage : imgAvatarWarrior;

  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
      {/* Static fallback — visible while Rive loads or on network failure */}
      {!riveReady && (
        <img
          src={fallbackSrc}
          alt=""
          style={{
            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            maxHeight: 200, width: 'auto', objectFit: 'contain', imageRendering: 'pixelated',
            opacity: 0.75, zIndex: 1,
          }}
        />
      )}
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: 'bottom center',
        display: 'flex',
        alignItems: 'flex-end',
        opacity: riveReady ? 1 : 0,
        transition: 'opacity 0.4s',
        position: 'relative', zIndex: 2,
      }}>
        <RiveComponent style={{ width: 360, height: 360, imageRendering: 'pixelated' }} />
      </div>
    </div>
  );
}
