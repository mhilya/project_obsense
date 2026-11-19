import React, { createContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import storageService from '../mock/storageService';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inisialisasi auth state: validasi token tersimpan ke auth-service (/auth/me)
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

    const clearSession = () => {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      setToken(null);
      setUser(null);
    };

    if (!savedToken) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => {
        const me = res.data.user;
        setToken(savedToken);
        setUser(me);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(me));
      })
      .catch(() => {
        // Token palsu/kedaluwarsa, atau auth-service tidak bisa dihubungi
        clearSession();
      })
      .finally(() => setLoading(false));
    // savedUser sengaja tidak dipakai: data profil selalu diambil dari server
    void savedUser;
  }, []);

  // Login admin ke auth-service lewat gateway
  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/admin/login', { email: email.trim(), password });
      const { token: jwt, admin } = res.data;

      localStorage.setItem(STORAGE_KEYS.TOKEN, jwt);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(admin));
      setToken(jwt);
      setUser(admin);

      return { success: true, user: admin };
    } catch (error) {
      const message = error.response
        ? error.response.data?.message || 'Email atau password salah.'
        : 'Tidak dapat terhubung ke server. Pastikan gateway & auth-service berjalan.';
      return { success: false, message };
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
