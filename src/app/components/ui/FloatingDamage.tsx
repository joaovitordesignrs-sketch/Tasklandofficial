/**
 * FloatingDamage — renders falling, fading damage numbers over the arena.
 * Numbers appear at the monster position, fall down, and vanish.
 * Visual weight (size, color, glow) scales with the damage amount.
 */

export interface DamageNumber {
  id: number;
  amount: number;
}

interface Props {
  numbers: DamageNumber[];
}

// Determine visual style based on damage magnitude
function getDmgParams(amount: number): {
  fontSize: number;
  color: string;
  shadow: string;
} {
  const fontSize = Math.min(Math.max(20, Math.round(20 + Math.log(amount + 1) * 7)), 60);

  if (amount >= 300) {
    return { fontSize, color: "#ff2d55", shadow: "0 0 24px #ff2d5599, 3px 3px 0 #000" };
  }
  if (amount >= 150) {
    return { fontSize, color: "#E63946", shadow: "0 0 18px #E6394666, 3px 3px 0 #000" };
  }
  if (amount >= 80) {
    return { fontSize, color: "#FFD700", shadow: "0 0 14px #FFD70055, 2px 2px 0 #000" };
  }
  if (amount >= 40) {
    return { fontSize, color: "#FF6B35", shadow: "0 0 10px #FF6B3544, 2px 2px 0 #000" };
  }
  if (amount >= 20) {
    return { fontSize, color: "#06FFA5", shadow: "2px 2px 0 #000" };
  }
  return { fontSize, color: "#8a9fba", shadow: "1px 1px 0 #000" };
}

// Stable seeded position spread so overlapping hits don't stack on top of each other
function getOffset(id: number): { x: number; y: number } {
  const seed = id % 100;
  return {
    x: -20 + (seed % 40),       // ±20px horizontal
    y: -10 + ((seed * 7) % 20), // ±10px vertical start
  };
}

export function FloatingDamage({ numbers }: Props) {
  if (numbers.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes dmgFall {
          0%   { opacity: 0;   transform: translate(var(--ox), var(--oy)) scale(0.4); }
          12%  { opacity: 1;   transform: translate(var(--ox), calc(var(--oy) - 4px)) scale(1.15); }
          35%  { opacity: 1;   transform: translate(var(--ox), var(--oy)) scale(1.0); }
          100% { opacity: 0;   transform: translate(var(--ox), calc(var(--oy) + 60px)) scale(0.75); }
        }
      `}</style>
      {numbers.map((dn) => {
        // Guard against NaN/non-finite amount values
        const safeAmount = Number.isFinite(dn.amount) ? dn.amount : 0;
        const { fontSize, color, shadow } = getDmgParams(safeAmount);
        const { x, y } = getOffset(dn.id);
        return (
          <div
            key={dn.id}
            style={{
              position: "absolute",
              // Positioned over the monster (right side of arena)
              right: "12%",
              top: "35%",
              zIndex: 10,
              pointerEvents: "none",
              fontFamily: "'Press Start 2P', monospace",
              fontSize,
              color,
              textShadow: shadow,
              letterSpacing: 1,
              whiteSpace: "nowrap",
              lineHeight: 1,
              userSelect: "none",
              // CSS custom properties for animation
              "--ox": `${x}px`,
              "--oy": `${y}px`,
              animation: "dmgFall 1.3s cubic-bezier(0.2, 0.8, 0.4, 1) forwards",
            } as React.CSSProperties}
          >
            -{safeAmount}
          </div>
        );
      })}
    </>
  );
}