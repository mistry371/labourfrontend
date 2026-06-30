'use client';
import { useMemo, useState } from 'react';

interface DataPoint {
  date: string;   // ISO date string
  amount: number;
}

interface Props {
  data: DataPoint[];
  /** Height of the SVG chart area in px */
  height?: number;
}

const W = 600;   // viewBox width (scales with container)
const PAD = { top: 16, right: 12, bottom: 32, left: 48 };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatAmount(n: number) {
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n}`;
}

/** Fill missing dates in a 30-day window with 0 */
function fillGaps(data: DataPoint[]): DataPoint[] {
  const map = new Map(data.map((d) => [d.date.slice(0, 10), d.amount]));
  const result: DataPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, amount: map.get(key) ?? 0 });
  }
  return result;
}

export function EarningsChart({ data, height = 180 }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: DataPoint } | null>(null);

  const filled = useMemo(() => fillGaps(data), [data]);

  const H = height;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...filled.map((d) => d.amount), 1);
  // Round up to a nice number
  const yMax = Math.ceil(maxVal / 500) * 500 || 500;

  const xScale = (i: number) => PAD.left + (i / (filled.length - 1)) * innerW;
  const yScale = (v: number) => PAD.top + innerH - (v / yMax) * innerH;

  // Build SVG path
  const linePath = filled
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d.amount).toFixed(1)}`)
    .join(' ');

  const areaPath =
    `${linePath} L${xScale(filled.length - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${PAD.left.toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    value: yMax * f,
    y: yScale(yMax * f),
  }));

  // X-axis labels — show every 7th
  const xLabels = filled
    .map((d, i) => ({ i, d }))
    .filter(({ i }) => i % 7 === 0 || i === filled.length - 1);

  const hasData = filled.some((d) => d.amount > 0);

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines + labels */}
        {yTicks.map(({ value, y }) => (
          <g key={value}>
            <line
              x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
              stroke="#f3f4f6" strokeWidth="1"
            />
            <text
              x={PAD.left - 6} y={y + 4}
              textAnchor="end" fontSize="10" fill="#9ca3af"
            >
              {formatAmount(value)}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {xLabels.map(({ i, d }) => (
          <text
            key={i}
            x={xScale(i)} y={H - 6}
            textAnchor="middle" fontSize="9" fill="#9ca3af"
          >
            {formatDate(d.date)}
          </text>
        ))}

        {hasData ? (
          <>
            {/* Area fill */}
            <path d={areaPath} fill="url(#earningsGrad)" />
            {/* Line */}
            <path d={linePath} fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {/* Hover targets */}
            {filled.map((d, i) => (
              <rect
                key={i}
                x={xScale(i) - innerW / filled.length / 2}
                y={PAD.top}
                width={innerW / filled.length}
                height={innerH}
                fill="transparent"
                onMouseEnter={(e) => {
                  const svgRect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                  setTooltip({
                    x: xScale(i),
                    y: yScale(d.amount),
                    point: d,
                  });
                }}
              />
            ))}
            {/* Active dot */}
            {tooltip && (
              <circle
                cx={tooltip.x} cy={tooltip.y}
                r="4" fill="#f97316" stroke="white" strokeWidth="2"
              />
            )}
          </>
        ) : (
          <text
            x={W / 2} y={H / 2}
            textAnchor="middle" fontSize="12" fill="#d1d5db"
          >
            No earnings data yet
          </text>
        )}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap z-10"
          style={{
            left: `${(tooltip.x / W) * 100}%`,
            top: `${(tooltip.y / height) * 100}%`,
            transform: 'translate(-50%, -130%)',
          }}
        >
          <p className="font-semibold">₹{tooltip.point.amount.toLocaleString()}</p>
          <p className="text-gray-400">{formatDate(tooltip.point.date)}</p>
        </div>
      )}
    </div>
  );
}
