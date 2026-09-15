import React, { useState, useEffect } from 'react';
import { X, Scale, Save } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import useAuth from '../../hooks/useAuth';
import storageService from '../../mock/storageService';

export const UserEditModal = ({ isOpen, user, onClose, onSaveSuccess }) => {
  const { user: currentAdmin } = useAuth();
  const { showSuccess, showError } = useNotification();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || formData.height <= 0 || formData.weight <= 0) {
      showError('Harap lengkapi semua data wajib dengan benar!');
      return;
    }

    try {
      const updated = storageService.updateUser(
        user.id,
        formData,
        currentAdmin?.name || 'Administrator'
      );
      showSuccess(`Data antropometri ${updated.name} berhasil diperbarui!`);
      onSaveSuccess(updated);
      onClose();
    } catch (err) {
      showError('Gagal memperbarui data pengguna: ' + err.message);
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Kelamin</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Laki-laki (Male)</option>
                <option value="Female">Perempuan (Female)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Usia (Tahun) *</label>
              <input
                type="number"
                min="10"
                max="100"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 p-4 space-y-3 dark:border-blue-500/20 dark:bg-blue-950/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-blue-950 dark:text-blue-200 mb-1">Tinggi Badan (cm) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="100"
                  max="250"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 dark:text-blue-200 mb-1">Berat Badan (kg) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="20"
                  max="300"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <Scale size={16} />
              <span>
                Kalkulasi Otomatis BMI Baru: <strong>{calculatedBmi} kg/m²</strong>
              </span>
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                className="rounded text-blue-600 focus:ring-blue-500"
                checked={formData.family_history_with_overweight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    family_history_with_overweight: e.target.checked
                  })
                }
              />
              <span>Ada riwayat keluarga dengan berat badan berlebih / obesitas</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500"
            >
              <Save size={15} />
              <span>Simpan Koreksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;

