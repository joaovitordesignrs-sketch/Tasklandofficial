import { useState, useCallback } from "react";
import { ShoppingBag, Coins, Sparkles, Check } from "lucide-react";
import { PageShell } from "./ui/PageShell";
import { CardIn } from "./ui/CardIn";
import { RpgButton } from "./ui/RpgButton";
import { PixelIcon } from "./ui/PixelIcon";
import {
  ITEM_TEMPLATES, SLOT_INFO, TIER_MULTIPLIERS,
  buyItem, getItems, type ItemSlot,
} from "../data/items";
import { getEconomy } from "../data/economy";
import { PixelTabs, type PixelTabDef } from "./ui/PixelTabs";
import {
  ACCENT_GOLD, BG_CARD, BG_DEEPEST, BORDER_SUBTLE, BORDER_ELEVATED,
  COLOR_SUCCESS, COLOR_MAGE, COLOR_WARRIOR, COLOR_WARNING,
  TEXT_BODY, TEXT_MUTED, TEXT_INACTIVE,
  FONT_PIXEL, FONT_BODY,
  SP_XS, SP_SM, SP_MD, SP_LG, SP_XL,
  RADIUS_LG, RADIUS_PILL,
  alpha,
} from "../data/tokens";

type ShopTab = ItemSlot;

const SHOP_TABS: PixelTabDef<ShopTab>[] = [
  { key: "weapon",    label: "ARMA",      Icon: () => <PixelIcon name="sword"    size={13} />, color: ACCENT_GOLD   },
  { key: "armor",     label: "ARMADURA",  Icon: () => <PixelIcon name="shield"   size={13} />, color: COLOR_WARRIOR },
  { key: "accessory", label: "ACESSÓRIO", Icon: () => <PixelIcon name="gem"      size={13} />, color: COLOR_MAGE    },
  { key: "relic",     label: "RELÍQUIA",  Icon: () => <PixelIcon name="sparkles" size={13} />, color: COLOR_WARNING },
];

const SLOT_ACCENT: Record<ShopTab, string> = {
  weapon:    ACCENT_GOLD,
  armor:     COLOR_WARRIOR,
  accessory: COLOR_MAGE,
  relic:     COLOR_WARNING,
};

