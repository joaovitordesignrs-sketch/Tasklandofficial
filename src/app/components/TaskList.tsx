import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task, TaskDifficulty, getTags, ensureTag, tagColor, removeTag, setTagColor, TAG_PALETTE } from "../data/missions";
import { DIFFICULTY_INFO, calcTaskDamage } from "../data/gameEngine";
import { Trash2, Check, GripVertical, Pencil, Plus, X, CheckSquare, Swords, MoreVertical, Tag, SlidersHorizontal, Calendar } from "lucide-react";
import { audioManager } from "../hooks/audioManager";
import { useCampaign } from "../hooks/useCampaign";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { cardInStyle } from "./ui/CardIn";
import { MobileAddTaskModal } from "./ui/MobileAddTaskModal";
import { DifficultyPicker } from "./ui/DifficultyPicker";
import { useTheme } from "../contexts/PreferencesContext";

const ITEM_TYPE = "TASK";

interface DragItem { index: number; id: string }

// ── Difficulty picker ─────────────────────────────────────────────────────────
function DifficultyPickerLocal({ value, onChange }: { value: TaskDifficulty; onChange: (d: TaskDifficulty) => void }) {
  return <DifficultyPicker value={value} onChange={onChange} />;
}

// ── Inline tag input for edit/add forms ──────────────────────────────────────
function TagInput({
  value, onChange, availableTags, onTagCreated,
}: { value: string; onChange: (t: string) => void; availableTags: string[]; onTagCreated?: () => void }) {
  const { BORDER_ELEVATED, TEXT_LIGHT, TEXT_MUTED, TEXT_INACTIVE, BG_CARD, FONT_BODY, alpha } = useTheme();
  const [showNew, setShowNew]       = useState(false);
  const [newVal, setNewVal]         = useState("");
  const [pickedColor, setPickedColor] = useState<string>(TAG_PALETTE[0]);

  function commitNewTag() {
    const t = newVal.trim();
    if (!t) { setShowNew(false); return; }
    ensureTag(t);
    setTagColor(t, pickedColor);
    onChange(t);
    onTagCreated?.();
    setNewVal("");
    setPickedColor(TAG_PALETTE[0]);
    setShowNew(false);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
        {/* No tag chip */}
        <button
          onClick={() => { onChange(""); setShowNew(false); }}
          style={{
            padding: "2px 10px", borderRadius: 20, fontSize: 13,
            fontFamily: FONT_BODY, cursor: "pointer",
            background: !value ? alpha(BORDER_ELEVATED, "44") : "transparent",
            border: `1px solid ${!value ? TEXT_MUTED : BORDER_ELEVATED}`,
            color: !value ? TEXT_LIGHT : TEXT_INACTIVE,
          }}
        >
          —
        </button>

        {availableTags.map(tag => {
          const c = tagColor(tag);
          const active = value === tag;
          return (
            <button
              key={tag}
              onClick={() => { onChange(active ? "" : tag); setShowNew(false); }}
              style={{
                padding: "2px 10px", borderRadius: 20, fontSize: 13,
                fontFamily: FONT_BODY, cursor: "pointer",
                background: active ? `${c}22` : "transparent",
                border: `1px solid ${active ? c : BORDER_ELEVATED}`,
                color: active ? c : TEXT_INACTIVE,
              }}
            >
              {tag}
            </button>
          );
        })}

        {/* Chip de fallback para tag recém-criada não ainda em availableTags */}
        {value && !availableTags.includes(value) && (() => {
          const c = tagColor(value);
          return (
            <span style={{
              padding: "2px 10px", borderRadius: 20, fontSize: 13,
              fontFamily: FONT_BODY,
              background: `${c}22`, border: `1px solid ${c}`, color: c,
            }}>
              {value}
            </span>
          );
        })()}

        {!showNew && (
          <button
            onClick={() => setShowNew(true)}
            style={{
              padding: "2px 8px", borderRadius: 20, fontSize: 13,
              fontFamily: FONT_BODY, cursor: "pointer",
              background: "transparent", border: `1px dashed ${BORDER_ELEVATED}`, color: TEXT_INACTIVE,
            }}
          >
            + new
          </button>
        )}

        {showNew && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4, width: "100%" }}>
            <div style={{ display: "flex", gap: 4 }}>
              <input
                autoFocus
                value={newVal}
                onChange={e => setNewVal(e.target.value)}
                placeholder="tag name..."
                onKeyDown={e => {
                  if (e.key === "Enter") commitNewTag();
                  if (e.key === "Escape") { setShowNew(false); setNewVal(""); }
                }}
                style={{
                  background: BG_CARD, border: `1px solid ${pickedColor}66`,
                  color: "#fff", padding: "2px 8px", fontSize: 14,
                  fontFamily: FONT_BODY, outline: "none",
                  borderRadius: 6, width: 110,
                }}
              />
              <button
                onClick={commitNewTag}
                style={{ background: `${pickedColor}22`, border: `1px solid ${pickedColor}66`, color: pickedColor, padding: "2px 8px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: FONT_BODY }}
              >
                OK
              </button>
              <button
                onClick={() => { setShowNew(false); setNewVal(""); }}
                style={{ background: "none", border: `1px solid ${BORDER_ELEVATED}`, color: TEXT_MUTED, padding: "2px 6px", borderRadius: 6, cursor: "pointer" }}
              >
                <X size={12} />
              </button>
            </div>
            {/* Color palette */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {TAG_PALETTE.map(c => (
                <button
                  key={c}
                  onClick={() => setPickedColor(c)}
                  title={c}
                  style={{
                    width: 20, height: 20, borderRadius: "50%", background: c, border: "none", cursor: "pointer",
                    outline: pickedColor === c ? `2px solid #fff` : "2px solid transparent",
                    outlineOffset: 1, transition: "outline 0.1s",
                  }}
                />
              ))}
            </div>
            {/* Preview */}
            {newVal.trim() && (
              <span style={{
                alignSelf: "flex-start", padding: "1px 8px", borderRadius: 20, fontSize: 12,
                fontFamily: FONT_BODY, color: pickedColor,
                background: `${pickedColor}18`, border: `1px solid ${pickedColor}55`,
              }}>
                {newVal.trim()}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TaskItem ──────────────────────────────────────────────────────────────────
interface TaskItemProps {
  task:           Task;
  index:          number;
  isSelected:     boolean;
  showDamage:     boolean;
  playerLevel:    number;
  isMobile:       boolean;
  dndDisabled:    boolean;
  availableTags:  string[];
  onToggleSelect: (id: string) => void;
  onDelete:       (id: string) => void;
  onEdit:         (id: string, updates: Partial<Task>) => void;
  onMoveTask:     (di: number, hi: number) => void;
  onUncomplete:   (id: string) => void;
  onTagCreated:   () => void;
}

function TaskItem({
  task, index, isSelected, showDamage, playerLevel, isMobile, dndDisabled,
  availableTags, onToggleSelect, onDelete, onEdit, onMoveTask, onUncomplete, onTagCreated,
}: TaskItemProps) {
  const { BORDER_ELEVATED, BORDER_SUBTLE, BG_CARD, BG_DEEPEST, ACCENT_GOLD, COLOR_DANGER, COLOR_SUCCESS, TEXT_MUTED, TEXT_INACTIVE, TEXT_LIGHT, FONT_PIXEL, FONT_BODY, alpha } = useTheme();
  const [isEditing,   setIsEditing]   = useState(false);
  const [editText,    setEditText]    = useState(task.text);
  const [editDiff,    setEditDiff]    = useState<TaskDifficulty>(task.difficulty ?? "easy");
  const [editTag,     setEditTag]     = useState<string>(task.tag ?? "");
  const [editDueDate, setEditDueDate] = useState<string>(task.dueDate ?? "");
  const [actionsOpen, setActionsOpen] = useState(false);
  const ref      = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: ITEM_TYPE,
    collect(monitor) { return { handlerId: monitor.getHandlerId() }; },
    hover(item, monitor) {
      if (!ref.current || isMobile || dndDisabled) return;
      const drag = item.index, hover = index;
      if (drag === hover) return;
      const rect  = ref.current.getBoundingClientRect();
      const midY  = (rect.bottom - rect.top) / 2;
      const off   = monitor.getClientOffset();
      if (!off) return;
      const cy = off.y - rect.top;
      if (drag < hover && cy < midY) return;
      if (drag > hover && cy > midY) return;
      onMoveTask(drag, hover);
      item.index = hover;
    },
  });

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: ITEM_TYPE,
    item: () => ({ id: task.id, index }),
    collect: (m) => ({ isDragging: m.isDragging() }),
  });
  dragPreview(drop(ref));

  function startEdit() {
    setEditText(task.text);
    setEditDiff(task.difficulty ?? "easy");
    setEditTag(task.tag ?? "");
    setEditDueDate(task.dueDate ?? "");
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }
  function saveEdit() {
    if (editText.trim()) {
      if (editTag) ensureTag(editTag);
      onEdit(task.id, { text: editText.trim(), difficulty: editDiff, tag: editTag || undefined, dueDate: editDueDate || undefined });
    }
    setIsEditing(false);
  }
  function keyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") { setEditText(task.text); setIsEditing(false); }
  }

  const diff     = task.difficulty ?? "easy";
  const diffInfo = DIFFICULTY_INFO[diff];
  const dmg      = calcTaskDamage(task, playerLevel);
  const tc       = task.tag ? tagColor(task.tag) : null;

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      style={{
        opacity:      isDragging ? 0.4 : 1,
        background:   isSelected ? "rgba(227,159,100,0.08)" : task.completed ? "rgba(78,222,128,0.04)" : "transparent",
        borderBottom: "1px solid rgba(31,37,79,0.7)",
        borderLeft:   isSelected ? `3px solid ${ACCENT_GOLD}` : task.completed ? `3px solid ${alpha(COLOR_SUCCESS, "40")}` : "3px solid transparent",
        transition:   "background 0.15s, border-color 0.15s",
        userSelect:   "none",
        cursor:       !task.completed && !isEditing ? "pointer" : "default",
        position: "relative",
        zIndex:   actionsOpen ? 1000 : "auto",
        ...cardInStyle(index),
      }}
      onClick={(e) => {
        if (task.completed || isEditing) return;
        const target = e.target as HTMLElement;
        if (target.closest("[data-action]")) return;
        audioManager.playClick("tap");
        onToggleSelect(task.id);
      }}
    >
      <div className="flex items-center gap-2 px-3" style={{ minHeight: 52 }}>

        {/* Drag handle — desktop only, hidden on mobile or when DnD disabled */}
        {!isMobile && !task.completed && !dndDisabled ? (
          <div ref={drag} data-action="drag" style={{ color: TEXT_INACTIVE, cursor: "grab", flexShrink: 0, padding: "16px 4px 16px 0", touchAction: "none" }}>
            <GripVertical size={15} />
          </div>
        ) : (
          <div style={{ width: !isMobile ? 19 : 0, flexShrink: 0 }} />
        )}

        {/* Checkbox */}
        {!task.completed ? (
          <div style={{ flexShrink: 0, width: 22, height: 22, background: isSelected ? alpha(ACCENT_GOLD, "33") : "transparent", border: `1px solid ${isSelected ? ACCENT_GOLD : BORDER_ELEVATED}`, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
            {isSelected && <Check size={13} color={ACCENT_GOLD} strokeWidth={2.5} />}
          </div>
        ) : (
          <button
            data-action="uncomplete"
            onClick={(e) => { e.stopPropagation(); audioManager.playClick("tap"); onUncomplete(task.id); }}
            style={{ flexShrink: 0, width: 22, height: 22, background: alpha(COLOR_SUCCESS, "1f"), border: `1px solid ${alpha(COLOR_SUCCESS, "80")}`, borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = alpha(COLOR_DANGER, "26"); (e.currentTarget as HTMLButtonElement).style.borderColor = COLOR_DANGER; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = alpha(COLOR_SUCCESS, "1f"); (e.currentTarget as HTMLButtonElement).style.borderColor = alpha(COLOR_SUCCESS, "80"); }}
          >
            <Check size={13} color={COLOR_SUCCESS} strokeWidth={2.5} />
          </button>
        )}

        {/* Text */}
        <div style={{ flex: 1, paddingTop: 6, paddingBottom: 6, minWidth: 0 }}>
          {isEditing ? (
            <input
              ref={inputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={keyDown}
              style={{ width: "100%", background: BG_CARD, border: `1px solid ${ACCENT_GOLD}`, color: "#fff", padding: "4px 8px", fontSize: 19, fontFamily: FONT_BODY, outline: "none", borderRadius: 4 }}
            />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ color: task.completed ? TEXT_INACTIVE : "#fff", fontSize: 19, fontFamily: FONT_BODY, textDecoration: task.completed ? "line-through" : "none" }}>
                {task.text}
              </span>
              {/* Tag badge */}
              {task.tag && tc && (
                <span style={{
                  fontSize: 12, fontFamily: FONT_BODY,
                  color: tc, background: `${tc}18`,
                  border: `1px solid ${tc}44`,
                  padding: "1px 7px", borderRadius: 20, whiteSpace: "nowrap",
                  opacity: task.completed ? 0.5 : 1,
                }}>
                  {task.tag}
                </span>
              )}
              {/* Due date badge */}
              {task.dueDate && (() => {
                const today = new Date().toISOString().slice(0, 10);
                const isToday = task.dueDate === today;
                const isOverdue = task.dueDate < today && !task.completed;
                const badgeColor = isOverdue ? COLOR_DANGER : isToday ? COLOR_SUCCESS : TEXT_INACTIVE;
                const badgeLabel = isOverdue ? "OVERDUE" : isToday ? "TODAY" : task.dueDate;
                return (
                  <span style={{
                    fontSize: 12, fontFamily: FONT_BODY,
                    color: badgeColor, background: `${badgeColor}18`,
                    border: `1px solid ${badgeColor}44`,
                    padding: "1px 7px", borderRadius: 20, whiteSpace: "nowrap",
                    opacity: task.completed ? 0.5 : 1,
                  }}>
                    {badgeLabel}
                  </span>
                );
              })()}
            </div>
          )}
        </div>

        {/* Difficulty badge */}
        {!isEditing && !task.completed && (
          <span style={{ flexShrink: 0, padding: "1px 7px", background: diffInfo.color + "15", border: `1px solid ${diffInfo.color}55`, color: diffInfo.color, fontSize: 13, fontFamily: FONT_BODY, borderRadius: 4 }}>
            {diffInfo.short}
          </span>
        )}

        {/* Damage preview */}
        {showDamage && !task.completed && !isEditing && (
          <span style={{ flexShrink: 0, color: COLOR_DANGER, fontSize: 14, fontFamily: FONT_BODY, whiteSpace: "nowrap" }}>
            -{dmg}HP
          </span>
        )}

        {/* Completed checkmark */}
        {task.completed && !isEditing && (
          <span style={{ color: COLOR_SUCCESS, fontSize: 14, fontFamily: FONT_BODY, flexShrink: 0 }}>✓</span>
        )}

        {/* ── Actions: float menu ── */}
        <div data-action="actions" style={{ position: "relative", flexShrink: 0 }}>
          {!isEditing ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); audioManager.playClick("tap"); setActionsOpen(o => !o); }}
                style={{ background: "none", border: "none", color: actionsOpen ? ACCENT_GOLD : TEXT_MUTED, cursor: "pointer", padding: "8px 6px", display: "flex", alignItems: "center", transition: "color 0.15s" }}
              >
                <MoreVertical size={15} />
              </button>

              {actionsOpen && (
                <>
                  <div
                    onClick={(e) => { e.stopPropagation(); setActionsOpen(false); }}
                    style={{ position: "fixed", inset: 0, zIndex: 49 }}
                  />
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 50,
                    background: BG_CARD, border: `1px solid ${BORDER_ELEVATED}`, borderRadius: 8,
                    overflow: "hidden", minWidth: 128,
                    boxShadow: "0 8px 28px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset",
                  }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(); setActionsOpen(false); }}
                      style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", color: ACCENT_GOLD, fontFamily: FONT_BODY, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background 0.1s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = alpha(ACCENT_GOLD, "1a"); }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <div style={{ height: 1, background: BORDER_SUBTLE }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); audioManager.playClick("tap"); onDelete(task.id); setActionsOpen(false); }}
                      style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", color: COLOR_DANGER, fontFamily: FONT_BODY, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background 0.1s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = alpha(COLOR_DANGER, "1a"); }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setEditText(task.text); setIsEditing(false); }}
              style={{ background: "none", border: "none", color: TEXT_MUTED, cursor: "pointer", padding: 8 }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Edit mode: difficulty + tag + save */}
      {isEditing && (
        <div style={{ paddingLeft: isMobile ? 32 : 44, paddingRight: 12, paddingBottom: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          <DifficultyPickerLocal value={editDiff} onChange={setEditDiff} />

          {/* Tag picker */}
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: TEXT_MUTED, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <Tag size={11} /> TAG
            </div>
            <TagInput value={editTag} onChange={setEditTag} availableTags={availableTags} onTagCreated={onTagCreated} />
          </div>

          {/* Due date */}
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: TEXT_MUTED, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={11} /> DUE DATE
            </div>
            <input
              type="date"
              value={editDueDate}
              onChange={e => setEditDueDate(e.target.value)}
              style={{
                background: BG_DEEPEST, border: `1px solid ${BORDER_ELEVATED}`,
                color: TEXT_LIGHT, padding: "4px 8px", fontSize: 15,
                fontFamily: FONT_BODY, borderRadius: 4, outline: "none",
                colorScheme: "dark",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveEdit} style={{ padding: "4px 16px", background: ACCENT_GOLD, border: "none", color: BG_CARD, fontFamily: FONT_BODY, fontSize: 16, cursor: "pointer", borderRadius: 5 }}>
              Save
            </button>
            <button onClick={() => { setEditText(task.text); setIsEditing(false); }} style={{ padding: "4px 12px", background: "transparent", border: `1px solid ${BORDER_ELEVATED}`, color: TEXT_MUTED, fontFamily: FONT_BODY, fontSize: 16, cursor: "pointer", borderRadius: 5 }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TaskList ──────────────────────────────────────────────────────────────────
interface TaskListProps {
  tasks:       Task[];
  onChange:    (tasks: Task[]) => void;
  onComplete?: (count: number, completedIds: string[]) => void;
  onUncomplete?: (taskId: string) => void;
  onDeleteTask?: (task: Task) => void;
  showDamage?: boolean;
  playerLevel?: number;
  hideAttackButton?: boolean;
  addTriggerRef?: React.MutableRefObject<(() => void) | null>;
  onAddFormToggle?: (open: boolean) => void;
}

export function TaskList({ tasks, onChange, onComplete, onUncomplete, onDeleteTask, showDamage = false, playerLevel = 1, hideAttackButton = false, addTriggerRef, onAddFormToggle }: TaskListProps) {
  const { BG_CARD, BG_DEEPEST, BORDER_SUBTLE, BORDER_ELEVATED, ACCENT_GOLD, COLOR_DANGER, COLOR_SUCCESS, TEXT_INACTIVE, TEXT_MUTED, TEXT_LIGHT, FONT_PIXEL, FONT_BODY, alpha } = useTheme();
  const isDesktop = useIsDesktop();
  const isMobile  = !isDesktop;

  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [showAddInput, setShowAddInputRaw] = useState(false);

  // Tag state
  const [availableTags,    setAvailableTags]    = useState<string[]>(() => getTags());
  const [activeTagFilters, setActiveTagFilters] = useState<Set<string>>(new Set());
  const [newTaskTag,       setNewTaskTag]       = useState<string>("");
  const [newTagInput,      setNewTagInput]      = useState("");
  const [showNewTagInput,  setShowNewTagInput]  = useState(false);
  const [showFilterBar,    setShowFilterBar]    = useState<boolean>(() => {
    try { return localStorage.getItem("rpg_tagfilter_open_v1") !== "false"; } catch { return true; }
  });

  // Refresh tags whenever we add/delete one
  const refreshTags = useCallback(() => setAvailableTags(getTags()), []);

  const headerRef = useRef<HTMLDivElement>(null);

  function handleDeleteTag(tag: string) {
    removeTag(tag);
    setActiveTagFilters(prev => { const n = new Set(prev); n.delete(tag); return n; });
    refreshTags();
    audioManager.playClick("tap");
  }

  function toggleTagFilter(tag: string) {
    audioManager.playClick("tap");
    setActiveTagFilters(prev => {
      const n = new Set(prev);
      n.has(tag) ? n.delete(tag) : n.add(tag);
      return n;
    });
  }

  function clearTagFilters() {
    audioManager.playClick("tap");
    setActiveTagFilters(new Set());
  }

  function toggleFilterBar() {
    setShowFilterBar(v => {
      const next = !v;
      try { localStorage.setItem("rpg_tagfilter_open_v1", String(next)); } catch {}
      return next;
    });
    audioManager.playClick("tap");
  }

  const setShowAddInput = useCallback((val: boolean) => {
    setShowAddInputRaw(val);
    onAddFormToggle?.(val);
    if (val) {
      setTimeout(() => {
        headerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 30);
    }
  }, [onAddFormToggle]);

  const [newText, setNewText] = useState("");
  const [newDiff, setNewDiff] = useState<TaskDifficulty>("easy");
  const [newDueDate, setNewDueDate] = useState("");

  const sortedTasks = useMemo(() => {
    const uncompleted = tasks.filter((t) => !t.completed);
    const completed   = tasks.filter((t) => t.completed);
    return [...uncompleted, ...completed];
  }, [tasks]);

  // Apply tag filter for display
  const displayTasks = useMemo(() => {
    if (!activeTagFilters.size) return sortedTasks;
    return sortedTasks.filter(t => t.tag && activeTagFilters.has(t.tag));
  }, [sortedTasks, activeTagFilters]);

  // DnD index map — maps display positions to original task indices
  const dndIndexMap = useMemo(() => {
    return displayTasks.map((t) => tasks.indexOf(t));
  }, [displayTasks, tasks]);

  const dndDisabled = activeTagFilters.size > 0; // disable drag-and-drop when filtered

  const { setSelectedTaskCount, attackCallbackRef } = useCampaign();

  useEffect(() => {
    setSelectedTaskCount(selected.size);
  }, [selected, setSelectedTaskCount]);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task && onDeleteTask) {
      onDeleteTask(task);
    } else {
      onChange(tasks.filter((t) => t.id !== id));
    }
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }, [tasks, onChange, onDeleteTask]);

  const handleEdit = useCallback((id: string, updates: Partial<Task>) => {
    onChange(tasks.map((t) => t.id === id ? { ...t, ...updates } : t));
    refreshTags();
  }, [tasks, onChange, refreshTags]);

  const handleMoveTask = useCallback((di: number, hi: number) => {
    if (isMobile || dndDisabled) return;
    const origDi = dndIndexMap[di];
    const origHi = dndIndexMap[hi];
    if (origDi === undefined || origHi === undefined) return;
    const u = [...tasks]; const [r] = u.splice(origDi, 1); u.splice(origHi, 0, r); onChange(u);
  }, [tasks, onChange, dndIndexMap, isMobile, dndDisabled]);

  const handleUncomplete = useCallback((id: string) => {
    onChange(tasks.map((t) => t.id === id ? { ...t, completed: false, completedAt: undefined } : t));
    onUncomplete?.(id);
  }, [tasks, onChange, onUncomplete]);

  const handleCompleteSelected = useCallback(() => {
    const now = Date.now();
    const ids = Array.from(selected).filter((id) => tasks.find((t) => t.id === id && !t.completed));
    if (!ids.length) return;
    onChange(tasks.map((t) => ids.includes(t.id) ? { ...t, completed: true, completedAt: now } : t));
    setSelected(new Set());
    onComplete?.(ids.length, ids);
  }, [tasks, selected, onChange, onComplete]);

  useEffect(() => {
    attackCallbackRef.current = handleCompleteSelected;
    return () => { attackCallbackRef.current = null; };
  }, [handleCompleteSelected, attackCallbackRef]);

  const handleAdd = useCallback((text: string, diff: TaskDifficulty, tag?: string) => {
    if (tag) ensureTag(tag);
    onChange([{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text, completed: false, difficulty: diff, tag: tag || undefined }, ...tasks]);
    refreshTags();
  }, [tasks, onChange, refreshTags]);

  useEffect(() => {
    if (addTriggerRef) {
      addTriggerRef.current = () => {
        setShowAddInput(true);
        setTimeout(() => {
          headerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          window.scrollTo({ top: 0, behavior: "smooth" });
          document.getElementById("new-task-input")?.focus();
        }, 60);
      };
    }
    return () => { if (addTriggerRef) addTriggerRef.current = null; };
  }, [addTriggerRef, setShowAddInput]);

  const handleAddDesktop = useCallback(() => {
    if (!newText.trim()) return;
    const tag = showNewTagInput ? newTagInput.trim() : newTaskTag || undefined;
    if (tag) ensureTag(tag);
    onChange([{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text: newText.trim(), completed: false, difficulty: newDiff, tag: tag || undefined, dueDate: newDueDate || undefined }, ...tasks]);
    setNewText(""); setNewDiff("easy"); setNewTaskTag(""); setNewTagInput(""); setShowNewTagInput(false); setNewDueDate("");
    setShowAddInput(false);
    refreshTags();
  }, [tasks, newText, newDiff, newTaskTag, newTagInput, showNewTagInput, newDueDate, onChange, refreshTags]);

  const handleSelectAll = useCallback(() => {
    const uc = displayTasks.filter((t) => !t.completed).map((t) => t.id);
    if (selected.size === uc.length && uc.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(uc));
    }
  }, [displayTasks, selected]);

  const uncompletedCount = displayTasks.filter((t) => !t.completed).length;
  const completedCount   = displayTasks.filter((t) => t.completed).length;
  const allTags          = availableTags;

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{
        background: BG_CARD,
        border: isDesktop ? `1px solid ${alpha(BORDER_ELEVATED, "cc")}` : "none",
        borderRadius: isDesktop ? 10 : 0,
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* ── Toolbar ── */}
        <div ref={headerRef} style={{ background: BG_DEEPEST, borderBottom: `1px solid ${BORDER_SUBTLE}`, padding: "8px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button
            onClick={() => { audioManager.playClick("tap"); handleSelectAll(); }}
            style={{ background: "none", border: "none", color: TEXT_MUTED, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 15, fontFamily: FONT_BODY, transition: "color 0.15s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = ACCENT_GOLD)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = TEXT_MUTED)}
          >
            <CheckSquare size={14} />
            {selected.size === uncompletedCount && uncompletedCount > 0 ? "Deselect" : "All"}
          </button>

          <div style={{ flex: 1 }} />
          <span style={{ color: TEXT_MUTED, fontSize: 15, fontFamily: FONT_BODY }}>
            {completedCount}/{activeTagFilters.size > 0 ? displayTasks.length : tasks.length}
          </span>

          {/* Tag filter toggle */}
          {allTags.length > 0 && (
            <button
              onClick={toggleFilterBar}
              title={showFilterBar ? "Hide filters" : "Filter by tag"}
              style={{
                background: showFilterBar ? "rgba(124,77,255,0.18)" : "transparent",
                border: `1px solid ${showFilterBar ? "#7c4dff" : BORDER_ELEVATED}`,
                color: showFilterBar ? "#a78bfa" : TEXT_MUTED,
                padding: "4px 8px", borderRadius: 6, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
                fontFamily: FONT_BODY, fontSize: 14, transition: "all 0.15s",
              }}
            >
              <SlidersHorizontal size={13} />
              {activeTagFilters.size > 0 && (
                <span style={{ color: "#a78bfa" }}>{activeTagFilters.size}</span>
              )}
            </button>
          )}

          {isDesktop && (
            <button
              data-onboarding="add-task-btn"
              onClick={() => {
                audioManager.playClick("press");
                setShowAddInput(true);
                setTimeout(() => {
                  headerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  document.getElementById("new-task-input")?.focus();
                }, 50);
              }}
              style={{
                background: alpha(ACCENT_GOLD, "2e"), border: `2px dashed ${ACCENT_GOLD}`,
                color: ACCENT_GOLD, padding: "5px 11px", fontFamily: FONT_BODY,
                fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                transition: "all 0.2s", borderRadius: 6,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = alpha(ACCENT_GOLD, "4d"); }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = alpha(ACCENT_GOLD, "2e"); }}
              title="New Task"
            >
              <Plus size={14} /> New Task
            </button>
          )}
        </div>

        {/* ── Tag filter bar ── */}
        {allTags.length > 0 && showFilterBar && (
          <div style={{
            background: BG_DEEPEST, borderBottom: `1px solid ${BORDER_SUBTLE}`,
            padding: "6px 14px", display: "flex", gap: 6, overflowX: "auto",
            scrollbarWidth: "none", flexShrink: 0, alignItems: "center",
          }}>
            <Tag size={11} color={TEXT_INACTIVE} style={{ flexShrink: 0 }} />
            {/* "Todas" chip */}
            <button
              onClick={clearTagFilters}
              style={{
                padding: "3px 12px", borderRadius: 20, whiteSpace: "nowrap",
                background: !activeTagFilters.size ? alpha(BORDER_ELEVATED, "44") : "transparent",
                border: `1px solid ${!activeTagFilters.size ? TEXT_MUTED : BORDER_ELEVATED}`,
                color: !activeTagFilters.size ? TEXT_LIGHT : TEXT_INACTIVE,
                fontFamily: FONT_BODY, fontSize: 15, cursor: "pointer", flexShrink: 0,
              }}
            >
              All
            </button>

            {allTags.map(tag => {
              const c = tagColor(tag);
              const active = activeTagFilters.has(tag);
              return (
                <div key={tag} style={{ display: "flex", alignItems: "stretch", flexShrink: 0, borderRadius: 20, overflow: "hidden", border: `1px solid ${active ? c : BORDER_ELEVATED}` }}>
                  {/* Tag name — selects/deselects */}
                  <button
                    onClick={() => toggleTagFilter(tag)}
                    style={{
                      padding: "3px 10px 3px 13px", whiteSpace: "nowrap",
                      background: active ? `${c}22` : "transparent",
                      border: "none",
                      color: active ? c : TEXT_INACTIVE,
                      fontFamily: FONT_BODY, fontSize: 15, cursor: "pointer",
                    }}
                  >
                    {tag}
                  </button>
                  {/* Separator */}
                  <div style={{ width: 1, background: active ? `${c}44` : BORDER_ELEVATED, flexShrink: 0 }} />
                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteTag(tag)}
                    title={`Delete tag "${tag}"`}
                    style={{
                      padding: "3px 9px",
                      background: active ? `${c}22` : "transparent",
                      border: "none",
                      color: active ? `${c}99` : "#4a5070",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "color 0.1s, background 0.1s",
                      fontSize: 15, lineHeight: 1,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = COLOR_DANGER;
                      (e.currentTarget as HTMLButtonElement).style.background = alpha(COLOR_DANGER, "26");
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = active ? `${c}99` : "#4a5070";
                      (e.currentTarget as HTMLButtonElement).style.background = active ? `${c}22` : "transparent";
                    }}
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Desktop inline add form ── */}
        {showAddInput && isDesktop && (
          <div style={{ flexShrink: 0, borderLeft: `3px solid ${ACCENT_GOLD}` }}>
            {/* Text row */}
            <div style={{ background: BG_DEEPEST, borderBottom: `1px solid ${BORDER_SUBTLE}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <input
                id="new-task-input"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Task name..."
                onKeyDown={(e) => { if (e.key === "Enter") handleAddDesktop(); if (e.key === "Escape") { setShowAddInput(false); setNewText(""); } }}
                style={{ flex: 1, background: BG_CARD, border: `1px solid ${alpha(ACCENT_GOLD, "66")}`, color: "#fff", padding: "6px 10px", fontSize: 19, fontFamily: FONT_BODY, outline: "none", borderRadius: 5 }}
              />
              <button onClick={() => { audioManager.playClick("press"); handleAddDesktop(); }} style={{ background: alpha(ACCENT_GOLD, "26"), border: `2px dashed ${ACCENT_GOLD}`, color: ACCENT_GOLD, padding: "6px 14px", fontFamily: FONT_BODY, fontSize: 17, cursor: "pointer", borderRadius: 5 }}>
                +
              </button>
              <button onClick={() => { setShowAddInput(false); setNewText(""); setNewTaskTag(""); }} style={{ background: "none", border: "none", color: TEXT_MUTED, cursor: "pointer", padding: 4 }}>
                <X size={14} />
              </button>
            </div>
            {/* Difficulty row */}
            <div style={{ background: BG_DEEPEST, borderBottom: `1px solid ${BORDER_SUBTLE}`, padding: "6px 14px 8px" }}>
              <div style={{ color: TEXT_MUTED, fontSize: 13, fontFamily: FONT_BODY, marginBottom: 5 }}>DIFFICULTY</div>
              <DifficultyPickerLocal value={newDiff} onChange={setNewDiff} />
            </div>
            {/* Tag row */}
            <div style={{ background: BG_DEEPEST, borderBottom: `1px solid ${BORDER_SUBTLE}`, padding: "6px 14px 10px" }}>
              <div style={{ color: TEXT_MUTED, fontSize: 13, fontFamily: FONT_BODY, marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
                <Tag size={11} /> TAG (OPTIONAL)
              </div>
              <TagInput
                value={showNewTagInput ? newTagInput : newTaskTag}
                onChange={(t) => {
                  setNewTaskTag(t);
                  setShowNewTagInput(false);
                  setNewTagInput("");
                }}
                availableTags={availableTags}
                onTagCreated={refreshTags}
              />
            </div>
            {/* Due date row */}
            <div style={{ background: BG_DEEPEST, borderBottom: `1px solid ${BORDER_SUBTLE}`, padding: "6px 14px 10px" }}>
              <div style={{ color: TEXT_MUTED, fontSize: 13, fontFamily: FONT_BODY, marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={11} /> DUE DATE (OPTIONAL)
              </div>
              <input
                type="date"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                style={{
                  background: BG_CARD, border: `1px solid ${alpha(ACCENT_GOLD, "44")}`,
                  color: TEXT_LIGHT, padding: "6px 10px", fontSize: 16,
                  fontFamily: FONT_BODY, borderRadius: 5, outline: "none",
                  colorScheme: "dark",
                }}
              />
            </div>
          </div>
        )}

        {/* ── Task items ── */}
        <div>
          {displayTasks.length === 0 && !showAddInput && (
            <div style={{ color: TEXT_INACTIVE, textAlign: "center", padding: "40px 20px", fontSize: 20, fontFamily: FONT_BODY }}>
              {activeTagFilters.size > 0
                ? `No tasks with the selected tags.`
                : "No tasks. Add one to start the battle!"}
            </div>
          )}

          {displayTasks.map((task, index) => {
            const isFirstCompleted = task.completed && (index === 0 || !displayTasks[index - 1].completed);
            return (
              <div key={task.id}>
                {isFirstCompleted && uncompletedCount > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: BG_DEEPEST }}>
                    <div style={{ flex: 1, height: 1, background: BORDER_SUBTLE }} />
                    <span style={{ color: TEXT_INACTIVE, fontSize: 13, fontFamily: FONT_BODY, whiteSpace: "nowrap" }}>
                      COMPLETED ({completedCount})
                    </span>
                    <div style={{ flex: 1, height: 1, background: BORDER_SUBTLE }} />
                  </div>
                )}
                <TaskItem
                  task={task}
                  index={index}
                  isSelected={selected.has(task.id)}
                  showDamage={showDamage}
                  playerLevel={playerLevel}
                  isMobile={isMobile}
                  dndDisabled={dndDisabled}
                  availableTags={availableTags}
                  onToggleSelect={toggleSelect}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onMoveTask={handleMoveTask}
                  onUncomplete={handleUncomplete}
                  onTagCreated={refreshTags}
                />
              </div>
            );
          })}
        </div>

        {/* ── Desktop sticky attack button ── */}
        {selected.size > 0 && !hideAttackButton && isDesktop && (
          <div style={{ position: "sticky", bottom: 0, zIndex: 20, padding: "10px 12px", background: alpha(BG_CARD, "f8"), borderTop: `1px solid ${BORDER_SUBTLE}`, flexShrink: 0 }}>
            <button
              onClick={() => { audioManager.playClick("press"); handleCompleteSelected(); }}
              style={{
                width: "100%", padding: "14px 24px",
                background: selected.size >= 5
                  ? "linear-gradient(135deg, #FF6B35, #FFD700)"
                  : selected.size >= 3
                  ? "linear-gradient(135deg, #FF6B35, #FFD700)"
                  : selected.size >= 2
                  ? `linear-gradient(135deg, ${COLOR_SUCCESS}, #22D3EE)`
                  : "#4ded6e",
                border: "none", color: BG_CARD,
                fontFamily: FONT_PIXEL,
                fontSize: selected.size >= 3 ? 12 : 11,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                borderRadius: 8,
                boxShadow: selected.size >= 3
                  ? "0 0 24px rgba(255,107,53,0.45), 0 4px 16px rgba(0,0,0,0.4)"
                  : "0 0 18px rgba(6,255,165,0.35), 0 4px 16px rgba(0,0,0,0.4)",
                animation: selected.size >= 3 ? "pulse 0.8s infinite" : "none",
              }}
            >
              <Swords size={16} />
              {selected.size >= 5
                ? `CRITICAL HIT!!! ×${selected.size}`
                : selected.size >= 3
                ? `TRIPLE STRIKE! (${selected.size})`
                : selected.size >= 2
                ? `DOUBLE STRIKE! (${selected.size})`
                : `ATTACK! (${selected.size})`}
            </button>
          </div>
        )}
      </div>

      {/* ── Mobile add-task modal ── */}
      <MobileAddTaskModal
        open={showAddInput && isMobile}
        accent={ACCENT_GOLD}
        title="NEW TASK"
        placeholder="Task name..."
        availableTags={availableTags}
        onClose={() => setShowAddInput(false)}
        onAdd={handleAdd}
      />
    </DndProvider>
  );
}