import React, { useState, useEffect } from 'react';
import storageService from '../../mock/storageService';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import {
  Save,
  RotateCcw,
  ShieldCheck,
  Scale,
  ListTree,
  CalendarDays
} from 'lucide-react';

export const SystemConfig = () => {
  const { user: currentAdmin } = useAuth();
  const { showSuccess, showError, confirm } = useNotification();

  const [config, setConfig] = useState(() => storageService.getConfigurations());
  const [activeTab, setActiveTab] = useState('thresholds');

  const loadConfig = () => {
    setConfig(storageService.getConfigurations());
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    const ok = await confirm({
      title: 'Terapkan Konfigurasi Baru?',
      message: 'Perubahan ambang batas dan pemetaan variabel akan langsung diterapkan ke seluruh kalkulasi sistem OBSENSE dan dicatat pada audit log.',
      confirmText: 'Simpan & Terapkan'
    });

    if (ok) {
      try {
        const updated = storageService.updateConfigurations(
          config,
          currentAdmin?.name || 'Administrator'
        );
        setConfig(updated);
        showSuccess('Konfigurasi sistem berhasil disimpan dan diterapkan!');
      } catch (err) {
        showError('Gagal menyimpan konfigurasi: ' + err.message);
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
      localStorage.removeItem('obsense_configurations');
      loadConfig();
      showSuccess('Konfigurasi berhasil dikembalikan ke standar awal.');
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
            Pengaturan ambang batas kesehatan WHO/AHA/FAO, pemetaan variabel diskret kuesioner, dan jendela FFQ 14-hari.
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
        {activeTab === 'thresholds' && (
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

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Obesity Type II Min - Max
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={config.threshold_who_bmi.obesity_2_min}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        threshold_who_bmi: {
                          ...config.threshold_who_bmi,
                          obesity_2_min: parseFloat(e.target.value) || 0
                        }
                      })
                    }
                  />
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">s/d</span>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={config.threshold_who_bmi.obesity_2_max}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        threshold_who_bmi: {
                          ...config.threshold_who_bmi,
                          obesity_2_max: parseFloat(e.target.value) || 0
                        }
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Obesity Type III (Kritis) Min (&ge;)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={config.threshold_who_bmi.obesity_3_min}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      threshold_who_bmi: {
                        ...config.threshold_who_bmi,
                        obesity_3_min: parseFloat(e.target.value) || 0
                      }
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VARIABLE MAPPINGS */}
        {activeTab === 'mappings' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pemetaan Skala Kuesioner (Discrete Scale Mapping)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Standarisasi nilai ordinal FAF, TUE, dan FCVC untuk model pembelajaran mesin
              </p>
            </div>

            <div className="space-y-6">
              {/* FAF */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  1. FAF (Physical Activity Frequency)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-2.5">Kode Ordinal</th>
                        <th className="px-4 py-2.5">Durasi Jam / Minggu</th>
                        <th className="px-4 py-2.5">Label Deskripsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {config.variable_mappings.faf.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-2.5">
                            <span className="font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                              {item.code}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-bold">{item.hours}</td>
                          <td className="px-4 py-2.5">{item.label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TUE */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  2. TUE (Screen Time / Device Technology Usage)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-2.5">Kode Ordinal</th>
                        <th className="px-4 py-2.5">Waktu Layar / Hari</th>
                        <th className="px-4 py-2.5">Kategori Risiko</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {config.variable_mappings.tue.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-2.5">
                            <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              {item.code}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-bold">{item.hours}</td>
                          <td className="px-4 py-2.5">{item.label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FCVC */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  3. FCVC (Frequency of Vegetable Consumption)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-2.5">Skala</th>
                        <th className="px-4 py-2.5">Frekuensi Makan Sayur</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {config.variable_mappings.fcvc.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-2.5">
                            <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              {item.code}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-bold">{item.label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FFQ WINDOW */}
        {activeTab === 'ffq' && (
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
                  value={config.ffq_window.window_days}
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
                  value={config.ffq_window.min_days_required}
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
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
          >
            <Save size={18} /> Simpan & Terapkan Konfigurasi
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemConfig;
