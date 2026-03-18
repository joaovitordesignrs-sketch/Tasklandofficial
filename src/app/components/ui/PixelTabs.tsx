/**
 * PixelTabs — Shared tab-bar component with pixel-art RPG aesthetic.
 * Used as the standard tab bar across all screens (Profile, Settings, etc.).
 */
import React from "react";
import { audioManager } from "../../hooks/audioManager";

export interface PixelTabDef<T extends string = string> {
  key: T;
  label: string;
  /** A Lucide (or any) icon component */
  Icon: React.ComponentType<{ size?: number }>;
  /** Accent colour for the active state */
  color: string;
}

interface PixelTabsProps<T extends string> {
  tabs: PixelTabDef<T>[];
  active: T;
  onSelect: (key: T) => void;
  style?: React.CSSProperties;
}

export function PixelTabs<T extends string>({
  tabs,
  active,
  onSelect,
  style,
}: PixelTabsProps<T>) {
  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        background: "#0b0d1e",
        border: "1px solid #1f254f",
        borderRadius: 10,
        padding: 4,
        flexShrink: 0,
        ...style,
      }}
    >
      {tabs.map(({ key, label, Icon, color }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => {
              audioManager.playClick("tap");
              onSelect(key);
            }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              padding: "10px 6px",
              background: isActive ? color + "18" : "transparent",
              border: isActive ? `1px solid ${color}55` : "1px solid transparent",
              borderRadius: 7,
              color: isActive ? color : "#3a4060",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7,
              cursor: "pointer",
              transition: "all 0.15s ease",
              letterSpacing: 0.5,
              textShadow: isActive ? `0 0 8px ${color}88` : "none",
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
