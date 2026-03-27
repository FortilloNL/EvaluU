import { CHART_COLORS } from "../constants";

export default function StockChart({ series, periods, height = 220 }) {
  if (series.length === 0 || periods.length === 0) return null;

  const padding = { top: 20, right: 20, bottom: 30, left: 36 };
  const width = 700;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(1, ...series.flatMap((s) => s.data));
  const yTicks = [];
  for (let i = 0; i <= maxVal; i++) yTicks.push(i);
  if (yTicks.length > 6) {
    const step = Math.ceil(maxVal / 5);
    yTicks.length = 0;
    for (let i = 0; i <= maxVal; i += step) yTicks.push(i);
    if (yTicks[yTicks.length - 1] < maxVal) yTicks.push(maxVal);
  }

  const getX = (i) => padding.left + (i / (periods.length - 1)) * chartW;
  const getY = (v) => padding.top + chartH - (v / maxVal) * chartH;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={padding.left} y1={getY(tick)}
            x2={width - padding.right} y2={getY(tick)}
            stroke="#E8E6E2" strokeWidth={1}
          />
          <text x={padding.left - 8} y={getY(tick) + 4} textAnchor="end"
            fill="#AAA" fontSize={11} fontFamily="'DM Sans', system-ui, sans-serif">
            {tick}
          </text>
        </g>
      ))}
      {periods.map((p, i) => (
        <text key={i} x={getX(i)} y={height - 6} textAnchor="middle"
          fill="#AAA" fontSize={11} fontFamily="'DM Sans', system-ui, sans-serif">
          {p.label}
        </text>
      ))}
      {series.map((s, si) => {
        const points = s.data.map((v, i) => `${getX(i)},${getY(v)}`).join(" ");
        return (
          <g key={si}>
            <polyline
              points={points}
              fill="none"
              stroke={s.color}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {s.data.map((v, i) => (
              <circle key={i} cx={getX(i)} cy={getY(v)} r={3.5}
                fill="#fff" stroke={s.color} strokeWidth={2} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
