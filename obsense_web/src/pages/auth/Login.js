import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Activity,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Shield,
  Loader2,
  Sun,
  Moon
} from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showSuccess, showError } = useNotification();

  const [email, setEmail] = useState('superadmin@obsense.com');
  const [password, setPassword] = useState('admin123');
  const [activeAccountTab, setActiveAccountTab] = useState('superadmin');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Masukkan alamat email dan kata sandi.');
      return;
    }

    setIsLoading(true);
    const result = await login({ email, password });
    setIsLoading(false);

    if (result.success) {
      showSuccess(`Autentikasi berhasil: ${result.user.name}`);
      navigate('/dashboard');
    } else {
      showError(result.message);
    }
  };

  const handleSelectRole = (roleType) => {
    setActiveAccountTab(roleType);
    if (roleType === 'superadmin') {
      setEmail('superadmin@obsense.com');
      setPassword('admin123');
    } else {
      setEmail('admin@obsense.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 transition-colors duration-300">
      {/* Top Right Theme Toggle */}
      <div className="absolute top-5 right-5 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-semibold"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={16} className="text-amber-400" />
              <span>Mode Terang</span>
            </>
          ) : (
            <>
              <Moon size={16} className="text-blue-600" />
              <span>Mode Gelap</span>
            </>
          )}
        </button>
      </div>

      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl transition-colors duration-300">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20">
            <Activity size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">OBSENSE</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Clinical Decision Support System &middot; Obesity Risk Analytics
          </p>
        </div>

        {/* Demo Account Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 mb-6">
          <button
            type="button"
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
              activeAccountTab === 'superadmin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            onClick={() => handleSelectRole('superadmin')}
          >
            <Shield size={14} />
            <span>Super Admin</span>
          </button>
          <button
            type="button"
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
              activeAccountTab === 'admin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            onClick={() => handleSelectRole('admin')}
          >
            <ShieldCheck size={14} />
            <span>Admin Klinis</span>
          </button>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Administrator
            </label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                id="email"
                type="email"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="nama@obsense.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                id="password"
                type="password"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span>Masuk ke Sistem</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 text-center border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Standar Klasifikasi WHO &middot; Random Forest 7-Class Model v1.2
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
