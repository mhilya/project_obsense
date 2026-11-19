import api from './api';

export const cycleService = {
  async getCycles(params = {}) {
    const response = await api.get('/cycles', { params });
    return response.data.data || [];
  },

  async createCycle(cycleData = {}) {
    const response = await api.post('/cycles', cycleData);
    return response.data;
  },

  async getCurrentCycle(params = {}) {
    const response = await api.get('/cycles/current', { params });
    return response.data.data;
  },

  async getDailyLogs(params = {}) {
    const response = await api.get('/cycles/daily-logs', { params });
    return response.data.data || [];
  },

  async createDailyLog(logData) {
    const response = await api.post('/cycles/daily-logs', logData);
    return response.data;
  },

  async updateDailyLog(id, logData) {
    const response = await api.put(`/cycles/daily-logs/${id}`, logData);
    return response.data;
  },

  async deleteDailyLog(id) {
    const response = await api.delete(`/cycles/daily-logs/${id}`);
    return response.data;
  },
};

export default cycleService;
