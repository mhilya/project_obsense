import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../../components/common/DataTable';
import auditService from '../../services/auditService';
import { useNotification } from '../../context/NotificationContext';
import {
  FileSpreadsheet,
  X,
  Clock,
  Code2
} from 'lucide-react';

export const AuditLogs = () => {
  const { showSuccess, showError } = useNotification();
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  const loadLogs = useCallback(async () => {
    try {
      const data = await auditService.getAuditLogs({ limit: 200 });
      setLogs(data || []);
    } catch (err) {
      showError('Gagal memuat log audit dari database.');
    }
  }, [showError]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleExportCSV = () => {
    if (!logs.length) return;
    const headers = ['ID', 'Waktu', 'Admin', 'Aksi', 'Entitas', 'TargetID', 'IP', 'Detail'];
    const rows = logs.map((l) => [
      l.id,
      `"${l.created_at}"`,
      `"${l.admin_name || l.admin_email || 'System'}"`,
      l.action,
      l.entity_type,
      l.entity_id || '-',
      l.ip_address || '127.0.0.1',
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `obsense_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Audit log trail berhasil diexport ke CSV untuk compliance!');
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('DELETE') || action.includes('FAIL')) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
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
    { label: 'CREATE_USER', value: 'CREATE_USER' },
    { label: 'UPDATE_USER', value: 'UPDATE_USER' },
    { label: 'DELETE_USER', value: 'DELETE_USER' },
    { label: 'RESTORE_USER', value: 'RESTORE_USER' },
    { label: 'EVALUATE', value: 'EVALUATE' },
    { label: 'UPDATE_CONFIG', value: 'UPDATE_CONFIG' },
    { label: 'EXPORT_DATA', value: 'EXPORT_DATA' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Log Audit & Rekam Jejak Sistem
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pelacakan aktivitas administratif, riwayat modifikasi data (before & after), dan kepatuhan keamanan di database MySQL.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
            onClick={handleExportCSV}
          >
            <FileSpreadsheet size={16} /> Export Audit Log
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
        <DataTable
          columns={columns}
          data={logs}
          searchPlaceholder="Cari nama admin, aksi, atau entitas target..."
          searchKeys={['admin_name', 'action', 'entity_type', 'ip_address']}
          filterKey="action"
          filterOptions={actionFilterOptions}
          filterLabel="Semua Aksi Sistem"
          defaultPageSize={10}
          rowActions={(row) => (
            <button
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all"
              onClick={() => setSelectedLog(row)}
            >
              <Code2 size={13} />
              <span>Detail JSON</span>
            </button>
          )}
        />
      </div>

      {/* JSON Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Detail Snapshot Audit #{selectedLog.id}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedLog.admin_name} • {selectedLog.action}
                </p>
              </div>
              <button
                type="button"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                onClick={() => setSelectedLog(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Entitas Target</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                    {selectedLog.entity_type} {selectedLog.entity_id ? `(#${selectedLog.entity_id})` : ''}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">IP Address</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200 mt-1 block">
                    {selectedLog.ip_address || '127.0.0.1'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Payload Data (State Snapshot / Event Details):
                </span>
                <pre className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800 max-h-60">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
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
