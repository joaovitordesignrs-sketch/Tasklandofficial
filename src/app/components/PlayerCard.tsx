import { getLevelInfo, getRank, calcTotalXP } from "../data/gameEngine";
import { useTheme } from "../contexts/PreferencesContext";
import imgHero from "figma:asset/88db16de6cc4fac02e41af10e16775e8930dedaf.png";

const AVG_XP_PER_TASK = 15; // average XP per task (mix of difficulties)

// ─── Stats derivation ─────────────────────────────────────────────────────────
interface Stats {
  completedMissions: number;
  totalMissions:     number;
  totalTasksDone:    number;
  totalTasks:        number;
}

function deriveStats(missions: Mission[]): Stats {
  let completedMissions = 0, totalTasksDone = 0, totalTasks = 0;
  for (const m of missions) {
    const done = m.tasks.filter((t) => t.completed).length;
    totalTasksDone += done;
    totalTasks += m.tasks.length;
    if (m.tasks.length > 0 && done === m.tasks.length) completedMissions++;
  }
  return { completedMissions, totalMissions: missions.length, totalTasksDone, totalTasks };
}

// ─── Component ────────────────────────────────────────────────────────────────
interface PlayerCardProps {
  missions: Mission[];
  playerName: string;
  onNameChange: (name: string) => void;
}

