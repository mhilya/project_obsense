import api from './api';

export const authService = {
  // Login user
  login: async (credentials) => {
    // Sesuaikan endpoint sesuai backend Anda nanti (misal: /auth/login atau /login)
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register user baru
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Backend logout failed or not implemented yet', e);
    }
  },

  // Dapatkan profile user yang sedang login
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
