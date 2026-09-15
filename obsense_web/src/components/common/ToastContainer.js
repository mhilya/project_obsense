import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer = ({ toasts, onRemove }) => {
  if (!toasts.length) return null;

  const getStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />,
          border: 'border-l-4 border-emerald-500'
        };
      case 'error':
        return {
          icon: <AlertCircle size={18} className="text-rose-500 shrink-0" />,
          border: 'border-l-4 border-rose-500'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={18} className="text-amber-500 shrink-0" />,
          border: 'border-l-4 border-amber-500'
        };
      case 'info':
      default:
        return {
          icon: <Info size={18} className="text-blue-500 shrink-0" />,
          border: 'border-l-4 border-blue-500'
        };
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none" role="region" aria-live="polite">
      {toasts.map((toast) => {
        const style = getStyle(toast.type);
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900 ${style.border}`}
          >
            <div className="flex items-center gap-2.5">
              {style.icon}
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{toast.message}</p>
            </div>
            <button
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              onClick={() => onRemove(toast.id)}
              title="Tutup Notifikasi"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;

