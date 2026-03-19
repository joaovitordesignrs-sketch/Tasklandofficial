import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Shield, Coins, Sparkles, Star, User } from "lucide-react";
import { useTheme } from "../contexts/PreferencesContext";
import { PageShell } from "./ui/PageShell";
import { CardIn } from "./ui/CardIn";
import { RpgButton } from "./ui/RpgButton";
import {
  getEconomy, gmSetCoins, gmSetEssences, gmSetBonusXP, getGmBonusXP,
} from "../data/economy";
import { loadPlayerName, savePlayerName, getMissions } from "../data/missions";
import { calcTotalXP, getLevelInfo } from "../data/gameEngine";
import { schedulePush } from "../data/syncService";

function StatRow({ label, value, color, icon }: {
  label: string; value: string | number; color: string; icon: React.ReactNode;
}) {
  const { FONT_PIXEL, FONT_BODY, TEXT_MUTED, BG_CARD, BORDER_SUBTLE, RADIUS_LG, SP_SM, SP_MD } = useTheme();
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: BG_CARD, border: `1px solid ${BORDER_SUBTLE}`,
      borderRadius: RADIUS_LG, padding: `${SP_SM}px ${SP_MD}px`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: SP_SM }}>
        {icon}
        <span style={{ fontFamily: FONT_PIXEL, fontSize: 7, color: TEXT_MUTED, letterSpacing: 1 }}>{label}</span>
      </div>
      <span style={{ fontFamily: FONT_BODY, fontSize: 18, color }}>{value}</span>
    </div>
  );
}

function EditField({ label, value, color, icon, onApply, type = "number" }: {
  label: string; value: string | number; color: string; icon: React.ReactNode;
  onApply: (val: string) => void; type?: "number" | "text";
}) {
  const {
    FONT_PIXEL, FONT_BODY, TEXT_MUTED, TEXT_BODY, BG_CARD, BG_DEEPEST,
    BORDER_SUBTLE, BORDER_ELEVATED, RADIUS_LG, RADIUS_MD, SP_XS, SP_SM, SP_MD, alpha,
  } = useTheme();
  const [input, setInput] = useState(String(value));
  const [saved, setSaved] = useState(false);

  const handleApply = () => {
    onApply(input);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div style={{
      background: BG_CARD, border: `1px solid ${BORDER_SUBTLE}`,
      borderLeft: `3px solid ${color}`,
      borderRadius: RADIUS_LG, padding: `${SP_MD}px`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: SP_SM, marginBottom: SP_SM }}>
        {icon}
        <span style={{ fontFamily: FONT_PIXEL, fontSize: 7, color: TEXT_MUTED, letterSpacing: 1 }}>{label}</span>
        <span style={{ fontFamily: FONT_BODY, fontSize: 15, color: TEXT_MUTED, marginLeft: "auto" }}>
          current: <span style={{ color }}>{value}</span>
        </span>
      </div>
      <div style={{ display: "flex", gap: SP_SM }}>
        <input
          type={type}
          value={input}
          onChange={e => { setInput(e.target.value); setSaved(false); }}
          onKeyDown={e => { if (e.key === "Enter") handleApply(); }}
          style={{
            flex: 1, background: BG_DEEPEST,
            border: `1px solid ${BORDER_ELEVATED}`,
            borderRadius: RADIUS_MD, padding: `${SP_XS}px ${SP_SM}px`,
            fontFamily: FONT_BODY, fontSize: 17, color: TEXT_BODY,
            outline: "none",
          }}
        />
        <RpgButton
          variant={saved ? "ghost" : "primary"}
          color={saved ? "#06FFA5" : color}
          small
          bodyFont
          onClick={handleApply}
        >
          {saved ? "✓ SAVED" : "APPLY"}
        </RpgButton>
      </div>
    </div>
  );
}

