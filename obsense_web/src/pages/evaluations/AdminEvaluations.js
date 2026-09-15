import React, { useState, useEffect } from 'react';
import storageService from '../../mock/storageService';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import {
  Clock,
  Send,
  ShieldCheck,
  AlertCircle,
  User,
  Activity,
  FileText,
  Stethoscope,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const AdminEvaluations = () => {
  const { user: currentAdmin } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [notes, setNotes] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [adjustedRisk, setAdjustedRisk] = useState('High');

  useEffect(() => {
    const userList = storageService.getUsers();
    setUsers(userList);
    if (userList.length > 0) {
      setSelectedUserId(String(userList[0].id));
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      setEvaluations(storageService.getEvaluations(Number(selectedUserId)));
    }
  }, [selectedUserId]);

  const selectedUser = users.find((u) => u.id === Number(selectedUserId));

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.obesity_class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEvaluation = (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      showError('Harap tuliskan catatan pengamatan klinis!');
      return;
    }

    try {
      storageService.addEvaluation(
        {
          assessment_id: 401,
          user_id: Number(selectedUserId),
          userName: selectedUser?.name || 'Pasien',
          evaluation_notes: notes.trim(),
          clinical_recommendation: recommendation.trim() || 'Tetap jalankan pola makan seimbang dan monitoring berkala.',
          adjusted_risk_level: adjustedRisk
        },
        currentAdmin?.name || 'Admin Klinis',
        currentAdmin?.id || 1
      );

      showSuccess('Evaluasi manual klinis berhasil direkam ke database (Append-Only)!');
      setNotes('');
      setRecommendation('');
      setEvaluations(storageService.getEvaluations(Number(selectedUserId)));
    } catch (err) {
      showError('Gagal menyimpan evaluasi: ' + err.message);
    }
  };

  const riskOptions = [
    { value: 'Low', label: 'Rendah (Low)', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { value: 'Moderate', label: 'Sedang (Moderate)', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    { value: 'High', label: 'Tinggi (High)', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
    { value: 'Critical', label: 'Kritis (Critical)', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-500/15 border-red-500/40' }
  ];

  const getRiskBadgeClasses = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'moderate':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'critical':
        return 'bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-300 border-red-300 dark:border-red-800 font-black';
      case 'high':
      default:
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Evaluasi Manual Klinis
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ruang telaah klinis bagi dokter & tenaga medis untuk menambahkan catatan evaluasi, diagnosis gizi, dan penyesuaian risiko secara permanen (<em>Append-Only</em>).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <Lock size={14} />
            <span>Append-Only Immutability Guaranteed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Select User & New Evaluation Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Patient Selector Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pilih Pasien Terdaftar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pilih subjek untuk melihat riwayat atau membuat telaah baru
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Ketik untuk mencari nama pasien..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                {filteredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — BMI {u.bmi} ({u.obesity_class.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>

              {selectedUser && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 mt-3 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {selectedUser.name}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        #{selectedUser.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedUser.gender === 'Male' ? 'Laki-laki' : 'Perempuan'} • {selectedUser.age} Tahun • {selectedUser.email}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
                      <div className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                        TB: <strong className="text-slate-900 dark:text-white">{selectedUser.height} cm</strong>
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                        BB: <strong className="text-slate-900 dark:text-white">{selectedUser.weight} kg</strong>
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                        BMI: <strong>{selectedUser.bmi}</strong>
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 truncate">
                        <strong className="text-slate-900 dark:text-white">{selectedUser.obesity_class.replace(/_/g, ' ')}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* New Evaluation Form Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tambah Telaah Klinis Baru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Catatan akan di-timestamp dan terikat pada akun admin penilai
              </p>
            </div>

            <form onSubmit={handleAddEvaluation} className="space-y-4">
              {/* Evaluator Identity */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 text-xs">
                <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 mr-1.5">Penilai Aktif:</span>
                  <strong className="text-slate-900 dark:text-white">{currentAdmin?.name || 'Dokter / Tenaga Medis'}</strong>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold ml-1.5">
                    ({currentAdmin?.role === 'super_admin' ? 'Super Admin' : 'Admin Klinis'})
                  </span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <FileText size={14} className="text-blue-500" />
                  Catatan Pengamatan Klinis *
                </label>
                <textarea
                  rows="3"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                  placeholder="Tuliskan temuan klinis, kepatuhan gaya hidup pasien, komorbiditas, atau validasi terhadap output model ML..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <Stethoscope size={14} className="text-emerald-500" />
                  Rekomendasi Terapi, Diet & Gizi
                </label>
                <textarea
                  rows="2"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                  placeholder="Anjuran target defisit kalori harian, durasi aktivitas fisik terukur, atau rujukan lab..."
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <Activity size={14} className="text-purple-500" />
                  Penyesuaian Tingkat Risiko Klinis (Adjusted Risk)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {riskOptions.map((opt) => {
                    const isSelected = adjustedRisk === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all text-left flex items-center justify-between ${
                          isSelected
                            ? `${opt.bg} ${opt.color} shadow-sm ring-1 ring-inset`
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        onClick={() => setAdjustedRisk(opt.value)}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <CheckCircle2 size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
                >
                  <Send size={16} /> Simpan Evaluasi Klinis (Append-Only)
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Timeline of Evaluations (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 h-full">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Riwayat Rekam Evaluasi ({evaluations.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Catatan historis kronologis pasien <strong>{selectedUser?.name || ''}</strong>
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Terekam Permanen
              </span>
            </div>

            {evaluations.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <AlertCircle size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Belum Ada Catatan Evaluasi
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Gunakan formulir di sebelah kiri untuk merekam telaah klinis pertama bagi pasien ini.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {evaluations.map((item, index) => (
                  <div key={item.id || index} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white dark:border-slate-900 shadow-sm" />

                    {/* Timeline Item Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3.5 hover:shadow-sm transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <ShieldCheck size={16} />
                          </div>
                          <div>
                            <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                              {item.adminName}
                            </strong>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              Tenaga Medis Terverifikasi
                            </span>
                          </div>
                        </div>
                        <time className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                          <Clock size={12} />
                          {item.created_at}
                        </time>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                            Pengamatan & Telaah Klinis:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed m-0">
                            {item.evaluation_notes}
                          </p>
                        </div>

                        {item.clinical_recommendation && (
                          <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs mb-1">
                              <Stethoscope size={14} />
                              <span>Rekomendasi Terapi & Gizi:</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed m-0 text-xs">
                              {item.clinical_recommendation}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            Tingkat Risiko:
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getRiskBadgeClasses(item.adjusted_risk_level)}`}>
                            {item.adjusted_risk_level || 'High'} Risk
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 size={12} /> Record Hash Verified
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEvaluations;
