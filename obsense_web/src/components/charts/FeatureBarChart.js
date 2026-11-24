import React, { useState } from 'react';
import { FEATURE_IMPORTANCE_DATA } from '../../mock/mockData';
import { Cpu } from 'lucide-react';

export const FeatureBarChart = ({ featureImportance = null }) => {
  const [scenario, setScenario] = useState('scenario_b_lifestyle');
  const [showAll, setShowAll] = useState(false);

  const hasLive = Boolean(
    featureImportance &&
      Array.isArray(featureImportance.scenario_a_full) &&
      Array.isArray(featureImportance.scenario_b_lifestyle)
  );

  const activeList = hasLive ? featureImportance[scenario] || [] : FEATURE_IMPORTANCE_DATA;
  const visibleItems = showAll ? activeList : activeList.slice(0, 8);
  const maxWeight = Math.max(...activeList.map((d) => d.weight), 0.01);

  const getCategoryTheme = (cat) => {
    switch (cat) {
      case 'Antropometri':
        return {
          pill: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
          bar: 'bg-blue-500'
        };
      case 'Demografi':
        return {
          pill: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
          bar: 'bg-purple-500'
        };
      case 'Gaya Hidup':
        return {
          pill: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
          bar: 'bg-emerald-500'
        };
      case 'Pola Makan':
      default:
        return {
          pill: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
          bar: 'bg-amber-500'
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Scenario Toggle & Model header info */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
          <Cpu size={15} />
          <span>
            {hasLive
              ? scenario === 'scenario_a_full'
                ? 'Skenario A: Full Features (16 Fitur)'
                : 'Skenario B: Lifestyle-Only (14 Fitur)'
              : 'Random Forest Feature Weights (Fallback)'}
          </span>
        </div>

        {hasLive && (
          <div className="inline-flex bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setScenario('scenario_a_full')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                scenario === 'scenario_a_full'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Skenario A (Full)
            </button>
            <button
              type="button"
              onClick={() => setScenario('scenario_b_lifestyle')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                scenario === 'scenario_b_lifestyle'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Skenario B (Lifestyle)
            </button>
          </div>
        )}
      </div>

      {/* Bars list */}
      <div className="space-y-3">
        {visibleItems.map((item, idx) => {
          const percent = (item.weight / maxWeight) * 100;
          const theme = getCategoryTheme(item.category);

          return (
            <div key={item.key || idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-mono font-bold flex-shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.feature}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${theme.pill}`}>
                    {item.category}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white w-12 text-right">
                    {(item.weight * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${theme.bar}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer info & expand toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
        <span className="italic">
          {scenario === 'scenario_a_full'
            ? '* Weight & Height mendominasi (~70%) karena label NObeyesdad diturunkan dari rumus BMI.'
            : '* Tanpa Weight & Height, model menyingkap faktor gaya hidup utama (Age, FCVC, NCP, FAF, CH2O, TUE).'}
        </span>
        {activeList.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline not-italic"
          >
            {showAll ? 'Tampilkan 8 teratas' : `Lihat semua (${activeList.length})`}
          </button>
        )}
      </div>
    </div>
  );
};

export default FeatureBarChart;
