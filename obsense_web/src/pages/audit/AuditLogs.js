import React, { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import storageService from '../../mock/storageService';
import { useNotification } from '../../context/NotificationContext';
import {
  FileSpreadsheet,
  X,
  Clock,
  Code2
} from 'lucide-react';

export const AuditLogs = () => {
  const { showSuccess } = useNotification();
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  const loadLogs = () => {
    setLogs(storageService.getAuditLogs());
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleExportCSV = () => {
    const exportable = logs.map((l) => ({
      ID: l.id,
      Waktu: l.created_at,
      Admin: l.admin_name || l.admin_email || 'System',
      Aksi: l.action,
      Entitas: l.entity_type,
      TargetID: l.entity_id || '-',
      IP: l.ip_address || '127.0.0.1',
      DetailPerubahan: JSON.stringify(l.details || {})
    }));
    storageService.exportToCSV(exportable, `obsense_audit_trail_${Date.now()}.csv`);
    showSuccess('Audit log trail berhasil diexport ke CSV untuk compliance!');
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('DELETE')) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    if (action.includes('UPDATE') || action.includes('CONFIG')) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    if (action.includes('LOGIN') || action.includes('CREATE')) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
  };

  const columns = [
    {
      header: 'Waktu & Tanggal',
      key: 'created_at',
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
          <Clock size={13} className="text-slate-400" />
          {val}
        </span>
      )
    },
    {
      header: 'Admin Pelaksana',
      key: 'admin_name',
      render: (val) => <strong className="text-xs font-bold text-slate-900 dark:text-white">{val || 'System'}</strong>
    },
    {
      header: 'Aksi Sistem',
      key: 'action',
      render: (val) => (
        <span className={`inline-flex items-center text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getActionBadgeColor(val)}`}>
          {val}
        </span>
      )
    },
    {
      header: 'Entitas Target',
      key: 'entity_type',
      render: (val, row) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {val} {row.entity_id ? <span className="font-mono font-bold text-blue-600 dark:text-blue-400">(#{row.entity_id})</span> : ''}
        </span>
      )
    },
    {
      header: 'IP Address',
      key: 'ip_address',
      render: (val) => <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{val || '127.0.0.1'}</span>
    }
  ];

  const actionFilterOptions = [
    { label: 'LOGIN', value: 'LOGIN' },
    { label: 'UPDATE_USER', value: 'UPDATE_USER' },
    { label: 'SOFT_DELETE_USER', value: 'SOFT_DELETE_USER' },
    { label: 'EVALUATE', value: 'EVALUATE' },
    { label: 'UPDATE_CONFIG', value: 'UPDATE_CONFIG' },
    { label: 'EXPORT_DATA', value: 'EXPORT_DATA' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Audit Logs & Compliance Trail
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pelacakan seluruh aktivitas admin, riwayat modifikasi entitas, dan inspeksi detail Before/After JSON.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
            onClick={handleExportCSV}
          >
            <FileSpreadsheet size={16} /> Export Audit Log ke CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
        <DataTable
          columns={columns}
          data={logs}
          searchPlaceholder="Cari nama admin, aksi, entitas..."
          searchKeys={['admin_name', 'action', 'entity_type', 'entity_id']}
          filterKey="action"
          filterOptions={actionFilterOptions}
          filterLabel="Semua Jenis Aksi"
          defaultPageSize={10}
          rowActions={(row) => (
            <button
              type="button"
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-all"
              title="Lihat Detail Perubahan JSON"
              onClick={() => setSelectedLog(row)}
            >
              <Code2 size={16} />
            </button>
          )}
        />
      </div>

      {/* JSON Before/After Diff Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Code2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Detail Perubahan Aksi #{selectedLog.id}
                  </h3>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                    {selectedLog.action} pada {selectedLog.entity_type} oleh {selectedLog.admin_name} ({selectedLog.created_at})
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setSelectedLog(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Payload Details (JSON Schema):
                </span>
                <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                onClick={() => setSelectedLog(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
