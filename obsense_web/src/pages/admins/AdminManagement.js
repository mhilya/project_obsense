import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../../components/common/DataTable';
import adminService from '../../services/adminService';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import {
  UserPlus,
  Edit2,
  KeyRound,
  Power,
  X,
  Save,
  Clock,
  Shield,
  Loader2
} from 'lucide-react';

export const AdminManagement = () => {
  const { user: currentAdmin } = useAuth();
  const { showSuccess, showError, confirm } = useNotification();

  const [admins, setAdmins] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState(null); // 'add' | 'edit'
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    is_active: true
  });

  const loadAdmins = useCallback(async () => {
    try {
      const data = await adminService.getAdmins();
      setAdmins(data || []);
    } catch (err) {
      showError('Gagal memuat data admin dari server.');
    }
  }, [showError]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: 'admin123',
      role: 'admin',
      is_active: true
    });
    setModalType('add');
  };

  const handleOpenEdit = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      is_active: admin.is_active
    });
    setModalType('edit');
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showError('Harap isi nama dan email admin!');
      return;
    }

    setSubmitting(true);
    try {
      if (modalType === 'add') {
        await adminService.createAdmin(formData);
        showSuccess(`Akun admin baru ${formData.name} berhasil dibuat di database!`);
      } else {
        await adminService.updateAdmin(selectedAdmin.id, formData);
        showSuccess(`Profil admin ${formData.name} berhasil diperbarui!`);
      }
      setModalType(null);
      loadAdmins();
    } catch (err) {
      showError('Gagal menyimpan admin: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (admin) => {
    const ok = await confirm({
      title: 'Reset Password Akun Admin',
      message: `Reset kata sandi untuk akun ${admin.email} ke kata sandi standar (admin123)?`,
      confirmText: 'Reset Password'
    });

    if (ok) {
      try {
        await adminService.updateAdmin(admin.id, { password: 'admin123' });
        showSuccess(`Password admin ${admin.email} berhasil di-reset ke 'admin123'.`);
      } catch (err) {
        showError('Gagal reset password: ' + err.message);
      }
    }
  };

  const handleToggleActive = async (admin) => {
    if (admin.id === currentAdmin?.id) {
      showError('Anda tidak dapat menonaktifkan akun Anda sendiri!');
      return;
    }

    const nextState = !admin.is_active;
    const ok = await confirm({
      title: `${nextState ? 'Aktifkan' : 'Nonaktifkan'} Akun Admin?`,
      message: `Apakah Anda yakin ingin ${nextState ? 'mengaktifkan' : 'menonaktifkan'} akses admin ${admin.name}?`,
      confirmText: nextState ? 'Aktifkan' : 'Nonaktifkan',
      danger: !nextState
    });

    if (ok) {
      try {
        await adminService.updateAdmin(admin.id, { is_active: nextState });
        showSuccess(`Status admin ${admin.name} berhasil diubah.`);
        loadAdmins();
      } catch (err) {
        showError('Gagal mengubah status: ' + err.message);
      }
    }
  };

  const columns = [
    {
      header: 'Nama & Email Admin',
      key: 'name',
      render: (val, row) => (
        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">{val}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{row.email}</div>
        </div>
      )
    },
    {
      header: 'Tingkat Hak Akses (Role)',
      key: 'role',
      render: (val) => (
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
            val === 'super_admin'
              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
          }`}
        >
          <Shield size={12} />
          {val === 'super_admin' ? 'Super Administrator' : 'Admin Klinis'}
        </span>
      )
    },
    {
      header: 'Status Akun',
      key: 'is_active',
      render: (val) => (
        <span
          className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            val
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
          }`}
        >
          {val ? 'Aktif' : 'Non-aktif'}
        </span>
      )
    },
    {
      header: 'Login Terakhir',
      key: 'last_login_at',
      render: (val) => (
        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1">
          {val ? (
            <>
              <Clock size={12} className="text-slate-400" />
              {val}
            </>
          ) : (
            'Belum pernah login'
          )}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Manajemen Akun Administrator
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Khusus Super Administrator: Kelola akun admin internal, hak akses (role), dan kredensial sandi di database MySQL.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
            onClick={handleOpenAdd}
          >
            <UserPlus size={16} /> Tambah Admin Baru
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
        <DataTable
          columns={columns}
          data={admins}
          searchPlaceholder="Cari nama atau email admin..."
          searchKeys={['name', 'email', 'role']}
          defaultPageSize={10}
          rowActions={(row) => (
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-all"
                title="Edit Profil & Role"
                onClick={() => handleOpenEdit(row)}
              >
                <Edit2 size={15} />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-amber-900/30 transition-all"
                title="Reset Kata Sandi"
                onClick={() => handleResetPassword(row)}
              >
                <KeyRound size={15} />
              </button>
              <button
                type="button"
                className={`p-1.5 rounded-lg transition-all ${
                  row.is_active
                    ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-900/30'
                    : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/30'
                }`}
                title={row.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                onClick={() => handleToggleActive(row)}
              >
                <Power size={15} />
              </button>
            </div>
          )}
        />
      </div>

      {/* Add / Edit Admin Modal */}
      {modalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setModalType(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {modalType === 'add' ? 'Tambah Akun Administrator' : 'Perbarui Profil Admin'}
              </h3>
              <button
                type="button"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                onClick={() => setModalType(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Dr. Sarah Amalia, Sp.GK"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Email Resmi *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@obsense.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {modalType === 'add' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password Awal
                  </label>
                  <input
                    type="password"
                    placeholder="Default: admin123"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tingkat Hak Akses (Role)
                </label>
                <select
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="admin">Admin Klinis (Koreksi Data, Evaluasi Klinis & Validasi)</option>
                  <option value="super_admin">Super Administrator (Akses Penuh & Konfigurasi Sistem)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => setModalType(null)}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{modalType === 'add' ? 'Simpan Admin' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
