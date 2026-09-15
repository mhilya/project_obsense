import React, { useState } from 'react';
import DonutChart from '../../components/charts/DonutChart';
import TrendLineChart from '../../components/charts/TrendLineChart';
import CorrelationHeatmap from '../../components/charts/CorrelationHeatmap';
import FeatureBarChart from '../../components/charts/FeatureBarChart';
import storageService from '../../mock/storageService';
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
  const [stats] = useState(() => storageService.getDashboardStats());

  const handleExportCSVReport = () => {
    const summaryData = [
      { Indikator: 'Total Pasien Terdaftar', Nilai: stats.totalUsers },
      { Indikator: 'Rata-rata BMI Populasi', Nilai: stats.avgBmi },
      { Indikator: 'Kasus Risiko Tinggi & Kritis', Nilai: stats.highRiskCount },
      { Indikator: 'Persentase Siklus Tuntas', Nilai: `${stats.completionRate}%` },
      { Indikator: 'Versi Model ML', Nilai: 'Random Forest 7-Class v1.2' },
      { Indikator: 'Fitur Paling Berpengaruh', Nilai: 'Weight (32%), Age (18%), FAF (14%)' }
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
      sub: 'Status: Overweight',
      icon: Scale,
      color: '#f59e0b',
      bgColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    },
    {
      label: 'Model Klasifikasi ML',
      value: 'Random Forest v1.2',
      sub: 'Akurasi F1-Score: 94.2%',
      icon: Cpu,
      color: '#10b981',
      bgColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    {
      label: 'Faktor Pendorong Utama',
      value: 'FAVC (r = +0.72)',
      sub: 'Makanan Tinggi Kalori',
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
          <CorrelationHeatmap />
        </div>

        {/* Feature Importance ML */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Feature Importance (Model Machine Learning)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Bobot kontribusi variabel terhadap keputusan klasifikasi Random Forest
            </p>
          </div>
          <FeatureBarChart />
        </div>
      </div>

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
