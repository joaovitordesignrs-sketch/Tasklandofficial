// MissionEditModal – kept as stub (not used in current routing)
import { useState } from "react";
import { Mission } from "../data/missions";
import { X, Save, CalendarDays, Timer } from "lucide-react";
import { useTheme } from "../contexts/PreferencesContext";

interface MissionEditModalProps {
  mission: Mission;
  onSave:  (updated: Mission) => void;
  onClose: () => void;
}

export function MissionEditModal({ mission, onSave, onClose }: MissionEditModalProps) {
  const { BG_CARD, BG_DEEPEST, BG_PAGE, BORDER_ELEVATED, ACCENT_GOLD, TEXT_LIGHT, TEXT_MUTED, FONT_PIXEL, FONT_BODY, alpha } = useTheme();
  const [name,        setName]        = useState(mission.name);
  const [description, setDescription] = useState(mission.description);
  const [monsterName, setMonsterName] = useState(mission.monsterName);
  const [deadline,    setDeadline]    = useState(
    mission.deadline ? new Date(mission.deadline).toISOString().split("T")[0] : ""
  );

  function handleSave() {
    onSave({
      ...mission,
      name:        name.trim() || mission.name,
      description: description.trim(),
      monsterName: monsterName.trim() || mission.monsterName,
      deadline:    deadline ? new Date(deadline).toISOString() : mission.deadline,
    });
    onClose();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: BG_PAGE, border: `2px solid ${BORDER_ELEVATED}`, color: TEXT_LIGHT,
    padding: "10px 14px", fontSize: 20, fontFamily: FONT_BODY, outline: "none", boxSizing: "border-box",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: alpha(BG_DEEPEST, "d9") }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: BG_CARD, border: `1px solid ${alpha(ACCENT_GOLD, "44")}`, borderTop: `2px solid ${ACCENT_GOLD}`, borderRadius: 12, padding: "32px", maxWidth: 480, width: "90%", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: TEXT_MUTED, cursor: "pointer" }}>
          <X size={20} />
        </button>
        <h2 style={{ fontFamily: FONT_PIXEL, color: ACCENT_GOLD, fontSize: 13, marginBottom: 24, textShadow: "2px 2px 0 #000" }}>EDIT MISSION</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Mission Name", val: name, set: setName, ph: "" },
            { label: "Monster Name", val: monsterName, set: setMonsterName, ph: "" },
          ].map(({ label, val, set, ph }) => (
            <div key={label}>
              <label style={{ color: ACCENT_GOLD, fontSize: 17, display: "block", marginBottom: 6, fontFamily: FONT_BODY }}>{label}</label>
              <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph} style={inputStyle} onFocus={(e) => (e.target.style.borderColor = ACCENT_GOLD)} onBlur={(e) => (e.target.style.borderColor = BORDER_ELEVATED)} />
            </div>
          ))}
          <div>
            <label style={{ color: ACCENT_GOLD, fontSize: 17, display: "block", marginBottom: 6, fontFamily: FONT_BODY }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: "none" }} onFocus={(e) => (e.target.style.borderColor = ACCENT_GOLD)} onBlur={(e) => (e.target.style.borderColor = BORDER_ELEVATED)} />
          </div>
          <div>
            <label style={{ color: ACCENT_GOLD, fontSize: 17, display: "block", marginBottom: 6, fontFamily: FONT_BODY }}>Deadline</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={inputStyle} onFocus={(e) => (e.target.style.borderColor = ACCENT_GOLD)} onBlur={(e) => (e.target.style.borderColor = BORDER_ELEVATED)} />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button onClick={onClose} style={{ flex: 1, background: "none", border: `2px solid ${BORDER_ELEVATED}`, color: TEXT_MUTED, padding: 12, fontFamily: FONT_BODY, fontSize: 20, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} style={{ flex: 2, background: ACCENT_GOLD, border: "none", color: BG_CARD, padding: 12, fontFamily: FONT_PIXEL, fontSize: 11, cursor: "pointer", boxShadow: "3px 3px 0 #b07830", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Save size={14} /> SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}