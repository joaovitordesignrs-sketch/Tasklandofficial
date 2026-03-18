/**
 * useAudioSettings – React hook that subscribes to the
 * global audioManager and re-renders on any change.
 */
import { useState, useEffect } from "react";
import { audioManager, type AudioSettings } from "./audioManager";

export function useAudioSettings() {
  const [settings, setSettings] = useState<AudioSettings>(() => audioManager.getSettings());

  useEffect(() => {
    const unsub = audioManager.subscribe(setSettings);
    return unsub;
  }, []);

  return {
    ...settings,
    trackName:       audioManager.getTrackName(),
    trackCount:      audioManager.getTrackCount(),
    setMusicOn:      (on: boolean) => audioManager.setMusicOn(on),
    setMusicVolume:  (v: number)   => audioManager.setMusicVolume(v),
    setSfxOn:        (on: boolean) => audioManager.setSfxOn(on),
    setSfxVolume:    (v: number)   => audioManager.setSfxVolume(v),
    ensureStarted:   ()            => audioManager.ensureStarted(),
    playPreviewBeep: ()            => audioManager.playPreviewBeep(),
  };
}
