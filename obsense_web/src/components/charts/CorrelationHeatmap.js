import React from 'react';
import { CORRELATION_MATRIX_DATA } from '../../mock/mockData';
import { Activity, Tv, Salad, Flame, TrendingDown, TrendingUp } from 'lucide-react';

export const CorrelationHeatmap = () => {
  const getIcon = (feature) => {
    if (feature.includes('FAF')) return <Activity size={18} />;
    if (feature.includes('TUE')) return <Tv size={18} />;
    if (feature.includes('FCVC')) return <Salad size={18} />;
    return <Flame size={18} />;
  };

  return (
    <div className="space-y-4">
      {/* Legend & Scale Guide */}
      <div className="flex flex-wrap items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
          <TrendingDown size={14} />
          <span>Protektif (r &lt; 0): Mengurangi Risiko Obesitas</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
          <TrendingUp size={14} />
          <span>Faktor Risiko (r &gt; 0): Meningkatkan Risiko</span>
        </div>
      </div>

      {/* Grid of correlation items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {CORRELATION_MATRIX_DATA.map((item, idx) => {
          const val = item.correlationWithObesity;
          const isNegative = val < 0;
          const absVal = Math.abs(val);

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all hover:shadow-md ${
                isNegative
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isNegative
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {getIcon(item.feature)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                      {item.feature}
                    </h5>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isNegative
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                      }`}
                    >
                      {item.impact}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold ${
                      isNegative ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    r = {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Bipolar Scale (-1.0 to +1.0) */}
              <div className="space-y-1 my-2">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  <span>-1.0</span>
                  <span>-0.5</span>
                  <span className="font-bold text-slate-600 dark:text-slate-400">0.0</span>
                  <span>+0.5</span>
                  <span>+1.0</span>
                </div>
                <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-400 dark:bg-slate-500 z-10 -translate-x-1/2" />
                  {isNegative ? (
                    <div
                      className="absolute top-0 bottom-0 right-1/2 bg-emerald-500 rounded-l-full transition-all duration-300"
                      style={{ width: `${absVal * 50}%` }}
                    />
                  ) : (
                    <div
                      className="absolute top-0 bottom-0 left-1/2 bg-rose-500 rounded-r-full transition-all duration-300"
                      style={{ width: `${absVal * 50}%` }}
                    />
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed m-0">
                  {item.notes}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CorrelationHeatmap;
