import api from './api';
import { STORAGE_KEYS } from '../utils/constants';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async demoSwitch(role = 'super_admin') {
    const response = await api.post('/auth/demo-switch', { role });
    return response.data;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getCurrentUser() {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }
};

export default authService;
