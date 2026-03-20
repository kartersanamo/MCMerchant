import React from "react";

type BarDatum = {
  label: string;
  value: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function MiniBarChart({
  data,
  formatValue,
  height = 64,
}: {
  data: BarDatum[];
  formatValue?: (value: number) => string;
  height?: number;
}) {
  const max = data.reduce((m, d) => Math.max(m, d.value), 0);
  const safeMax = max <= 0 ? 1 : max;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${data.length * 18} ${height}`}
        preserveAspectRatio="none"
        className="h-[64px] w-full"
        role="img"
        aria-label="Chart"
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(99,102,241,0.95)" />
            <stop offset="1" stopColor="rgba(168,85,247,0.25)" />
          </linearGradient>
        </defs>

        {data.map((d, i) => {
          const ratio = d.value / safeMax;
          const barHeight = clamp(ratio * (height - 6), 2, height - 6);
          const x = i * 18 + 5;
          const y = height - barHeight;
          const w = 8;

          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={w}
                height={barHeight}
                rx={3}
                fill="url(#barGradient)"
                opacity={d.value > 0 ? 1 : 0.35}
              />
              {formatValue ? (
                <title>{`${d.label}: ${formatValue(d.value)}`}</title>
              ) : null}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
        <span>{data[0]?.label ?? ""}</span>
        <span>{data[Math.max(0, data.length - 1)]?.label ?? ""}</span>
      </div>
    </div>
  );
}