export default function GameMasterScreen() {
  const navigate = useNavigate();
  const {
    ACCENT_GOLD, COLOR_MAGE, COLOR_WARNING, COLOR_SUCCESS,
    TEXT_MUTED, FONT_PIXEL, FONT_BODY,
    SP_SM, SP_MD, SP_LG, SP_XL,
    RADIUS_LG, RADIUS_PILL, alpha, BG_CARD, BORDER_SUBTLE,
  } = useTheme();

  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);
  void tick;

  const econ = getEconomy();
  const missions = getMissions();
  const totalXP = calcTotalXP(missions);
  const { level, currentXP, neededXP } = getLevelInfo(totalXP);
  const playerName = loadPlayerName();

  return (
    <PageShell
      icon={<Shield size={18} />}
      title="GAME MASTER"
      accentColor={COLOR_WARNING}
      badge={
        <div style={{
          display: "flex", alignItems: "center", gap: SP_SM,
          background: alpha(COLOR_WARNING, "18"), border: `1px solid ${alpha(COLOR_WARNING, "44")}`,
          borderRadius: RADIUS_PILL, padding: `4px 10px`,
        }}>
          <span style={{ fontFamily: FONT_PIXEL, fontSize: 7, color: COLOR_WARNING, letterSpacing: 1 }}>
            DEV ONLY
          </span>
        </div>
      }
    >
      {/* Current state */}
      <CardIn index={0}>
        <div style={{ display: "flex", flexDirection: "column", gap: SP_SM }}>
          <span style={{ fontFamily: FONT_PIXEL, fontSize: 8, color: TEXT_MUTED, letterSpacing: 1, marginBottom: 4 }}>
            CURRENT STATE
          </span>
          <StatRow label="PLAYER NAME" value={playerName} color="#fff" icon={<User size={13} color={TEXT_MUTED} />} />
          <StatRow label="LEVEL" value={`${level}  (${currentXP}/${neededXP} XP)`} color={ACCENT_GOLD} icon={<Star size={13} color={ACCENT_GOLD} />} />
          <StatRow label="TOTAL XP" value={totalXP.toLocaleString()} color={ACCENT_GOLD} icon={<Star size={13} color={ACCENT_GOLD} />} />
          <StatRow label="GOLD (COINS)" value={econ.coins.toLocaleString()} color={ACCENT_GOLD} icon={<Coins size={13} color={ACCENT_GOLD} />} />
          <StatRow label="MONSTER ESSENCES" value={(econ.monsterEssences ?? 0).toLocaleString()} color={COLOR_MAGE} icon={<Sparkles size={13} color={COLOR_MAGE} />} />
          <StatRow label="GM BONUS XP" value={(econ.gmBonusXP ?? 0).toLocaleString()} color={COLOR_WARNING} icon={<Star size={13} color={COLOR_WARNING} />} />
        </div>
      </CardIn>

      {/* Edit fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: SP_MD, marginTop: SP_LG }}>
        <span style={{ fontFamily: FONT_PIXEL, fontSize: 8, color: TEXT_MUTED, letterSpacing: 1 }}>
          EDIT VALUES
        </span>

        <EditField
          label="PLAYER NAME"
          value={playerName}
          color="#c0c8e0"
          type="text"
          icon={<User size={13} color="#c0c8e0" />}
          onApply={val => { savePlayerName(val.trim() || "Adventurer"); schedulePush(1000); refresh(); }}
        />

        <EditField
          label="GOLD (COINS)"
          value={econ.coins}
          color={ACCENT_GOLD}
          icon={<Coins size={13} color={ACCENT_GOLD} />}
          onApply={val => { gmSetCoins(Number(val) || 0); schedulePush(1000); refresh(); }}
        />

        <EditField
          label="MONSTER ESSENCES"
          value={econ.monsterEssences ?? 0}
          color={COLOR_MAGE}
          icon={<Sparkles size={13} color={COLOR_MAGE} />}
          onApply={val => { gmSetEssences(Number(val) || 0); schedulePush(1000); refresh(); }}
        />

        <EditField
          label="GM BONUS XP"
          value={getGmBonusXP()}
          color={COLOR_WARNING}
          icon={<Star size={13} color={COLOR_WARNING} />}
          onApply={val => { gmSetBonusXP(Number(val) || 0); schedulePush(1000); refresh(); }}
        />
      </div>

      {/* XP note */}
      <div style={{
        marginTop: SP_MD,
        padding: SP_MD,
        background: alpha(COLOR_WARNING, "08"),
        border: `1px solid ${alpha(COLOR_WARNING, "33")}`,
        borderRadius: RADIUS_LG,
      }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 15, color: TEXT_MUTED }}>
          <span style={{ color: COLOR_WARNING }}>GM Bonus XP</span> is added on top of task XP. Setting it to{" "}
          <span style={{ color: "#fff" }}>50000</span> will push the player to ~level 25.
          Level updates immediately after applying.
        </span>
      </div>

      {/* Back */}
      <div style={{ marginTop: SP_MD }}>
        <RpgButton variant="ghost" color={TEXT_MUTED} fullWidth bodyFont onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> BACK
        </RpgButton>
      </div>
    </PageShell>
  );
}
