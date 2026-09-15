import React, { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import storageService from '../../mock/storageService';
import { useNotification } from '../../context/NotificationContext';
import useAuth from '../../hooks/useAuth';
import {
  Database,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Layers,
  X,
  Save
} from 'lucide-react';

export const DataManagement = () => {
  const { user: currentAdmin } = useAuth();
  const { showSuccess, showError, confirm } = useNotification();

  const [logs, setLogs] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'cycles'
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [editingLog, setEditingLog] = useState(null);

  const loadData = () => {
    setLogs(storageService.getDailyLogs());
    setCycles(storageService.getCycles());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCSV = () => {
    storageService.exportToCSV(logs, `obsense_daily_logs_${Date.now()}.csv`);
    showSuccess('Data log harian berhasil diexport ke file CSV!');
  };

  const handleDeleteLog = async (log) => {
    const ok = await confirm({
      title: 'Hapus Input Log Harian',
      message: `Hapus input log hari ke-${log.day_number} (${log.log_date}) untuk ${log.userName}?`,
      confirmText: 'Hapus Log',
      danger: true
    });

    if (ok) {
      storageService.deleteDailyLog(log.id, currentAdmin?.name);
      showSuccess('Log harian berhasil dihapus.');
      loadData();
    }
  };

  const handleSaveEditLog = (e) => {
    e.preventDefault();
    if (!editingLog) return;

    try {
      storageService.updateDailyLog(editingLog.id, editingLog, currentAdmin?.name);
      showSuccess(`Log H-${editingLog.day_number} untuk ${editingLog.userName} berhasil diperbarui!`);
      setEditingLog(null);
      loadData();
    } catch (err) {
      showError('Gagal memperbarui log: ' + err.message);
    }
  };

  const filteredLogs = selectedCycleId
    ? logs.filter((l) => l.cycle_id === Number(selectedCycleId))
    : logs;

  const logColumns = [
    {
      header: 'Pasien & Siklus',
      key: 'userName',
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">{val}</span>
          <span className="text-[11px] text-slate-400">Siklus #{row.cycle_id} • Hari ke-{row.day_number}</span>
        </div>
      )
    },
    {
      header: 'Tanggal',
      key: 'log_date',
      render: (val) => <span className="font-medium text-slate-700 dark:text-slate-300">{val}</span>
    },
    {
      header: 'Aktivitas (FAF)',
      key: 'faf',
      render: (val) => (
        <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          Lv {val} ({val === 0 ? '0 jam' : val === 1 ? '1-2 jam' : val === 2 ? '3-4 jam' : '5+ jam'})
        </span>
      )
    },
    {
      header: 'Screen Time (TUE)',
      key: 'tue',
      render: (val) => (
        <span
          className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${
            val === 2
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
          }`}
        >
          Lv {val} ({val === 0 ? '≤2j' : val === 1 ? '3-5j' : '>5j'})
        </span>
      )
    },
    {
      header: 'Sayur (FCVC)',
      key: 'fcvc',
      render: (val) => <span className="font-medium text-slate-700 dark:text-slate-300">Skala {val}</span>
    },
    {
      header: 'Tinggi Kalori (FAVC)',
      key: 'favc',
      render: (val) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
            val
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
          }`}
        >
          {val ? 'Ya' : 'Tidak'}
        </span>
      )
    },
    {
      header: 'Air (CH2O)',
      key: 'ch2o',
      render: (val) => <strong className="font-mono text-slate-800 dark:text-slate-200">{val} L</strong>
    },
    {
      header: 'Catatan User',
      key: 'notes',
      render: (val) => <span className="text-xs text-slate-500 truncate max-w-[140px] block">{val || '-'}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Manajemen Data & Agregasi 14-Hari
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Pusat pemantauan data kuesioner harian FFQ, agregasi statistik per siklus, dan koreksi data masukan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500"
            onClick={handleExportCSV}
          >
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        <button
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'daily'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
          }`}
          onClick={() => setActiveTab('daily')}
        >
          <Database size={15} />
          <span>Log Harian ({logs.length} Input)</span>
        </button>
        <button
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'cycles'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
          }`}
          onClick={() => setActiveTab('cycles')}
        >
          <Layers size={15} />
          <span>Detail Agregasi Siklus ({cycles.length} Siklus)</span>
        </button>
      </div>

      {/* TAB 1: LOG HARIAN */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Log Harian FFQ Seluruh Pasien</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Filter Siklus:</span>
              <select
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                value={selectedCycleId}
                onChange={(e) => setSelectedCycleId(e.target.value)}
              >
                <option value="">Semua Siklus</option>
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    Siklus #{c.id} ({c.userName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DataTable
            columns={logColumns}
            data={filteredLogs}
            searchPlaceholder="Cari berdasarkan nama pasien, tanggal, atau catatan..."
            searchKeys={['userName', 'log_date', 'notes']}
            defaultPageSize={10}
            rowActions={(row) => (
              <div className="flex items-center justify-end gap-1.5">
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-amber-500 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  title="Koreksi Input Harian"
                  onClick={() => setEditingLog({ ...row })}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400"
                  title="Hapus Data Input Ini"
                  onClick={() => handleDeleteLog(row)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          />
        </div>
      )}

      {/* TAB 2: DETAIL AGREGASI SIKLUS */}
      {activeTab === 'cycles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {cycles.map((cycle) => (
            <div
              key={cycle.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      Siklus #{cycle.id}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">{cycle.userName}</h4>
                    <span className="text-xs text-slate-400">
                      {cycle.start_date} s/d {cycle.end_date}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        cycle.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                      }`}
                    >
                      {cycle.status === 'completed' ? 'Tuntas 14 Hari' : 'Berjalan'}
                    </span>
                    <span className="block text-[11px] font-semibold text-slate-500 mt-1">{cycle.completion_rate}% Hari</span>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Hasil Agregasi Fitur Siklus:
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-800/40">
                      <span className="block text-[10px] text-slate-400">Rata-rata FAF</span>
                      <strong className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {cycle.aggregated_features?.faf_mean}
                      </strong>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-800/40">
                      <span className="block text-[10px] text-slate-400">Rata-rata TUE</span>
                      <strong className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {cycle.aggregated_features?.tue_mean}
                      </strong>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-800/40">
                      <span className="block text-[10px] text-slate-400">Modus FCVC</span>
                      <strong className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Skala {cycle.aggregated_features?.fcvc_mode}
                      </strong>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-800/40">
                      <span className="block text-[10px] text-slate-400">Rasio FAVC (Fastfood)</span>
                      <strong className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {((cycle.aggregated_features?.favc_ratio || 0) * 100).toFixed(0)}%
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Log Modal */}
      {editingLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setEditingLog(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Koreksi Input Harian Pasien</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {editingLog.userName} • Hari ke-{editingLog.day_number} ({editingLog.log_date})
                </p>
              </div>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                onClick={() => setEditingLog(null)}
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditLog} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Aktivitas Fisik (FAF)</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                    value={editingLog.faf}
                    onChange={(e) =>
                      setEditingLog({ ...editingLog, faf: Number(e.target.value) })
                    }
                  >
                    <option value={0}>0 = 0 jam (Sedentary)</option>
                    <option value={1}>1 = 1-2 jam (Ringan)</option>
                    <option value={2}>2 = 3-4 jam (Sedang)</option>
                    <option value={3}>3 = 5+ jam (Aktif)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Screen Time (TUE)</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                    value={editingLog.tue}
                    onChange={(e) =>
                      setEditingLog({ ...editingLog, tue: Number(e.target.value) })
                    }
                  >
                    <option value={0}>0 = ≤ 2 jam</option>
                    <option value={1}>1 = 3-5 jam</option>
                    <option value={2}>2 = &gt; 5 jam</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Konsumsi Sayur (FCVC)</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                    value={editingLog.fcvc}
                    onChange={(e) =>
                      setEditingLog({ ...editingLog, fcvc: Number(e.target.value) })
                    }
                  >
                    <option value={1}>1 = Jarang</option>
                    <option value={2}>2 = Kadang-kadang</option>
                    <option value={3}>3 = Setiap makan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Makanan Tinggi Kalori (FAVC)</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                    value={editingLog.favc ? 'true' : 'false'}
                    onChange={(e) =>
                      setEditingLog({ ...editingLog, favc: e.target.value === 'true' })
                    }
                  >
                    <option value="false">Tidak Ada</option>
                    <option value="true">Ya (Tinggi Kalori/Gorengan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Air (CH2O) dalam Liter</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  value={editingLog.ch2o}
                  onChange={(e) =>
                    setEditingLog({ ...editingLog, ch2o: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Harian Pasien</label>
                <textarea
                  rows="2"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  value={editingLog.notes || ''}
                  onChange={(e) =>
                    setEditingLog({ ...editingLog, notes: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  onClick={() => setEditingLog(null)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500"
                >
                  <Save size={15} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagement;

