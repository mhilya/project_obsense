import React, { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import storageService from '../../mock/storageService';
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
  Shield
} from 'lucide-react';

export const AdminManagement = () => {
  const { user: currentAdmin } = useAuth();
  const { showSuccess, showError, confirm } = useNotification();

  const [admins, setAdmins] = useState([]);
  const [modalType, setModalType] = useState(null); // 'add' | 'edit'
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin',
    is_active: true
  });

  const loadAdmins = () => {
    setAdmins(storageService.getAdmins());
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
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
      role: admin.role,
      is_active: admin.is_active
    });
    setModalType('edit');
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showError('Harap isi nama dan email admin!');
      return;
    }

    try {
      if (modalType === 'add') {
        storageService.addAdmin(formData, currentAdmin?.name);
        showSuccess(`Akun admin baru ${formData.name} berhasil dibuat!`);
      } else {
        storageService.updateAdmin(selectedAdmin.id, formData, currentAdmin?.name);
        showSuccess(`Profil admin ${formData.name} berhasil diperbarui!`);
      }
      setModalType(null);
      loadAdmins();
    } catch (err) {
      showError('Gagal menyimpan admin: ' + err.message);
    }
  };

  const handleResetPassword = async (admin) => {
    const ok = await confirm({
      title: 'Reset Password Akun Admin',
      message: `Reset kata sandi untuk akun ${admin.email} ke kata sandi standar (admin123)?`,
      confirmText: 'Reset Password'
    });

    if (ok) {
      storageService.resetAdminPassword(admin.id, currentAdmin?.name);
      showSuccess(`Password admin ${admin.email} berhasil di-reset ke 'admin123'.`);
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
      storageService.updateAdmin(admin.id, { is_active: nextState }, currentAdmin?.name);
      showSuccess(`Status admin ${admin.name} berhasil diubah.`);
      loadAdmins();
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
            Khusus Super Administrator: Kelola akun admin internal, atur hak akses (role), dan reset kredensial sandi.
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
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {modalType === 'add' ? 'Tambah Administrator Baru' : 'Edit Profil Admin'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Atur data dan hak akses sistem</p>
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setModalType(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Misal: Dr. Andi Pratama, Sp.GK"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Alamat Email *
                </label>
                <input
                  type="email"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="admin@obsense.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Role Akses (Hak Istimewa)
                </label>
                <select
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="admin">Admin Klinis (Operasional)</option>
                  <option value="super_admin">Super Administrator (Akses Penuh)</option>
                </select>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Super Admin dapat mengelola akun admin lain dan konfigurasi sistem tingkat lanjut.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Akun Aktif (Bisa login ke sistem)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                  onClick={() => setModalType(null)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
                >
                  <Save size={16} /> Simpan Akun Admin
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
