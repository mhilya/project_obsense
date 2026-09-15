import React, { useState } from 'react';
import { RISK_TREND_DATA } from '../../mock/mockData';

export const TrendLineChart = () => {
  const [period, setPeriod] = useState('weekly');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const data = RISK_TREND_DATA;
  const width = 580;
  const height = 240;
  const padding = { top: 25, right: 25, bottom: 40, left: 40 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = 6;
  const getX = (index) => padding.left + (index / (data.length - 1)) * chartWidth;
  const getY = (val) => padding.top + chartHeight - (val / maxVal) * chartHeight;

  // Function to create smooth curved SVG path using Catmull-Rom to Cubic Bezier
  const createSmoothPath = (key) => {
    const points = data.map((d, i) => ({ x: getX(i), y: getY(d[key]) }));
    if (points.length < 2) return '';

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
  };

  // Create area fill path under the curve
  const createAreaPath = (key) => {
    const linePath = createSmoothPath(key);
    const lastX = getX(data.length - 1);
    const firstX = getX(0);
    const bottomY = padding.top + chartHeight;
    return `${linePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  };

  const series = [
    { key: 'low', label: 'Risiko Rendah', color: '#10b981' },
    { key: 'moderate', label: 'Risiko Sedang', color: '#f59e0b' },
    { key: 'high', label: 'Risiko Tinggi', color: '#ef4444' },
    { key: 'critical', label: 'Kritis', color: '#991b1b' }
  ];

  return (
    <div className="w-full">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block">
            HISTORI PER GERAKAN KASUS
          </span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Distribusi Risiko Obesitas
          </h4>
        </div>
        <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              period === 'weekly'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            onClick={() => setPeriod('weekly')}
          >
            Mingguan
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              period === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            onClick={() => setPeriod('monthly')}
          >
            Bulanan
          </button>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            {series.map((s) => (
              <linearGradient key={`grad-${s.key}`} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0.0" />
              </linearGradient>
            ))}
          </defs>

          {/* Horizontal grid lines */}
          {[0, 2, 4, 6].map((gridVal) => (
            <g key={gridVal}>
              <line
                x1={padding.left}
                y1={getY(gridVal)}
                x2={width - padding.right}
                y2={getY(gridVal)}
                className="stroke-slate-200 dark:stroke-slate-800 stroke-1 stroke-dashed"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={getY(gridVal) + 4}
                textAnchor="end"
                className="fill-slate-400 dark:fill-slate-500 text-[11px] font-medium"
              >
                {gridVal}
              </text>
            </g>
          ))}

          {/* Area Fills under curves */}
          {series.map((s) => (
            <path
              key={`area-${s.key}`}
              d={createAreaPath(s.key)}
              fill={`url(#grad-${s.key})`}
              pointerEvents="none"
            />
          ))}

          {/* Smooth Curves */}
          {series.map((s) => (
            <g key={s.key}>
              <path
                d={createSmoothPath(s.key)}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {data.map((d, i) => (
                <circle
                  key={i}
                  cx={getX(i)}
                  cy={getY(d[s.key])}
                  r={hoveredIndex === i ? 6 : 3.5}
                  fill={s.color}
                  className="stroke-white dark:stroke-slate-900 stroke-2 cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
            </g>
          ))}

          {/* Bottom X-axis labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={height - 12}
              textAnchor="middle"
              className={`text-[11px] font-semibold transition-colors ${
                hoveredIndex === i
                  ? 'fill-blue-600 dark:fill-blue-400 font-bold'
                  : 'fill-slate-500 dark:fill-slate-400'
              }`}
            >
              {d.period}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend & Tooltip Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-4">
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        {hoveredIndex !== null && (
          <div className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 font-medium">
            {data[hoveredIndex].period}: Rendah ({data[hoveredIndex].low}), Sedang ({data[hoveredIndex].moderate}), Tinggi ({data[hoveredIndex].high}), Kritis ({data[hoveredIndex].critical})
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendLineChart;
