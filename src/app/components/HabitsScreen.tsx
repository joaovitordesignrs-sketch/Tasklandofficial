import { Flame, Trash2, Plus, X, Check, Medal } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getHabits, createHabit, deleteHabit, checkinHabit, uncheckinHabit,
  isCheckedInToday, recalcStreaks, HABIT_MEDALS, Habit, HabitMedal,
} from "../data/habits";
import { audioManager } from "../hooks/audioManager";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { PageShell } from "./ui/PageShell";
import { HabitIcon, HABIT_ICON_CATEGORIES, PixelIcon } from "./ui/PixelIcon";
import { CardIn } from "./ui/CardIn";
import { RpgButton } from "./ui/RpgButton";
import { useTheme } from "../contexts/PreferencesContext";

const DEFAULT_ICON = HABIT_ICON_CATEGORIES[0].icons[0]; // "heart"

export default function HabitsScreen() {
  const {
    BG_DEEPEST, BG_PAGE, BG_CARD, BORDER_SUBTLE, BORDER_ELEVATED,
    COLOR_ORANGE, COLOR_SUCCESS, COLOR_DANGER, COLOR_LEGENDARY,
    TEXT_INACTIVE, TEXT_MUTED, TEXT_BODY,
    FONT_PIXEL, FONT_BODY, RADIUS_LG, RADIUS_XL,
  } = useTheme();
  const isDesktop = useIsDesktop();
  const [habits, setHabits]           = useState<Habit[]>([]);
  const [showCreate, setShowCreate]   = useState(false);
  const [newName, setNewName]         = useState("");
  const [newIcon, setNewIcon]         = useState<string>(DEFAULT_ICON);
  const [activeCategory, setActiveCategory] = useState(HABIT_ICON_CATEGORIES[0].key);
  const [medalPopup, setMedalPopup]   = useState<{ medal: HabitMedal; habitName: string } | null>(null);

  const refresh = () => { recalcStreaks(); setHabits([...getHabits()]); };

  useEffect(() => {
    refresh();
    // Re-sync habits when cloud push arrives from another device
    window.addEventListener("rpg:data-updated", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("rpg:data-updated", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const h = createHabit(newName.trim(), newIcon);
    if (!h) return;
    audioManager.playClick("press");
    setNewName("");
    setNewIcon(DEFAULT_ICON);
    setActiveCategory(HABIT_ICON_CATEGORIES[0].key);
    setShowCreate(false);
    refresh();
  };

  const handleCheckin = (id: string) => {
    audioManager.playClick("tap");
    const { newMedals } = checkinHabit(id);
    refresh();
    if (newMedals.length > 0) {
      const habit = getHabits().find(h => h.id === id);
      setMedalPopup({ medal: newMedals[0], habitName: habit?.name ?? "" });
      setTimeout(() => setMedalPopup(null), 3000);
    }
  };

  const handleUncheckin = (id: string) => {
    audioManager.playClick("tap");
    uncheckinHabit(id);
    refresh();
  };

  const handleDelete = (id: string) => {
    audioManager.playClick("tap");
    deleteHabit(id);
    refresh();
  };

  const activeHabits   = habits.filter(h => h.active);
  const streakingCount = activeHabits.filter(h => h.currentStreak > 0).length;
  const totalStreakBonus = streakingCount * 2;

  const currentCategory = HABIT_ICON_CATEGORIES.find(c => c.key === activeCategory)!;

  return (
    <>
      <style>{`
        @keyframes medalIn { 0%{transform:scale(0) rotate(-30deg);opacity:0} 60%{transform:scale(1.3) rotate(5deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes streakGlow { 0%,100%{text-shadow:0 0 6px rgba(255,107,53,0.5)} 50%{text-shadow:0 0 16px rgba(255,107,53,0.9)} }
        @keyframes iconPop { 0%{transform:scale(0.7);opacity:0} 100%{transform:scale(1);opacity:1} }
      `}</style>

      <PageShell icon={<Flame size={16} />} title="HÁBITOS" accentColor={COLOR_ORANGE}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Damage bonus banner */}
          {totalStreakBonus > 0 && (
            <div style={{
              background: `rgba(255,107,53,0.08)`, border: `1px solid ${COLOR_ORANGE}33`,
              borderTop: `2px solid ${COLOR_ORANGE}`, borderRadius: RADIUS_XL, padding: "10px 16px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <Flame size={18} color={COLOR_ORANGE} />
              <span style={{ color: COLOR_ORANGE, fontSize: 18, fontFamily: FONT_BODY }}>
                +{totalStreakBonus}% dano de hábitos ativos ({streakingCount}/5 em streak)
              </span>
            </div>
          )}

          {/* Habits list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeHabits.length === 0 && (
              <div style={{
                background: BG_CARD, border: `1px solid rgba(42,46,80,0.8)`,
                borderRadius: RADIUS_XL, padding: "30px 20px", textAlign: "center",
              }}>
                <div style={{ color: TEXT_MUTED, fontSize: 20, fontFamily: FONT_BODY, marginBottom: 8 }}>
                  Nenhum hábito criado
                </div>
                <div style={{ color: TEXT_INACTIVE, fontSize: 16, fontFamily: FONT_BODY }}>
                  Crie até 5 hábitos para ganhar bônus de dano!
                </div>
              </div>
            )}

            {activeHabits.map((h, hIdx) => {
              const checked      = isCheckedInToday(h);
              const streakColor  = h.currentStreak >= 66 ? COLOR_ORANGE
                                 : h.currentStreak >= 21 ? COLOR_LEGENDARY
                                 : h.currentStreak >= 5  ? COLOR_SUCCESS
                                 : TEXT_MUTED;
              return (
                <CardIn key={h.id} index={hIdx}>
                  <div style={{
                    background: checked ? `rgba(6,255,165,0.06)` : BG_CARD,
                    border: `1px solid ${checked ? `${COLOR_SUCCESS}44` : `rgba(42,46,80,0.7)`}`,
                    borderLeft: `3px solid ${checked ? COLOR_SUCCESS : BORDER_ELEVATED}`,
                    borderRadius: RADIUS_LG, padding: "14px 16px",
                    display: "flex", alignItems: "center", gap: 14,
                    transition: "all 0.2s",
                  }}>
                    {/* Check-in button */}
                    <button
                      onClick={() => checked ? handleUncheckin(h.id) : handleCheckin(h.id)}
                      style={{
                        width: 44, height: 44, flexShrink: 0,
                        background: checked ? COLOR_SUCCESS : BG_DEEPEST,
                        border: `1px solid ${checked ? COLOR_SUCCESS : BORDER_ELEVATED}`,
                        borderRadius: RADIUS_LG, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      {checked
                        ? <Check size={22} color="#000" strokeWidth={3} />
                        : <HabitIcon icon={h.icon} size={22} />}
                    </button>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: checked ? COLOR_SUCCESS : "#fff", fontSize: 20,
                        fontFamily: FONT_BODY,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                        <HabitIcon icon={h.icon} size={18} color={checked ? COLOR_SUCCESS : "#c8d0e0"} />
                        {h.name}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                        <span style={{
                          color: streakColor, fontSize: 18, fontFamily: FONT_BODY,
                          display: "flex", alignItems: "center", gap: 4,
                          animation: h.currentStreak >= 21 ? "streakGlow 2s infinite" : "none",
                        }}>
                          <Flame size={13} color={streakColor} /> {h.currentStreak} dias
                        </span>
                        <span style={{ color: TEXT_INACTIVE, fontSize: 14, fontFamily: FONT_BODY }}>
                          (recorde: {h.bestStreak})
                        </span>
                      </div>
                      {h.medals.length > 0 && (
                        <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                          {h.medals.map(m => (
                            <span key={m} style={{
                              background: HABIT_MEDALS[m].color + "22",
                              border: `1px solid ${HABIT_MEDALS[m].color}55`,
                              color: HABIT_MEDALS[m].color,
                              padding: "2px 8px", fontSize: 13, fontFamily: FONT_BODY,
                              borderRadius: 4,
                            }}>
                              {HABIT_MEDALS[m].label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delete */}
                    <RpgButton
                      variant="icon"
                      color={COLOR_DANGER}
                      onClick={() => handleDelete(h.id)}
                      style={{ opacity: 0.4 }}
                    >
                      <Trash2 size={16} />
                    </RpgButton>
                  </div>
                </CardIn>
              );
            })}
          </div>

          {/* Medal progress */}
          <div style={{
            background: BG_CARD, border: `1px solid rgba(42,46,80,0.8)`,
            borderTop: `2px solid ${TEXT_MUTED}`, borderRadius: RADIUS_XL, padding: "14px 16px",
          }}>
            <div style={{ fontFamily: FONT_PIXEL, color: TEXT_MUTED, fontSize: 9, marginBottom: 10 }}>
              MEDALHAS DE HÁBITO
            </div>
            {(Object.entries(HABIT_MEDALS) as [HabitMedal, typeof HABIT_MEDALS[HabitMedal]][]).map(([key, info]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${BORDER_SUBTLE}` }}>
                <div style={{ width: 8, height: 8, background: info.color, borderRadius: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ color: info.color, fontSize: 17, fontFamily: FONT_BODY }}>{info.label}</span>
                  <span style={{ color: TEXT_INACTIVE, fontSize: 14, fontFamily: FONT_BODY, marginLeft: 8 }}>{info.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add habit button */}
          {activeHabits.length < 5 && !showCreate && (
            <RpgButton
              variant="dashed"
              color={COLOR_ORANGE}
              fullWidth
              onClick={() => { audioManager.playClick("press"); setShowCreate(true); }}
            >
              <Plus size={16} /> NOVO HÁBITO ({activeHabits.length}/5)
            </RpgButton>
          )}

          {/* ── Create form ── */}
          {showCreate && (
            <div style={{
              background: BG_CARD,
              border: `1px solid rgba(255,107,53,0.3)`,
              borderTop: `2px solid ${COLOR_ORANGE}`,
              borderRadius: RADIUS_XL, overflow: "hidden",
            }}>
              {/* Header */}
              <div style={{
                background: BG_DEEPEST, borderBottom: `1px solid ${BORDER_SUBTLE}`,
                padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
              }}>
                <Flame size={14} color={COLOR_ORANGE} />
                <span style={{ fontFamily: FONT_PIXEL, color: COLOR_ORANGE, fontSize: 10, flex: 1 }}>
                  NOVO HÁBITO
                </span>
                <RpgButton variant="icon" color={TEXT_MUTED} onClick={() => setShowCreate(false)}>
                  <X size={16} />
                </RpgButton>
              </div>

              <div style={{ padding: "16px 14px" }}>

                {/* ── Icon picker ── */}
                <div style={{ marginBottom: 14 }}>
                  {/* Label */}
                  <div style={{
                    fontFamily: FONT_PIXEL, fontSize: 8,
                    color: TEXT_MUTED, marginBottom: 10, letterSpacing: 1,
                  }}>
                    ÍCONE DO HÁBITO
                  </div>

                  {/* Category tabs */}
                  <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
                    {HABIT_ICON_CATEGORIES.map(cat => {
                      const isActive = activeCategory === cat.key;
                      return (
                        <button
                          key={cat.key}
                          onClick={() => { audioManager.playClick("tap"); setActiveCategory(cat.key); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "6px 10px",
                            background: isActive ? cat.color + "22" : "transparent",
                            border: `1px solid ${isActive ? cat.color : BORDER_ELEVATED}`,
                            color: isActive ? cat.color : TEXT_MUTED,
                            fontFamily: FONT_PIXEL,
                            fontSize: 7, letterSpacing: 0.5,
                            cursor: "pointer", borderRadius: 6,
                            transition: "all 0.15s",
                            boxShadow: isActive ? `0 0 8px ${cat.color}33` : "none",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center" }}>
                            <PixelIcon name={cat.tabIcon} size={12} color={isActive ? cat.color : TEXT_MUTED} />
                          </span>
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div style={{
                    height: 1,
                    background: `linear-gradient(90deg, ${currentCategory.color}44 0%, transparent 100%)`,
                    marginBottom: 10,
                  }} />

                  {/* Icons grid */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {currentCategory.icons.map((iconKey, i) => {
                      const isSelected = newIcon === iconKey;
                      const cat = currentCategory;
                      return (
                        <button
                          key={iconKey}
                          onClick={() => { audioManager.playClick("tap"); setNewIcon(iconKey); }}
                          style={{
                            width: 48, height: 48,
                            background: isSelected ? cat.color + "28" : BG_DEEPEST,
                            border: `${isSelected ? 2 : 1}px solid ${isSelected ? cat.color : BORDER_ELEVATED}`,
                            borderRadius: 8,
                            cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s",
                            boxShadow: isSelected ? `0 0 12px ${cat.color}44` : "none",
                            animation: `iconPop 0.15s ease-out ${i * 0.03}s both`,
                            transform: isSelected ? "scale(1.1)" : "scale(1)",
                          }}
                          onMouseEnter={e => {
                            if (!isSelected) {
                              (e.currentTarget as HTMLButtonElement).style.borderColor = cat.color + "88";
                              (e.currentTarget as HTMLButtonElement).style.background  = cat.color + "12";
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isSelected) {
                              (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER_ELEVATED;
                              (e.currentTarget as HTMLButtonElement).style.background  = BG_DEEPEST;
                            }
                          }}
                        >
                          <PixelIcon
                            name={iconKey}
                            size={22}
                            color={isSelected ? cat.color : "#8a9fba"}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Preview of selected icon */}
                  <div style={{
                    marginTop: 10, padding: "8px 12px",
                    background: currentCategory.color + "0d",
                    border: `1px solid ${currentCategory.color}22`,
                    borderRadius: 6,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <PixelIcon name={newIcon} size={16} color={currentCategory.color} />
                    <span style={{ fontFamily: "'VT323', monospace", color: currentCategory.color, fontSize: 16 }}>
                      {currentCategory.label}
                    </span>
                    <span style={{ fontFamily: FONT_BODY, color: TEXT_MUTED, fontSize: 14 }}>
                      · ícone selecionado
                    </span>
                  </div>
                </div>

                {/* Name input */}
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ex: Beber 8 copos de água"
                  maxLength={50}
                  style={{
                    width: "100%", padding: "10px 14px", background: BG_DEEPEST,
                    border: `1px solid ${BORDER_ELEVATED}`, color: "#fff",
                    borderRadius: 6,
                    fontFamily: FONT_BODY, fontSize: 18,
                    outline: "none", boxSizing: "border-box", marginBottom: 14,
                  }}
                  onFocus={e => (e.target.style.borderColor = COLOR_ORANGE)}
                  onBlur={e  => (e.target.style.borderColor = BORDER_ELEVATED)}
                  onKeyDown={e => { if (e.key === "Enter") handleCreate(); }}
                  autoFocus
                />

                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  style={{
                    width: "100%", padding: "13px 0",
                    background: newName.trim() ? COLOR_ORANGE : BG_PAGE,
                    border: "none", color: newName.trim() ? "#000" : TEXT_INACTIVE,
                    borderRadius: 8,
                    fontFamily: FONT_PIXEL, fontSize: 11,
                    cursor: newName.trim() ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: newName.trim() ? "0 0 16px rgba(255,107,53,0.4)" : "none",
                    transition: "all 0.2s",
                  }}
                  onMouseDown={e => newName.trim() && ((e.currentTarget as HTMLButtonElement).style.transform = "translate(1px,1px)")}
                  onMouseUp={e   => ((e.currentTarget as HTMLButtonElement).style.transform = "")}
                >
                  <Flame size={13} /> CRIAR HÁBITO
                </button>
              </div>
            </div>
          )}

        </div>
      </PageShell>

      {/* Medal popup */}
      {medalPopup && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
          }}
          onClick={() => setMedalPopup(null)}
        >
          <div style={{
            background: BG_CARD,
            border: `1px solid ${HABIT_MEDALS[medalPopup.medal].color}44`,
            borderTop: `2px solid ${HABIT_MEDALS[medalPopup.medal].color}`,
            borderRadius: 12, padding: "30px 40px", textAlign: "center",
            animation: "medalIn 0.5s ease-out",
            boxShadow: `0 0 40px ${HABIT_MEDALS[medalPopup.medal].color}44`,
          }}>
            <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Medal size={48} color={HABIT_MEDALS[medalPopup.medal].color} />
            </div>
            <div style={{ fontFamily: FONT_PIXEL, color: HABIT_MEDALS[medalPopup.medal].color, fontSize: 14, marginBottom: 8 }}>
              MEDALHA DESBLOQUEADA!
            </div>
            <div style={{ color: "#fff", fontSize: 22, fontFamily: FONT_BODY, marginBottom: 4 }}>
              {HABIT_MEDALS[medalPopup.medal].label}
            </div>
            <div style={{ color: TEXT_BODY, fontSize: 16, fontFamily: FONT_BODY }}>
              {medalPopup.habitName}
            </div>
            <div style={{ color: COLOR_SUCCESS, fontSize: 18, fontFamily: FONT_BODY, marginTop: 8 }}>
              {HABIT_MEDALS[medalPopup.medal].desc}
            </div>
          </div>
        </div>
      )}
    </>
  );
}