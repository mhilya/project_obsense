import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import Breadcrumbs from './Breadcrumbs';
import {
  LogOut,
  User,
  Bell,
  Sun,
  Moon,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Menu,
  X
} from 'lucide-react';

export const Navbar = ({
  onToggleSidebar,
  isSidebarCollapsed,
  onToggleMobileSidebar,
  isMobileSidebarOpen
}) => {
  const { user, logout, switchRole, isSuperAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { confirm, showInfo } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Konfirmasi Keluar',
      message: 'Apakah Anda yakin ingin keluar dari sesi admin OBSENSE?',
      confirmText: 'Ya, Keluar',
      danger: true
    });
    if (ok) {
      logout();
    }
  };

  const handleQuickRoleSwitch = () => {
    const nextRole = isSuperAdmin ? 'admin' : 'super_admin';
    switchRole(nextRole);
    showInfo(`Role dialihkan ke: ${nextRole === 'super_admin' ? 'Super Admin' : 'Admin Klinis'}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 sm:px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="flex items-center gap-2.5 sm:gap-6 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 md:hidden hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          aria-label={isMobileSidebarOpen ? 'Tutup Menu' : 'Buka Menu'}
          title={isMobileSidebarOpen ? 'Tutup Menu' : 'Buka Menu'}
        >
          {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20 flex-shrink-0">
            <Activity size={18} className="sm:size-5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              OBSENSE
            </h2>
            <span className="hidden xs:inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold tracking-wide text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              CLINICAL
            </span>
          </div>
        </div>

        {/* Breadcrumbs - visible on medium screens and up */}
        <div className="hidden lg:block">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        {/* Quick Role Switcher Button for Testing */}
        <button
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition border ${
            isSuperAdmin
              ? 'border-amber-500/30 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400'
              : 'border-blue-500/30 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400'
          }`}
          onClick={handleQuickRoleSwitch}
          title="Klik untuk beralih role (Testing Demo)"
        >
          {isSuperAdmin ? (
            <>
              <ShieldAlert size={14} className="text-amber-500 flex-shrink-0" />
              <span className="hidden sm:inline">Role: Super Admin</span>
              <span className="sm:hidden text-[11px]">Super</span>
            </>
          ) : (
            <>
              <ShieldCheck size={14} className="text-blue-500 flex-shrink-0" />
              <span className="hidden sm:inline">Role: Admin</span>
              <span className="sm:hidden text-[11px]">Admin</span>
            </>
          )}
        </button>

        {/* Dark Mode Toggle */}
        <button
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifikasi Sistem"
          >
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              2
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <h6 className="text-xs font-bold text-slate-900 dark:text-white">Notifikasi & Peringatan</h6>
                <button
                  className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  onClick={() => setShowNotifications(false)}
                >
                  Tutup
                </button>
              </div>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start gap-2.5 rounded-lg bg-slate-50 p-2 text-xs dark:bg-slate-800/50">
                  <span className="mt-1 h-2 w-2 rounded-full bg-rose-500 shrink-0"></span>
                  <div className="flex flex-col">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Anomali Terdeteksi (BMI ≥ 40)</p>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">User: Dimas Prasetyo (41.4)</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5 rounded-lg bg-slate-50 p-2 text-xs dark:bg-slate-800/50">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <div className="flex flex-col">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Siklus 14 Hari Selesai</p>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">User: Anisa Rahmawati</span>
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-1 sm:px-3 sm:py-1.5 dark:border-slate-800 dark:bg-slate-800/70">
          <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            <User size={14} />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[100px] md:max-w-[140px]">
              {user?.name || 'Administrator'}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          className="flex h-8 w-8 sm:h-auto sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 p-1.5 sm:px-3 sm:py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60"
          onClick={handleLogout}
          title="Keluar dari sistem"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;

