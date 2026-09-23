import React, { useState, useEffect } from 'react';
import { X, Scale, Save, Loader2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import userService from '../../services/userService';

export const UserEditModal = ({ isOpen, user, onClose, onSaveSuccess }) => {
  const { showSuccess, showError } = useNotification();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    age: 25,
    height: 170,
    weight: 70,
    family_history_with_overweight: false,
    status: 'active'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || 'Male',
        age: user.age || 25,
        height: user.height || 170,
        weight: user.weight || 70,
        family_history_with_overweight: !!user.family_history_with_overweight,
        status: user.status || 'active'
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  // Real-time calculated BMI
  const calculatedBmi =
    formData.height > 0 && formData.weight > 0
      ? (formData.weight / ((formData.height / 100) ** 2)).toFixed(1)
      : '0.0';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || formData.height <= 0 || formData.weight <= 0) {
      showError('Harap lengkapi semua data wajib dengan benar!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await userService.updateUser(user.id, formData);
      showSuccess(`Data antropometri ${formData.name} berhasil diperbarui di database!`);
      if (onSaveSuccess) onSaveSuccess(res.data || formData);
      onClose();
    } catch (err) {
      showError('Gagal memperbarui data pengguna: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Koreksi Antropometri Pasien</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ID Pasien: #{user.id} • {user.name}</p>
          </div>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            onClick={onClose}
            title="Batal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap *</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
              <input
                type="email"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon</label>
              <input
                type="tel"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Kelamin</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Laki-laki</option>
                <option value="Female">Perempuan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Usia (Thn)</label>
              <input
                type="number"
                min="10"
                max="100"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tinggi (cm)</label>
              <input
                type="number"
                step="0.5"
                min="100"
                max="250"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Berat (kg)</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* BMI Live Preview Box */}
          <div className="flex items-center justify-between rounded-xl bg-blue-50/80 p-3 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">Kalkulasi Otomatis BMI:</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-base font-black text-blue-600 dark:text-blue-400">{calculatedBmi}</span>
              <span className="text-[10px] text-blue-700/80 dark:text-blue-300/80 font-bold">kg/m²</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                className="rounded text-blue-600 focus:ring-blue-500"
                checked={formData.family_history_with_overweight}
                onChange={(e) =>
                  setFormData({ ...formData, family_history_with_overweight: e.target.checked })
                }
              />
              <span>Riwayat keluarga obesitas</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={onClose}
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
