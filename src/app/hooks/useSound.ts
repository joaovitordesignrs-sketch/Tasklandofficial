/**
 * useSound – lightweight hook for one-shot sound effects.
 * Reads SFX enabled/volume from the global audioManager.
 */
import { useRef, useEffect, useCallback } from "react";
import { audioManager } from "./audioManager";

export function useSound(url: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = new Audio(url);
    a.preload = "auto";
    audioRef.current = a;
  }, [url]);

  const play = useCallback(() => {
    if (!audioManager.isSfxOn()) return;
    try {
      const vol = audioManager.getSfxVolume();
      const clone = audioRef.current?.cloneNode(true) as HTMLAudioElement | undefined;
      if (clone) {
        clone.volume = Math.min(1, Math.max(0, vol));
        clone.play().catch(() => {});
      }
    } catch {
      /* browser may block before interaction */
    }
  }, []);

  return play;
}
