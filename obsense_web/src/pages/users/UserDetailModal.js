import React, { useState, useEffect, useCallback } from 'react';
import { X, User, Calendar, Activity, Cpu, Sparkles } from 'lucide-react';
import assessmentService from '../../services/assessmentService';
import cycleService from '../../services/cycleService';
import predictionService from '../../services/predictionService';
import { apiErrorMessage } from '../../services/userService';
import { useNotification } from '../../context/NotificationContext';
import { OBESITY_CLASSES } from '../../mock/mockData';

export const UserDetailModal = ({ isOpen, user, onClose, onEdit }) => {
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState('profile');
  const [assessments, setAssessments] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [predicting, setPredicting] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setLoadError('');
    try {
      const [a, l] = await Promise.all([
        assessmentService.getAssessments({ user_id: user.id }),
        cycleService.getDailyLogs({ user_id: user.id })
      ]);
      setAssessments(a);
      setDailyLogs([...l].sort((x, y) => (x.log_date < y.log_date ? -1 : 1)));
    } catch (err) {
      setLoadError(apiErrorMessage(err));
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen || !user) return;
    loadHistory();
  }, [isOpen, user, loadHistory]);

  const handleRunPrediction = async () => {
    if (!user) return;
    setPredicting(true);
    try {
      const res = await predictionService.predictFromCycle({ user_id: user.id });
      const clsLabel = (res.data?.obesity_class || '').replace(/_/g, ' ');
      showSuccess(`Prediksi ML selesai: ${clsLabel}`);
      await loadHistory();
    } catch (err) {
      showError('Gagal menjalankan prediksi ML: ' + apiErrorMessage(err));
    } finally {
      setPredicting(false);
    }
  };

  if (!isOpen || !user) return null;

  const classConfig = OBESITY_CLASSES.find((c) => c.key === user.obesity_class) || {
    label: user.obesity_class || 'Tidak diketahui',
    color: '#64748b'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <User size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{user.name}</h3>
                <span
                  className="rounded px-2 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: `${classConfig.color}18`, color: classConfig.color }}
                >
                  {classConfig.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user.email} • {user.phone || '-'}
              </p>
            </div>
          </div>

          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            onClick={onClose}
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex overflow-x-auto whitespace-nowrap border-b border-slate-100 bg-slate-50/50 px-3 sm:px-5 dark:border-slate-800 dark:bg-slate-950/40 scrollbar-none">
          <button
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition shrink-0 ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={14} /> Profil Antropometri
          </button>
          <button
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition shrink-0 ${
              activeTab === 'assessments'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('assessments')}
          >
            <Activity size={14} /> Riwayat Prediksi ML ({assessments.length})
          </button>
          <button
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition shrink-0 ${
              activeTab === 'logs'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('logs')}
          >
            <Calendar size={14} /> Data Harian ({dailyLogs.length} Hari)
          </button>
        </div>

        {/* Modal Body per Tab */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: Profil Antropometri */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-center dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="block text-[10px] font-bold uppercase text-slate-400">Tinggi Badan</span>
                  <span className="mt-1 block text-base font-extrabold text-slate-900 dark:text-white">{user.height ?? '-'} cm</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-center dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="block text-[10px] font-bold uppercase text-slate-400">Berat Badan</span>
                  <span className="mt-1 block text-base font-extrabold text-slate-900 dark:text-white">{user.weight ?? '-'} kg</span>
                </div>
                <div className="rounded-xl border border-blue-500/30 bg-blue-50/60 p-3 text-center dark:border-blue-500/30 dark:bg-blue-950/40">
                  <span className="block text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">BMI</span>
                  <span className="mt-1 block text-base font-extrabold text-blue-600 dark:text-blue-400">{user.bmi}</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-center dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="block text-[10px] font-bold uppercase text-slate-400">Usia & Gender</span>
                  <span className="mt-1 block text-xs font-extrabold text-slate-900 dark:text-white">
                    {user.age ?? '-'} Thn • {user.gender === 'Male' ? 'L' : user.gender === 'Female' ? 'P' : '-'}
                  </span>
                </div>
              </div>

              {/* Visual WHO BMI Spectrum Gauge */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between text-xs">
                  <strong className="text-slate-800 dark:text-slate-200">Spektrum Klasifikasi BMI WHO:</strong>
                  <span className="font-bold" style={{ color: classConfig.color }}>
                    {user.bmi} kg/m² ({classConfig.label})
                  </span>
                </div>
                <div className="relative mt-6 mb-3">
                  {/* Indicator Pointer */}
                  <div
                    className="absolute -top-5 -translate-x-1/2 flex flex-col items-center z-10"
                    style={{
                      left: `${Math.min(Math.max(((user.bmi - 15) / (45 - 15)) * 100, 4), 96)}%`
                    }}
                  >
                    <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-extrabold text-white dark:bg-white dark:text-slate-900 shadow">
                      {user.bmi}
                    </span>
                    <span className="text-[9px] -mt-1 text-slate-900 dark:text-white">▼</span>
                  </div>
                  {/* Segmented Color Bar */}
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full">
                    <div style={{ width: '12%', background: '#38bdf8' }} title="Insufficient (<18.5)" />
                    <div style={{ width: '21%', background: '#10b981' }} title="Normal (18.5-24.9)" />
                    <div style={{ width: '17%', background: '#f59e0b' }} title="Overweight (25-29.9)" />
                    <div style={{ width: '17%', background: '#ef4444' }} title="Obesity I (30-34.9)" />
                    <div style={{ width: '17%', background: '#dc2626' }} title="Obesity II (35-39.9)" />
                    <div style={{ width: '16%', background: '#991b1b' }} title="Obesity III (>=40)" />
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>&lt;18.5 (Under)</span>
                  <span>18.5 - 24.9 (Ideal)</span>
                  <span>25 - 29.9</span>
                  <span>30 - 34.9</span>
                  <span>35 - 39.9</span>
                  <span>≥40 (Kritis)</span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white p-4 text-xs dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Riwayat Keluarga Obesitas:</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {user.family_history_with_overweight ? 'Ya (Ada Riwayat)' : 'Tidak Ada'}
                  </strong>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Status Akun:</span>
                  <span className={`font-bold ${user.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {user.status === 'active' ? 'Aktif' : 'Non-aktif'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Tingkat Risiko:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{user.risk_level || 'Low'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Terdaftar Sejak:</span>
                  <span className="text-slate-600 dark:text-slate-300">{user.created_at}</span>
                </div>
              </div>

              <div className="text-right pt-2">
                <button
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500"
                  onClick={() => {
                    onClose();
                    onEdit(user);
                  }}
                >
                  Koreksi Data Antropometri
                </button>
              </div>
            </div>
          )}

          {loadError && (
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              Gagal memuat riwayat: {loadError}
            </div>
          )}

          {/* TAB 2: Riwayat Prediksi */}
          {activeTab === 'assessments' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200/80 bg-blue-50/50 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Jalankan inferensi Random Forest (Skenario A + Skenario B &amp; SHAP) dari siklus terbaru pasien ini.
                </div>
                <button
                  type="button"
                  disabled={predicting}
                  onClick={handleRunPrediction}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-50"
                >
                  <Cpu size={14} />
                  <span>{predicting ? 'Memproses...' : 'Jalankan Prediksi ML'}</span>
                </button>
              </div>

              {assessments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada riwayat asesmen selesai untuk pengguna ini.
                </div>
              ) : (
                assessments.map((item) => {
                  const life = item.lifestyle_prediction;
                  const shapList = Array.isArray(item.shap_factors) ? item.shap_factors : [];
                  return (
                    <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-800/40">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Hasil Prediksi Model #{item.id}</h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Model: {item.model_version} • Tanggal: {item.assessment_date}
                          </span>
                        </div>
                        <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
                          {item.risk_level} Risk
                        </span>
                      </div>

                      {/* Dual-Scenario Comparison (Skenario A vs Skenario B) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="rounded-lg border border-blue-200/70 bg-white p-2.5 dark:border-blue-900/40 dark:bg-slate-900">
                          <span className="block text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">
                            Skenario A (Full / Klinis)
                          </span>
                          <strong className="block text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
                            {(item.obesity_class || '-').replace(/_/g, ' ')}
                          </strong>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            BMI: {item.bmi ?? '-'} • Risiko: {item.risk_level}
                          </span>
                        </div>

                        {life && (
                          <div className="rounded-lg border border-emerald-200/70 bg-white p-2.5 dark:border-emerald-900/40 dark:bg-slate-900">
                            <span className="block text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                              Skenario B (Lifestyle-Only)
                            </span>
                            <strong className="block text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
                              {(life.obesity_class || '-').replace(/_/g, ' ')}
                            </strong>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Murni pola hidup • Risiko: {life.risk_level}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Top SHAP Factors */}
                      {shapList.length > 0 && (
                        <div className="rounded-lg border border-slate-200/70 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                          <h5 className="flex items-center gap-1 text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-2">
                            <Sparkles size={12} className="text-purple-500" />
                            <span>Faktor Pendorong Gaya Hidup (SHAP):</span>
                          </h5>
                          <div className="flex flex-wrap gap-1.5">
                            {shapList.map((f, i) => (
                              <span
                                key={f.feature || i}
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                                  f.impact === 'risk_up'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50'
                                }`}
                              >
                                <span>{f.label || f.feature}</span>
                                <span className="font-mono opacity-80">
                                  ({f.shap_value >= 0 ? `+${f.shap_value}` : f.shap_value})
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">Distribusi Probabilitas 7 Kelas:</h5>
                        <div className="space-y-1.5">
                          {item.probability_scores &&
                            Object.entries(item.probability_scores).map(([k, prob]) => {
                              const cls = OBESITY_CLASSES.find((c) => c.key === k);
                              return (
                                <div key={k} className="flex items-center gap-2 text-[11px]">
                                  <span className="w-36 truncate text-slate-500 dark:text-slate-400">{cls?.label || k}</span>
                                  <div className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden dark:bg-slate-700">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${(prob * 100).toFixed(1)}%`,
                                        backgroundColor: cls?.color || '#3b82f6'
                                      }}
                                    />
                                  </div>
                                  <span className="w-10 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                                    {(prob * 100).toFixed(1)}%
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {item.recommendations && (
                        <div className="rounded-lg bg-white p-3 border border-slate-200/60 dark:border-slate-700 dark:bg-slate-900">
                          <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">Rekomendasi Klinis:</h5>
                          <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
                            {item.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: Log Harian (14 Hari) */}
          {activeTab === 'logs' && (
            <div>
              {dailyLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada catatan log harian yang diisi.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold uppercase text-slate-500">
                        <th className="px-3 py-2.5">Hari</th>
                        <th className="px-3 py-2.5">Tanggal</th>
                        <th className="px-3 py-2.5">FAF</th>
                        <th className="px-3 py-2.5">TUE</th>
                        <th className="px-3 py-2.5">FCVC</th>
                        <th className="px-3 py-2.5">FAVC</th>
                        <th className="px-3 py-2.5">Air (L)</th>
                        <th className="px-3 py-2.5">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {dailyLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="px-3 py-2 font-bold">H-{log.day_number}</td>
                          <td className="px-3 py-2">{log.log_date}</td>
                          <td className="px-3 py-2">Lv {log.faf}</td>
                          <td className="px-3 py-2">Lv {log.tue}</td>
                          <td className="px-3 py-2">Lv {log.fcvc}</td>
                          <td className="px-3 py-2">{log.favc ? 'Ya' : 'Tidak'}</td>
                          <td className="px-3 py-2">{log.ch2o} L</td>
                          <td className="px-3 py-2 truncate max-w-[120px] text-slate-400">{log.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;

