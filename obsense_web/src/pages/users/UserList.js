import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../../components/common/DataTable';
import UserDetailModal from './UserDetailModal';
import UserEditModal from './UserEditModal';
import userService from '../../services/userService';
import { OBESITY_CLASSES } from '../../mock/mockData';
import { useNotification } from '../../context/NotificationContext';
import {
  Eye,
  Edit2,
  Trash2,
  Power,
  FileSpreadsheet,
  RotateCcw
} from 'lucide-react';

export const UserList = () => {
  const { showSuccess, showError, confirm } = useNotification();

  const [users, setUsers] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const data = await userService.getUsers({ includeDeleted: showDeleted });
      setUsers(data || []);
    } catch (err) {
      showError('Gagal memuat data pengguna dari server.');
    }
  }, [showDeleted, showError]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handlers
  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    const statusLabel = nextStatus === 'active' ? 'Aktif' : 'Non-aktif';
    const ok = await confirm({
      title: `Ubah Status Akun?`,
      message: `Apakah Anda yakin ingin mengubah status akun ${user.name} menjadi ${statusLabel}?`,
      confirmText: 'Ubah Status'
    });

    if (ok) {
      try {
        await userService.updateUser(user.id, { status: nextStatus });
        showSuccess(`Status ${user.name} berhasil diubah menjadi ${statusLabel}`);
        loadUsers();
      } catch (err) {
        showError('Gagal mengubah status: ' + err.message);
      }
    }
  };

  const handleDeleteUser = async (user) => {
    const ok = await confirm({
      title: 'Hapus Akun Pasien (Soft Delete)',
      message: `Apakah Anda yakin ingin menghapus data pasien ${user.name}? Data akan ditandai sebagai terhapus di database.`,
      confirmText: 'Ya, Hapus Data',
      danger: true
    });

    if (ok) {
      try {
        await userService.deleteUser(user.id);
        showSuccess(`Akun ${user.name} berhasil dinonaktifkan / dihapus (soft-delete).`);
        loadUsers();
      } catch (err) {
        showError('Gagal menghapus akun: ' + err.message);
      }
    }
  };

  const handleRestoreUser = async (user) => {
    const ok = await confirm({
      title: 'Pulihkan Akun Pasien',
      message: `Pulihkan akun ${user.name} dan aktifkan kembali di sistem?`,
      confirmText: 'Pulihkan Akun'
    });

    if (ok) {
      try {
        await userService.restoreUser(user.id);
        showSuccess(`Akun ${user.name} berhasil dipulihkan.`);
        loadUsers();
      } catch (err) {
        showError('Gagal memulihkan akun: ' + err.message);
      }
    }
  };

  const handleExportUsers = () => {
    if (!users.length) return;
    const headers = ['ID', 'Nama', 'Email', 'Telepon', 'Gender', 'Usia', 'Tinggi(cm)', 'Berat(kg)', 'BMI', 'Kelas Obesitas', 'Risk Level', 'Status'];
    const rows = users.map(u => [
      u.id, `"${u.name}"`, u.email, u.phone || '', u.gender, u.age, u.height, u.weight, u.bmi, u.obesity_class, u.risk_level, u.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `obsense_users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Data pengguna berhasil diexport ke file CSV!');
  };

  // Columns definition for DataTable
  const columns = [
    {
      header: 'Pasien / Email',
      key: 'name',
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">{row.name}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{row.email}</span>
        </div>
      )
    },
    {
      header: 'Gender & Usia',
      key: 'age',
      render: (val, row) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {row.gender === 'Male' ? 'Laki-laki' : 'Perempuan'}, {row.age} th
        </span>
      )
    },
    {
      header: 'Tinggi & Berat',
      key: 'height',
      render: (val, row) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {row.height} cm / {row.weight} kg
        </span>
      )
    },
    {
      header: 'Nilai BMI',
      key: 'bmi',
      render: (val) => <strong className="font-mono text-xs font-bold text-slate-900 dark:text-white">{val}</strong>
    },
    {
      header: 'Kategori Obesitas (UCI)',
      key: 'obesity_class',
      render: (val) => {
        const cls = OBESITY_CLASSES.find((c) => c.key === val);
        return (
          <span
            className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold"
            style={{
              backgroundColor: `${cls?.color || '#64748b'}18`,
              color: cls?.color || '#64748b'
            }}
          >
            {cls?.label || val}
          </span>
        );
      }
    },
    {
      header: 'Status',
      key: 'status',
      render: (val, row) => {
        if (row.deleted_at) {
          return (
            <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
              Terhapus
            </span>
          );
        }
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              val === 'active'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
            }`}
          >
            {val === 'active' ? 'Aktif' : 'Non-aktif'}
          </span>
        );
      }
    }
  ];

  const filterOptions = OBESITY_CLASSES.map((c) => ({
    label: c.label,
    value: c.key
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Manajemen Data Pengguna
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Daftar seluruh pasien, verifikasi data antropometri, riwayat asesmen, dan status akun dari database MySQL.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded text-blue-600 focus:ring-blue-500"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
            />
            <span>Tampilkan terhapus (Soft delete)</span>
          </label>
          <button
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={handleExportUsers}
          >
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="Cari nama, email, atau status..."
        searchKeys={['name', 'email', 'obesity_class']}
        filterKey="obesity_class"
        filterOptions={filterOptions}
        filterLabel="Semua Kelas Obesitas"
        defaultPageSize={10}
        rowActions={(row) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
              title="Lihat Detail Profil & Asesmen"
              onClick={() => handleViewDetail(row)}
            >
              <Eye size={14} />
            </button>
            <button
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-amber-500 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-amber-400 dark:hover:text-amber-400"
              title="Koreksi Antropometri"
              onClick={() => handleOpenEdit(row)}
            >
              <Edit2 size={14} />
            </button>
            {row.deleted_at ? (
              <button
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                title="Pulihkan Akun"
                onClick={() => handleRestoreUser(row)}
              >
                <RotateCcw size={14} />
              </button>
            ) : (
              <>
                <button
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                    row.status === 'active'
                      ? 'border-slate-200 bg-white text-slate-600 hover:border-amber-500 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                  }`}
                  title={row.status === 'active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                  onClick={() => handleToggleStatus(row)}
                >
                  <Power size={14} />
                </button>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400"
                  title="Hapus Akun (Soft Delete)"
                  onClick={() => handleDeleteUser(row)}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        )}
      />

      {/* Modals */}
      {detailModalOpen && (
        <UserDetailModal
          isOpen={detailModalOpen}
          user={selectedUser}
          onClose={() => setDetailModalOpen(false)}
          onEdit={(u) => {
            setSelectedUser(u);
            setEditModalOpen(true);
          }}
        />
      )}

      {editModalOpen && (
        <UserEditModal
          isOpen={editModalOpen}
          user={selectedUser}
          onClose={() => setEditModalOpen(false)}
          onSaveSuccess={() => {
            loadUsers();
          }}
        />
      )}
    </div>
  );
};

export default UserList;
