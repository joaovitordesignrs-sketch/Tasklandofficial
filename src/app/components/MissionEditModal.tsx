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
  const { BG_CARD, BG_DEEPEST, BG_PAGE, BORDER_ELEVATED, TEXT_LIGHT, TEXT_MUTED, alpha } = useTheme();
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
    padding: "10px 14px", fontSize: 20, fontFamily: "'VT323', monospace", outline: "none", boxSizing: "border-box",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: alpha(BG_DEEPEST, "d9") }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: BG_CARD, border: "1px solid #e39f6444", borderTop: "2px solid #e39f64", borderRadius: 12, padding: "32px", maxWidth: 480, width: "90%", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: TEXT_MUTED, cursor: "pointer" }}>
          <X size={20} />
        </button>
        <h2 style={{ fontFamily: "'Press Start 2P', monospace", color: "#e39f64", fontSize: 13, marginBottom: 24, textShadow: "2px 2px 0 #000" }}>EDIT MISSION</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Mission Name", val: name, set: setName, ph: "" },
            { label: "Monster Name", val: monsterName, set: setMonsterName, ph: "" },
          ].map(({ label, val, set, ph }) => (
            <div key={label}>
              <label style={{ color: "#e39f64", fontSize: 17, display: "block", marginBottom: 6, fontFamily: "'VT323', monospace" }}>{label}</label>
              <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph} style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#e39f64")} onBlur={(e) => (e.target.style.borderColor = BORDER_ELEVATED)} />
            </div>
          ))}
          <div>
            <label style={{ color: "#e39f64", fontSize: 17, display: "block", marginBottom: 6, fontFamily: "'VT323', monospace" }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: "none" }} onFocus={(e) => (e.target.style.borderColor = "#e39f64")} onBlur={(e) => (e.target.style.borderColor = BORDER_ELEVATED)} />
          </div>
          <div>
            <label style={{ color: "#e39f64", fontSize: 17, display: "block", marginBottom: 6, fontFamily: "'VT323', monospace" }}>Deadline</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#e39f64")} onBlur={(e) => (e.target.style.borderColor = BORDER_ELEVATED)} />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button onClick={onClose} style={{ flex: 1, background: "none", border: `2px solid ${BORDER_ELEVATED}`, color: TEXT_MUTED, padding: 12, fontFamily: "'VT323', monospace", fontSize: 20, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} style={{ flex: 2, background: "#e39f64", border: "none", color: "#0d1024", padding: 12, fontFamily: "'Press Start 2P', monospace", fontSize: 11, cursor: "pointer", boxShadow: "3px 3px 0 #b07830", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Save size={14} /> SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}