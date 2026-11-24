import React, { useState, useEffect } from 'react';
import DonutChart from '../../components/charts/DonutChart';
import TrendLineChart from '../../components/charts/TrendLineChart';
import CorrelationHeatmap from '../../components/charts/CorrelationHeatmap';
import FeatureBarChart from '../../components/charts/FeatureBarChart';
import storageService from '../../mock/storageService';
import dashboardService, { EMPTY_STATS } from '../../services/dashboardService';
import predictionService from '../../services/predictionService';
import { useNotification } from '../../context/NotificationContext';
import {
  FileSpreadsheet,
  Printer,
  Users,
  Scale,
  Cpu,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ReportsAnalytics = () => {
  const { showSuccess } = useNotification();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [mlMeta, setMlMeta] = useState(null);

  useEffect(() => {
    dashboardService
      .getStats()
      .then(setStats)
      .catch((err) => console.error('Gagal memuat statistik:', err));

    predictionService
      .getMetadata()
      .then(setMlMeta)
      .catch((err) => console.warn('Metadata ML belum tersedia, memakai fallback:', err.message));
  }, []);

  const accFull = mlMeta?.models?.scenario_a_full?.metrics?.test_accuracy ?? 96.41;
  const accLife = mlMeta?.models?.scenario_b_lifestyle?.metrics?.test_accuracy ?? 85.65;

  const handleExportCSVReport = () => {
    const summaryData = [
      { Indikator: 'Total Pasien Terdaftar', Nilai: stats.totalUsers },
      { Indikator: 'Rata-rata BMI Populasi', Nilai: stats.avgBmi },
      { Indikator: 'Kasus Risiko Tinggi & Kritis', Nilai: stats.highRiskCount },
      { Indikator: 'Persentase Siklus Tuntas', Nilai: `${stats.completionRate}%` },
      { Indikator: 'Random Forest Tuned - Skenario A (Full)', Nilai: `${accFull}%` },
      { Indikator: 'Random Forest Tuned - Skenario B (Lifestyle-Only)', Nilai: `${accLife}%` }
    ];
    storageService.exportToCSV(summaryData, `obsense_analytics_report_${Date.now()}.csv`);
    showSuccess('Laporan analitik berhasil diexport ke CSV!');
  };

  const handlePrint = () => {
    window.print();
  };

  const kpis = [
    {
      label: 'Total Sampel Terdaftar',
      value: `${stats.totalUsers} Pasien`,
      sub: 'Data Riil & Kuesioner',
      icon: Users,
      color: '#3b82f6',
      bgColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
    },
    {
      label: 'Rata-Rata Indeks Massa Tubuh',
      value: `${stats.avgBmi} kg/m²`,
      sub:
        stats.avgBmi <= 0
          ? 'Belum ada data'
          : stats.avgBmi < 18.5
            ? 'Status: Underweight'
            : stats.avgBmi < 25
              ? 'Status: Normal'
              : stats.avgBmi < 30
                ? 'Status: Overweight'
                : 'Status: Obesitas',
      icon: Scale,
      color: '#f59e0b',
      bgColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    },
    {
      label: 'Model Klasifikasi ML',
      value: `RF Tuned ${accFull}%`,
      sub: `Lifestyle-Only: ${accLife}%`,
      icon: Cpu,
      color: '#10b981',
      bgColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    {
      label: 'Faktor Utama (A vs B)',
      value: 'Weight (r = +0.91)',
      sub: 'Lifestyle: Age, FCVC, NCP, FAF',
      icon: Flame,
      color: '#ef4444',
      bgColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Laporan & Analitik Obesitas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Wawasan komprehensif korelasi variabel gaya hidup, evaluasi bobot fitur model ML, dan tren populasi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
          >
            <Printer size={16} /> Cetak / Simpan PDF
          </button>
          <button
            type="button"
            onClick={handleExportCSVReport}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
          >
            <FileSpreadsheet size={16} /> Export Ringkasan CSV
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${kpi.bgColor} flex-shrink-0`}>
                <Icon size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
                  {kpi.label}
                </span>
                <span className="block text-lg font-black text-slate-900 dark:text-white mt-0.5 truncate">
                  {kpi.value}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {kpi.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 1: 2 Primary Charts (Donut & Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Distribusi 7 Kelas Obesitas (UCI Standard)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Persentase proporsi pasien di setiap spektrum berat badan
            </p>
          </div>
          <DonutChart classCounts={stats.classCounts} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tren Risiko Obesitas Berkala
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dinamika migrasi level risiko pasien dalam 6 periode observasi
            </p>
          </div>
          <TrendLineChart />
        </div>
      </div>

      {/* Row 2: Correlation Analysis & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correlation Heatmap */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Korelasi Fitur Gaya Hidup terhadap Obesitas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Koefisien korelasi Pearson (r) variabel FAF, TUE, FCVC, dan FAVC
            </p>
          </div>
          <CorrelationHeatmap correlationData={mlMeta?.correlation_matrix} />
        </div>

        {/* Feature Importance ML */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Feature Importance — Ablation Study (Skenario A vs B)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Bandingkan dominasi BMI pada Skenario A vs faktor gaya hidup murni pada Skenario B
            </p>
          </div>
          <FeatureBarChart featureImportance={mlMeta?.feature_importance} />
        </div>
      </div>

      {/* Row 2.5: A/B Testing (Ablation Study) Table */}
      {mlMeta?.ab_experiments && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hasil Eksperimen A/B Testing (Ablation Study) &amp; Hyperparameter Tuning
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dataset UCI Obesity Levels ({mlMeta.dataset?.clean_rows} sampel bersih, split 80/20 stratified, 5-Fold CV)
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Live dari prediction-service
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  <th className="px-3.5 py-2.5">Model</th>
                  <th className="px-3.5 py-2.5">Skenario</th>
                  <th className="px-3.5 py-2.5 text-center">Fitur</th>
                  <th className="px-3.5 py-2.5 text-right">5-Fold CV F1</th>
                  <th className="px-3.5 py-2.5 text-right">Test Accuracy</th>
                  <th className="px-3.5 py-2.5 text-right">Weighted F1</th>
                  <th className="px-3.5 py-2.5 text-right">Error Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {mlMeta.ab_experiments.map((row, idx) => {
                  const isTuned = row.model.includes('Tuned');
                  return (
                    <tr
                      key={idx}
                      className={
                        isTuned
                          ? 'bg-blue-50/40 dark:bg-blue-950/20 font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                      }
                    >
                      <td className="px-3.5 py-2.5 font-bold text-slate-900 dark:text-white">{row.model}</td>
                      <td className="px-3.5 py-2.5">{row.scenario}</td>
                      <td className="px-3.5 py-2.5 text-center font-mono">{row.feature_count}</td>
                      <td className="px-3.5 py-2.5 text-right font-mono">{row.cv_f1_score ?? '-'}</td>
                      <td className="px-3.5 py-2.5 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                        {row.test_accuracy}%
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono">{row.test_f1_score}</td>
                      <td className="px-3.5 py-2.5 text-right font-mono text-slate-500">
                        {row.error_rate}% ({row.misclassified}/{row.test_samples})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Row 3: Clinical Insights Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Kesimpulan Klinis & Rekomendasi Program Intervensi
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rangkuman analitis berbasis model inferensi dan data harian
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle2 size={18} />
              <span>Faktor Protektif Signifikan</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Aktivitas Fisik (FAF, r = -0.68) dan Konsumsi Sayur (FCVC, r = -0.61) terbukti menjadi faktor pencegah paling efektif. Intervensi disarankan berfokus pada target 150 menit olahraga sedang/minggu.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <AlertCircle size={18} />
              <span>Faktor Risiko Utama yang Perlu Dikontrol</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Kebiasaan Makanan Tinggi Kalori (FAVC, r = +0.72) dan Screen Time berlebih (TUE, r = +0.58) adalah pemicu utama eskalasi berat badan menuju Obesity Type I & II.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
