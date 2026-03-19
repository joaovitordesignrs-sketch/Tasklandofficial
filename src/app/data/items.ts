/**
 * items.ts — Sistema de Itens do TaskLand
 *
 * Templates de item (estáticos), estado do inventário do usuário (localStorage),
 * cálculo de bônus de itens equipados sobre os multiplicadores de poder.
 *
 * localStorage key: "rpg_items_v1"
 */

import { spendCoins } from "./economy";
import {
  ACCENT_GOLD, TEXT_BODY, COLOR_SUCCESS, COLOR_LEGENDARY, COLOR_MAGE,
} from "./tokens";

// ── Types ──────────────────────────────────────────────────────────────────────

export type ItemSlot    = "weapon" | "armor" | "accessory" | "relic";
export type BonusType   = "MH" | "MN" | "MC" | "MR";
export type ItemTier    = 1 | 2 | 3 | 4;

export interface ItemTemplate {
  id:               string;
  name:             string;
  slot:             ItemSlot;
  bonus_type:       BonusType;
  base_bonus_value: number;
  gold_cost:        number;
  description:      string;
  icon:             string; // lucide icon key
}

export interface UserItem {
  id:           string;   // uuid gerado na compra
  template_id:  string;
  tier:         ItemTier;
  is_equipped:  boolean;
  purchased_at: number;   // timestamp
}

export interface ItemBonuses {
  bonusMH: number;
  bonusMN: number;
  bonusMC: number;
  bonusMR: number;
}

// ── Tier tables ────────────────────────────────────────────────────────────────

export const TIER_MULTIPLIERS: Record<ItemTier, number> = {
  1: 1.0,
  2: 1.5,
  3: 2.2,
  4: 3.0,
};

export const TIER_NAMES: Record<ItemTier, string> = {
  1: "Apprentice",
  2: "Hero",
  3: "Legend",
  4: "Ascendant",
};

export const TIER_COLORS: Record<ItemTier, string> = {
  1: TEXT_BODY,
  2: COLOR_SUCCESS,
  3: COLOR_LEGENDARY,
  4: COLOR_MAGE,
};

/** Essência necessária para evoluir do tier N para N+1 */
export const ESSENCE_COSTS: Record<1 | 2 | 3, number> = {
  1: 20,
  2: 50,
  3: 100,
};

// ── Item templates ─────────────────────────────────────────────────────────────

export const ITEM_TEMPLATES: ItemTemplate[] = [
  {
    id:               "espada_da_disciplina",
    name:             "Discipline Sword",
    slot:             "weapon",
    bonus_type:       "MH",
    base_bonus_value: 0.02,
    gold_cost:        300,
    icon:             "sword",
    description:      "+MH — habit bonus",
  },
  {
    id:               "armadura_do_foco",
    name:             "Focus Armor",
    slot:             "armor",
    bonus_type:       "MC",
    base_bonus_value: 0.02,
    gold_cost:        350,
    icon:             "shield",
    description:      "+MC — class bonus",
  },
  {
    id:               "amuleto_do_nivel",
    name:             "Level Amulet",
    slot:             "accessory",
    bonus_type:       "MN",
    base_bonus_value: 0.015,
    gold_cost:        400,
    icon:             "gem",
    description:      "+MN — level bonus",
  },
  {
    id:               "reliquia_do_campeao",
    name:             "Champion's Relic",
    slot:             "relic",
    bonus_type:       "MR",
    base_bonus_value: 0.015,
    gold_cost:        450,
    icon:             "sparkles",
    description:      "+MR — permanent bonus",
  },
];

/** Slot display info */
export const SLOT_INFO: Record<ItemSlot, { label: string; icon: string; color: string }> = {
  weapon:    { label: "WEAPON",    icon: "sword",    color: ACCENT_GOLD },
  armor:     { label: "ARMOR",     icon: "shield",   color: "#60a5fa"  },
  accessory: { label: "ACCESSORY", icon: "gem",      color: "#c084fc"  },
  relic:     { label: "RELIC",     icon: "sparkles", color: "#FF6B35"  },
};

/** Essence drop per monster type */
export function getEssenceDrop(monsterType: string): number {
  switch (monsterType) {
    case "boss":     return 5;
    case "strong":   return 3;
    case "normal":   return 2;
    case "xp_bonus": return 2;
    case "weak":     return 1;
    default:         return 1;
  }
}

