import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title = 'Konfirmasi Aksi',
  message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  danger = false,
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                danger
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
              }`}
            >
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
          </div>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            onClick={onClose}
            title="Batal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
          <button
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-xs font-bold text-white transition shadow-sm ${
              danger
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

