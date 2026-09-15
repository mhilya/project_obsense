import React, { useState } from 'react';
import { OBESITY_CLASSES } from '../../mock/mockData';

export const DonutChart = ({ classCounts = {} }) => {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const total = Object.values(classCounts).reduce((acc, c) => acc + c, 0) || 1;

  let cumulativePercent = 0;
  const segments = OBESITY_CLASSES.map((cls) => {
    const count = classCounts[cls.key] || 0;
    const percent = (count / total) * 100;
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += percent;
    const endAngle = (cumulativePercent / 100) * 360;

    return {
      ...cls,
      count,
      percent: Number(percent.toFixed(1)),
      startAngle,
      endAngle
    };
  });

  const size = 230;
  const center = size / 2;
  const radius = 82;
  const strokeWidth = 34;
  const circumference = 2 * Math.PI * radius;

  let strokeOffset = 0;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-2">
      {/* SVG Canvas & Tooltip */}
      <div className="relative flex items-center justify-center w-56 h-56 flex-shrink-0">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <filter id="donut-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
            </filter>
          </defs>

          {segments.map((seg) => {
            const strokeDasharray = `${(seg.percent / 100) * circumference} ${circumference}`;
            const currentOffset = strokeOffset;
            strokeOffset -= (seg.percent / 100) * circumference;

            const isHovered = hoveredSlice?.key === seg.key;

            return (
              <circle
                key={seg.key}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={currentOffset}
                transform={`rotate(-90 ${center} ${center})`}
                filter={isHovered ? 'url(#donut-shadow)' : undefined}
                className="transition-all duration-200 cursor-pointer"
                style={{
                  opacity: hoveredSlice && !isHovered ? 0.35 : 1
                }}
                onMouseEnter={() => setHoveredSlice(seg)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            );
          })}

          {/* Center text */}
          <text
            x={center}
            y={center - 4}
            textAnchor="middle"
            className="fill-slate-900 dark:fill-white font-extrabold text-2xl select-none"
          >
            {hoveredSlice ? hoveredSlice.count : total}
          </text>
          <text
            x={center}
            y={center + 18}
            textAnchor="middle"
            className="fill-slate-500 dark:fill-slate-400 font-semibold text-[11px] uppercase tracking-wider select-none"
          >
            {hoveredSlice ? hoveredSlice.label.substring(0, 16) : 'Total Pasien'}
          </text>
        </svg>

        {hoveredSlice && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-16 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-xl text-center pointer-events-none z-20 whitespace-nowrap">
            <p className="font-bold text-xs" style={{ color: hoveredSlice.color }}>{hoveredSlice.label}</p>
            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">{hoveredSlice.count} Pasien ({hoveredSlice.percent}%)</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">BMI: {hoveredSlice.bmiRange}</p>
          </div>
        )}
      </div>

      {/* Legend list with mini progress bars */}
      <div className="flex-1 w-full space-y-2 max-h-72 overflow-y-auto pr-1">
        {segments.map((seg) => {
          const isHovered = hoveredSlice?.key === seg.key;
          return (
            <div
              key={seg.key}
              className={`p-2 rounded-lg transition-all cursor-pointer border ${
                isHovered
                  ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600 shadow-sm'
                  : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
              onMouseEnter={() => setHoveredSlice(seg)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                    {seg.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex-shrink-0">
                  {seg.count} <span className="text-[11px] font-normal text-slate-400">({seg.percent}%)</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${seg.percent}%`, backgroundColor: seg.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DonutChart;
