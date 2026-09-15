import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import storageService from '../mock/storageService';
import DonutChart from '../components/charts/DonutChart';
import TrendLineChart from '../components/charts/TrendLineChart';
import {
  Users,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Database,
  BarChart3,
  ClipboardCheck,
  Settings,
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(() => storageService.getDashboardStats());
  const recentLogs = storageService.getAuditLogs().slice(0, 4);

  useEffect(() => {
    setStats(storageService.getDashboardStats());
  }, []);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const statCards = [
    {
      title: 'Total Pasien Terdaftar',
      value: stats.totalUsers,
      meta: 'Pasien Aktif',
      change: '+2 minggu ini',
      icon: Users,
      color: '#3b82f6',
      progress: 75,
      link: '/users'
    },
    {
      title: 'Rata-rata BMI Populasi',
      value: `${stats.avgBmi}`,
      unit: 'kg/m²',
      meta: 'Kategori Overweight',
      change: 'Normal: 18.5 - 24.9',
      icon: Scale,
      color: '#f59e0b',
      progress: 68,
      link: '/analytics'
    },
    {
      title: 'Kasus Risiko Tinggi',
      value: stats.highRiskCount,
      meta: 'Tipe Obesitas I, II & III',
      change: 'Perlu intervensi gizi',
      icon: AlertTriangle,
      color: '#ef4444',
      progress: 40,
      link: '/users'
    },
    {
      title: 'Siklus 14-Hari Selesai',
      value: `${stats.completionRate}%`,
      meta: `${stats.completedCycles} Siklus Selesai`,
      change: 'Target compliance >80%',
      icon: CheckCircle2,
      color: '#10b981',
      progress: stats.completionRate,
      link: '/data-management'
    }
  ];

  const quickModules = [
    {
      name: 'Manajemen User',
      desc: '10 Pasien terdaftar • Antropometri',
      path: '/users',
      icon: Users,
      color: '#3b82f6'
    },
    {
      name: 'Data Harian & FFQ',
      desc: 'Log 14-hari • Agregasi Mean & Rasio',
      path: '/data-management',
      icon: Database,
      color: '#10b981'
    },
    {
      name: 'Laporan & Korelasi',
      desc: 'Analisis FAF, TUE • Random Forest Weights',
      path: '/analytics',
      icon: BarChart3,
      color: '#8b5cf6'
    },
    {
      name: 'Evaluasi Manual Klinis',
      desc: 'Append-Only • Rekomendasi Dokter',
      path: '/evaluations',
      icon: ClipboardCheck,
      color: '#f59e0b'
    },
    {
      name: 'Konfigurasi Sistem',
      desc: 'Threshold WHO • Mapping Variabel',
      path: '/configurations',
      icon: Settings,
      color: '#64748b'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header with greeting & Date badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {getGreeting()}, {user?.name ? user.name : 'Administrator'}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Ringkasan pemantauan antropometri, distribusi 7 kelas obesitas, dan telaah klinis terintegrasi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <Calendar size={14} className="text-slate-400" />
            <span>{todayStr}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 dark:border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400">
            <Activity size={14} className="animate-pulse" />
            <span>Random Forest Engine v1.2 Online</span>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-50/80 p-4.5 dark:border-amber-500/20 dark:bg-amber-950/30">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 shrink-0 dark:text-amber-400">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Perhatian Medis: Kasus Obesitas Morbid Terdeteksi
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-0.5">
              Pasien <strong>Dimas Prasetyo (24 Thn)</strong> terdeteksi memiliki BMI <strong>41.4 kg/m²</strong> (Obesity Type III) dengan screen time tinggi (&gt;5 jam/hari). Disarankan verifikasi evaluasi klinis.
            </p>
          </div>
        </div>
        <Link
          to="/evaluations"
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-600 bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700 shrink-0"
        >
          <span>Tinjau Pasien Sekarang</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* 4 Interactive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              to={card.link}
              key={idx}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{card.title}</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      {card.value}
                    </span>
                    {card.unit && (
                      <span className="text-xs font-bold text-slate-400">{card.unit}</span>
                    )}
                  </div>
                </div>
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl transition"
                  style={{
                    backgroundColor: `${card.color}15`,
                    color: card.color
                  }}
                >
                  <Icon size={22} />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-semibold" style={{ color: card.color }}>
                    <TrendingUp size={13} />
                    {card.change}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">{card.meta}</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${card.progress}%`,
                      backgroundColor: card.color
                    }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart: 7 Classes */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Distribusi 7 Kelas Obesitas</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Klasifikasi spektrum berat badan standar UCI</p>
            </div>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <span>Detail</span>
              <ArrowRight size={13} />
            </Link>
          </div>
          <div className="p-5">
            <DonutChart classCounts={stats.classCounts} />
          </div>
        </div>

        {/* Trend Line Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tren Fluktuasi Risiko Pasien</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pergerakan populasi risiko rendah hingga kritis</p>
            </div>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <span>Proyeksi</span>
              <ArrowRight size={13} />
            </Link>
          </div>
          <div className="p-5">
            <TrendLineChart />
          </div>
        </div>
      </div>

      {/* Quick Access Modules & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Access */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Akses Cepat Modul Sistem</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pintasan ke modul manajemen operasional</p>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickModules.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <Link
                  to={mod.path}
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 transition hover:border-blue-500 hover:bg-white dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                    style={{
                      backgroundColor: `${mod.color}15`,
                      color: mod.color
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                      {mod.name}
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {mod.desc}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Live Audit Trail */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audit Aktivitas Terbaru</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Catatan log aktivitas admin</p>
              </div>
              <Link to="/audit-logs" className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400">
                Semua
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {recentLogs.map((log) => (
                <li key={log.id} className="flex items-start gap-2.5 rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-slate-800/50">
                  <span
                    className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      log.action.includes('FAIL') ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-slate-800 dark:text-slate-200 truncate">
                      <strong>{log.admin_name}</strong> — {log.action}
                    </span>
                    <time className="text-[10px] text-slate-400 mt-0.5">{log.created_at}</time>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

