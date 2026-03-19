/**
 * PowerSpiderChart – SVG radar chart for the 3 Power multiplicators.
 * Axes: MH (Hábitos), MN (Nível), MC (Classe)
 * Values are multipliers (e.g., 1.15). Normalized against their theoretical max.
 */
import { useEffect, useRef } from "react";
import { PowerSource } from "../../data/combatPower";

interface PowerSpiderChartProps {
  sources:      PowerSource[];
  accentColor:  string;
  size?:        number;
}

// Max expected value per axis for normalization
const MAX_VALUES: Record<string, number> = {
  mh: 1.20,   // 5 hábitos → 1 + 5×0.05 = 1.25 (cap ~1.25)
  mn: 1.40,   // nível 13+ → 1 + 13×0.03 = 1.39 ≈ cap at 1.40
  mc: 1.25,   // Mago em Modo Foco = 1.25 (highest MC)
};

function getAxesPoints(n: number, cx: number, cy: number, r: number) {
  return Array.from({ length: n }, (_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

function toPolygon(pts: { x: number; y: number }[]) {
  return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

/** Normalize a multiplier value to 0–1 range for the chart */
function normalizeMultiplier(id: string, value: number): number {
  const base = 1.0; // All multipliers start at 1.0
  const max  = MAX_VALUES[id] ?? 2.0;
  const excess = Math.max(0, value - base);
  const range  = Math.max(0.01, max - base);
  return Math.min(1, excess / range);
}

export function PowerSpiderChart({ sources, accentColor, size = 260 }: PowerSpiderChartProps) {
  const polygonRef = useRef<SVGPolygonElement>(null);
  const glowRef    = useRef<SVGPolygonElement>(null);

  const cx   = size / 2;
  const cy   = size / 2;
  const maxR = size * 0.36;
  const n    = sources.length;

  const axesPts = getAxesPoints(n, cx, cy, maxR);

  const valueRatios = sources.map((s) => normalizeMultiplier(s.id, s.value));

  const valuePts = sources.map((_, i) => {
    const ratio = valueRatios[i];
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + maxR * ratio * Math.cos(angle),
      y: cy + maxR * ratio * Math.sin(angle),
    };
  });

  const rings = [0.33, 0.66, 1].map((f) => getAxesPoints(n, cx, cy, maxR * f));
  const labelPts = getAxesPoints(n, cx, cy, maxR + 28);

  useEffect(() => {
    const el = polygonRef.current;
    const gl = glowRef.current;
    if (!el || !gl) return;
    el.style.opacity = "0";
    gl.style.opacity = "0";
    let start: number | null = null;
    const dur = 900;
    function frame(ts: number) {
      if (!start) start = ts;
      const t = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      if (el) el.style.opacity = String(ease * 0.45);
      if (gl) gl.style.opacity = String(ease * 0.25);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }, [sources]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <radialGradient id="spiderFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={accentColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.2" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Grid rings */}
        {rings.map((pts, ri) => (
          <polygon
            key={ri}
            points={toPolygon(pts)}
            fill="none"
            stroke={ri === 2 ? "#2a2e50" : "#1a1e37"}
            strokeWidth={ri === 2 ? 1.5 : 1}
            strokeDasharray={ri < 2 ? "4 3" : undefined}
          />
        ))}

        {/* Axis lines */}
        {axesPts.map((pt, i) => (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={pt.x} y2={pt.y}
            stroke="#1a1e37"
            strokeWidth={1}
          />
        ))}

        {/* Value polygon — glow */}
        <polygon
          ref={glowRef}
          points={toPolygon(valuePts)}
          fill={accentColor}
          stroke="none"
          filter="url(#glow)"
          style={{ transition: "opacity 0.3s" }}
        />

        {/* Value polygon — main */}
        <polygon
          ref={polygonRef}
          points={toPolygon(valuePts)}
          fill="url(#spiderFill)"
          stroke={accentColor}
          strokeWidth={2}
          strokeLinejoin="round"
          style={{ transition: "opacity 0.3s" }}
        />

        {/* Dot at each axis */}
        {valuePts.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={4}
            fill={sources[i].active ? sources[i].color : "#2a2e50"}
            stroke="#0d1024"
            strokeWidth={1.5}
          />
        ))}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={3} fill={accentColor} opacity={0.6} />

        {/* Axis labels */}
        {labelPts.map((pt, i) => {
          const src    = sources[i];
          const anchor = pt.x < cx - 8 ? "end" : pt.x > cx + 8 ? "start" : "middle";
          const isTop  = pt.y < cy;

          return (
            <g key={i}>
              {/* Short icon */}
              <text
                x={pt.x}
                y={isTop ? pt.y - 8 : pt.y + 4}
                textAnchor={anchor}
                dominantBaseline="middle"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, fill: src.active ? src.color : "#3a4060" }}
              >
                {src.icon}
              </text>
              {/* Multiplier value */}
              <text
                x={pt.x}
                y={isTop ? pt.y - 19 : pt.y + 16}
                textAnchor={anchor}
                dominantBaseline="middle"
                style={{ fontFamily: "'VT323', monospace", fontSize: 13, fill: src.active ? src.color : "#3a4060" }}
              >
                {src.value.toFixed(2)}×
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", justifyContent: "center", marginTop: 8, maxWidth: size + 40 }}>
        {sources.map((s) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.active ? s.color : "#2a2e50", flexShrink: 0 }} />
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: s.active ? s.color : "#3a4060", whiteSpace: "nowrap" }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
