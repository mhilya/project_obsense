import api from './api';

export const analyticsService = {
  async getDashboardStats() {
    const response = await api.get('/analytics/dashboard-stats');
    return response.data.data;
  },

  async getAnalyticsReport() {
    const response = await api.get('/analytics/report');
    return response.data.data;
  }
};

export default analyticsService;
