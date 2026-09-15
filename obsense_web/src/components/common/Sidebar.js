import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Database,
  BarChart3,
  ClipboardCheck,
  Settings,
  FileText,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { isSuperAdmin } = useAuth();

  const menuGroups = [
    {
      group: 'UTAMA',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Manajemen User', path: '/users', icon: Users, badge: '10' }
      ]
    },
    {
      group: 'DATA & ANALITIK',
      items: [
        { name: 'Manajemen Data', path: '/data-management', icon: Database },
        { name: 'Laporan & Analitik', path: '/analytics', icon: BarChart3 },
        { name: 'Evaluasi Manual', path: '/evaluations', icon: ClipboardCheck }
      ]
    },
    {
      group: 'SISTEM',
      items: [
        { name: 'Konfigurasi Sistem', path: '/configurations', icon: Settings },
        { name: 'Audit Logs', path: '/audit-logs', icon: FileText },
        {
          name: 'Manajemen Admin',
          path: '/admins',
          icon: ShieldCheck,
          superAdminOnly: true,
          badge: isSuperAdmin ? 'Super' : 'Kunci'
        }
      ]
    }
  ];

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 z-20 flex flex-col justify-between border-r border-slate-200 bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out dark:border-slate-800 ${
        isCollapsed ? 'w-18 items-center' : 'w-64'
      }`}
    >
      {/* Top Collapse Button */}
      <div className="flex items-center justify-end px-3 pt-3">
        <button
          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-white transition"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <span className="block px-3 text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
                {group.group}
              </span>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isLocked = item.superAdminOnly && !isSuperAdmin;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : isLocked
                        ? 'text-slate-500 opacity-60 hover:bg-slate-800/40 cursor-not-allowed'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`
                  }
                  title={isCollapsed ? item.name : ''}
                >
                  <Icon size={18} className="shrink-0" />
                  {!isCollapsed && (
                    <div className="flex flex-1 items-center justify-between">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            item.superAdminOnly
                              ? isSuperAdmin
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer System Status */}
      {!isCollapsed && (
        <div className="border-t border-slate-800/80 p-3 m-3 rounded-xl bg-slate-950/40 border">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-300">OBSENSE Engine Active</span>
          </div>
          <span className="mt-1 block text-[10px] text-slate-500 font-mono">Random Forest v1.2 (7-Class)</span>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