export function PlayerCard({ missions, playerName, onNameChange }: PlayerCardProps) {
  const { ACCENT_GOLD, ACCENT_SHADOW, BG_CARD, BG_DEEPEST, BORDER_SUBTLE, BORDER_ELEVATED, COLOR_SUCCESS, COLOR_DANGER, COLOR_LEGENDARY, FONT_PIXEL, FONT_BODY, TEXT_MUTED, TEXT_INACTIVE, RANK_NOVATO, PX_XL, VT_LG, alpha } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(playerName);

  const stats   = deriveStats(missions);
  const totalXP = calcTotalXP(missions);
  const lvInfo  = getLevelInfo(totalXP);
  const xpPct   = Math.round((lvInfo.currentXP / lvInfo.neededXP) * 100);
  const rank    = getRank(lvInfo.level);

  function confirmEdit() {
    const trimmed = draft.trim();
    onNameChange(trimmed || playerName);
    setEditing(false);
  }

  function cancelEdit() {
    setDraft(playerName);
    setEditing(false);
  }

  return (
    /* Shadow wrapper — drop-shadow follows the clipped shape */
    <div
      style={{
        filter: `drop-shadow(6px 6px 0 ${ACCENT_SHADOW})`,
        marginBottom: "8px",
      }}
    >
      {/* Border layer */}
      <div
        style={{
          clipPath: PIXEL_CLIP,
          background: ACCENT_GOLD,
          padding: "3px",
        }}
      >
        {/* Card body */}
        <div
          style={{
            background: BG_CARD,
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {/* ── Top section: avatar + stats ─────────────── */}
          <div style={{ display: "flex", alignItems: "stretch" }}>

            {/* Avatar box */}
            <div
              style={{
                width: 110,
                flexShrink: 0,
                background: `linear-gradient(135deg, #1a0f2e 0%, ${BG_CARD} 60%, #1a2040 100%)`,
                borderRight: `1px solid ${alpha(ACCENT_GOLD, "30")}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 8px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Subtle glow behind avatar */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(ellipse at center, ${alpha(ACCENT_GOLD, "26")} 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />
              <img
                src={imgHero}
                alt="Personagem"
                style={{
                  width: 80,
                  height: "auto",
                  imageRendering: "pixelated",
                  position: "relative",
                  zIndex: 1,
                }}
              />
            </div>

            {/* Stats panel */}
            <div
              style={{
                flex: 1,
                padding: "14px 18px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                minWidth: 0,
              }}
            >
              {/* Name row */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {editing ? (
                  <>
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                      style={{
                        flex: 1,
                        background: BG_CARD,
                        border: `2px solid ${ACCENT_GOLD}`,
                        color: "#fff",
                        padding: "4px 10px",
                        fontSize: "20px",
                        fontFamily: FONT_BODY,
                        outline: "none",
                        minWidth: 0,
                      }}
                    />
                    <button
                      onClick={confirmEdit}
                      style={{ background: "none", border: "none", cursor: "pointer", color: COLOR_SUCCESS, padding: "2px" }}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{ background: "none", border: "none", cursor: "pointer", color: COLOR_DANGER, padding: "2px" }}
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      style={{
                        fontFamily: FONT_PIXEL,
                        color: "#fff",
                        fontSize: PX_XL,
                        textShadow: "2px 2px 0 #000",
                        lineHeight: 1.4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {playerName}
                    </span>
                    <button
                      onClick={() => { setDraft(playerName); setEditing(true); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED, padding: "2px", flexShrink: 0, transition: "color 0.15s" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = ACCENT_GOLD)}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = TEXT_MUTED)}
                      title="Editar nome"
                    >
                      <Pencil size={14} />
                    </button>
                  </>
                )}
              </div>

              {/* Rank badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Star size={12} style={{ color: rank.color, flexShrink: 0 }} />
                <span
                  style={{
                    fontFamily: FONT_BODY,
                    color: rank.color,
                    fontSize: VT_LG,
                    letterSpacing: "1px",
                    textShadow: "1px 1px 0 #000",
                  }}
                >
                  {rank.label}
                </span>
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                  <span style={{ color: TEXT_MUTED, fontSize: "13px", fontFamily: FONT_BODY }}>MISSÕES</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <Swords size={13} style={{ color: ACCENT_GOLD }} />
                    <span style={{ fontFamily: FONT_BODY, color: ACCENT_GOLD, fontSize: "22px", lineHeight: 1 }}>
                      {stats.completedMissions}
                    </span>
                    <span style={{ color: TEXT_INACTIVE, fontSize: "16px", fontFamily: FONT_BODY }}>
                      /{stats.totalMissions}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                  <span style={{ color: TEXT_MUTED, fontSize: "13px", fontFamily: FONT_BODY }}>TASKS</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ fontFamily: FONT_BODY, color: COLOR_SUCCESS, fontSize: "22px", lineHeight: 1 }}>
                      {stats.totalTasksDone}
                    </span>
                    <span style={{ color: TEXT_INACTIVE, fontSize: "16px", fontFamily: FONT_BODY }}>
                      /{stats.totalTasks}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                  <span style={{ color: TEXT_MUTED, fontSize: "13px", fontFamily: FONT_BODY }}>XP TOTAL</span>
                  <span style={{ fontFamily: FONT_BODY, color: COLOR_LEGENDARY, fontSize: "22px", lineHeight: 1, textShadow: "1px 1px 0 #000" }}>
                    {totalXP}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── XP Bar section ──────────────────────────── */}
          <div
            style={{
              borderTop: `2px solid ${BORDER_SUBTLE}`,
              padding: "10px 18px 14px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span
                  style={{
                    fontFamily: FONT_PIXEL,
                    color: COLOR_LEGENDARY,
                    fontSize: "11px",
                    textShadow: "2px 2px 0 #000",
                  }}
                >
                  LVL {lvInfo.level}
                </span>
                <span style={{ fontFamily: FONT_BODY, color: RANK_NOVATO, fontSize: "16px" }}>
                  ({lvInfo.currentXP}/{lvInfo.neededXP} XP)
                </span>
              </div>
              <span style={{ fontFamily: FONT_BODY, color: xpPct >= 80 ? COLOR_SUCCESS : COLOR_LEGENDARY, fontSize: "16px" }}>
                {xpPct}%
              </span>
            </div>

            <div
              style={{
                height: 14,
                background: BG_DEEPEST,
                border: `2px solid ${BORDER_ELEVATED}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Fill */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${xpPct}%`,
                  background: COLOR_LEGENDARY,
                  transition: "width 0.8s ease",
                }}
              />
              {/* Pixel segments overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 11px)",
                  pointerEvents: "none",
                }}
              />
            </div>

            {lvInfo.currentXP < lvInfo.neededXP && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: 4, height: 4, background: alpha(COLOR_LEGENDARY, "66"), transform: "rotate(45deg)" }} />
                <span style={{ fontFamily: FONT_BODY, color: "#4a5070", fontSize: "14px" }}>
                  {lvInfo.neededXP - lvInfo.currentXP} XP to LVL {lvInfo.level + 1} —&nbsp;
                  {Math.ceil((lvInfo.neededXP - lvInfo.currentXP) / AVG_XP_PER_TASK)} task{Math.ceil((lvInfo.neededXP - lvInfo.currentXP) / AVG_XP_PER_TASK) !== 1 ? "s" : ""} remaining
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}