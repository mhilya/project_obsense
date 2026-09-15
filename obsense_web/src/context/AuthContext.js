import React, { createContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import storageService from '../mock/storageService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inisialisasi auth state dari localStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Failed to parse saved user JSON', e);
        }
      }
    } else {
      // Auto-login default ke Super Admin untuk kemudahan demonstrasi pertama kali
      const defaultAdmin = storageService.getAdmins()[0];
      if (defaultAdmin) {
        setToken('obsense-demo-jwt-token');
        setUser(defaultAdmin);
        localStorage.setItem(STORAGE_KEYS.TOKEN, 'obsense-demo-jwt-token');
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultAdmin));
      }
    }
    setLoading(false);
  }, []);

  // Fungsi Login dengan validasi kredensial & logging attempt
  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      // Cari admin dari storageService
      const admins = storageService.getAdmins();
      const matchedAdmin = admins.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase()
      );

      // Kredensial demo: password 'admin123' untuk semua admin demo
      const isValidPassword = password === 'admin123' || password === 'superadmin123';

      if (!matchedAdmin || !isValidPassword) {
        storageService.recordLoginAttempt(email, 'FAILED', navigator.userAgent);
        storageService.addAuditLog({
          action: 'LOGIN_FAILED',
          entity_type: 'Security',
          entity_id: email,
          admin_name: 'Guest / Unknown',
          details: { email_entered: email, reason: 'Invalid credentials' }
        });
        return {
          success: false,
          message: 'Email atau password salah. Coba password default: admin123'
        };
      }

      if (!matchedAdmin.is_active) {
        storageService.recordLoginAttempt(email, 'BLOCKED', navigator.userAgent);
        return {
          success: false,
          message: 'Akun admin ini dinonaktifkan. Hubungi Super Administrator.'
        };
      }

      // Login berhasil
      const userToken = `obsense-token-${matchedAdmin.role}-${Date.now()}`;
      const userData = {
        id: matchedAdmin.id,
        name: matchedAdmin.name,
        email: matchedAdmin.email,
        role: matchedAdmin.role
      };

      localStorage.setItem(STORAGE_KEYS.TOKEN, userToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      setToken(userToken);
      setUser(userData);

      storageService.recordLoginAttempt(email, 'SUCCESS', navigator.userAgent);
      storageService.addAuditLog({
        action: 'LOGIN',
        entity_type: 'Admin',
        entity_id: String(matchedAdmin.id),
        admin_name: matchedAdmin.name,
        details: { role: matchedAdmin.role, status: 'SUCCESS' }
      });

      // Update last login
      storageService.updateAdmin(matchedAdmin.id, {
        last_login_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Terjadi kesalahan sistem saat login'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Switch role cepat untuk kebutuhan testing demo
  const switchRole = useCallback((role = 'super_admin') => {
    const admins = storageService.getAdmins();
    const target = admins.find((a) => a.role === role) || admins[0];
    const userToken = `obsense-token-${target.role}-${Date.now()}`;

    localStorage.setItem(STORAGE_KEYS.TOKEN, userToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(target));
    setToken(userToken);
    setUser(target);
  }, []);

  // Fungsi Logout
  const logout = useCallback(async () => {
    if (user) {
      storageService.addAuditLog({
        action: 'LOGOUT',
        entity_type: 'Admin',
        entity_id: String(user.id),
        admin_name: user.name,
        details: { status: 'User logged out' }
      });
    }

    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setToken(null);
    setUser(null);
  }, [user]);

  const isSuperAdmin = user?.role === 'super_admin';

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isSuperAdmin,
    loading,
    login,
    logout,
    switchRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