export default function ShopScreen() {
  const [tab,    setTab]    = useState<ShopTab>("weapon");
  const [tick,   setTick]   = useState(0);
  const [buying, setBuying] = useState<string | null>(null);

  const refresh = useCallback(() => setTick(t => t + 1), []);
  void tick;

  const econ  = getEconomy();
  const owned = new Set(getItems().map(i => i.template_id));
  const tpl   = ITEM_TEMPLATES.find(t => t.slot === tab)!;
  const accent = SLOT_ACCENT[tab];
  const isOwned    = owned.has(tpl.id);
  const canAfford  = econ.coins >= tpl.gold_cost;
  const isBuying   = buying === tpl.id;

  // Bonus range T1 → T4
  const bonusT1 = (tpl.base_bonus_value * TIER_MULTIPLIERS[1]).toFixed(3);
  const bonusT4 = (tpl.base_bonus_value * TIER_MULTIPLIERS[4]).toFixed(3);

  function handleBuy() {
    if (econ.coins < tpl.gold_cost) return;
    setBuying(tpl.id);
    const ok = buyItem(tpl.id);
    setBuying(null);
    if (ok) refresh();
  }

  return (
    <PageShell
      icon={<ShoppingBag size={18} />}
      title="LOJA"
      accentColor={ACCENT_GOLD}
      badge={
        <div style={{ display: "flex", gap: SP_SM, alignItems: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: SP_XS,
            background: alpha(ACCENT_GOLD, "18"), border: `1px solid ${alpha(ACCENT_GOLD, "44")}`,
            borderRadius: RADIUS_PILL, padding: `${SP_XS}px ${SP_SM}px`,
          }}>
            <Coins size={12} color={ACCENT_GOLD} />
            <span style={{ fontFamily: FONT_BODY, fontSize: 18, color: ACCENT_GOLD }}>
              {econ.coins.toLocaleString("pt-BR")}
            </span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: SP_XS,
            background: alpha(COLOR_MAGE, "18"), border: `1px solid ${alpha(COLOR_MAGE, "44")}`,
            borderRadius: RADIUS_PILL, padding: `${SP_XS}px ${SP_SM}px`,
          }}>
            <Sparkles size={12} color={COLOR_MAGE} />
            <span style={{ fontFamily: FONT_BODY, fontSize: 18, color: COLOR_MAGE }}>
              {(econ.monsterEssences ?? 0).toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
      }
    >
      <PixelTabs tabs={SHOP_TABS} active={tab} onSelect={setTab} style={{ marginBottom: SP_LG }} />

      <CardIn index={0}>
        <div style={{
          background: isOwned ? alpha(COLOR_SUCCESS, "08") : BG_CARD,
          border: `1px solid ${isOwned ? alpha(COLOR_SUCCESS, "55") : alpha(accent, "44")}`,
          borderLeft: `3px solid ${isOwned ? COLOR_SUCCESS : accent}`,
          borderRadius: RADIUS_LG,
          padding: "14px 16px",
          display: "flex", alignItems: "center", gap: SP_MD,
        }}>
          {/* Icon */}
          <div style={{
            width: 44, height: 44, flexShrink: 0,
            background: isOwned ? alpha(COLOR_SUCCESS, "18") : alpha(accent, "18"),
            border: `1px solid ${isOwned ? alpha(COLOR_SUCCESS, "44") : alpha(accent, "44")}`,
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <PixelIcon name={tpl.icon} size={22} color={isOwned ? COLOR_SUCCESS : accent} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: SP_SM, marginBottom: 4 }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: 20, color: isOwned ? COLOR_SUCCESS : "#fff" }}>
                {tpl.name}
              </span>
              {isOwned && (
                <span style={{
                  fontFamily: FONT_PIXEL, fontSize: 8, color: COLOR_SUCCESS,
                  background: alpha(COLOR_SUCCESS, "18"), border: `1px solid ${alpha(COLOR_SUCCESS, "55")}`,
                  borderRadius: RADIUS_PILL, padding: "2px 6px",
                }}>
                  POSSUÍDO
                </span>
              )}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 16, color: TEXT_MUTED, marginBottom: SP_XS }}>
              {tpl.description}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 15, color: TEXT_BODY }}>
              Tier 1: <span style={{ color: accent }}>+{bonusT1}</span>
              {" "}→{" "}
              Tier 4: <span style={{ color: accent }}>+{bonusT4}</span>
              <span style={{ color: TEXT_INACTIVE }}> ao {tpl.bonus_type}</span>
            </div>
          </div>

          {/* Buy area */}
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: SP_XS }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: SP_XS }}>
              <Coins size={13} color={canAfford && !isOwned ? ACCENT_GOLD : TEXT_INACTIVE} />
              <span style={{
                fontFamily: FONT_BODY, fontSize: 22,
                color: canAfford && !isOwned ? ACCENT_GOLD : TEXT_INACTIVE,
              }}>
                {tpl.gold_cost}
              </span>
            </div>
            {isOwned ? (
              <div style={{
                display: "flex", alignItems: "center", gap: SP_XS,
                fontFamily: FONT_BODY, fontSize: 16, color: COLOR_SUCCESS,
              }}>
                <Check size={14} color={COLOR_SUCCESS} /> Possuído
              </div>
            ) : (
              <RpgButton
                variant={canAfford ? "primary" : "ghost"}
                color={canAfford ? ACCENT_GOLD : TEXT_INACTIVE}
                disabled={!canAfford || isBuying}
                small
                bodyFont
                onClick={handleBuy}
              >
                {isBuying ? "..." : canAfford ? "COMPRAR" : "OURO INSUF."}
              </RpgButton>
            )}
          </div>
        </div>
      </CardIn>

      {/* Upgrade hint */}
      <div style={{
        marginTop: SP_XL, padding: `${SP_MD}px`,
        background: alpha(BORDER_SUBTLE, "88"),
        border: `1px solid ${BORDER_SUBTLE}`,
        borderRadius: RADIUS_LG, textAlign: "center",
      }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 16, color: TEXT_MUTED }}>
          Equipe e evolua seus itens na aba{" "}
          <span style={{ color: ACCENT_GOLD }}>ITENS</span> do perfil.{" "}
          Essência de monstro <Sparkles size={12} color={COLOR_MAGE} style={{ verticalAlign: "middle" }} /> é usada para evoluir.
        </span>
      </div>
    </PageShell>
  );
}
