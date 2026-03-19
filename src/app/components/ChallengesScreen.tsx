import { useState } from "react";
import { Brain, Timer, Trash2 } from "lucide-react";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { audioManager } from "../hooks/audioManager";
import { getChallenges, deleteChallenge } from "../data/challenges";
import { getFocusDamageBonus } from "../data/economy";
import { PageShell } from "./ui/PageShell";
import { CardIn } from "./ui/CardIn";
import { RpgButton } from "./ui/RpgButton";
import { useTheme } from "../contexts/PreferencesContext";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatMs(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN — shows focus session history + permanent bonus counter
// ═══════════════════════════════════════════════════════════════════════════
export default function ChallengesScreen() {
  const {
    BG_CARD, COLOR_MAGE, COLOR_SUCCESS, COLOR_DANGER,
    TEXT_INACTIVE, TEXT_MUTED, FONT_PIXEL, FONT_BODY, RADIUS_XL, RADIUS_LG,
  } = useTheme();
  const isDesktop = useIsDesktop();
  const [challenges, setChallenges] = useState(getChallenges());
  const focusBonus = getFocusDamageBonus();

  function refresh() { setChallenges([...getChallenges()]); }
  function handleDelete(id: string) { deleteChallenge(id); refresh(); }

  const focusDone = challenges.filter(c => c.type === "focus" && c.status !== "active");
  const focusActive = challenges.filter(c => c.type === "focus" && c.status === "active");

  return (
    <PageShell icon={<Brain size={16} />} title="CONTINUOUS FOCUS" accentColor={COLOR_MAGE}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Permanent focus bonus card */}
        <div style={{
          background: BG_CARD, border: `1px solid rgba(192,132,252,0.2)`,
          borderTop: `2px solid ${COLOR_MAGE}`,
          borderRadius: RADIUS_XL, overflow: "hidden",
          padding: "18px 20px",
        }}>
          <div style={{
            fontFamily: FONT_PIXEL, fontSize: 9,
            color: COLOR_MAGE, marginBottom: 14,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Brain size={13} /> ACCUMULATED FOCUS BONUS
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div>
              <div style={{ color: TEXT_MUTED, fontSize: 15, marginBottom: 4, fontFamily: FONT_BODY }}>Permanent damage gained through focus sessions</div>
              <div style={{
                fontFamily: FONT_PIXEL, fontSize: 22,
                color: focusBonus > 0 ? COLOR_SUCCESS : TEXT_INACTIVE,
                textShadow: focusBonus > 0 ? "0 0 16px rgba(6,255,165,0.4)" : "none",
              }}>
                +{focusBonus.toFixed(2)}x
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 6, fontFamily: FONT_BODY }}>
                Each task completed in focus mode = +0.01x permanent
              </div>
              <div style={{ color: TEXT_INACTIVE, fontSize: 14, fontFamily: FONT_BODY }}>
                {focusDone.length + focusActive.length} sessions · {focusBonus > 0 ? Math.round(focusBonus / 0.01) : 0} focus tasks completed
              </div>
            </div>
          </div>
        </div>

        {/* Active sessions hint */}
        {focusActive.length > 0 && (
          <div style={{
            background: `rgba(192,132,252,0.08)`, border: `2px solid ${COLOR_MAGE}44`,
            borderRadius: RADIUS_LG, padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Brain size={16} color={COLOR_MAGE} />
            <span style={{ fontFamily: FONT_BODY, color: COLOR_MAGE, fontSize: 18 }}>
              {focusActive.length} active session — go to the main screen to manage
            </span>
          </div>
        )}

        {/* History */}
        {focusDone.length === 0 && (
          <div style={{
            background: BG_CARD, border: `1px solid rgba(42,46,80,0.8)`,
            borderRadius: RADIUS_XL, padding: "30px 20px", textAlign: "center",
          }}>
            <div style={{ color: TEXT_MUTED, fontSize: 20, fontFamily: FONT_BODY, marginBottom: 8 }}>
              No sessions completed yet
            </div>
            <div style={{ color: TEXT_INACTIVE, fontSize: 16, fontFamily: FONT_BODY }}>
              Activate Focus Mode on the Campaign screen to begin!
            </div>
          </div>
        )}

        {focusDone.length > 0 && (
          <div>
            <div style={{ fontFamily: FONT_PIXEL, color: TEXT_MUTED, fontSize: 9, marginBottom: 8, padding: "0 4px" }}>
              SESSION HISTORY ({focusDone.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...focusDone].reverse().map((c, idx) => (
                <CardIn key={c.id} index={idx}>
                  <div style={{
                    background: BG_CARD,
                    border: `1px solid ${c.status === "completed" ? `${COLOR_SUCCESS}33` : `${COLOR_DANGER}33`}`,
                    borderLeft: `3px solid ${c.status === "completed" ? COLOR_SUCCESS : COLOR_DANGER}`,
                    borderRadius: RADIUS_LG, padding: "12px 16px",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <Brain size={16} color={c.status === "completed" ? COLOR_SUCCESS : COLOR_DANGER} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#fff", fontSize: 18, fontFamily: FONT_BODY, marginBottom: 2 }}>{c.name}</div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ color: TEXT_MUTED, fontSize: 14, fontFamily: FONT_BODY }}>
                          {c.tasks?.filter(t => t.completed).length ?? 0}/{c.tasks?.length ?? 0} tasks
                        </span>
                        <span style={{ color: c.status === "completed" ? COLOR_SUCCESS : COLOR_DANGER, fontSize: 14, fontFamily: FONT_BODY }}>
                          {c.status === "completed" ? "COMPLETED" : "CANCELLED"}
                        </span>
                      </div>
                    </div>
                    <RpgButton variant="icon" color={COLOR_DANGER} onClick={() => handleDelete(c.id)} style={{ opacity: 0.4 }}>
                      <Trash2 size={14} />
                    </RpgButton>
                  </div>
                </CardIn>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}