// ── State ──────────────────────────────────────────────────────────────────────

const ITEMS_KEY = "rpg_items_v1";

function loadItems(): UserItem[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (raw) return JSON.parse(raw) as UserItem[];
  } catch { /* noop */ }
  return [];
}

function saveItems(items: UserItem[]): void {
  try { localStorage.setItem(ITEMS_KEY, JSON.stringify(items)); } catch { /* noop */ }
  try { import("./syncService").then(s => s.schedulePush(1000)); } catch { /* noop */ }
}

let itemsState: UserItem[] = loadItems();

export function getItems(): UserItem[] { return itemsState; }

export function reloadItems(): void { itemsState = loadItems(); }

export function getEquippedItems(): UserItem[] {
  return itemsState.filter(i => i.is_equipped);
}

export function getItemTemplate(templateId: string): ItemTemplate | undefined {
  return ITEM_TEMPLATES.find(t => t.id === templateId);
}

/** Bônus final de um item considerando seu tier */
export function getItemBonus(item: UserItem): number {
  const tpl = getItemTemplate(item.template_id);
  if (!tpl) return 0;
  return parseFloat((tpl.base_bonus_value * TIER_MULTIPLIERS[item.tier]).toFixed(4));
}

/** Soma dos bônus de todos os itens equipados por multiplicador */
export function getItemBonuses(): ItemBonuses {
  const equipped = getEquippedItems();
  let bonusMH = 0, bonusMN = 0, bonusMC = 0, bonusMR = 0;
  for (const item of equipped) {
    const tpl = getItemTemplate(item.template_id);
    if (!tpl) continue;
    const bonus = getItemBonus(item);
    switch (tpl.bonus_type) {
      case "MH": bonusMH += bonus; break;
      case "MN": bonusMN += bonus; break;
      case "MC": bonusMC += bonus; break;
      case "MR": bonusMR += bonus; break;
    }
  }
  return {
    bonusMH: parseFloat(bonusMH.toFixed(4)),
    bonusMN: parseFloat(bonusMN.toFixed(4)),
    bonusMC: parseFloat(bonusMC.toFixed(4)),
    bonusMR: parseFloat(bonusMR.toFixed(4)),
  };
}

/** Comprar item na loja. Retorna true se bem-sucedido. */
export function buyItem(templateId: string): boolean {
  const tpl = getItemTemplate(templateId);
  if (!tpl) return false;

  // Já possui
  if (itemsState.some(i => i.template_id === templateId)) return false;

  if (!spendCoins(tpl.gold_cost)) return false;

  const newItem: UserItem = {
    id:           `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    template_id:  templateId,
    tier:         1,
    is_equipped:  false,
    purchased_at: Date.now(),
  };
  itemsState = [...itemsState, newItem];
  saveItems(itemsState);
  return true;
}

/** Equipar item — desequipa outros no mesmo slot automaticamente */
export function equipItem(userItemId: string): void {
  const item = itemsState.find(i => i.id === userItemId);
  if (!item) return;
  const tpl = getItemTemplate(item.template_id);
  if (!tpl) return;

  itemsState = itemsState.map(i => {
    const iTpl = getItemTemplate(i.template_id);
    if (i.id === userItemId) return { ...i, is_equipped: true };
    if (iTpl?.slot === tpl.slot && i.is_equipped) return { ...i, is_equipped: false };
    return i;
  });
  saveItems(itemsState);
}

/** Desequipar item */
export function unequipItem(userItemId: string): void {
  itemsState = itemsState.map(i =>
    i.id === userItemId ? { ...i, is_equipped: false } : i
  );
  saveItems(itemsState);
}

/** Evoluir item com essência. Retorna true se bem-sucedido. */
export function upgradeItem(userItemId: string, spendEssencesFn: (n: number) => boolean): boolean {
  const item = itemsState.find(i => i.id === userItemId);
  if (!item || item.tier >= 4) return false;

  const cost = ESSENCE_COSTS[item.tier as 1 | 2 | 3];
  if (!spendEssencesFn(cost)) return false;

  itemsState = itemsState.map(i =>
    i.id === userItemId ? { ...i, tier: (i.tier + 1) as ItemTier } : i
  );
  saveItems(itemsState);
  return true;
}
