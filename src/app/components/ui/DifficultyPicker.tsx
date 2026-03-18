/**
 * DifficultyPicker — Shared difficulty selector (Fácil / Médio / Difícil).
 *
 * Previously duplicated identically in:
 *   - TaskList.tsx
 *   - ChallengePanel.tsx
 *   - FocusPanel.tsx
 *
 * Now extracted here as the single root component.
 * All tokens (colors, fonts, spacing) come from /src/app/data/tokens.ts.
 */
import React from "react";
import { DIFFICULTY_INFO } from "../../data/gameEngine";
import { TaskDifficulty }  from "../../data/missions";
import { audioManager }    from "../../hooks/audioManager";
import {
  FONT_BODY, BORDER_ELEVATED, TEXT_MUTED, RADIUS_SM, VT_MD,
} from "../../data/tokens";

interface DifficultyPickerProps {
  value:    TaskDifficulty;
  onChange: (d: TaskDifficulty) => void;
}

export function DifficultyPicker({ value, onChange }: DifficultyPickerProps) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {(["easy", "medium", "hard"] as TaskDifficulty[]).map((d) => {
        const info   = DIFFICULTY_INFO[d];
        const active = value === d;
        return (
          <button
            key={d}
            onClick={() => { audioManager.playClick("tap"); onChange(d); }}
            style={{
              padding:      "3px 12px",
              background:   active ? info.color + "22" : "transparent",
              border:       `1px solid ${active ? info.color : BORDER_ELEVATED}`,
              color:        active ? info.color : TEXT_MUTED,
              fontFamily:   FONT_BODY,
              fontSize:     VT_MD,
              cursor:       "pointer",
              transition:   "all 0.1s",
              borderRadius: RADIUS_SM,
            }}
          >
            {info.label}
          </button>
        );
      })}
    </div>
  );
}
