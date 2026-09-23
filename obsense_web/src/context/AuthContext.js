import React, { createContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inisialisasi auth state saat aplikasi pertama kali dimuat
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (savedToken && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(parsedUser);

          // Verifikasi ke backend secara asynchronous
          try {
            const res = await authService.getMe();
            if (res?.user) {
              setUser(res.user);
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
            }
          } catch {
            // Jika backend belum siap, tetap pakai savedUser dari localStorage
          }
        } catch (e) {
          console.error('Failed to parse saved user JSON', e);
        }
      } else {
        // Auto-login default ke Super Admin untuk kemudahan preview
        try {
          const res = await authService.demoSwitch('super_admin');
          if (res?.token && res?.user) {
            setToken(res.token);
            setUser(res.user);
            localStorage.setItem(STORAGE_KEYS.TOKEN, res.token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
          }
        } catch {
          // Fallback lokal jika backend offline
          const fallbackUser = {
            id: 1,
            name: 'Dr. Sarah Amalia, Sp.GK (Super Admin)',
            email: 'superadmin@obsense.com',
            role: 'super_admin',
            is_active: true
          };
          setToken('obsense-demo-jwt-token');
          setUser(fallbackUser);
          localStorage.setItem(STORAGE_KEYS.TOKEN, 'obsense-demo-jwt-token');
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fallbackUser));
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Fungsi Login dengan backend API
  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, res.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Gagal login' };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Terjadi kesalahan sistem saat login';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Switch role cepat untuk kebutuhan demonstrasi
  const switchRole = useCallback(async (role = 'super_admin') => {
    try {
      const res = await authService.demoSwitch(role);
      if (res.success && res.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, res.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
      }
    } catch (e) {
      console.warn('Switch role API failed, updating local state', e);
      const fallbackUser = {
        id: role === 'super_admin' ? 1 : 2,
        name: role === 'super_admin' ? 'Dr. Sarah Amalia, Sp.GK' : 'Budi Santoso, S.Gz',
        email: role === 'super_admin' ? 'superadmin@obsense.com' : 'admin@obsense.com',
        role,
        is_active: true
      };
      setUser(fallbackUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fallbackUser));
    }
  }, []);

  // Fungsi Logout
  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

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
