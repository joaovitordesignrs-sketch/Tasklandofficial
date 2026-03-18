/**
 * MobileAddTaskModal – bottom-sheet modal for adding tasks on mobile.
 * Used by TaskList, FocusPanel and ChallengePanel.
 * Supports optional tag selection when `availableTags` is provided.
 */
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Tag, Trash2 } from "lucide-react";
import { TaskDifficulty, removeTag } from "../../data/missions";
import { tagColor, ensureTag, setTagColor, TAG_PALETTE } from "../../data/missions";
import { DIFFICULTY_INFO } from "../../data/gameEngine";
import { audioManager } from "../../hooks/audioManager";

interface MobileAddTaskModalProps {
  open: boolean;
  accent: string;
  title?: string;
  placeholder?: string;
  availableTags?: string[];
  onClose: () => void;
  onAdd: (text: string, diff: TaskDifficulty, tag?: string) => void;
  onTagsChanged?: () => void;
}

export function MobileAddTaskModal({
  open,
  accent,
  title = "NOVA TAREFA",
  placeholder = "Nome da tarefa...",
  availableTags = [],
  onClose,
  onAdd,
  onTagsChanged,
}: MobileAddTaskModalProps) {
  const [text, setText] = useState("");
  const [diff, setDiff] = useState<TaskDifficulty>("easy");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [newTagInput, setNewTagInput] = useState("");
  const [showNewTag, setShowNewTag] = useState(false);
  const [pickedColor, setPickedColor] = useState<string>(TAG_PALETTE[0]);
  const [manageMode, setManageMode] = useState(false);

  useEffect(() => {
    if (open) {
      setText(""); setDiff("easy"); setSelectedTag("");
      setNewTagInput(""); setShowNewTag(false);
      setPickedColor(TAG_PALETTE[0]); setManageMode(false);
    }
  }, [open]);

  if (!open) return null;

  function handleAdd() {
    if (!text.trim()) return;
    audioManager.playClick("press");
    let finalTag: string | undefined;
    if (showNewTag && newTagInput.trim()) {
      finalTag = newTagInput.trim();
      ensureTag(finalTag);
      setTagColor(finalTag, pickedColor);
      onTagsChanged?.();
    } else {
      finalTag = selectedTag || undefined;
    }
    onAdd(text.trim(), diff, finalTag);
    setText(""); setDiff("easy"); setSelectedTag("");
    setNewTagInput(""); setShowNewTag(false);
    onClose();
  }

  function handleDeleteTag(tag: string) {
    removeTag(tag);
    if (selectedTag === tag) setSelectedTag("");
    onTagsChanged?.();
    audioManager.playClick("tap");
  }

  const hasTags = availableTags.length > 0;

  const content = (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(5, 7, 18, 0.82)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: "fixed",
        bottom: 0, left: "50%",
        transform: "translateX(-50%)",
        width: "100%", maxWidth: 640,
        zIndex: 9999,
        background: "#0d1024",
        borderTop: `2px solid ${accent}`,
        borderRadius: "20px 20px 0 0",
        padding: "0 0 44px",
        boxShadow: `0 -8px 40px rgba(0,0,0,0.75), 0 0 0 1px ${accent}20 inset`,
        animation: "mobileModalSlideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards",
      }}>
        <style>{`
          @keyframes mobileModalSlideUp {
            from { transform: translateX(-50%) translateY(100%); opacity: 0; }
            to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
          }
        `}</style>

        {/* Handle bar */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 40, height: 4, background: "#2a2e50", borderRadius: 2 }} />
        </div>

        {/* Header */}
        <div style={{ padding: "8px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: accent, textShadow: "1px 1px 0 #000" }}>
            {title}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#5a6080", cursor: "pointer", padding: 6, display: "flex", alignItems: "center" }}>
            <X size={20} />
          </button>
        </div>

        {/* Text input */}
        <div style={{ padding: "0 20px 16px" }}>
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") onClose(); }}
            style={{
              width: "100%", background: "#131629", border: `1px solid ${accent}44`,
              borderRadius: 10, color: "#fff", padding: "14px 16px",
              fontSize: 22, fontFamily: "'VT323', monospace", outline: "none", boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = accent)}
            onBlur={(e) => (e.target.style.borderColor = `${accent}44`)}
          />
        </div>

        {/* Difficulty picker */}
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#5a6080", letterSpacing: 1, marginBottom: 10 }}>
            DIFICULDADE
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["easy", "medium", "hard"] as TaskDifficulty[]).map((d) => {
              const info = DIFFICULTY_INFO[d];
              const active = diff === d;
              return (
                <button
                  key={d}
                  onClick={() => { audioManager.playClick("tap"); setDiff(d); }}
                  style={{
                    flex: 1, padding: "12px 8px",
                    background: active ? info.color + "20" : "transparent",
                    border: `2px solid ${active ? info.color : "#2a2e50"}`,
                    color: active ? info.color : "#5a6080",
                    fontFamily: "'VT323', monospace", fontSize: 20,
                    cursor: "pointer", borderRadius: 10, transition: "all 0.15s",
                  }}
                >
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tag section */}
        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#5a6080", letterSpacing: 1, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Tag size={10} /> TAG (OPCIONAL)
            </div>
            {hasTags && !showNewTag && (
              <button
                onClick={() => setManageMode(m => !m)}
                style={{
                  background: manageMode ? "rgba(230,57,70,0.12)" : "transparent",
                  border: `1px solid ${manageMode ? "#E6394655" : "#2a2e50"}`,
                  color: manageMode ? "#E63946" : "#3a4060",
                  padding: "3px 8px", borderRadius: 5, cursor: "pointer",
                  fontFamily: "'Press Start 2P', monospace", fontSize: 6,
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                <Trash2 size={8} /> {manageMode ? "FEITO" : "EDITAR"}
              </button>
            )}
          </div>

          {/* Existing tags */}
          {hasTags && !showNewTag && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {!manageMode && (
                <button
                  onClick={() => setSelectedTag("")}
                  style={{
                    padding: "5px 12px", borderRadius: 20,
                    background: !selectedTag ? "#2a2e5044" : "transparent",
                    border: `1px solid ${!selectedTag ? "#5a6080" : "#2a2e50"}`,
                    color: !selectedTag ? "#c8d0f0" : "#5a6080",
                    fontFamily: "'VT323', monospace", fontSize: 16, cursor: "pointer",
                  }}
                >
                  Nenhuma
                </button>
              )}
              {availableTags.map(tag => {
                const c = tagColor(tag);
                const active = selectedTag === tag;
                return manageMode ? (
                  <div key={tag} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                    <span style={{
                      padding: "5px 8px 5px 12px", borderRadius: "20px 0 0 20px",
                      background: `${c}18`, border: `1px solid ${c}55`, borderRight: "none",
                      color: c, fontFamily: "'VT323', monospace", fontSize: 16,
                    }}>
                      {tag}
                    </span>
                    <button
                      onClick={() => handleDeleteTag(tag)}
                      style={{
                        padding: "5px 10px", borderRadius: "0 20px 20px 0",
                        background: "rgba(230,57,70,0.12)", border: "1px solid #E6394655", borderLeft: "1px solid #E6394633",
                        color: "#E63946", cursor: "pointer", display: "flex", alignItems: "center",
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(active ? "" : tag)}
                    style={{
                      padding: "5px 12px", borderRadius: 20,
                      background: active ? `${c}22` : "transparent",
                      border: `1px solid ${active ? c : "#2a2e50"}`,
                      color: active ? c : "#5a6080",
                      fontFamily: "'VT323', monospace", fontSize: 16, cursor: "pointer",
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}

          {/* New tag input with color picker */}
          {showNewTag ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  autoFocus
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Nome da tag..."
                  onKeyDown={(e) => { if (e.key === "Escape") { setShowNewTag(false); setNewTagInput(""); } }}
                  style={{
                    flex: 1, background: "#131629", border: `1px solid ${pickedColor}55`,
                    borderRadius: 8, color: "#fff", padding: "10px 14px",
                    fontSize: 18, fontFamily: "'VT323', monospace", outline: "none",
                  }}
                />
                <button
                  onClick={() => { setShowNewTag(false); setNewTagInput(""); }}
                  style={{ background: "none", border: "1px solid #2a2e50", color: "#5a6080", padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}
                >
                  <X size={14} />
                </button>
              </div>
              {/* Color palette */}
              <div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#5a6080", marginBottom: 8 }}>COR DA TAG</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {TAG_PALETTE.map(c => (
                    <button
                      key={c}
                      onClick={() => setPickedColor(c)}
                      style={{
                        width: 28, height: 28, borderRadius: "50%", background: c,
                        border: "none", cursor: "pointer",
                        outline: pickedColor === c ? "3px solid #fff" : "3px solid transparent",
                        outlineOffset: 2, transition: "outline 0.1s",
                      }}
                    />
                  ))}
                </div>
              </div>
              {/* Preview */}
              {newTagInput.trim() && (
                <span style={{
                  alignSelf: "flex-start", padding: "4px 12px", borderRadius: 20,
                  fontFamily: "'VT323', monospace", fontSize: 16,
                  color: pickedColor, background: `${pickedColor}18`, border: `1px solid ${pickedColor}55`,
                }}>
                  {newTagInput.trim()}
                </span>
              )}
            </div>
          ) : (
            !manageMode && (
              <button
                onClick={() => { setShowNewTag(true); setSelectedTag(""); setManageMode(false); }}
                style={{
                  padding: "8px 14px", background: "transparent",
                  border: "1px dashed #2a2e50", color: "#5a6080",
                  fontFamily: "'VT323', monospace", fontSize: 16,
                  cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <Tag size={12} /> Nova tag...
              </button>
            )
          )}
        </div>

        {/* Add button */}
        <div style={{ padding: "0 20px" }}>
          <button
            onClick={handleAdd}
            disabled={!text.trim()}
            style={{
              width: "100%", padding: "16px",
              background: text.trim() ? `linear-gradient(135deg, ${accent}, ${accent}bb)` : "#1a1e37",
              border: "none", borderRadius: 12,
              color: text.trim() ? "#0d1024" : "#3a4060",
              fontFamily: "'Press Start 2P', monospace", fontSize: 12,
              cursor: text.trim() ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              boxShadow: text.trim() ? `0 0 20px ${accent}55` : "none",
            }}
          >
            + ADICIONAR TAREFA
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}