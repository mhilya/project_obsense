import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import SuperAdminRoute from './SuperAdminRoute';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/Dashboard';
import UserList from '../pages/users/UserList';
import DataManagement from '../pages/data/DataManagement';
import ReportsAnalytics from '../pages/analytics/ReportsAnalytics';
import AdminEvaluations from '../pages/evaluations/AdminEvaluations';
import SystemConfig from '../pages/configurations/SystemConfig';
import AuditLogs from '../pages/audit/AuditLogs';
import AdminManagement from '../pages/admins/AdminManagement';
import NotFound from '../pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Route Publik (Auth Layout) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Route Terproteksi (Main Layout dengan Navbar & Sidebar) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Modul Manajemen User */}
          <Route path="/users" element={<UserList />} />
          
          {/* Modul Manajemen Data */}
          <Route path="/data-management" element={<DataManagement />} />
          
          {/* Modul Laporan & Analitik */}
          <Route path="/analytics" element={<ReportsAnalytics />} />
          
          {/* Modul Evaluasi Manual Admin */}
          <Route path="/evaluations" element={<AdminEvaluations />} />
          
          {/* Modul Konfigurasi Sistem */}
          <Route path="/configurations" element={<SystemConfig />} />
          
          {/* Modul Audit Logs */}
          <Route path="/audit-logs" element={<AuditLogs />} />
          
          {/* Modul Manajemen Admin (Khusus Super Admin) */}
          <Route
            path="/admins"
            element={
              <SuperAdminRoute>
                <AdminManagement />
              </SuperAdminRoute>
            }
          />
        </Route>
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
