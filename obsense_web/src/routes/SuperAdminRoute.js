import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SuperAdminRoute = ({ children }) => {
  const { isSuperAdmin, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin) {
    return (
      <div className="unauthorized-container card">
        <div className="unauthorized-box">
          <div className="icon-circle icon-danger" style={{ width: 54, height: 54, margin: '0 auto 16px' }}>
            <ShieldAlert size={28} />
          </div>
          <h2>Akses Terbatas (Super Admin Only)</h2>
          <p className="subtitle" style={{ maxWidth: 460, margin: '8px auto 20px' }}>
            Modul Manajemen Akun Admin ini memerlukan hak akses <strong>Super Administrator</strong>.
            Gunakan tombol beralih role di Navbar untuk menguji hak akses Super Admin.
          </p>
          <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default SuperAdminRoute;
