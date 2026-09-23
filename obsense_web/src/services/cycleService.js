import api from './api';

export const cycleService = {
  async getCycles(params = {}) {
    const response = await api.get('/cycles', { params });
    return response.data.data;
  },

  async getDailyLogs(params = {}) {
    const response = await api.get('/cycles/daily-logs', { params });
    return response.data.data;
  },

  async createDailyLog(logData) {
    const response = await api.post('/cycles/daily-logs', logData);
    return response.data;
  }
};

export default cycleService;
