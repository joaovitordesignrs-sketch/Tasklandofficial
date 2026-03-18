/**
 * useInteractionFeedback – Provides ready-to-use feedback functions
 * for UI interactions using synthetic click sounds only.
 */
import { useCallback } from "react";
import { audioManager } from "./audioManager";

export function useInteractionFeedback() {
  /** Light feedback – checkboxes, toggles, small icon buttons */
  const tap = useCallback(() => {
    audioManager.playClick("tap");
  }, []);

  /** Medium feedback – main action buttons (Nova Tarefa, Concluir, etc.) */
  const press = useCallback(() => {
    audioManager.playClick("press");
  }, []);

  /** Navigation feedback – tab switch, page navigation */
  const navigate = useCallback(() => {
    audioManager.playClick("navigate");
  }, []);

  /** Heavy feedback – attack hit on monster (no-op, hit SFX handled separately) */
  const impact = useCallback(() => {}, []);

  /** Critical hit – boss defeat, critical attacks (no-op) */
  const critical = useCallback(() => {}, []);

  /** Victory – level up, mission complete (no-op, victory SFX handled separately) */
  const victory = useCallback(() => {}, []);

  return { tap, press, navigate, impact, critical, victory };
}
