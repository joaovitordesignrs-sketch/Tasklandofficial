/**
 * ItemsTab — Aba de inventário e equipamento de itens.
 * Usada dentro do ProfileScreen (tab ITENS).
 */
import { useState, useCallback } from "react";
import { Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import { PixelIcon } from "./ui/PixelIcon";
import { CardIn } from "./ui/CardIn";
import { RpgButton } from "./ui/RpgButton";
import {
  ITEM_TEMPLATES, SLOT_INFO, TIER_MULTIPLIERS, TIER_NAMES, TIER_COLORS,
  ESSENCE_COSTS, getItems, equipItem, unequipItem, upgradeItem,
  getItemBonus, getItemTemplate,
  type ItemSlot, type UserItem,
} from "../data/items";
import { getEconomy, spendEssences } from "../data/economy";
import { useTheme } from "../contexts/PreferencesContext";

const SLOTS: ItemSlot[] = ["weapon", "armor", "accessory", "relic"];

export function ItemsTab() {
  const {
    BG_CARD, BG_DEEPEST, BORDER_SUBTLE, BORDER_ELEVATED,
    COLOR_SUCCESS, COLOR_MAGE, COLOR_DANGER, COLOR_LEGENDARY,
    TEXT_MUTED, TEXT_LIGHT, TEXT_INACTIVE,
    FONT_PIXEL, FONT_BODY, RADIUS_LG, RADIUS_PILL, alpha,
  } = useTheme();
  const [tick,         setTick]         = useState(0);
  const [openSlot,     setOpenSlot]     = useState<ItemSlot | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const refresh = useCallback(() => setTick(t => t + 1), []);
  void tick;

  const items   = getItems();
  const econ    = getEconomy();
  const essence = econ.monsterEssences ?? 0;

  const equippedBySlot = Object.fromEntries(
    SLOTS.map(slot => [
      slot,
      items.find(i => i.is_equipped && getItemTemplate(i.template_id)?.slot === slot) ?? null,
    ])
  ) as Record<ItemSlot, UserItem | null>;

  function itemsForSlot(slot: ItemSlot) {
    return items.filter(i => getItemTemplate(i.template_id)?.slot === slot);
  }

  function handleEquip(id: string)   { equipItem(id);   refresh(); }
  function handleUnequip(id: string) { unequipItem(id); refresh(); }
  function handleUpgrade(id: string) {
    if (upgradeItem(id, spendEssences)) refresh();
  }

  const selected    = selectedItem ? items.find(i => i.id === selectedItem) ?? null : null;
  const selectedTpl = selected ? getItemTemplate(selected.template_id) ?? null : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

      {/* Essence balance */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: alpha(COLOR_MAGE, "0d"),
        border: `1px solid ${alpha(COLOR_MAGE, "44")}`,
        borderLeft: `3px solid ${COLOR_MAGE}`,
        borderRadius: RADIUS_LG,
        padding: "10px 14px",
      }}>
        <Sparkles size={14} color={COLOR_MAGE} />
        <span style={{ fontFamily: FONT_BODY, fontSize: 18, color: COLOR_MAGE }}>Monster Essence</span>
        <span style={{ fontFamily: FONT_BODY, fontSize: 20, color: COLOR_MAGE, marginLeft: "auto", fontWeight: "bold" }}>
          {essence.toLocaleString("en-US")}
        </span>
      </div>

      {/* Slot list */}
      {SLOTS.map((slot, idx) => {
        const equipped  = equippedBySlot[slot];
        const eqTpl     = equipped ? getItemTemplate(equipped.template_id) : null;
        const slotInfo  = SLOT_INFO[slot];
        const isOpen    = openSlot === slot;
        const slotItems = itemsForSlot(slot);

        return (
          <CardIn key={slot} index={idx}>
            {/* Slot header */}
            <div
              onClick={() => { setOpenSlot(isOpen ? null : slot); setSelectedItem(null); }}
              style={{
                background: isOpen ? alpha(slotInfo.color, "0d") : BG_CARD,
                border: `1px solid ${isOpen ? alpha(slotInfo.color, "55") : BORDER_ELEVATED}`,
                borderLeft: `3px solid ${equipped ? slotInfo.color : BORDER_SUBTLE}`,
                borderRadius: RADIUS_LG,
                padding: "12px 14px",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
              }}
            >
              <PixelIcon name={slotInfo.icon} size={18} color={equipped ? slotInfo.color : TEXT_INACTIVE} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT_PIXEL, fontSize: 8, color: equipped ? slotInfo.color : TEXT_INACTIVE, letterSpacing: 1, marginBottom: 2 }}>
                  {slotInfo.label}
                </div>
                {equipped && eqTpl ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: FONT_BODY, fontSize: 18, color: TEXT_LIGHT }}>{eqTpl.name}</span>
                    <span style={{
                      fontFamily: FONT_PIXEL, fontSize: 7,
                      color: TIER_COLORS[equipped.tier],
                      background: alpha(TIER_COLORS[equipped.tier], "18"),
                      border: `1px solid ${alpha(TIER_COLORS[equipped.tier], "44")}`,
                      borderRadius: RADIUS_PILL, padding: "1px 5px",
                    }}>
                      T{equipped.tier} {TIER_NAMES[equipped.tier].toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <span style={{ fontFamily: FONT_BODY, fontSize: 16, color: TEXT_INACTIVE }}>
                    {slotItems.length > 0 ? "Click to equip" : "Empty — buy in Shop"}
                  </span>
                )}
              </div>
              {isOpen ? <ChevronDown size={14} color={TEXT_MUTED} /> : <ChevronRight size={14} color={TEXT_INACTIVE} />}
            </div>

            {/* Expanded: items for this slot */}
            {isOpen && (
              <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                {slotItems.length === 0 ? (
                  <div style={{
                    padding: "12px 14px", borderRadius: RADIUS_LG,
                    background: alpha(BORDER_SUBTLE, "88"), border: `1px solid ${BORDER_SUBTLE}`,
                    fontFamily: FONT_BODY, fontSize: 16, color: TEXT_INACTIVE, textAlign: "center",
                  }}>
                    No items. Buy in the <span style={{ color: COLOR_LEGENDARY }}>Shop</span>.
                  </div>
                ) : slotItems.map(item => {
                  const tpl       = getItemTemplate(item.template_id)!;
                  const isSel     = selectedItem === item.id;
                  const tierColor = TIER_COLORS[item.tier];
                  const bonus     = getItemBonus(item);

                  return (
                    <div key={item.id}>
                      {/* Item row */}
                      <div
                        onClick={e => { e.stopPropagation(); setSelectedItem(isSel ? null : item.id); }}
                        style={{
                          background: isSel ? alpha(slotInfo.color, "0d") : BG_DEEPEST,
                          border: `1px solid ${isSel ? alpha(slotInfo.color, "55") : BORDER_ELEVATED}`,
                          borderLeft: `3px solid ${item.is_equipped ? COLOR_SUCCESS : isSel ? slotInfo.color : BORDER_SUBTLE}`,
                          borderRadius: RADIUS_LG,
                          padding: "10px 14px",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 10,
                        }}
                      >
                        <PixelIcon name={tpl.icon} size={16} color={slotInfo.color} />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontFamily: FONT_BODY, fontSize: 18, color: TEXT_LIGHT }}>{tpl.name}</span>
                          <span style={{ fontFamily: FONT_BODY, fontSize: 15, color: TEXT_MUTED, marginLeft: 8 }}>
                            +{bonus.toFixed(3)} {tpl.bonus_type}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                          <span style={{
                            fontFamily: FONT_PIXEL, fontSize: 7, color: tierColor,
                            background: alpha(tierColor, "18"), border: `1px solid ${alpha(tierColor, "44")}`,
                            borderRadius: RADIUS_PILL, padding: "2px 5px",
                          }}>T{item.tier}</span>
                          {item.is_equipped && (
                            <span style={{
                              fontFamily: FONT_PIXEL, fontSize: 7, color: COLOR_SUCCESS,
                              background: alpha(COLOR_SUCCESS, "18"), border: `1px solid ${alpha(COLOR_SUCCESS, "44")}`,
                              borderRadius: RADIUS_PILL, padding: "2px 5px",
                            }}>EQ</span>
                          )}
                        </div>
                      </div>

                      {/* Detail panel */}
                      {isSel && selectedTpl && selected && (
                        <div style={{
                          margin: "4px 0 0 16px",
                          background: BG_CARD,
                          border: `1px solid ${alpha(tierColor, "44")}`,
                          borderLeft: `3px solid ${TIER_COLORS[selected.tier]}`,
                          borderRadius: RADIUS_LG,
                          padding: "12px 14px",
                        }}>
                          {/* Tier info row */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <div>
                              <span style={{ fontFamily: FONT_PIXEL, fontSize: 7, color: TEXT_MUTED }}>CURRENT TIER</span>
                              <div style={{ fontFamily: FONT_BODY, fontSize: 18, color: TIER_COLORS[selected.tier], marginTop: 2 }}>
                                T{selected.tier} — {TIER_NAMES[selected.tier]}
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ fontFamily: FONT_PIXEL, fontSize: 7, color: TEXT_MUTED }}>BONUS</span>
                              <div style={{ fontFamily: FONT_BODY, fontSize: 20, color: TIER_COLORS[selected.tier], marginTop: 2 }}>
                                +{getItemBonus(selected).toFixed(3)} {selectedTpl.bonus_type}
                              </div>
                            </div>
                          </div>

                          {/* Next tier preview */}
                          {selected.tier < 4 && (() => {
                            const cost      = ESSENCE_COSTS[selected.tier as 1 | 2 | 3];
                            const nextTier  = (selected.tier + 1) as 2 | 3 | 4;
                            const nextBonus = (selectedTpl.base_bonus_value * TIER_MULTIPLIERS[nextTier]).toFixed(3);
                            const canUpgrade = essence >= cost;
                            return (
                              <div style={{
                                background: alpha(COLOR_MAGE, "0a"),
                                border: `1px dashed ${alpha(COLOR_MAGE, "44")}`,
                                borderRadius: RADIUS_LG, padding: "8px 12px",
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                marginBottom: 10,
                              }}>
                                <div style={{ fontFamily: FONT_BODY, fontSize: 16, color: TEXT_MUTED }}>
                                  T{nextTier} — +{nextBonus} {selectedTpl.bonus_type}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  <Sparkles size={11} color={COLOR_MAGE} />
                                  <span style={{ fontFamily: FONT_BODY, fontSize: 16, color: canUpgrade ? COLOR_MAGE : COLOR_DANGER }}>
                                    {cost} ess.
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Action buttons */}
                          <div style={{ display: "flex", gap: 6 }}>
                            {selected.is_equipped ? (
                              <RpgButton variant="ghost" color={TEXT_MUTED} fullWidth bodyFont small onClick={() => handleUnequip(selected.id)}>
                                UNEQUIP
                              </RpgButton>
                            ) : (
                              <RpgButton variant="primary" color={COLOR_LEGENDARY} fullWidth bodyFont small onClick={() => handleEquip(selected.id)}>
                                EQUIP
                              </RpgButton>
                            )}
                            {selected.tier < 4 && (() => {
                              const cost = ESSENCE_COSTS[selected.tier as 1 | 2 | 3];
                              const can  = essence >= cost;
                              return (
                                <RpgButton variant="ghost" color={can ? COLOR_MAGE : TEXT_INACTIVE} disabled={!can} fullWidth bodyFont small onClick={() => handleUpgrade(selected.id)}>
                                  ▲ UPGRADE ({cost}✦)
                                </RpgButton>
                              );
                            })()}
                            {selected.tier >= 4 && (
                              <RpgButton variant="icon" color={TIER_COLORS[4]} style={{ cursor: "default" }}>MAX</RpgButton>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardIn>
        );
      })}

      {/* Empty state */}
      {items.length === 0 && (
        <div style={{
          textAlign: "center", padding: "32px 16px",
          background: alpha(BORDER_SUBTLE, "88"), border: `1px solid ${BORDER_SUBTLE}`,
          borderRadius: RADIUS_LG,
        }}>
          <PixelIcon name="shield" size={32} color={TEXT_INACTIVE} />
          <div style={{ fontFamily: FONT_BODY, fontSize: 18, color: TEXT_MUTED, marginTop: 8 }}>
            No items in inventory.
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 15, color: TEXT_INACTIVE, marginTop: 4 }}>
            Defeat monsters to earn gold and buy in the <span style={{ color: COLOR_LEGENDARY }}>Shop</span>.
          </div>
        </div>
      )}
    </div>
  );
}
