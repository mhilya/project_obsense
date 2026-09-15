import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS = {
  dashboard: 'Dashboard',
  users: 'Manajemen User',
  'data-management': 'Manajemen Data',
  analytics: 'Laporan & Analitik',
  evaluations: 'Evaluasi Manual Admin',
  configurations: 'Konfigurasi Sistem',
  'audit-logs': 'Audit Logs',
  admins: 'Manajemen Admin'
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
          <Home size={13} /> Dashboard Utama
        </span>
      </div>
    );
  }

  return (
    <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
      <Link to="/dashboard" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition">
        <Home size={13} /> Home
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = ROUTE_LABELS[name] || decodeURIComponent(name);

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight size={13} className="text-slate-400" />
            {isLast ? (
              <span className="font-semibold text-slate-800 dark:text-slate-200">{label}</span>
            ) : (
              <Link to={routeTo} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;

