import React, { useState, useEffect, useCallback } from 'react';
import configService from '../../services/configService';
import { useNotification } from '../../context/NotificationContext';
import {
  Save,
  RotateCcw,
  ShieldCheck,
  Scale,
  ListTree,
  CalendarDays,
  Loader2
} from 'lucide-react';

export const SystemConfig = () => {
  const { showSuccess, showError, confirm } = useNotification();

  const [config, setConfig] = useState({
    threshold_who_bmi: {
      insufficient_weight: 18.5,
      normal_weight_min: 18.5,
      normal_weight_max: 24.9,
      overweight_min: 25.0,
      overweight_max: 29.9,
      obesity_1_min: 30.0,
      obesity_1_max: 34.9,
      obesity_2_min: 35.0,
      obesity_2_max: 39.9,
      obesity_3_min: 40.0
    },
    variable_mappings: {
      faf: [
        { code: 0, hours: '0 jam', label: 'Sedentary (Tidak pernah)' },
        { code: 1, hours: '1-2 jam', label: 'Aktivitas Ringan' },
        { code: 2, hours: '3-4 jam', label: 'Aktivitas Sedang' },
        { code: 3, hours: '5+ jam', label: 'Aktivitas Berat / Atlet' }
      ],
      tue: [
        { code: 0, hours: '≤ 2 jam', label: 'Rendah (Ideal)' },
        { code: 1, hours: '3-5 jam', label: 'Sedang' },
        { code: 2, hours: '> 5 jam', label: 'Tinggi (Beresiko)' }
      ],
      fcvc: [
        { code: 1, label: 'Jarang (Never / Rarely)' },
        { code: 2, label: 'Kadang-kadang (Sometimes)' },
        { code: 3, label: 'Setiap Waktu Makan (Always)' }
      ]
    },
    ffq_window: {
      window_days: 14,
      min_days_required: 10,
      allow_missed_day_recovery: true
    },
    audit_info: {
      last_modified_by: 'Super Administrator',
      last_modified_at: '2026-09-12 16:30:00'
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('thresholds');

  const loadConfig = useCallback(async () => {
    try {
      const data = await configService.getConfigurations();
      if (data) {
        setConfig((prev) => ({
          ...prev,
          ...data,
          ffq_window: data.ffq_window_settings || data.ffq_window || prev.ffq_window
        }));
      }
    } catch (err) {
      console.warn('Gagal memuat konfigurasi dari database:', err);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    const ok = await confirm({
      title: 'Terapkan Konfigurasi Baru?',
      message: 'Perubahan ambang batas dan pemetaan variabel akan disimpan ke database MySQL dan dicatat pada audit log.',
      confirmText: 'Simpan & Terapkan'
    });

    if (ok) {
      setSubmitting(true);
      try {
        await Promise.all([
          configService.updateConfiguration('threshold_who_bmi', config.threshold_who_bmi),
          configService.updateConfiguration('variable_mappings', config.variable_mappings),
          configService.updateConfiguration('ffq_window_settings', config.ffq_window)
        ]);
        showSuccess('Konfigurasi sistem berhasil disimpan ke database MySQL!');
        loadConfig();
      } catch (err) {
        showError('Gagal menyimpan konfigurasi: ' + (err.response?.data?.message || err.message));
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleResetDefaults = async () => {
    const ok = await confirm({
      title: 'Reset ke Konfigurasi Standar WHO?',
      message: 'Apakah Anda ingin mengembalikan seluruh parameter ambang batas dan mapping ke default pabrikan?',
      confirmText: 'Reset Default',
      danger: true
    });

    if (ok) {
      const defaults = {
        threshold_who_bmi: {
          insufficient_weight: 18.5,
          normal_weight_min: 18.5,
          normal_weight_max: 24.9,
          overweight_min: 25.0,
          overweight_max: 29.9,
          obesity_1_min: 30.0,
          obesity_1_max: 34.9,
          obesity_2_min: 35.0,
          obesity_2_max: 39.9,
          obesity_3_min: 40.0
        },
        variable_mappings: {
          faf: [
            { code: 0, hours: '0 jam', label: 'Sedentary (Tidak pernah)' },
            { code: 1, hours: '1-2 jam', label: 'Aktivitas Ringan' },
            { code: 2, hours: '3-4 jam', label: 'Aktivitas Sedang' },
            { code: 3, hours: '5+ jam', label: 'Aktivitas Berat / Atlet' }
          ],
          tue: [
            { code: 0, hours: '≤ 2 jam', label: 'Rendah (Ideal)' },
            { code: 1, hours: '3-5 jam', label: 'Sedang' },
            { code: 2, hours: '> 5 jam', label: 'Tinggi (Beresiko)' }
          ],
          fcvc: [
            { code: 1, label: 'Jarang (Never / Rarely)' },
            { code: 2, label: 'Kadang-kadang (Sometimes)' },
            { code: 3, label: 'Setiap Waktu Makan (Always)' }
          ]
        },
        ffq_window: {
          window_days: 14,
          min_days_required: 10,
          allow_missed_day_recovery: true
        }
      };

      try {
        await Promise.all([
          configService.updateConfiguration('threshold_who_bmi', defaults.threshold_who_bmi),
          configService.updateConfiguration('variable_mappings', defaults.variable_mappings),
          configService.updateConfiguration('ffq_window_settings', defaults.ffq_window)
        ]);
        setConfig((prev) => ({ ...prev, ...defaults }));
        showSuccess('Konfigurasi berhasil dikembalikan ke standar WHO di database.');
        loadConfig();
      } catch (err) {
        showError('Gagal reset: ' + err.message);
      }
    }
  };

  const tabs = [
    { id: 'thresholds', label: 'Ambang Batas BMI (WHO)', icon: Scale },
    { id: 'mappings', label: 'Mapping Variabel (FAF, TUE, FCVC)', icon: ListTree },
    { id: 'ffq', label: 'Pengaturan Jendela FFQ (14 Hari)', icon: CalendarDays }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Konfigurasi Sistem & Standar Klinis
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pengaturan ambang batas kesehatan WHO/AHA/FAO, pemetaan variabel diskret kuesioner, dan jendela FFQ 14-hari tersimpan di database MySQL.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 shadow-sm transition-all"
            onClick={handleResetDefaults}
          >
            <RotateCcw size={16} /> Reset Default WHO
          </button>
        </div>
      </div>

      {/* Last Modified Info Banner */}
      <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs">
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={20} />
        </div>
        <div>
          <span className="text-slate-700 dark:text-slate-300">
            Terakhir diubah oleh: <strong className="text-slate-900 dark:text-white">{config?.audit_info?.last_modified_by}</strong>
          </span>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
            Waktu: {config?.audit_info?.last_modified_at}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 max-w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSaveConfig} className="space-y-6">
        {/* TAB 1: THRESHOLDS */}
        {activeTab === 'thresholds' && config.threshold_who_bmi && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ambang Batas BMI Klasifikasi WHO (kg/m²)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Parameter batas bawah dan atas setiap tingkatan status berat badan
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Insufficient Weight (&lt;)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={config.threshold_who_bmi.insufficient_weight}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      threshold_who_bmi: {
                        ...config.threshold_who_bmi,
                        insufficient_weight: parseFloat(e.target.value) || 0
                      }
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Normal Weight Min - Max
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={config.threshold_who_bmi.normal_weight_min}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        threshold_who_bmi: {
                          ...config.threshold_who_bmi,
                          normal_weight_min: parseFloat(e.target.value) || 0
                        }
                      })
                    }
                  />
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">s/d</span>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={config.threshold_who_bmi.normal_weight_max}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        threshold_who_bmi: {
                          ...config.threshold_who_bmi,
                          normal_weight_max: parseFloat(e.target.value) || 0
                        }
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Overweight Min - Max
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={config.threshold_who_bmi.overweight_min}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        threshold_who_bmi: {
                          ...config.threshold_who_bmi,
                          overweight_min: parseFloat(e.target.value) || 0
                        }
                      })
                    }
                  />
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">s/d</span>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={config.threshold_who_bmi.overweight_max}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        threshold_who_bmi: {
                          ...config.threshold_who_bmi,
                          overweight_max: parseFloat(e.target.value) || 0
                        }
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Obesity Type I Min - Max
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={config.threshold_who_bmi.obesity_1_min}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        threshold_who_bmi: {
                          ...config.threshold_who_bmi,
                          obesity_1_min: parseFloat(e.target.value) || 0
                        }
                      })
                    }
                  />
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">s/d</span>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={config.threshold_who_bmi.obesity_1_max}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        threshold_who_bmi: {
                          ...config.threshold_who_bmi,
                          obesity_1_max: parseFloat(e.target.value) || 0
                        }
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VARIABLE MAPPINGS */}
        {activeTab === 'mappings' && config.variable_mappings && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pemetaan Skala Diskret Variabel Gaya Hidup (UCI Standards)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mapping opsi kuesioner harian ke format numerik model machine learning
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <strong className="block text-slate-900 dark:text-white">Aktivitas Fisik (FAF):</strong>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                  <li>0 = 0 jam (Sedentary)</li>
                  <li>1 = 1-2 jam (Ringan)</li>
                  <li>2 = 3-4 jam (Sedang)</li>
                  <li>3 = 5+ jam (Aktif)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <strong className="block text-slate-900 dark:text-white">Screen Time (TUE):</strong>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                  <li>0 = ≤ 2 jam (Ideal)</li>
                  <li>1 = 3-5 jam (Sedang)</li>
                  <li>2 = &gt; 5 jam (Tinggi)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <strong className="block text-slate-900 dark:text-white">Konsumsi Sayur (FCVC):</strong>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                  <li>1 = Jarang / Never</li>
                  <li>2 = Kadang-kadang</li>
                  <li>3 = Setiap waktu makan</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FFQ WINDOW */}
        {activeTab === 'ffq' && config.ffq_window && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pengaturan Periode Siklus FFQ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Durasi pengumpulan data konsumsi sebelum dilakukan agregasi prediksi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Panjang Siklus Pengisian (Hari)
                </label>
                <input
                  type="number"
                  min="7"
                  max="30"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={config.ffq_window.window_days || 14}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      ffq_window: {
                        ...config.ffq_window,
                        window_days: parseInt(e.target.value, 10) || 14
                      }
                    })
                  }
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Default standar protokol: 14 hari</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Batas Minimal Hari Terisi untuk Agregasi Valid
                </label>
                <input
                  type="number"
                  min="5"
                  max="14"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={config.ffq_window.min_days_required || 10}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      ffq_window: {
                        ...config.ffq_window,
                        min_days_required: parseInt(e.target.value, 10) || 10
                      }
                    })
                  }
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Minimal 10 hari terisi untuk kalkulasi akurat</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Simpan & Terapkan Konfigurasi</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemConfig;
